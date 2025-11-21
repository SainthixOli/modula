/**
 * MÓDULA - ROTAS DE NOTIFICAÇÕES
 * 
 * Endpoints para gerenciar notificações internas do sistema.
 * Sistema completo de notificações com tipos, prioridades e ações.
 * 
 * Rotas implementadas:
 * 
 * USUÁRIO:
 * - GET /api/notifications - Listar minhas notificações
 * - GET /api/notifications/unread - Notificações não lidas
 * - GET /api/notifications/unread/count - Contador de não lidas
 * - GET /api/notifications/:id - Detalhes de notificação
 * - PUT /api/notifications/:id/read - Marcar como lida
 * - PUT /api/notifications/:id/unread - Marcar como não lida
 * - PUT /api/notifications/mark-all-read - Marcar todas como lidas
 * - DELETE /api/notifications/:id - Deletar notificação
 * - DELETE /api/notifications/read - Deletar todas lidas
 * - GET /api/notifications/stats - Estatísticas pessoais
 * 
 * ADMIN:
 * - POST /api/admin/notifications - Criar notificação
 * - POST /api/admin/notifications/bulk - Criar em lote
 * - DELETE /api/admin/notifications/cleanup - Limpar antigas
 * - GET /api/admin/notifications/stats - Estatísticas globais
 */

const express = require('express');
const router = express.Router();

// Middleware de autenticação
const { validateToken, requireAdmin } = require('../middleware/auth');

// Controller
const notificationController = require('../controllers/notificationController');

// Validações
const {
  validateCreateNotification,
  validateCreateBulk,
  validateListNotifications,
  validateMarkAllRead,
  validateCleanup,
  validateNotificationId,
} = require('../middleware/notificationValidations');

// Wrapper para async/await
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================
// ROTAS DO USUÁRIO
// ============================================

/**
 * @route   GET /api/notifications
 * @desc    Listar minhas notificações
 * @access  Private
 * @query   page, limit, is_read, type, category, priority
 */
router.get(
  '/',
  validateToken,
  validateListNotifications,
  asyncHandler(notificationController.getMyNotifications)
);

/**
 * @route   GET /api/notifications/unread
 * @desc    Obter notificações não lidas
 * @access  Private
 * @query   limit, category
 */
router.get(
  '/unread',
  validateToken,
  asyncHandler(notificationController.getUnreadNotifications)
);

/**
 * @route   GET /api/notifications/unread/count
 * @desc    Contar notificações não lidas
 * @access  Private
 */
router.get(
  '/unread/count',
  validateToken,
  asyncHandler(notificationController.getUnreadCount)
);

/**
 * @route   GET /api/notifications/stats
 * @desc    Obter estatísticas pessoais de notificações
 * @access  Private
 */
router.get(
  '/stats',
  validateToken,
  asyncHandler(notificationController.getNotificationStats)
);

/**
 * @route   GET /api/notifications/:id
 * @desc    Obter detalhes de uma notificação
 * @access  Private
 */
router.get(
  '/:id',
  validateToken,
  validateNotificationId,
  asyncHandler(notificationController.getNotificationById)
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Marcar notificação como lida
 * @access  Private
 */
router.put(
  '/:id/read',
  validateToken,
  validateNotificationId,
  asyncHandler(notificationController.markAsRead)
);

/**
 * @route   PUT /api/notifications/:id/unread
 * @desc    Marcar notificação como não lida
 * @access  Private
 */
router.put(
  '/:id/unread',
  validateToken,
  validateNotificationId,
  asyncHandler(notificationController.markAsUnread)
);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Marcar todas as notificações como lidas
 * @access  Private
 * @body    { category?, type? }
 */
router.put(
  '/mark-all-read',
  validateToken,
  validateMarkAllRead,
  asyncHandler(notificationController.markAllAsRead)
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Deletar notificação
 * @access  Private
 */
router.delete(
  '/:id',
  validateToken,
  validateNotificationId,
  asyncHandler(notificationController.deleteNotification)
);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Deletar todas as notificações lidas
 * @access  Private
 */
router.delete(
  '/read',
  validateToken,
  asyncHandler(notificationController.deleteAllRead)
);

// ============================================
// ROTAS ADMINISTRATIVAS
// ============================================

/**
 * @route   POST /api/admin/notifications
 * @desc    Criar notificação para um usuário
 * @access  Admin
 * @body    { user_id, type, category, title, message, priority, ... }
 */
router.post(
  '/admin',
  validateToken,
  requireAdmin,
  validateCreateNotification,
  asyncHandler(notificationController.createNotification)
);

/**
 * @route   POST /api/admin/notifications/bulk
 * @desc    Criar notificações em lote para múltiplos usuários
 * @access  Admin
 * @body    { user_ids[], type, category, title, message, priority, ... }
 */
router.post(
  '/admin/bulk',
  validateToken,
  requireAdmin,
  validateCreateBulk,
  asyncHandler(notificationController.createBulkNotifications)
);

/**
 * @route   DELETE /api/admin/notifications/cleanup
 * @desc    Limpar notificações antigas/expiradas
 * @access  Admin
 * @query   days_old (default 30)
 */
router.delete(
  '/admin/cleanup',
  validateToken,
  requireAdmin,
  validateCleanup,
  asyncHandler(notificationController.cleanupOldNotifications)
);

/**
 * @route   GET /api/admin/notifications/stats
 * @desc    Obter estatísticas globais de notificações
 * @access  Admin
 */
router.get(
  '/admin/stats',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.getGlobalNotificationStats)
);

// ============================================
// ROTAS DE TRIGGERS (ADMIN)
// ============================================

/**
 * @route   GET /api/notifications/admin/triggers/stats
 * @desc    Estatísticas dos triggers (deve vir antes de /admin/triggers/:id)
 * @access  Admin
 */
router.get(
  '/admin/triggers/stats',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.getTriggerStats)
);

/**
 * @route   GET /api/notifications/admin/triggers
 * @desc    Listar todos os triggers configurados
 * @access  Admin
 */
router.get(
  '/admin/triggers',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.getAllTriggers)
);

/**
 * @route   PUT /api/notifications/admin/triggers/:id
 * @desc    Atualizar status de um trigger
 * @access  Admin
 */
router.put(
  '/admin/triggers/:id',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.updateTrigger)
);

/**
 * @route   POST /api/notifications/admin/triggers/:id/test
 * @desc    Testar um trigger específico
 * @access  Admin
 */
router.post(
  '/admin/triggers/:id/test',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.testTrigger)
);

/**
 * @route   POST /api/notifications/admin/triggers/:type/execute
 * @desc    Executar manualmente um trigger por tipo
 * @access  Admin
 */
router.post(
  '/admin/triggers/:type/execute',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.executeTrigger)
);

// ============================================
// ROTAS DE TRIGGERS CUSTOMIZADOS (ADMIN)
// ============================================

/**
 * @route   POST /api/notifications/admin/triggers/custom
 * @desc    Criar novo trigger customizado
 * @access  Admin
 */
router.post(
  '/admin/triggers/custom',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.createCustomTrigger)
);

/**
 * @route   GET /api/notifications/admin/triggers/custom/:id
 * @desc    Obter detalhes de um trigger customizado
 * @access  Admin
 */
router.get(
  '/admin/triggers/custom/:id',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.getCustomTriggerById)
);

/**
 * @route   PUT /api/notifications/admin/triggers/custom/:id
 * @desc    Atualizar trigger customizado
 * @access  Admin
 */
router.put(
  '/admin/triggers/custom/:id',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.updateCustomTrigger)
);

/**
 * @route   DELETE /api/notifications/admin/triggers/custom/:id
 * @desc    Deletar trigger customizado
 * @access  Admin
 */
router.delete(
  '/admin/triggers/custom/:id',
  validateToken,
  requireAdmin,
  asyncHandler(notificationController.deleteCustomTrigger)
);

// ============================================
// EXPORT
// ============================================

module.exports = router;