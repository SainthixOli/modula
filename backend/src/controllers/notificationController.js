/**
 * MÓDULA - CONTROLLER DE NOTIFICAÇÕES
 * 
 * Lógica completa para gerenciar notificações internas do sistema.
 * CRUD completo, marcação de lidas, filtros e estatísticas.
 */

const { Notification, User, NotificationRule } = require('../models');
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
// GERENCIAMENTO DE TRIGGERS
// ============================================

const notificationTriggers = require('../services/notificationTriggers');

// Configuração dos triggers disponíveis
const AVAILABLE_TRIGGERS = [
  {
    id: 'transfer_requested',
    name: 'Transferência Solicitada',
    description: 'Notifica admins e profissional destino quando uma transferência é solicitada',
    type: 'transfer',
    event: 'transfer_requested',
    enabled: true,
    auto_trigger: true,
  },
  {
    id: 'transfer_approved',
    name: 'Transferência Aprovada',
    description: 'Notifica profissionais envolvidos quando uma transferência é aprovada',
    type: 'transfer',
    event: 'transfer_approved',
    enabled: true,
    auto_trigger: true,
  },
  {
    id: 'transfer_rejected',
    name: 'Transferência Rejeitada',
    description: 'Notifica profissional solicitante quando uma transferência é rejeitada',
    type: 'transfer',
    event: 'transfer_rejected',
    enabled: true,
    auto_trigger: true,
  },
  {
    id: 'session_upcoming',
    name: 'Lembrete de Sessão (24h)',
    description: 'Envia lembrete 24h antes de cada sessão agendada',
    type: 'session',
    event: 'session_upcoming',
    schedule: '0 8 * * *',
    enabled: true,
    auto_trigger: false,
  },
  {
    id: 'session_cancelled',
    name: 'Sessão Cancelada',
    description: 'Notifica profissional quando uma sessão é cancelada',
    type: 'session',
    event: 'session_cancelled',
    enabled: true,
    auto_trigger: true,
  },
  {
    id: 'evolution_pending',
    name: 'Evolução Pendente',
    description: 'Notifica sobre sessões completadas sem evolução registrada',
    type: 'session',
    event: 'evolution_pending',
    schedule: '0 18 * * *',
    enabled: true,
    auto_trigger: false,
  },
  {
    id: 'anamnesis_pending',
    name: 'Anamnese Pendente',
    description: 'Notifica sobre anamneses não finalizadas há mais de 7 dias',
    type: 'anamnesis',
    event: 'anamnesis_pending',
    schedule: '0 9 * * 1',
    enabled: true,
    auto_trigger: false,
  },
  {
    id: 'anamnesis_completed',
    name: 'Anamnese Completada',
    description: 'Notifica profissional quando anamnese é completada',
    type: 'anamnesis',
    event: 'anamnesis_completed',
    enabled: true,
    auto_trigger: true,
  },
  {
    id: 'patient_new',
    name: 'Novo Paciente',
    description: 'Notifica profissional sobre novo paciente cadastrado',
    type: 'patient',
    event: 'patient_new',
    enabled: true,
    auto_trigger: true,
  },
  {
    id: 'backup_completed',
    name: 'Backup Realizado',
    description: 'Notifica admins sobre conclusão de backup do sistema',
    type: 'system',
    event: 'backup_completed',
    enabled: true,
    auto_trigger: true,
  },
];

// Armazenamento temporário do estado dos triggers (em produção, usar banco de dados)
let triggerStates = {};
AVAILABLE_TRIGGERS.forEach(trigger => {
  triggerStates[trigger.id] = {
    ...trigger,
    trigger_count: 0,
    last_triggered: null,
  };
});

/**
 * Listar todos os triggers disponíveis (hard-coded + customizados do BD)
 * GET /api/admin/notifications/triggers
 */
const getAllTriggers = async (req, res) => {
  // 1. Triggers hard-coded (sistema)
  const systemTriggers = Object.values(triggerStates).map(t => ({
    ...t,
    is_system: true,
    is_custom: false,
  }));
  
  // 2. Triggers customizados do banco de dados
  const customTriggers = await NotificationRule.findAll({
    where: { deleted_at: null },
    include: [
      {
        model: User,
        as: 'Creator',
        attributes: ['id', 'full_name'],
        required: false,
      },
    ],
    order: [['created_at', 'DESC']],
  });
  
  const formattedCustomTriggers = customTriggers.map(rule => ({
    id: rule.id,
    name: rule.name,
    description: rule.description,
    type: rule.type,
    event: rule.event_type,
    enabled: rule.enabled,
    auto_trigger: !rule.is_scheduled,
    schedule: rule.schedule,
    trigger_count: rule.trigger_count,
    last_triggered: rule.last_triggered_at,
    is_system: false,
    is_custom: true,
    created_by: rule.Creator ? {
      id: rule.Creator.id,
      name: rule.Creator.full_name,
    } : null,
    created_at: rule.created_at,
  }));
  
  // 3. Combina todos
  const allTriggers = [...systemTriggers, ...formattedCustomTriggers];
  
  res.json({
    success: true,
    data: {
      triggers: allTriggers,
      total: allTriggers.length,
      system_triggers: systemTriggers.length,
      custom_triggers: formattedCustomTriggers.length,
    },
  });
};

/**
 * Obter estatísticas dos triggers
 * GET /api/admin/notifications/triggers/stats
 */
const getTriggerStats = async (req, res) => {
  const triggers = Object.values(triggerStates);
  
  const stats = {
    total_triggers: triggers.length,
    active_triggers: triggers.filter(t => t.enabled).length,
    inactive_triggers: triggers.filter(t => !t.enabled).length,
    total_notifications_sent: triggers.reduce((sum, t) => sum + (t.trigger_count || 0), 0),
    triggers_by_type: {},
  };
  
  // Agrupar por tipo
  triggers.forEach(trigger => {
    if (!stats.triggers_by_type[trigger.type]) {
      stats.triggers_by_type[trigger.type] = 0;
    }
    stats.triggers_by_type[trigger.type]++;
  });
  
  res.json({
    success: true,
    data: stats,
  });
};

/**
 * Atualizar status de um trigger
 * PUT /api/admin/notifications/triggers/:id
 */
const updateTrigger = async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  
  if (!triggerStates[id]) {
    throw new AppError('Trigger não encontrado', 404, 'TRIGGER_NOT_FOUND');
  }
  
  triggerStates[id].enabled = enabled;
  
  res.json({
    success: true,
    message: `Trigger ${enabled ? 'ativado' : 'desativado'} com sucesso`,
    data: {
      trigger: triggerStates[id],
    },
  });
};

/**
 * Testar um trigger específico
 * POST /api/admin/notifications/triggers/:id/test
 */
const testTrigger = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  if (!triggerStates[id]) {
    throw new AppError('Trigger não encontrado', 404, 'TRIGGER_NOT_FOUND');
  }
  
  if (!triggerStates[id].enabled) {
    throw new AppError('Trigger está desativado', 400, 'TRIGGER_DISABLED');
  }
  
  // Criar notificação de teste para o próprio admin
  await Notification.createForUser(userId, {
    type: 'info',
    category: 'system',
    title: `[TESTE] ${triggerStates[id].name}`,
    message: `Este é um teste do trigger "${triggerStates[id].name}". Em produção, seria enviado para os usuários apropriados.`,
    priority: 'low',
    action_type: 'none',
    related_entity_type: 'system',
  });
  
  res.json({
    success: true,
    message: 'Trigger testado com sucesso. Verifique suas notificações.',
  });
};

/**
 * Executar manualmente um trigger
 * POST /api/admin/notifications/triggers/:type/execute
 */
const executeTrigger = async (req, res) => {
  const { type } = req.params;
  
  let executed = false;
  let message = '';
  
  try {
    switch (type) {
      case 'session_upcoming':
        if (triggerStates['session_upcoming']?.enabled) {
          await notificationTriggers.notifyUpcomingSessions();
          triggerStates['session_upcoming'].trigger_count++;
          triggerStates['session_upcoming'].last_triggered = new Date();
          executed = true;
          message = 'Notificações de sessões próximas enviadas';
        }
        break;
        
      case 'evolution_pending':
        if (triggerStates['evolution_pending']?.enabled) {
          await notificationTriggers.notifyPendingEvolutions();
          triggerStates['evolution_pending'].trigger_count++;
          triggerStates['evolution_pending'].last_triggered = new Date();
          executed = true;
          message = 'Notificações de evoluções pendentes enviadas';
        }
        break;
        
      case 'anamnesis_pending':
        if (triggerStates['anamnesis_pending']?.enabled) {
          await notificationTriggers.notifyPendingAnamnesis();
          triggerStates['anamnesis_pending'].trigger_count++;
          triggerStates['anamnesis_pending'].last_triggered = new Date();
          executed = true;
          message = 'Notificações de anamneses pendentes enviadas';
        }
        break;
        
      default:
        throw new AppError('Tipo de trigger inválido ou não executável manualmente', 400, 'INVALID_TRIGGER_TYPE');
    }
    
    if (!executed) {
      throw new AppError('Trigger está desativado', 400, 'TRIGGER_DISABLED');
    }
    
    res.json({
      success: true,
      message,
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`Erro ao executar trigger: ${error.message}`, 500, 'TRIGGER_EXECUTION_ERROR');
  }
};

// ============================================
// CRUD DE TRIGGERS CUSTOMIZADOS
// ============================================

/**
 * Criar novo trigger customizado
 * POST /api/notifications/admin/triggers/custom
 */
const createCustomTrigger = async (req, res) => {
  const {
    name,
    description,
    type,
    category,
    event_type,
    conditions,
    notification_template,
    target_user_type,
    target_user_ids,
    schedule,
    is_scheduled,
    enabled,
  } = req.body;
  
  const userId = req.userId;
  
  // Validações básicas
  if (!name || !type || !category || !event_type || !notification_template || !target_user_type) {
    throw new AppError('Campos obrigatórios faltando', 400, 'MISSING_FIELDS');
  }
  
  // Criar trigger
  const trigger = await NotificationRule.create({
    name,
    description,
    type,
    category,
    event_type,
    conditions: conditions || {},
    notification_template,
    target_user_type,
    target_user_ids: target_user_ids || null,
    schedule: schedule || null,
    is_scheduled: is_scheduled || false,
    enabled: enabled !== undefined ? enabled : true,
    created_by: userId,
  });
  
  res.status(201).json({
    success: true,
    message: 'Trigger customizado criado com sucesso',
    data: {
      trigger: trigger.getFormattedData(),
    },
  });
};

/**
 * Atualizar trigger customizado
 * PUT /api/notifications/admin/triggers/custom/:id
 */
const updateCustomTrigger = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const trigger = await NotificationRule.findByPk(id);
  
  if (!trigger) {
    throw new AppError('Trigger não encontrado', 404, 'TRIGGER_NOT_FOUND');
  }
  
  // Atualiza campos permitidos
  const allowedFields = [
    'name',
    'description',
    'type',
    'category',
    'event_type',
    'conditions',
    'notification_template',
    'target_user_type',
    'target_user_ids',
    'schedule',
    'is_scheduled',
    'enabled',
  ];
  
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      trigger[field] = updates[field];
    }
  });
  
  await trigger.save();
  
  res.json({
    success: true,
    message: 'Trigger atualizado com sucesso',
    data: {
      trigger: trigger.getFormattedData(),
    },
  });
};

/**
 * Deletar trigger customizado
 * DELETE /api/notifications/admin/triggers/custom/:id
 */
const deleteCustomTrigger = async (req, res) => {
  const { id } = req.params;
  
  const trigger = await NotificationRule.findByPk(id);
  
  if (!trigger) {
    throw new AppError('Trigger não encontrado', 404, 'TRIGGER_NOT_FOUND');
  }
  
  // Soft delete
  await trigger.destroy();
  
  res.json({
    success: true,
    message: 'Trigger deletado com sucesso',
  });
};

/**
 * Obter detalhes de um trigger customizado
 * GET /api/notifications/admin/triggers/custom/:id
 */
const getCustomTriggerById = async (req, res) => {
  const { id } = req.params;
  
  const trigger = await NotificationRule.findByPk(id, {
    include: [
      {
        model: User,
        as: 'Creator',
        attributes: ['id', 'full_name'],
        required: false,
      },
    ],
  });
  
  if (!trigger) {
    throw new AppError('Trigger não encontrado', 404, 'TRIGGER_NOT_FOUND');
  }
  
  res.json({
    success: true,
    data: {
      trigger: trigger.getFormattedData(),
      creator: trigger.Creator ? {
        id: trigger.Creator.id,
        name: trigger.Creator.full_name,
      } : null,
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
  
  // Gerenciamento de triggers
  getAllTriggers,
  getTriggerStats,
  updateTrigger,
  testTrigger,
  executeTrigger,
  
  // CRUD de triggers customizados
  createCustomTrigger,
  updateCustomTrigger,
  deleteCustomTrigger,
  getCustomTriggerById,
};