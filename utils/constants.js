// Tipos de usuário
const USER_TYPES = {
  VOLUNTEER: 'volunteer',
  INSTITUTION: 'institution',
  COMPANY: 'company',
  UNIVERSITY: 'university'
};

// Status de usuário
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked'
};

// Status de oportunidade
const OPPORTUNITY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

// Status de candidatura
const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Categorias de atuação
const CATEGORIES = {
  EDUCATION: 'education',
  HEALTH: 'health',
  ENVIRONMENT: 'environment',
  SOCIAL_ASSISTANCE: 'social_assistance',
  CULTURE: 'culture',
  SPORTS: 'sports',
  TECHNOLOGY: 'technology',
  ANIMAL_WELFARE: 'animal_welfare',
  HUMAN_RIGHTS: 'human_rights',
  DISASTER_RELIEF: 'disaster_relief'
};

// Tipos de voluntariado
const VOLUNTEER_TYPES = {
  PRESENTIAL: 'presential',
  ONLINE: 'online',
  HYBRID: 'hybrid'
};

// Níveis de habilidade
const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

// Status de avaliação
const EVALUATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Tipos de notificação
const NOTIFICATION_TYPES = {
  NEW_OPPORTUNITY: 'new_opportunity',
  APPLICATION_UPDATE: 'application_update',
  MESSAGE: 'message',
  REMINDER: 'reminder',
  EVALUATION: 'evaluation',
  SYSTEM: 'system'
};

// Configurações de paginação
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Configurações de upload
const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Mensagens de erro
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Acesso negado. Token inválido ou expirado.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos fornecidos.',
  DUPLICATE_ENTRY: 'Registro já existe.',
  INTERNAL_ERROR: 'Erro interno do servidor.',
  INVALID_CREDENTIALS: 'Credenciais inválidas.',
  EMAIL_ALREADY_EXISTS: 'Email já está em uso.',
  DOCUMENT_ALREADY_EXISTS: 'Documento já está em uso.',
  INVALID_DOCUMENT: 'Documento inválido ou não encontrado.',
  ACCOUNT_NOT_VERIFIED: 'Conta não verificada.',
  ACCOUNT_SUSPENDED: 'Conta suspensa.',
  ACCOUNT_BLOCKED: 'Conta bloqueada.'
};

// Mensagens de sucesso
const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuário criado com sucesso.',
  USER_UPDATED: 'Usuário atualizado com sucesso.',
  USER_DELETED: 'Usuário deletado com sucesso.',
  LOGIN_SUCCESS: 'Login realizado com sucesso.',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso.',
  PASSWORD_UPDATED: 'Senha atualizada com sucesso.',
  EMAIL_VERIFIED: 'Email verificado com sucesso.',
  OPPORTUNITY_CREATED: 'Oportunidade criada com sucesso.',
  OPPORTUNITY_UPDATED: 'Oportunidade atualizada com sucesso.',
  APPLICATION_SUBMITTED: 'Candidatura enviada com sucesso.',
  APPLICATION_UPDATED: 'Candidatura atualizada com sucesso.',
  EVALUATION_SUBMITTED: 'Avaliação enviada com sucesso.',
  MESSAGE_SENT: 'Mensagem enviada com sucesso.'
};

module.exports = {
  USER_TYPES,
  USER_STATUS,
  OPPORTUNITY_STATUS,
  APPLICATION_STATUS,
  CATEGORIES,
  VOLUNTEER_TYPES,
  SKILL_LEVELS,
  EVALUATION_STATUS,
  NOTIFICATION_TYPES,
  PAGINATION,
  UPLOAD,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
