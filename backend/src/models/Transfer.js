/**
 * MÓDULA - MODELO TRANSFER
 * 
 * Modelo para gerenciar transferências de pacientes entre profissionais.
 * Workflow completo: pending → approved/rejected → completed
 * Mantém histórico completo e auditoria de todas as operações.
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Transfer = sequelize.define('Transfer', {
  // ============================================
  // IDENTIFICAÇÃO
  // ============================================
  
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único da transferência',
  },

  // ============================================
  // RELACIONAMENTOS
  // ============================================

  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT', // Não permite deletar paciente com transferências
    comment: 'ID do paciente sendo transferido',
  },

  from_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    comment: 'ID do profissional atual (origem)',
  },

  to_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
    comment: 'ID do profissional destino',
  },

  // ============================================
  // STATUS E WORKFLOW
  // ============================================

  status: {
    type: DataTypes.ENUM(
      'pending',      // Aguardando aprovação
      'approved',     // Aprovada pelo admin
      'rejected',     // Rejeitada pelo admin
      'completed',    // Transferência efetivada
      'cancelled'     // Cancelada pelo solicitante
    ),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Status atual da transferência',
  },

  // ============================================
  // DATAS E TIMESTAMPS
  // ============================================

  requested_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data/hora da solicitação',
  },

  processed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora do processamento (aprovação/rejeição)',
  },

  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora da conclusão da transferência',
  },

  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora do cancelamento',
  },

  // ============================================
  // PROCESSAMENTO E AUDITORIA
  // ============================================

  processed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'ID do admin que processou a transferência',
  },

  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'ID do usuário que cancelou',
  },

  // ============================================
  // MOTIVOS E OBSERVAÇÕES
  // ============================================

  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Motivo da transferência (obrigatório)',
    validate: {
      len: {
        args: [10, 1000],
        msg: 'Motivo deve ter entre 10 e 1000 caracteres',
      },
    },
  },

  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo da rejeição (se rejeitada)',
  },

  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do cancelamento (se cancelada)',
  },

  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações do administrador',
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações gerais adicionais',
  },

  // ============================================
  // DADOS DO SNAPSHOT (HISTÓRICO)
  // ============================================

  patient_snapshot: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Snapshot dos dados do paciente no momento da transferência',
  },

  from_professional_snapshot: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados do profissional de origem',
  },

  to_professional_snapshot: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados do profissional de destino',
  },

  // ============================================
  // METADADOS
  // ============================================

  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadados adicionais (sessions_count, last_appointment, etc.)',
  },

}, {
  tableName: 'transfers',
  timestamps: true,
  underscored: true,
  indexes: [
    // Índices para busca otimizada
    { fields: ['patient_id'] },
    { fields: ['from_user_id'] },
    { fields: ['to_user_id'] },
    { fields: ['status'] },
    { fields: ['requested_at'] },
    // Índice composto para buscar transferências pendentes
    { fields: ['status', 'requested_at'] },
  ],
});

// ============================================
// MÉTODOS DE INSTÂNCIA
// ============================================

/**
 * Verificar se transferência está pendente
 */
Transfer.prototype.isPending = function() {
  return this.status === 'pending';
};

/**
 * Verificar se transferência foi aprovada
 */
Transfer.prototype.isApproved = function() {
  return this.status === 'approved';
};

/**
 * Verificar se transferência foi rejeitada
 */
Transfer.prototype.isRejected = function() {
  return this.status === 'rejected';
};

/**
 * Verificar se transferência foi completada
 */
Transfer.prototype.isCompleted = function() {
  return this.status === 'completed';
};

/**
 * Verificar se transferência foi cancelada
 */
Transfer.prototype.isCancelled = function() {
  return this.status === 'cancelled';
};

/**
 * Aprovar transferência (apenas admin)
 * @param {String} adminId - ID do administrador
 * @param {String} notes - Observações do admin
 */
Transfer.prototype.approve = async function(adminId, notes = null) {
  if (!this.isPending()) {
    throw new Error('Apenas transferências pendentes podem ser aprovadas');
  }

  this.status = 'approved';
  this.processed_by = adminId;
  this.processed_at = new Date();
  if (notes) {
    this.admin_notes = notes;
  }

  await this.save();
  return this;
};

/**
 * Rejeitar transferência (apenas admin)
 * @param {String} adminId - ID do administrador
 * @param {String} reason - Motivo da rejeição (obrigatório)
 */
Transfer.prototype.reject = async function(adminId, reason) {
  if (!this.isPending()) {
    throw new Error('Apenas transferências pendentes podem ser rejeitadas');
  }

  if (!reason || reason.trim().length < 10) {
    throw new Error('Motivo da rejeição é obrigatório (mínimo 10 caracteres)');
  }

  this.status = 'rejected';
  this.processed_by = adminId;
  this.processed_at = new Date();
  this.rejection_reason = reason;

  await this.save();
  return this;
};

/**
 * Completar transferência (efetuar mudança do paciente)
 * Deve ser chamado após aprovação
 */
Transfer.prototype.complete = async function() {
  if (!this.isApproved()) {
    throw new Error('Apenas transferências aprovadas podem ser completadas');
  }

  // Buscar paciente e efetivar transferência
  const Patient = require('./Patient');
  const patient = await Patient.findByPk(this.patient_id);

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  // Salvar snapshot antes da transferência
  this.patient_snapshot = patient.toJSON();

  // Atualizar profissional do paciente
  await patient.update({
    user_id: this.to_user_id,
    metadata: {
      ...patient.metadata,
      transferred_from: this.from_user_id,
      transferred_at: new Date(),
      transfer_id: this.id,
    },
  });

  // Marcar transferência como completa
  this.status = 'completed';
  this.completed_at = new Date();
  await this.save();

  return this;
};

/**
 * Cancelar transferência (apenas solicitante)
 * @param {String} userId - ID do usuário cancelando
 * @param {String} reason - Motivo do cancelamento
 */
Transfer.prototype.cancel = async function(userId, reason) {
  if (!this.isPending()) {
    throw new Error('Apenas transferências pendentes podem ser canceladas');
  }

  if (this.from_user_id !== userId) {
    throw new Error('Apenas o solicitante pode cancelar a transferência');
  }

  this.status = 'cancelled';
  this.cancelled_by = userId;
  this.cancelled_at = new Date();
  if (reason) {
    this.cancellation_reason = reason;
  }

  await this.save();
  return this;
};

/**
 * Obter informações formatadas da transferência
 */
Transfer.prototype.getFormattedInfo = async function() {
  const Patient = require('./Patient');
  const User = require('./User');

  // Carregar relacionamentos se necessário
  if (!this.Patient) await this.reload({ include: ['Patient', 'FromUser', 'ToUser'] });

  return {
    id: this.id,
    status: this.status,
    patient: {
      id: this.patient_id,
      name: this.Patient?.full_name,
    },
    from: {
      id: this.from_user_id,
      name: this.FromUser?.full_name,
    },
    to: {
      id: this.to_user_id,
      name: this.ToUser?.full_name,
    },
    reason: this.reason,
    requested_at: this.requested_at,
    processed_at: this.processed_at,
    completed_at: this.completed_at,
    rejection_reason: this.rejection_reason,
    admin_notes: this.admin_notes,
  };
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

/**
 * Buscar transferências pendentes (para admin)
 * @param {Object} options - Opções de paginação
 */
Transfer.findPending = async function(options = {}) {
  const { page = 1, limit = 20, sortBy = 'requested_at', order = 'ASC' } = options;
  const offset = (page - 1) * limit;

  const { count, rows } = await this.findAndCountAll({
    where: { status: 'pending' },
    include: [
      { association: 'Patient', attributes: ['id', 'full_name', 'cpf'] },
      { association: 'FromUser', attributes: ['id', 'full_name', 'email'] },
      { association: 'ToUser', attributes: ['id', 'full_name', 'email'] },
    ],
    order: [[sortBy, order]],
    limit,
    offset,
  });

  return {
    transfers: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Buscar transferências por profissional (enviadas ou recebidas)
 * @param {String} userId - ID do profissional
 * @param {String} direction - 'sent' | 'received' | 'all'
 */
Transfer.findByProfessional = async function(userId, direction = 'all', options = {}) {
  const { page = 1, limit = 20, status = null } = options;
  const offset = (page - 1) * limit;

  const where = {};
  
  // Filtrar por direção
  if (direction === 'sent') {
    where.from_user_id = userId;
  } else if (direction === 'received') {
    where.to_user_id = userId;
  } else {
    where[Op.or] = [
      { from_user_id: userId },
      { to_user_id: userId },
    ];
  }

  // Filtrar por status se fornecido
  if (status) {
    where.status = status;
  }

  const { count, rows } = await this.findAndCountAll({
    where,
    include: [
      { association: 'Patient', attributes: ['id', 'full_name', 'cpf'] },
      { association: 'FromUser', attributes: ['id', 'full_name'] },
      { association: 'ToUser', attributes: ['id', 'full_name'] },
    ],
    order: [['requested_at', 'DESC']],
    limit,
    offset,
  });

  return {
    transfers: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Buscar histórico de transferências de um paciente
 * @param {String} patientId - ID do paciente
 */
Transfer.findByPatient = async function(patientId) {
  return await this.findAll({
    where: { patient_id: patientId },
    include: [
      { association: 'FromUser', attributes: ['id', 'full_name'] },
      { association: 'ToUser', attributes: ['id', 'full_name'] },
      { 
        association: 'ProcessedBy', 
        attributes: ['id', 'full_name'],
        required: false,
      },
    ],
    order: [['requested_at', 'DESC']],
  });
};

/**
 * Estatísticas de transferências
 * @param {Object} filters - Filtros opcionais
 */
Transfer.getStats = async function(filters = {}) {
  const { startDate, endDate, userId } = filters;

  const where = {};
  
  if (startDate || endDate) {
    where.requested_at = {};
    if (startDate) where.requested_at[Op.gte] = new Date(startDate);
    if (endDate) where.requested_at[Op.lte] = new Date(endDate);
  }

  if (userId) {
    where[Op.or] = [
      { from_user_id: userId },
      { to_user_id: userId },
    ];
  }

  const [total, pending, approved, rejected, completed, cancelled] = await Promise.all([
    this.count({ where }),
    this.count({ where: { ...where, status: 'pending' } }),
    this.count({ where: { ...where, status: 'approved' } }),
    this.count({ where: { ...where, status: 'rejected' } }),
    this.count({ where: { ...where, status: 'completed' } }),
    this.count({ where: { ...where, status: 'cancelled' } }),
  ]);

  // Calcular taxa de aprovação
  const processed = approved + rejected;
  const approval_rate = processed > 0 ? (approved / processed * 100).toFixed(2) : 0;

  return {
    total,
    by_status: {
      pending,
      approved,
      rejected,
      completed,
      cancelled,
    },
    metrics: {
      approval_rate: parseFloat(approval_rate),
      processed,
      pending_percentage: total > 0 ? (pending / total * 100).toFixed(2) : 0,
    },
  };
};

// ============================================
// HOOKS
// ============================================

/**
 * Antes de criar: Validar se transferência é válida
 */
Transfer.beforeCreate(async (transfer) => {
  // Não pode transferir para si mesmo
  if (transfer.from_user_id === transfer.to_user_id) {
    throw new Error('Não é possível transferir um paciente para o mesmo profissional');
  }

  // Verificar se já existe transferência pendente para este paciente
  const existingPending = await Transfer.findOne({
    where: {
      patient_id: transfer.patient_id,
      status: 'pending',
    },
  });

  if (existingPending) {
    throw new Error('Já existe uma transferência pendente para este paciente');
  }

  // Salvar snapshots dos profissionais
  const User = require('./User');
  const [fromUser, toUser] = await Promise.all([
    User.findByPk(transfer.from_user_id, { attributes: ['id', 'full_name', 'email'] }),
    User.findByPk(transfer.to_user_id, { attributes: ['id', 'full_name', 'email'] }),
  ]);

  transfer.from_professional_snapshot = fromUser?.toJSON();
  transfer.to_professional_snapshot = toUser?.toJSON();
});

/**
 * Após atualizar: Log de auditoria
 */
Transfer.afterUpdate(async (transfer) => {
  console.log(`[TRANSFER] Transfer ${transfer.id} updated to status: ${transfer.status}`);
  
  // Adicionar timestamp ao metadata
  if (!transfer.metadata) transfer.metadata = {};
  transfer.metadata.last_updated_at = new Date();
  
  if (transfer.changed('status')) {
    transfer.metadata.status_history = transfer.metadata.status_history || [];
    transfer.metadata.status_history.push({
      status: transfer.status,
      changed_at: new Date(),
    });
  }
});

// ============================================
// ASSOCIAÇÕES (definidas em models/index.js)
// ============================================

// Transfer.belongsTo(Patient)
// Transfer.belongsTo(User, { as: 'FromUser', foreignKey: 'from_user_id' })
// Transfer.belongsTo(User, { as: 'ToUser', foreignKey: 'to_user_id' })
// Transfer.belongsTo(User, { as: 'ProcessedBy', foreignKey: 'processed_by' })
// Transfer.belongsTo(User, { as: 'CancelledBy', foreignKey: 'cancelled_by' })

module.exports = Transfer;