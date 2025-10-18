/**
 * MÓDULA - MODELO NOTIFICATION
 * 
 * Modelo para gerenciar notificações internas do sistema.
 * Suporta diferentes tipos, prioridades e ações.
 * 
 * Funcionalidades:
 * - Notificações por usuário
 * - Tipos variados (info, warning, success, error)
 * - Sistema de leitura/não lida
 * - Limpeza automática de notificações antigas
 * - Ações associadas (links, callbacks)
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  // ============================================
  // IDENTIFICAÇÃO
  // ============================================
  
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único da notificação',
  },

  // ============================================
  // RELACIONAMENTOS
  // ============================================

  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Deletar notificações quando usuário é deletado
    comment: 'ID do usuário destinatário',
  },

  // ============================================
  // TIPO E CATEGORIA
  // ============================================

  type: {
    type: DataTypes.ENUM(
      'info',         // Informação geral
      'success',      // Ação bem-sucedida
      'warning',      // Aviso/atenção
      'error',        // Erro que requer ação
      'reminder'      // Lembrete
    ),
    allowNull: false,
    defaultValue: 'info',
    comment: 'Tipo da notificação (define cor/ícone)',
  },

  category: {
    type: DataTypes.ENUM(
      'system',           // Sistema geral
      'transfer',         // Transferências
      'session',          // Sessões/consultas
      'patient',          // Pacientes
      'anamnesis',        // Anamnese
      'admin',            // Administrativa
      'backup',           // Backup/manutenção
      'security'          // Segurança
    ),
    allowNull: false,
    defaultValue: 'system',
    comment: 'Categoria da notificação',
  },

  // ============================================
  // CONTEÚDO
  // ============================================

  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Título da notificação',
    validate: {
      len: {
        args: [3, 200],
        msg: 'Título deve ter entre 3 e 200 caracteres',
      },
    },
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Mensagem detalhada da notificação',
    validate: {
      len: {
        args: [5, 1000],
        msg: 'Mensagem deve ter entre 5 e 1000 caracteres',
      },
    },
  },

  // ============================================
  // PRIORIDADE E STATUS
  // ============================================

  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
    comment: 'Prioridade da notificação',
  },

  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Se a notificação foi lida',
  },

  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora que foi lida',
  },

  // ============================================
  // AÇÃO ASSOCIADA
  // ============================================

  action_type: {
    type: DataTypes.ENUM(
      'none',              // Sem ação
      'link',              // Link para página
      'approve_transfer',  // Aprovar transferência
      'reject_transfer',   // Rejeitar transferência
      'view_session',      // Ver sessão
      'view_patient',      // Ver paciente
      'complete_anamnesis',// Completar anamnese
      'custom'             // Ação customizada
    ),
    allowNull: false,
    defaultValue: 'none',
    comment: 'Tipo de ação associada',
  },

  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de destino da ação',
  },

  action_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Dados adicionais da ação (IDs, parâmetros)',
  },

  // ============================================
  // ORIGEM E CONTEXTO
  // ============================================

  related_entity_type: {
    type: DataTypes.ENUM(
      'transfer',
      'session',
      'patient',
      'anamnesis',
      'user',
      'backup',
      'system'
    ),
    allowNull: true,
    comment: 'Tipo de entidade relacionada',
  },

  related_entity_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID da entidade relacionada',
  },

  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'ID do usuário que criou (sistema se null)',
  },

  // ============================================
  // EXPIRAÇÃO
  // ============================================

  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração da notificação',
  },

  // ============================================
  // METADADOS
  // ============================================

  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadados adicionais',
  },

}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    // Índices principais
    { fields: ['user_id'] },
    { fields: ['is_read'] },
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['priority'] },
    { fields: ['created_at'] },
    // Índice composto para busca eficiente
    { fields: ['user_id', 'is_read', 'created_at'] },
    // Índice para notificações não lidas por usuário
    { fields: ['user_id', 'is_read'], where: { is_read: false } },
    // Índice para limpeza de expiradas
    { fields: ['expires_at'], where: { expires_at: { [Op.ne]: null } } },
  ],
});

// ============================================
// MÉTODOS DE INSTÂNCIA
// ============================================

/**
 * Marcar notificação como lida
 */
Notification.prototype.markAsRead = async function() {
  if (this.is_read) return this;

  this.is_read = true;
  this.read_at = new Date();
  await this.save();
  return this;
};

/**
 * Marcar notificação como não lida
 */
Notification.prototype.markAsUnread = async function() {
  this.is_read = false;
  this.read_at = null;
  await this.save();
  return this;
};

/**
 * Verificar se notificação expirou
 */
Notification.prototype.isExpired = function() {
  if (!this.expires_at) return false;
  return new Date() > new Date(this.expires_at);
};

/**
 * Obter idade da notificação em minutos
 */
Notification.prototype.getAgeInMinutes = function() {
  const now = new Date();
  const created = new Date(this.created_at);
  return Math.floor((now - created) / (1000 * 60));
};

/**
 * Obter dados formatados para frontend
 */
Notification.prototype.getFormattedData = function() {
  return {
    id: this.id,
    type: this.type,
    category: this.category,
    title: this.title,
    message: this.message,
    priority: this.priority,
    is_read: this.is_read,
    read_at: this.read_at,
    action: {
      type: this.action_type,
      url: this.action_url,
      data: this.action_data,
    },
    related: {
      type: this.related_entity_type,
      id: this.related_entity_id,
    },
    age_minutes: this.getAgeInMinutes(),
    is_expired: this.isExpired(),
    created_at: this.created_at,
    expires_at: this.expires_at,
  };
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

/**
 * Criar notificação para um usuário
 * @param {String} userId - ID do usuário
 * @param {Object} data - Dados da notificação
 */
Notification.createForUser = async function(userId, data) {
  const {
    type = 'info',
    category = 'system',
    title,
    message,
    priority = 'medium',
    action_type = 'none',
    action_url = null,
    action_data = {},
    related_entity_type = null,
    related_entity_id = null,
    created_by = null,
    expires_at = null,
    metadata = {},
  } = data;

  return await this.create({
    user_id: userId,
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
    metadata,
  });
};

/**
 * Buscar notificações não lidas de um usuário
 * @param {String} userId - ID do usuário
 */
Notification.findUnreadByUser = async function(userId, options = {}) {
  const { limit = 20, category = null } = options;

  const where = {
    user_id: userId,
    is_read: false,
  };

  if (category) {
    where.category = category;
  }

  return await this.findAll({
    where,
    order: [
      ['priority', 'DESC'], // Prioridade maior primeiro
      ['created_at', 'DESC'], // Mais recentes primeiro
    ],
    limit,
  });
};

/**
 * Buscar todas as notificações de um usuário
 * @param {String} userId - ID do usuário
 * @param {Object} options - Opções de busca
 */
Notification.findByUser = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    is_read = null,
    type = null,
    category = null,
  } = options;

  const offset = (page - 1) * limit;
  const where = { user_id: userId };

  if (is_read !== null) where.is_read = is_read;
  if (type) where.type = type;
  if (category) where.category = category;

  const { count, rows } = await this.findAndCountAll({
    where,
    order: [
      ['priority', 'DESC'],
      ['created_at', 'DESC'],
    ],
    limit,
    offset,
  });

  return {
    notifications: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Contar notificações não lidas de um usuário
 * @param {String} userId - ID do usuário
 */
Notification.countUnreadByUser = async function(userId) {
  return await this.count({
    where: {
      user_id: userId,
      is_read: false,
    },
  });
};

/**
 * Marcar todas como lidas para um usuário
 * @param {String} userId - ID do usuário
 * @param {Object} filters - Filtros opcionais
 */
Notification.markAllAsReadByUser = async function(userId, filters = {}) {
  const where = {
    user_id: userId,
    is_read: false,
  };

  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;

  const [updated] = await this.update(
    {
      is_read: true,
      read_at: new Date(),
    },
    { where }
  );

  return updated;
};

/**
 * Deletar notificações antigas/expiradas
 * @param {Number} daysOld - Dias de idade (default 30)
 */
Notification.deleteOld = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Deletar notificações lidas antigas
  const deletedRead = await this.destroy({
    where: {
      is_read: true,
      read_at: {
        [Op.lte]: cutoffDate,
      },
    },
  });

  // Deletar notificações expiradas
  const deletedExpired = await this.destroy({
    where: {
      expires_at: {
        [Op.lte]: new Date(),
      },
    },
  });

  return {
    deleted_read: deletedRead,
    deleted_expired: deletedExpired,
    total: deletedRead + deletedExpired,
  };
};

/**
 * Obter estatísticas de notificações
 * @param {String} userId - ID do usuário (opcional)
 */
Notification.getStats = async function(userId = null) {
  const where = userId ? { user_id: userId } : {};

  const [total, unread, byType, byPriority, byCategory] = await Promise.all([
    this.count({ where }),
    this.count({ where: { ...where, is_read: false } }),
    this.count({
      where,
      attributes: ['type'],
      group: ['type'],
      raw: true,
    }),
    this.count({
      where,
      attributes: ['priority'],
      group: ['priority'],
      raw: true,
    }),
    this.count({
      where,
      attributes: ['category'],
      group: ['category'],
      raw: true,
    }),
  ]);

  return {
    total,
    unread,
    read: total - unread,
    by_type: byType,
    by_priority: byPriority,
    by_category: byCategory,
  };
};

/**
 * Criar notificação em lote para múltiplos usuários
 * @param {Array} userIds - Array de IDs de usuários
 * @param {Object} data - Dados da notificação
 */
Notification.createBulk = async function(userIds, data) {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    ...data,
  }));

  return await this.bulkCreate(notifications);
};

// ============================================
// HOOKS
// ============================================

/**
 * Antes de criar: validar expiração
 */
Notification.beforeCreate(async (notification) => {
  // Se não tiver expiração definida, definir baseado no tipo
  if (!notification.expires_at) {
    const now = new Date();
    switch (notification.type) {
      case 'reminder':
        // Lembretes expiram em 7 dias
        notification.expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'info':
        // Informações expiram em 30 dias
        notification.expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      // warning, error, success não expiram automaticamente
      default:
        notification.expires_at = null;
    }
  }
});

/**
 * Após criar: log
 */
Notification.afterCreate(async (notification) => {
  console.log(`[NOTIFICATION] Created for user ${notification.user_id}: ${notification.title}`);
});

// ============================================
// ASSOCIAÇÕES (definidas em models/index.js)
// ============================================

// Notification.belongsTo(User, { as: 'User', foreignKey: 'user_id' })
// Notification.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' })
// User.hasMany(Notification, { foreignKey: 'user_id' })

module.exports = Notification;