const express = require('express');
const router = express.Router();
const improvementService = require('../services/improvementService');
const authMiddleware = require('../middleware/authMiddleware');
const { validateImprovement, validateVote, validateComment } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Improvements
 *   description: API para gerenciar sugestões de melhorias
 */

/**
 * @swagger
 * /api/v1/improvements:
 *   post:
 *     summary: Criar nova sugestão de melhoria
 *     tags: [Improvements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Melhorar sistema de notificações"
 *               description:
 *                 type: string
 *                 example: "Sugestão para melhorar o sistema de notificações..."
 *               category:
 *                 type: string
 *                 enum: [UI_UX, FUNCTIONALITY, PERFORMANCE, SECURITY, ACCESSIBILITY, OTHER]
 *                 example: "UI_UX"
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 example: "MEDIUM"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.png"]
 *     responses:
 *       201:
 *         description: Sugestão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 category:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     type:
 *                       type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', authMiddleware, validateImprovement, async (req, res, next) => {
  try {
    const improvement = await improvementService.createImprovement({
      ...req.body,
      userId: req.user.id
    });
    
    res.status(201).json(improvement);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/my:
 *   get:
 *     summary: Obter sugestões do usuário logado
 *     tags: [Improvements]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED]
 *         description: Filtrar por status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [UI_UX, FUNCTIONALITY, PERFORMANCE, SECURITY, ACCESSIBILITY, OTHER]
 *         description: Filtrar por categoria
 *     responses:
 *       200:
 *         description: Lista de sugestões do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 improvements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       votes:
 *                         type: array
 *                       comments:
 *                         type: array
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
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const result = await improvementService.getUserImprovements(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements:
 *   get:
 *     summary: Listar todas as sugestões
 *     tags: [Improvements]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED]
 *         description: Filtrar por status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [UI_UX, FUNCTIONALITY, PERFORMANCE, SECURITY, ACCESSIBILITY, OTHER]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, votes, priority]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem da ordenação
 *     responses:
 *       200:
 *         description: Lista de sugestões
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 improvements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       votes:
 *                         type: array
 *                       comments:
 *                         type: array
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
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await improvementService.getAllImprovements(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/{id}:
 *   get:
 *     summary: Obter sugestão específica
 *     tags: [Improvements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sugestão
 *     responses:
 *       200:
 *         description: Detalhes da sugestão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 category:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     type:
 *                       type: string
 *                 votes:
 *                   type: array
 *                 comments:
 *                   type: array
 *       404:
 *         description: Sugestão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', async (req, res, next) => {
  try {
    const improvement = await improvementService.getImprovementById(req.params.id);
    res.json(improvement);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/{id}/vote:
 *   post:
 *     summary: Votar em sugestão
 *     tags: [Improvements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sugestão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voteType
 *             properties:
 *               voteType:
 *                 type: string
 *                 enum: [UP, DOWN]
 *                 example: "UP"
 *     responses:
 *       200:
 *         description: Voto registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 action:
 *                   type: string
 *                   enum: [created, updated, removed]
 *                 voteType:
 *                   type: string
 *                   enum: [UP, DOWN]
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Sugestão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/:id/vote', authMiddleware, validateVote, async (req, res, next) => {
  try {
    const result = await improvementService.voteOnImprovement(
      req.params.id,
      req.user.id,
      req.body.voteType
    );
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/{id}/comments:
 *   post:
 *     summary: Comentar em sugestão
 *     tags: [Improvements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sugestão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Excelente sugestão!"
 *     responses:
 *       201:
 *         description: Comentário adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 comment:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Sugestão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/:id/comments', authMiddleware, validateComment, async (req, res, next) => {
  try {
    const comment = await improvementService.commentOnImprovement(
      req.params.id,
      req.user.id,
      req.body.comment
    );
    
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/{id}/status:
 *   patch:
 *     summary: Atualizar status da sugestão (apenas administradores)
 *     tags: [Improvements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sugestão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED]
 *                 example: "APPROVED"
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 reviewedAt:
 *                   type: string
 *                   format: date-time
 *                 reviewedBy:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Sugestão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const improvement = await improvementService.updateImprovementStatus(
      req.params.id,
      req.body.status,
      req.user.id
    );
    
    res.json(improvement);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/{id}/implement:
 *   patch:
 *     summary: Marcar sugestão como implementada (apenas administradores)
 *     tags: [Improvements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sugestão
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - implementationNotes
 *             properties:
 *               implementationNotes:
 *                 type: string
 *                 example: "Implementado na versão 2.1.0"
 *     responses:
 *       200:
 *         description: Sugestão marcada como implementada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 implementationNotes:
 *                   type: string
 *                 implementedAt:
 *                   type: string
 *                   format: date-time
 *                 implementedBy:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Sugestão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/:id/implement', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const improvement = await improvementService.markAsImplemented(
      req.params.id,
      req.body.implementationNotes,
      req.user.id
    );
    
    res.json(improvement);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/search:
 *   get:
 *     summary: Buscar sugestões
 *     tags: [Improvements]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
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
 *     responses:
 *       200:
 *         description: Resultados da busca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 improvements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       votes:
 *                         type: array
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
 *       400:
 *         description: Termo de busca é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/search', async (req, res, next) => {
  try {
    const result = await improvementService.searchImprovements(req.query.q, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/top/voted:
 *   get:
 *     summary: Obter sugestões mais votadas
 *     tags: [Improvements]
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
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para filtrar sugestões
 *     responses:
 *       200:
 *         description: Lista de sugestões mais votadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 improvements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       votes:
 *                         type: array
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
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/top/voted', async (req, res, next) => {
  try {
    const result = await improvementService.getTopVotedImprovements(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/category/{category}:
 *   get:
 *     summary: Obter sugestões por categoria
 *     tags: [Improvements]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [UI_UX, FUNCTIONALITY, PERFORMANCE, SECURITY, ACCESSIBILITY, OTHER]
 *         description: Categoria da sugestão
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
 *     responses:
 *       200:
 *         description: Lista de sugestões por categoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 improvements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       votes:
 *                         type: array
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
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/category/:category', async (req, res, next) => {
  try {
    const result = await improvementService.getImprovementsByCategory(req.params.category, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/pending:
 *   get:
 *     summary: Obter sugestões pendentes (apenas administradores)
 *     tags: [Improvements]
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
 *     responses:
 *       200:
 *         description: Lista de sugestões pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 improvements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       votes:
 *                         type: array
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
router.get('/pending', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const result = await improvementService.getPendingImprovements(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/improvements/stats:
 *   get:
 *     summary: Obter estatísticas de sugestões (apenas administradores)
 *     tags: [Improvements]
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
 *         description: Estatísticas de sugestões
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 pending:
 *                   type: integer
 *                 approved:
 *                   type: integer
 *                 implemented:
 *                   type: integer
 *                 byCategory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: integer
 *                 byPriority:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       priority:
 *                         type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           priority:
 *                             type: integer
 *                 top:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       votes:
 *                         type: array
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
    
    const stats = await improvementService.getImprovementStats(req.query.period);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
