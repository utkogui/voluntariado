const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API para métricas e analytics de uso
 */

/**
 * @swagger
 * /api/v1/analytics/track:
 *   post:
 *     summary: Registrar evento de uso
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 example: "PAGE_VIEW"
 *               eventData:
 *                 type: object
 *                 example: { "page": "/dashboard", "duration": 120 }
 *     responses:
 *       201:
 *         description: Evento registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 eventType:
 *                   type: string
 *                 eventData:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/track', authMiddleware, async (req, res, next) => {
  try {
    const event = await analyticsService.trackEvent(
      req.user.id,
      req.body.eventType,
      req.body.eventData
    );
    
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/metrics/usage:
 *   get:
 *     summary: Obter métricas de uso
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para as métricas
 *     responses:
 *       200:
 *         description: Métricas de uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     newUsers:
 *                       type: integer
 *                     opportunities:
 *                       type: integer
 *                     applications:
 *                       type: integer
 *                     donations:
 *                       type: integer
 *                     messages:
 *                       type: integer
 *                     evaluations:
 *                       type: integer
 *                     improvements:
 *                       type: integer
 *                 growth:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                     opportunities:
 *                       type: array
 *                     applications:
 *                       type: array
 *                     donations:
 *                       type: array
 *                     messages:
 *                       type: array
 *                     evaluations:
 *                       type: array
 *                     improvements:
 *                       type: array
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/metrics/usage', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const metrics = await analyticsService.getUsageMetrics(req.query.period);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/metrics/engagement:
 *   get:
 *     summary: Obter métricas de engajamento
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para as métricas
 *     responses:
 *       200:
 *         description: Métricas de engajamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avgSessionDuration:
 *                   type: number
 *                 avgPagesPerSession:
 *                   type: number
 *                 bounceRate:
 *                   type: number
 *                 retentionRate:
 *                   type: number
 *                 userEngagementScore:
 *                   type: number
 *                 topPages:
 *                   type: array
 *                 topActions:
 *                   type: array
 *                 userJourney:
 *                   type: array
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/metrics/engagement', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const metrics = await analyticsService.getEngagementMetrics(req.query.period);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/metrics/performance:
 *   get:
 *     summary: Obter métricas de performance
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para as métricas
 *     responses:
 *       200:
 *         description: Métricas de performance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avgResponseTime:
 *                   type: number
 *                 errorRate:
 *                   type: number
 *                 uptime:
 *                   type: number
 *                 throughput:
 *                   type: number
 *                 peakUsage:
 *                   type: number
 *                 slowQueries:
 *                   type: array
 *                 memoryUsage:
 *                   type: number
 *                 cpuUsage:
 *                   type: number
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/metrics/performance', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const metrics = await analyticsService.getPerformanceMetrics(req.query.period);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/metrics/business:
 *   get:
 *     summary: Obter métricas de negócio
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para as métricas
 *     responses:
 *       200:
 *         description: Métricas de negócio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversionRate:
 *                   type: number
 *                 userLifetimeValue:
 *                   type: number
 *                 churnRate:
 *                   type: number
 *                 revenue:
 *                   type: number
 *                 costPerAcquisition:
 *                   type: number
 *                 returnOnInvestment:
 *                   type: number
 *                 marketShare:
 *                   type: number
 *                 competitiveAnalysis:
 *                   type: object
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/metrics/business', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const metrics = await analyticsService.getBusinessMetrics(req.query.period);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Obter dashboard de métricas
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para as métricas
 *     responses:
 *       200:
 *         description: Dashboard de métricas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                 usage:
 *                   type: object
 *                 engagement:
 *                   type: object
 *                 performance:
 *                   type: object
 *                 business:
 *                   type: object
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
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const dashboard = await analyticsService.getMetricsDashboard(req.query.period);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/trends/{metric}:
 *   get:
 *     summary: Obter tendências de métrica
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da métrica
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para as tendências
 *     responses:
 *       200:
 *         description: Tendências da métrica
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metric:
 *                   type: string
 *                 period:
 *                   type: string
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       value:
 *                         type: object
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/trends/:metric', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const trends = await analyticsService.getTrends(req.params.metric, req.query.period);
    res.json(trends);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/comparison:
 *   get:
 *     summary: Obter comparação de períodos
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currentPeriod
 *         required: true
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Período atual
 *       - in: query
 *         name: previousPeriod
 *         required: true
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Período anterior
 *     responses:
 *       200:
 *         description: Comparação de períodos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPeriod:
 *                   type: string
 *                 previousPeriod:
 *                   type: string
 *                 comparison:
 *                   type: object
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/comparison', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const comparison = await analyticsService.getPeriodComparison(
      req.query.currentPeriod,
      req.query.previousPeriod
    );
    res.json(comparison);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/alerts:
 *   get:
 *     summary: Obter alertas de métricas
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [WARNING, ERROR, INFO]
 *                       metric:
 *                         type: string
 *                       value:
 *                         type: number
 *                       threshold:
 *                         type: number
 *                       message:
 *                         type: string
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/alerts', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const alerts = await analyticsService.getMetricAlerts();
    res.json({ alerts });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/export:
 *   get:
 *     summary: Exportar dados de analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, json, excel]
 *         description: Formato de exportação
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Período para exportação
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Filtros para exportação
 *     responses:
 *       200:
 *         description: Dados exportados
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Formato de exportação não suportado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/export', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const { format, period, filters } = req.query;
    
    if (!format) {
      return res.status(400).json({ message: 'Formato de exportação é obrigatório' });
    }
    
    const data = await analyticsService.exportData(format, period, filters);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="analytics.${format}"`);
    res.send(data);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/analytics/report:
 *   post:
 *     summary: Gerar relatório personalizado
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metrics
 *               - period
 *             properties:
 *               metrics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["users", "opportunities", "applications"]
 *               period:
 *                 type: string
 *                 enum: [7d, 30d, 90d, 1y]
 *                 example: "30d"
 *               filters:
 *                 type: object
 *                 example: { "eventType": "PAGE_VIEW" }
 *               groupBy:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["eventType", "userId"]
 *               sortBy:
 *                 type: object
 *                 example: { "_count": { "eventType": "desc" } }
 *     responses:
 *       200:
 *         description: Relatório personalizado gerado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   type: array
 *                 config:
 *                   type: object
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/report', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.type !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado - apenas administradores' });
    }
    
    const report = await analyticsService.getCustomReport(req.body);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

module.exports = router;