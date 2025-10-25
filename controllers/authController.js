const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, USER_TYPES } = require('../utils/constants');

// Registro de usuário
const register = async (req, res) => {
  try {
    const { email, password, userType, ...userData } = req.body;

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário base
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userType,
        ...userData
      }
    });

    // Criar perfil específico baseado no tipo
    let profile = null;
    switch (userType) {
      case USER_TYPES.VOLUNTEER:
        profile = await prisma.volunteer.create({
          data: {
            userId: user.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            city: userData.city,
            state: userData.state,
            skills: userData.skills || [],
            volunteerTypes: userData.volunteerTypes || ['PRESENTIAL']
          }
        });
        break;
      case USER_TYPES.INSTITUTION:
        profile = await prisma.institution.create({
          data: {
            userId: user.id,
            name: userData.name,
            description: userData.description,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zipCode: userData.zipCode,
            cnpj: userData.cnpj
          }
        });
        break;
      case USER_TYPES.COMPANY:
        profile = await prisma.company.create({
          data: {
            userId: user.id,
            name: userData.name,
            description: userData.description,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zipCode: userData.zipCode,
            cnpj: userData.cnpj
          }
        });
        break;
      case USER_TYPES.UNIVERSITY:
        profile = await prisma.university.create({
          data: {
            userId: user.id,
            name: userData.name,
            description: userData.description,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zipCode: userData.zipCode,
            cnpj: userData.cnpj
          }
        });
        break;
    }

    // Gerar tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    res.status(201).json({
      message: SUCCESS_MESSAGES.USER_CREATED,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
        isVerified: user.isVerified,
        profile
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login de usuário
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        volunteer: true,
        institution: true,
        company: true,
        university: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Verificar status da conta
    if (user.status === 'BLOCKED') {
      return res.status(403).json({
        error: ERROR_MESSAGES.ACCOUNT_BLOCKED
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: ERROR_MESSAGES.ACCOUNT_SUSPENDED
      });
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Gerar tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    // Determinar perfil baseado no tipo
    let profile = null;
    if (user.volunteer) profile = user.volunteer;
    else if (user.institution) profile = user.institution;
    else if (user.company) profile = user.company;
    else if (user.university) profile = user.university;

    res.json({
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
        isVerified: user.isVerified,
        profile
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Renovar token de acesso
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        error: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    // Gerar novo access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    });

    res.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(401).json({
      error: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Em uma implementação mais robusta, você adicionaria o token a uma blacklist
    // Por enquanto, apenas retornamos sucesso
    res.json({
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR
    });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const user = req.user; // Adicionado pelo middleware de autenticação
    
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(401).json({
      error: ERROR_MESSAGES.UNAUTHORIZED
    });
  }
};

// Cadastro específico para voluntários
const registerVolunteer = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, city, state, skills, volunteerTypes } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário e perfil em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: USER_TYPES.VOLUNTEER,
          status: 'ACTIVE',
          isVerified: false
        }
      });

      const volunteer = await tx.volunteer.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          city,
          state,
          skills: skills || [],
          volunteerTypes: volunteerTypes || ['PRESENTIAL']
        }
      });

      return { user, volunteer };
    });

    // Gerar tokens
    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      userType: result.user.userType
    });

    const refreshToken = generateRefreshToken({
      userId: result.user.id,
      email: result.user.email
    });

    res.status(201).json({
      message: 'Voluntário cadastrado com sucesso',
      user: {
        id: result.user.id,
        email: result.user.email,
        userType: result.user.userType,
        status: result.user.status,
        isVerified: result.user.isVerified,
        profile: result.volunteer
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no cadastro de voluntário:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cadastro específico para instituições
const registerInstitution = async (req, res) => {
  try {
    const { email, password, name, description, address, city, state, zipCode, cnpj, phone, website } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário e perfil em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: USER_TYPES.INSTITUTION,
          status: 'PENDING', // Instituições precisam de aprovação
          isVerified: false
        }
      });

      const institution = await tx.institution.create({
        data: {
          userId: user.id,
          name,
          description,
          address,
          city,
          state,
          zipCode,
          cnpj,
          phone,
          website
        }
      });

      return { user, institution };
    });

    // Gerar tokens
    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      userType: result.user.userType
    });

    const refreshToken = generateRefreshToken({
      userId: result.user.id,
      email: result.user.email
    });

    res.status(201).json({
      message: 'Instituição cadastrada com sucesso. Aguarde aprovação para acessar todas as funcionalidades.',
      user: {
        id: result.user.id,
        email: result.user.email,
        userType: result.user.userType,
        status: result.user.status,
        isVerified: result.user.isVerified,
        profile: result.institution
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no cadastro de instituição:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cadastro específico para empresas
const registerCompany = async (req, res) => {
  try {
    const { email, password, name, description, address, city, state, zipCode, cnpj, phone, website, companySize, industry } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário e perfil em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: USER_TYPES.COMPANY,
          status: 'PENDING', // Empresas precisam de aprovação
          isVerified: false
        }
      });

      const company = await tx.company.create({
        data: {
          userId: user.id,
          name,
          description,
          address,
          city,
          state,
          zipCode,
          cnpj,
          phone,
          website,
          companySize,
          industry
        }
      });

      return { user, company };
    });

    // Gerar tokens
    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      userType: result.user.userType
    });

    const refreshToken = generateRefreshToken({
      userId: result.user.id,
      email: result.user.email
    });

    res.status(201).json({
      message: 'Empresa cadastrada com sucesso. Aguarde aprovação para acessar todas as funcionalidades.',
      user: {
        id: result.user.id,
        email: result.user.email,
        userType: result.user.userType,
        status: result.user.status,
        isVerified: result.user.isVerified,
        profile: result.company
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no cadastro de empresa:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cadastro específico para universidades
const registerUniversity = async (req, res) => {
  try {
    const { email, password, name, description, address, city, state, zipCode, phone, website, universityType, accreditation } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário e perfil em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: USER_TYPES.UNIVERSITY,
          status: 'PENDING', // Universidades precisam de aprovação
          isVerified: false
        }
      });

      const university = await tx.university.create({
        data: {
          userId: user.id,
          name,
          description,
          address,
          city,
          state,
          zipCode,
          phone,
          website,
          universityType,
          accreditation
        }
      });

      return { user, university };
    });

    // Gerar tokens
    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      userType: result.user.userType
    });

    const refreshToken = generateRefreshToken({
      userId: result.user.id,
      email: result.user.email
    });

    res.status(201).json({
      message: 'Universidade cadastrada com sucesso. Aguarde aprovação para acessar todas as funcionalidades.',
      user: {
        id: result.user.id,
        email: result.user.email,
        userType: result.user.userType,
        status: result.user.status,
        isVerified: result.user.isVerified,
        profile: result.university
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no cadastro de universidade:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  registerVolunteer,
  registerInstitution,
  registerCompany,
  registerUniversity,
  login,
  refreshToken,
  logout,
  verifyToken
};
