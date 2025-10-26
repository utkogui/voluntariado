const express = require('express');
const router = express.Router();
const securityService = require('../services/securityService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Security
 *   description: API para monitoramento e gestão de segurança
 */

/**
 * @swagger
 * /api/v1/security/events:
 *   get:
 *     summary: Obter eventos de segurança
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Tipo de evento
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim
 *     responses:
 *       200:
 *         description: Lista de eventos de segurança
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       eventType:
 *                         type: string
 *                       eventData:
 *                         type: object
 *                       userId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       ipAddress:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           type:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/events', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const result = await securityService.getSecurityEvents(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/stats:
 *   get:
 *     summary: Obter estatísticas de segurança
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para as estatísticas
 *     responses:
 *       200:
 *         description: Estatísticas de segurança
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 critical:
 *                   type: integer
 *                 blockedIPs:
 *                   type: integer
 *                 blockedUsers:
 *                   type: integer
 *                 byType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventType:
 *                         type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           eventType:
 *                             type: integer
 *                 byUser:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: integer
 *                 topThreats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       eventType:
 *                         type: string
 *                       eventData:
 *                         type: object
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           type:
 *                             type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const stats = await securityService.getSecurityStats(req.query.period);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/report:
 *   get:
 *     summary: Obter relatório de segurança
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para o relatório
 *     responses:
 *       200:
 *         description: Relatório de segurança
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                 stats:
 *                   type: object
 *                 events:
 *                   type: array
 *                 threats:
 *                   type: array
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       action:
 *                         type: string
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/report', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const report = await securityService.getSecurityReport(req.query.period);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/password/strength:
 *   post:
 *     summary: Verificar força da senha
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "MinhaSenh@123"
 *     responses:
 *       200:
 *         description: Análise da força da senha
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 5
 *                 feedback:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Senha não fornecida
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/password/strength', async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Senha é obrigatória' });
    }
    
    const strength = await securityService.checkPasswordStrength(password);
    res.json(strength);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/password/generate:
 *   get:
 *     summary: Gerar senha segura
 *     tags: [Security]
 *     parameters:
 *       - in: query
 *         name: length
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 8
 *           maximum: 32
 *         description: Comprimento da senha
 *     responses:
 *       200:
 *         description: Senha segura gerada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 password:
 *                   type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/password/generate', async (req, res, next) => {
  try {
    const length = parseInt(req.query.length) || 12;
    const password = await securityService.generateSecurePassword(length);
    res.json({ password });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/password/compromised:
 *   post:
 *     summary: Verificar se senha foi comprometida
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "MinhaSenh@123"
 *     responses:
 *       200:
 *         description: Resultado da verificação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompromised:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Senha não fornecida
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/password/compromised', async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Senha é obrigatória' });
    }
    
    const isCompromised = await securityService.isPasswordCompromised(password);
    res.json({
      isCompromised,
      message: isCompromised ? 'Senha foi comprometida' : 'Senha segura'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/email/compromised:
 *   post:
 *     summary: Verificar se email foi comprometido
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *     responses:
 *       200:
 *         description: Resultado da verificação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompromised:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Email não fornecido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/email/compromised', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }
    
    const isCompromised = await securityService.isEmailCompromised(email);
    res.json({
      isCompromised,
      message: isCompromised ? 'Email foi comprometido' : 'Email seguro'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/user/{userId}/score:
 *   get:
 *     summary: Obter score de segurança do usuário
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Score de segurança do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 100
 *                 feedback:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/user/:userId/score', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const score = await securityService.getUserSecurityScore(req.params.userId);
    res.json(score);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/ip/{ipAddress}/blocked:
 *   get:
 *     summary: Verificar se IP está bloqueado
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ipAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Endereço IP
 *     responses:
 *       200:
 *         description: Status do bloqueio do IP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isBlocked:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/ip/:ipAddress/blocked', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const isBlocked = await securityService.isIPBlocked(req.params.ipAddress);
    res.json({
      isBlocked,
      message: isBlocked ? 'IP está bloqueado' : 'IP não está bloqueado'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/security/user/{userId}/blocked:
 *   get:
 *     summary: Verificar se usuário está bloqueado
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Status do bloqueio do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isBlocked:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/user/:userId/blocked', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const isBlocked = await securityService.isUserBlocked(req.params.userId);
    res.json({
      isBlocked,
      message: isBlocked ? 'Usuário está bloqueado' : 'Usuário não está bloqueado'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
