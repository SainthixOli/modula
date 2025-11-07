/**
 * MÓDULA - MODELO DE AUDITORIA (LGPD)
 * 
 * Define a estrutura da tabela de logs de auditoria para compliance com LGPD.
 * Registra todas as operações sensíveis realizadas no sistema.
 * 
 * Campos principais:
 * - Identificação do usuário e operação
 * - Recurso afetado e tipo de ação
 * - Dados antes/depois da alteração
 * - Informações de contexto (IP, user agent)
 * - Timestamp da operação
 * 
 * LGPD Compliance:
 * - Art. 37: Responsável pelo tratamento deve manter registros das operações
 * - Art. 48: Comunicação ao titular sobre uso de seus dados
 * - Retenção configurável conforme necessidade legal
 * 
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * MODELO AUDITLOG
 * Registra todas as operações de auditoria do sistema
 */
const AuditLog = sequelize.define('AuditLog', {
  // Campo ID (chave primária)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único do log de auditoria'
  },

  // Identificação do usuário
  user_id: {
    type: DataTypes.UUID,
    allowNull: true, // Pode ser null para operações do sistema
    comment: 'ID do usuário que executou a ação',
    references: {
      model: 'users',
      key: 'id'
    }
  },

  user_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email do usuário no momento da ação (para histórico)'
  },

  user_name: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Nome do usuário no momento da ação (para histórico)'
  },

  user_role: {
    type: DataTypes.ENUM('admin', 'professional', 'system'),
    allowNull: true,
    comment: 'Papel do usuário no momento da ação'
  },

  // Tipo de ação realizada
  action: {
    type: DataTypes.ENUM(
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
      'PASSWORD_RESET',
      'PASSWORD_CHANGED',
      'EXPORT',
      'TRANSFER',
      'BACKUP',
      'RESTORE',
      'ACCESS_DENIED'
    ),
    allowNull: false,
    comment: 'Tipo de ação executada'
  },

  // Recurso afetado
  resource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Tipo do recurso afetado (user, patient, session, etc)',
    validate: {
      isIn: {
        args: [['user', 'patient', 'session', 'anamnesis', 'transfer', 'notification', 'backup', 'system']],
        msg: 'Recurso inválido'
      }
    }
  },

  resource_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID do recurso afetado (se aplicável)'
  },

  // Dados da operação
  old_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados anteriores à operação (para UPDATE e DELETE)',
    defaultValue: null
  },

  new_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados novos da operação (para CREATE e UPDATE)',
    defaultValue: null
  },

  // Descrição legível da ação
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada da ação realizada'
  },

  // Informações de contexto
  ip_address: {
    type: DataTypes.STRING(45), // Suporta IPv6
    allowNull: true,
    comment: 'Endereço IP de origem da requisição'
  },

  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent do navegador/cliente'
  },

  // Status da operação
  status: {
    type: DataTypes.ENUM('success', 'failure', 'error'),
    allowNull: false,
    defaultValue: 'success',
    comment: 'Status da execução da operação'
  },

  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Mensagem de erro (se status = error ou failure)'
  },

  // Metadados adicionais
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados adicionais específicos da operação',
    defaultValue: {}
  },

  // Controle de retenção (LGPD)
  retention_until: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data até quando o log deve ser mantido (LGPD)'
  },

  // Timestamp da operação
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data e hora da operação'
  }

}, {
  tableName: 'audit_logs',
  timestamps: false, // Usar apenas created_at customizado
  indexes: [
    {
      fields: ['user_id'],
      name: 'idx_audit_user'
    },
    {
      fields: ['action'],
      name: 'idx_audit_action'
    },
    {
      fields: ['resource'],
      name: 'idx_audit_resource'
    },
    {
      fields: ['resource_id'],
      name: 'idx_audit_resource_id'
    },
    {
      fields: ['created_at'],
      name: 'idx_audit_created'
    },
    {
      fields: ['status'],
      name: 'idx_audit_status'
    },
    {
      fields: ['retention_until'],
      name: 'idx_audit_retention'
    },
    {
      // Índice composto para consultas comuns
      fields: ['user_id', 'action', 'created_at'],
      name: 'idx_audit_user_action_date'
    },
    {
      // Índice para filtros por recurso
      fields: ['resource', 'resource_id', 'created_at'],
      name: 'idx_audit_resource_date'
    }
  ],
  comment: 'Tabela de logs de auditoria para compliance LGPD'
});

/**
 * MÉTODOS ESTÁTICOS DO MODELO
 */

/**
 * Criar log de auditoria simplificado
 */
AuditLog.log = async function(data) {
  try {
    return await this.create({
      user_id: data.userId,
      user_email: data.userEmail,
      user_name: data.userName,
      user_role: data.userRole,
      action: data.action,
      resource: data.resource,
      resource_id: data.resourceId,
      old_data: data.oldData,
      new_data: data.newData,
      description: data.description,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      status: data.status || 'success',
      error_message: data.errorMessage,
      metadata: data.metadata || {},
      retention_until: data.retentionUntil
    });
  } catch (error) {
    console.error('[AuditLog] Erro ao criar log:', error);
    throw error;
  }
};

/**
 * Buscar logs com filtros
 */
AuditLog.findLogs = async function(filters = {}) {
  const where = {};

  if (filters.userId) where.user_id = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.resource) where.resource = filters.resource;
  if (filters.resourceId) where.resource_id = filters.resourceId;
  if (filters.status) where.status = filters.status;

  // Filtro por período
  if (filters.startDate || filters.endDate) {
    where.created_at = {};
    if (filters.startDate) where.created_at[sequelize.Op.gte] = filters.startDate;
    if (filters.endDate) where.created_at[sequelize.Op.lte] = filters.endDate;
  }

  return await this.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit: filters.limit || 100,
    offset: filters.offset || 0
  });
};

/**
 * Limpar logs expirados (para job de limpeza)
 */
AuditLog.cleanExpiredLogs = async function() {
  const now = new Date();
  
  const result = await this.destroy({
    where: {
      retention_until: {
        [sequelize.Op.lt]: now
      }
    }
  });

  console.log(`[AuditLog] ${result} logs expirados removidos`);
  return result;
};

/**
 * Estatísticas de auditoria
 */
AuditLog.getStats = async function(filters = {}) {
  const where = {};

  if (filters.startDate || filters.endDate) {
    where.created_at = {};
    if (filters.startDate) where.created_at[sequelize.Op.gte] = filters.startDate;
    if (filters.endDate) where.created_at[sequelize.Op.lte] = filters.endDate;
  }

  const total = await this.count({ where });
  
  const byAction = await this.count({
    where,
    group: ['action'],
    attributes: ['action']
  });

  const byResource = await this.count({
    where,
    group: ['resource'],
    attributes: ['resource']
  });

  const byStatus = await this.count({
    where,
    group: ['status'],
    attributes: ['status']
  });

  return {
    total,
    byAction,
    byResource,
    byStatus
  };
};

module.exports = AuditLog;
