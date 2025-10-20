/**
 * MÓDULA - CONTROLLER DE NOTIFICAÇÕES
 * 
 * Lógica completa para gerenciar notificações internas do sistema.
 * CRUD completo, marcação de lidas, filtros e estatísticas.
 */

const { Notification, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

// ============================================
// OPERAÇÕES BÁSICAS
// ============================================

/**
 * Listar minhas notificações
 * GET /api/notifications
 * 
 * @route GET /api/notifications
 * @access Private
 */
const getMyNotifications = async (req, res) => {
  const userId = req.userId;
  const {
    page = 1,
    limit = 20,
    is_read,
    type,
    category,
    priority,
  } = req.query;

  const result = await Notification.findByUser(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    is_read: is_read !== undefined ? is_read === 'true' : null,
    type,
    category,
  });

  // Filtrar por prioridade se fornecido
  if (priority) {
    result.notifications = result.notifications.filter(
      n => n.priority === priority
    );
  }

  // Formatar notificações
  const formatted = result.notifications.map(n => n.getFormattedData());

  res.json({
    success: true,
    data: {
      notifications: formatted,
    },
    pagination: result.pagination,
  });
};

/**
 * Obter notificações não lidas
 * GET /api/notifications/unread
 * 
 * @route GET /api/notifications/unread
 * @access Private
 */
const getUnreadNotifications = async (req, res) => {
  const userId = req.userId;
  const { limit = 20, category } = req.query;

  const notifications = await Notification.findUnreadByUser(userId, {
    limit: parseInt(limit),
    category,
  });

  const formatted = notifications.map(n => n.getFormattedData());

  res.json({
    success: true,
    data: {
      notifications: formatted,
      count: formatted.length,
    },
  });
};

/**
 * Contar notificações não lidas
 * GET /api/notifications/unread/count
 * 
 * @route GET /api/notifications/unread/count
 * @access Private
 */
const getUnreadCount = async (req, res) => {
  const userId = req.userId;

  const count = await Notification.countUnreadByUser(userId);

  res.json({
    success: true,
    data: {
      unread_count: count,
    },
  });
};

/**
 * Obter detalhes de uma notificação
 * GET /api/notifications/:id
 * 
 * @route GET /api/notifications/:id
 * @access Private
 */
const getNotificationById = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    throw new AppError('Notificação não encontrada', 404, 'NOTIFICATION_NOT_FOUND');
  }

  // Verificar se pertence ao usuário
  if (notification.user_id !== userId) {
    throw new AppError(
      'Você não tem permissão para visualizar esta notificação',
      403,
      'UNAUTHORIZED_ACCESS'
    );
  }

  res.json({
    success: true,
    data: {
      notification: notification.getFormattedData(),
    },
  });
};

// ============================================
// MARCAÇÃO DE LEITURA
// ============================================

/**
 * Marcar notificação como lida
 * PUT /api/notifications/:id/read
 * 
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    throw new AppError('Notificação não encontrada', 404, 'NOTIFICATION_NOT_FOUND');
  }

  if (notification.user_id !== userId) {
    throw new AppError(
      'Você não tem permissão para marcar esta notificação',
      403,
      'UNAUTHORIZED_ACCESS'
    );
  }

  await notification.markAsRead();

  res.json({
    success: true,
    message: 'Notificação marcada como lida',
    data: {
      notification: notification.getFormattedData(),
    },
  });
};

/**
 * Marcar notificação como não lida
 * PUT /api/notifications/:id/unread
 * 
 * @route PUT /api/notifications/:id/unread
 * @access Private
 */
const markAsUnread = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    throw new AppError('Notificação não encontrada', 404, 'NOTIFICATION_NOT_FOUND');
  }

  if (notification.user_id !== userId) {
    throw new AppError(
      'Você não tem permissão para marcar esta notificação',
      403,
      'UNAUTHORIZED_ACCESS'
    );
  }

  await notification.markAsUnread();

  res.json({
    success: true,
    message: 'Notificação marcada como não lida',
    data: {
      notification: notification.getFormattedData(),
    },
  });
};

/**
 * Marcar todas as notificações como lidas
 * PUT /api/notifications/mark-all-read
 * 
 * @route PUT /api/notifications/mark-all-read
 * @access Private
 */
const markAllAsRead = async (req, res) => {
  const userId = req.userId;
  const { category, type } = req.body;

  const filters = {};
  if (category) filters.category = category;
  if (type) filters.type = type;

  const updated = await Notification.markAllAsReadByUser(userId, filters);

  res.json({
    success: true,
    message: `${updated} notificação(ões) marcada(s) como lida(s)`,
    data: {
      marked_count: updated,
    },
  });
};

// ============================================
// CRIAÇÃO E DELEÇÃO
// ============================================

/**
 * Criar notificação (admin/sistema)
 * POST /api/notifications
 * 
 * @route POST /api/notifications
 * @access Admin
 */
const createNotification = async (req, res) => {
  const {
    user_id,
    type,
    category,
    title,
    message,
    priority,
    action_type,
    action_url,
    action_data,
    related_entity_type,
    related_entity_id,
    expires_at,
  } = req.body;

  const created_by = req.userId;

  // Verificar se usuário destino existe
  const user = await User.findByPk(user_id);
  if (!user) {
    throw new AppError('Usuário destino não encontrado', 404, 'USER_NOT_FOUND');
  }

  const notification = await Notification.createForUser(user_id, {
    type,
    category,
    title,
    message,
    priority,
    action_type,
    action_url,
    action_data,
    related_entity_type,
    related_entity_id,
    created_by,
    expires_at,
  });

  res.status(201).json({
    success: true,
    message: 'Notificação criada com sucesso',
    data: {
      notification: notification.getFormattedData(),
    },
  });
};

/**
 * Deletar notificação
 * DELETE /api/notifications/:id
 * 
 * @route DELETE /api/notifications/:id
 * @access Private
 */
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    throw new AppError('Notificação não encontrada', 404, 'NOTIFICATION_NOT_FOUND');
  }

  if (notification.user_id !== userId) {
    throw new AppError(
      'Você não tem permissão para deletar esta notificação',
      403,
      'UNAUTHORIZED_ACCESS'
    );
  }

  await notification.destroy();

  res.json({
    success: true,
    message: 'Notificação deletada com sucesso',
  });
};

/**
 * Deletar todas as notificações lidas
 * DELETE /api/notifications/read
 * 
 * @route DELETE /api/notifications/read
 * @access Private
 */
const deleteAllRead = async (req, res) => {
  const userId = req.userId;

  const deleted = await Notification.destroy({
    where: {
      user_id: userId,
      is_read: true,
    },
  });

  res.json({
    success: true,
    message: `${deleted} notificação(ões) deletada(s)`,
    data: {
      deleted_count: deleted,
    },
  });
};

// ============================================
// ESTATÍSTICAS
// ============================================

/**
 * Obter estatísticas das notificações
 * GET /api/notifications/stats
 * 
 * @route GET /api/notifications/stats
 * @access Private
 */
const getNotificationStats = async (req, res) => {
  const userId = req.userId;

  const stats = await Notification.getStats(userId);

  res.json({
    success: true,
    data: {
      statistics: stats,
    },
  });
};

// ============================================
// OPERAÇÕES ADMINISTRATIVAS
// ============================================

/**
 * Criar notificação em lote (admin)
 * POST /api/admin/notifications/bulk
 * 
 * @route POST /api/admin/notifications/bulk
 * @access Admin
 */
const createBulkNotifications = async (req, res) => {
  const {
    user_ids,
    type,
    category,
    title,
    message,
    priority,
    action_type,
    action_url,
    action_data,
  } = req.body;

  const created_by = req.userId;

  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    throw new AppError('Lista de usuários inválida', 400, 'INVALID_USER_IDS');
  }

  // Validar que todos os usuários existem
  const users = await User.findAll({
    where: {
      id: user_ids,
    },
    attributes: ['id'],
  });

  if (users.length !== user_ids.length) {
    throw new AppError(
      'Alguns usuários não foram encontrados',
      404,
      'USERS_NOT_FOUND'
    );
  }

  const notifications = await Notification.createBulk(user_ids, {
    type,
    category,
    title,
    message,
    priority,
    action_type,
    action_url,
    action_data,
    created_by,
  });

  res.status(201).json({
    success: true,
    message: `${notifications.length} notificação(ões) criada(s)`,
    data: {
      created_count: notifications.length,
      notifications: notifications.map(n => n.getFormattedData()),
    },
  });
};

/**
 * Limpar notificações antigas (admin)
 * DELETE /api/admin/notifications/cleanup
 * 
 * @route DELETE /api/admin/notifications/cleanup
 * @access Admin
 */
const cleanupOldNotifications = async (req, res) => {
  const { days_old = 30 } = req.query;

  const result = await Notification.deleteOld(parseInt(days_old));

  res.json({
    success: true,
    message: `Limpeza concluída. ${result.total} notificação(ões) removida(s)`,
    data: {
      deleted_read: result.deleted_read,
      deleted_expired: result.deleted_expired,
      total: result.total,
    },
  });
};

/**
 * Estatísticas globais de notificações (admin)
 * GET /api/admin/notifications/stats
 * 
 * @route GET /api/admin/notifications/stats
 * @access Admin
 */
const getGlobalNotificationStats = async (req, res) => {
  const stats = await Notification.getStats();

  // Buscar últimas notificações criadas
  const recentNotifications = await Notification.findAll({
    limit: 10,
    order: [['created_at', 'DESC']],
    include: [
      { 
        model: User, 
        as: 'User', 
        attributes: ['id', 'full_name', 'email'] 
      },
      { 
        model: User, 
        as: 'Creator', 
        attributes: ['id', 'full_name'],
        required: false,
      },
    ],
  });

  res.json({
    success: true,
    data: {
      statistics: stats,
      recent_notifications: recentNotifications.map(n => ({
        ...n.getFormattedData(),
        user: n.User ? {
          id: n.User.id,
          name: n.User.full_name,
        } : null,
        creator: n.Creator ? {
          id: n.Creator.id,
          name: n.Creator.full_name,
        } : null,
      })),
    },
  });
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Operações básicas
  getMyNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getNotificationById,
  
  // Marcação de leitura
  markAsRead,
  markAsUnread,
  markAllAsRead,
  
  // Criação e deleção
  createNotification,
  deleteNotification,
  deleteAllRead,
  
  // Estatísticas
  getNotificationStats,
  
  // Operações administrativas
  createBulkNotifications,
  cleanupOldNotifications,
  getGlobalNotificationStats,
};