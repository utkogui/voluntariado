const express = require('express');
const router = express.Router();
const privacyService = require('../services/privacyService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Privacy
 *   description: API para gestão de privacidade e proteção de dados
 */

/**
 * @swagger
 * /api/v1/privacy/consent:
 *   post:
 *     summary: Registrar consentimento do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consentType
 *               - consentData
 *             properties:
 *               consentType:
 *                 type: string
 *                 example: "DATA_PROCESSING"
 *               consentData:
 *                 type: object
 *                 example: { "purpose": "marketing", "expiresAt": "2024-12-31" }
 *     responses:
 *       201:
 *         description: Consentimento registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 consentType:
 *                   type: string
 *                 consentData:
 *                   type: object
 *                 grantedAt:
 *                   type: string
 *                   format: date-time
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/consent', authMiddleware, async (req, res, next) => {
  try {
    const consent = await privacyService.recordConsent(
      req.user.id,
      req.body.consentType,
      req.body.consentData
    );
    
    res.status(201).json(consent);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/consent/{consentType}:
 *   delete:
 *     summary: Revogar consentimento do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consentType
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de consentimento
 *     responses:
 *       200:
 *         description: Consentimento revogado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Consentimento revogado com sucesso"
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/consent/:consentType', authMiddleware, async (req, res, next) => {
  try {
    await privacyService.revokeConsent(req.user.id, req.params.consentType);
    res.json({ message: 'Consentimento revogado com sucesso' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/consent/{consentType}/check:
 *   get:
 *     summary: Verificar consentimento do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: consentType
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de consentimento
 *     responses:
 *       200:
 *         description: Status do consentimento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasConsent:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/consent/:consentType/check', authMiddleware, async (req, res, next) => {
  try {
    const hasConsent = await privacyService.checkConsent(req.user.id, req.params.consentType);
    res.json({
      hasConsent,
      message: hasConsent ? 'Consentimento concedido' : 'Consentimento não concedido'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/consent:
 *   get:
 *     summary: Obter consentimentos do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consentimentos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   consentType:
 *                     type: string
 *                   consentData:
 *                     type: object
 *                   grantedAt:
 *                     type: string
 *                     format: date-time
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *                   revokedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/consent', authMiddleware, async (req, res, next) => {
  try {
    const consents = await privacyService.getUserConsents(req.user.id);
    res.json(consents);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/data:
 *   get:
 *     summary: Obter dados pessoais do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados pessoais do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                 gender:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: string
 *                 availability:
 *                   type: object
 *                 location:
 *                   type: object
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 lastLoginAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/data', authMiddleware, async (req, res, next) => {
  try {
    const data = await privacyService.getUserPersonalData(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/data/export:
 *   get:
 *     summary: Exportar dados do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados exportados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 applications:
 *                   type: array
 *                 donations:
 *                   type: array
 *                 messages:
 *                   type: array
 *                 evaluations:
 *                   type: array
 *                 improvements:
 *                   type: array
 *                 consents:
 *                   type: array
 *                 securityEvents:
 *                   type: array
 *                 exportedAt:
 *                   type: string
 *                   format: date-time
 *                 format:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/data/export', authMiddleware, async (req, res, next) => {
  try {
    const data = await privacyService.exportUserData(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/data/delete:
 *   delete:
 *     summary: Excluir dados do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deleteType:
 *                 type: string
 *                 enum: [SOFT, HARD]
 *                 default: SOFT
 *                 description: Tipo de exclusão (SOFT = lógica, HARD = permanente)
 *     responses:
 *       200:
 *         description: Dados excluídos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 deleteType:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/data/delete', authMiddleware, async (req, res, next) => {
  try {
    const result = await privacyService.deleteUserData(req.user.id, req.body.deleteType);
    res.json({
      ...result,
      message: 'Dados excluídos com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/data/anonymize:
 *   patch:
 *     summary: Anonimizar dados do usuário
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados anonimizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/data/anonymize', authMiddleware, async (req, res, next) => {
  try {
    const result = await privacyService.anonymizeUserData(req.user.id);
    res.json({
      ...result,
      message: 'Dados anonimizados com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/history:
 *   get:
 *     summary: Obter histórico de privacidade
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de privacidade
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   eventType:
 *                     type: string
 *                   eventData:
 *                     type: object
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const history = await privacyService.getPrivacyHistory(req.user.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/stats:
 *   get:
 *     summary: Obter estatísticas de privacidade (apenas administradores)
 *     tags: [Privacy]
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
 *         description: Estatísticas de privacidade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 revoked:
 *                   type: integer
 *                 exports:
 *                   type: integer
 *                 deletions:
 *                   type: integer
 *                 anonymizations:
 *                   type: integer
 *                 events:
 *                   type: integer
 *                 byType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       consentType:
 *                         type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           consentType:
 *                             type: integer
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
    
    const stats = await privacyService.getPrivacyStats(req.query.period);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/privacy/report:
 *   get:
 *     summary: Obter relatório de privacidade (apenas administradores)
 *     tags: [Privacy]
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
 *         description: Relatório de privacidade
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
 *                 consents:
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
    
    const report = await privacyService.getPrivacyReport(req.query.period);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
