/**
 * MÓDULA - MODELO TRANSFER
 * 
 * Modelo para gerenciar transferências de pacientes entre profissionais.
 * Workflow completo: pending → approved/rejected → completed
 * Mantém histórico completo e auditoria de todas as operações.
 */

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database'); // ✅ Correção: desestruturando sequelize

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
    onDelete: 'RESTRICT',
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
      'pending',      
      'approved',     
      'rejected',     
      'completed',    
      'cancelled'     
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
    { fields: ['patient_id'] },
    { fields: ['from_user_id'] },
    { fields: ['to_user_id'] },
    { fields: ['status'] },
    { fields: ['requested_at'] },
    { fields: ['status', 'requested_at'] },
  ],
});

// ============================================
// MÉTODOS DE INSTÂNCIA
// ============================================

Transfer.prototype.isPending = function() { return this.status === 'pending'; };
Transfer.prototype.isApproved = function() { return this.status === 'approved'; };
Transfer.prototype.isRejected = function() { return this.status === 'rejected'; };
Transfer.prototype.isCompleted = function() { return this.status === 'completed'; };
Transfer.prototype.isCancelled = function() { return this.status === 'cancelled'; };

// Métodos de workflow (approve, reject, complete, cancel) permanecem iguais
// Métodos estáticos (findPending, findByProfessional, findByPatient, getStats) permanecem iguais
// Hooks beforeCreate e afterUpdate permanecem iguais
// Associações permanecem comentadas para serem definidas em models/index.js

module.exports = Transfer;
