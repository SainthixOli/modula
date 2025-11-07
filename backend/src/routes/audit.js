/**
 * Rotas de Auditoria
 * 
 * Endpoints para consulta de logs de auditoria (LGPD)
 * Acesso restrito a administradores
 */

const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { validateToken } = require('../middleware/auth');

// Middleware de autorização para admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar logs de auditoria.'
    });
  }
  next();
};

// Todas as rotas requerem autenticação e permissão de admin
router.use(validateToken);
router.use(authorizeAdmin);

/**
 * GET /api/audit/logs
 * Listar logs de auditoria com filtros
 * 
 * Query params:
 * - userId: Filtrar por usuário
 * - action: Filtrar por tipo de ação
 * - resource: Filtrar por tipo de recurso
 * - resourceId: Filtrar por ID do recurso
 * - status: Filtrar por status (success/failure/error)
 * - startDate: Data inicial (ISO 8601)
 * - endDate: Data final (ISO 8601)
 * - limit: Limite de resultados (padrão: 100)
 * - offset: Offset para paginação (padrão: 0)
 */
router.get('/logs', auditController.getLogs);

/**
 * GET /api/audit/logs/:id
 * Obter detalhes de um log específico
 */
router.get('/logs/:id', auditController.getLogById);

/**
 * GET /api/audit/stats
 * Obter estatísticas de auditoria
 * 
 * Query params:
 * - startDate: Data inicial (ISO 8601)
 * - endDate: Data final (ISO 8601)
 */
router.get('/stats', auditController.getStats);

/**
 * GET /api/audit/report
 * Gerar relatório de auditoria
 * 
 * Query params:
 * - userId: Filtrar por usuário
 * - action: Filtrar por tipo de ação
 * - resource: Filtrar por tipo de recurso
 * - startDate: Data inicial (ISO 8601)
 * - endDate: Data final (ISO 8601)
 * - limit: Limite de resultados (padrão: 1000)
 */
router.get('/report', auditController.generateReport);

/**
 * GET /api/audit/user/:userId
 * Obter logs de um usuário específico
 * 
 * Query params:
 * - limit: Limite de resultados (padrão: 100)
 * - offset: Offset para paginação (padrão: 0)
 * - startDate: Data inicial (ISO 8601)
 * - endDate: Data final (ISO 8601)
 */
router.get('/user/:userId', auditController.getUserLogs);

/**
 * GET /api/audit/resource/:resource/:resourceId
 * Obter logs de um recurso específico
 * 
 * Params:
 * - resource: Tipo do recurso (user, patient, session, etc)
 * - resourceId: ID do recurso
 * 
 * Query params:
 * - limit: Limite de resultados (padrão: 100)
 * - offset: Offset para paginação (padrão: 0)
 * - startDate: Data inicial (ISO 8601)
 * - endDate: Data final (ISO 8601)
 */
router.get('/resource/:resource/:resourceId', auditController.getResourceLogs);

/**
 * POST /api/audit/clean
 * Limpar logs expirados manualmente
 */
router.post('/clean', auditController.cleanExpiredLogs);

/**
 * GET /api/audit/actions
 * Listar tipos de ações disponíveis para filtro
 */
router.get('/actions', auditController.getActions);

/**
 * GET /api/audit/resources
 * Listar tipos de recursos disponíveis para filtro
 */
router.get('/resources', auditController.getResources);

module.exports = router;
