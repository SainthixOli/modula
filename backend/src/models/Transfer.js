/**
 * MÓDULA - MODELO TRANSFER
 * 
 * Modelo para gerenciar transferências de pacientes entre profissionais.
 * Sistema completo de workflow com aprovação administrativa.
 * 
 * Funcionalidades implementadas:
 * - Solicitação de transferência por profissional
 * - Workflow de aprovação/rejeição por admin
 * - Histórico completo de transferências
 * - Rastreamento de motivos
 * - Notificações automáticas
 * - Auditoria de mudanças
 * 
 * Recursos especiais:
 * - Status com workflow completo
 * - Timestamps de todas as etapas
 * - Metadados flexíveis (JSONB)
 * - Métodos de aprovação/rejeição
 * - Queries otimizadas
 */

module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define('Transfer', {
    // Identificação
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    // Relacionamentos
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id'
      },
      comment: 'Paciente a ser transferido'
    },

    from_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Profissional atual do paciente'
    },

    to_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Profissional destino da transferência'
    },

    processed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Admin que processou a transferência'
    },

    // Status e Workflow
    status: {
      type: DataTypes.ENUM(
        'pending',      // Aguardando aprovação
        'approved',     // Aprovada pelo admin
        'rejected',     // Rejeitada pelo admin
        'completed',    // Transferência executada
        'cancelled'     // Cancelada pelo solicitante
      ),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status atual da transferência'
    },

    // Timestamps do Workflow
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data/hora da solicitação'
    },

    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora do processamento (aprovação/rejeição)'
    },

    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora da conclusão da transferência'
    },

    // Motivos e Observações
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [10, 1000],
          msg: 'Motivo deve ter entre 10 e 1000 caracteres'
        }
      },
      comment: 'Motivo da transferência (informado pelo profissional)'
    },

    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [10, 1000],
          msg: 'Motivo da rejeição deve ter entre 10 e 1000 caracteres'
        }
      },
      comment: 'Motivo da rejeição (se rejeitada)'
    },

    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações do administrador'
    },

    // Dados Adicionais
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Metadados adicionais flexíveis'
    },

    // Timestamps automáticos
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'transfers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    indexes: [
      {
        name: 'idx_transfers_status',
        fields: ['status']
      },
      {
        name: 'idx_transfers_patient',
        fields: ['patient_id']
      },
      {
        name: 'idx_transfers_from_user',
        fields: ['from_user_id']
      },
      {
        name: 'idx_transfers_to_user',
        fields: ['to_user_id']
      },
      {
        name: 'idx_transfers_requested_at',
        fields: ['requested_at']
      }
    ]
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
   * Aprovar transferência
   */
  Transfer.prototype.approve = async function(adminId, notes = null) {
    if (!this.isPending()) {
      throw new Error('Apenas transferências pendentes podem ser aprovadas');
    }

    this.status = 'approved';
    this.processed_by = adminId;
    this.processed_at = new Date();
    if (notes) this.admin_notes = notes;

    await this.save();
    return this;
  };

  /**
   * Rejeitar transferência
   */
  Transfer.prototype.reject = async function(adminId, rejectionReason, notes = null) {
    if (!this.isPending()) {
      throw new Error('Apenas transferências pendentes podem ser rejeitadas');
    }

    if (!rejectionReason || rejectionReason.length < 10) {
      throw new Error('Motivo da rejeição é obrigatório (mínimo 10 caracteres)');
    }

    this.status = 'rejected';
    this.processed_by = adminId;
    this.processed_at = new Date();
    this.rejection_reason = rejectionReason;
    if (notes) this.admin_notes = notes;

    await this.save();
    return this;
  };

  /**
   * Completar transferência (executar a mudança de profissional)
   */
  Transfer.prototype.complete = async function() {
    if (!this.isApproved()) {
      throw new Error('Apenas transferências aprovadas podem ser completadas');
    }

    const { Patient } = require('./index');
    
    // Atualizar profissional do paciente
    await Patient.update(
      { user_id: this.to_user_id },
      { where: { id: this.patient_id } }
    );

    // Marcar transferência como completada
    this.status = 'completed';
    this.completed_at = new Date();

    await this.save();
    return this;
  };

  /**
   * Cancelar transferência (pelo solicitante, se ainda pendente)
   */
  Transfer.prototype.cancel = async function() {
    if (!this.isPending()) {
      throw new Error('Apenas transferências pendentes podem ser canceladas');
    }

    this.status = 'cancelled';
    await this.save();
    return this;
  };

  /**
   * Obter informações resumidas
   */
  Transfer.prototype.getSummary = function() {
    return {
      id: this.id,
      status: this.status,
      reason: this.reason,
      requested_at: this.requested_at,
      processed_at: this.processed_at,
      completed_at: this.completed_at,
      days_pending: this.isPending() 
        ? Math.ceil((new Date() - this.requested_at) / (1000 * 60 * 60 * 24))
        : null
    };
  };

  // ============================================
  // MÉTODOS ESTÁTICOS
  // ============================================

  /**
   * Buscar transferências pendentes
   */
  Transfer.findPending = async function() {
    return await this.findAll({
      where: { status: 'pending' },
      order: [['requested_at', 'ASC']],
      include: [
        {
          model: sequelize.models.Patient,
          as: 'patient',
          attributes: ['id', 'full_name', 'cpf']
        },
        {
          model: sequelize.models.User,
          as: 'fromProfessional',
          attributes: ['id', 'full_name', 'professional_register']
        },
        {
          model: sequelize.models.User,
          as: 'toProfessional',
          attributes: ['id', 'full_name', 'professional_register']
        }
      ]
    });
  };

  /**
   * Buscar histórico de transferências de um paciente
   */
  Transfer.findByPatient = async function(patientId) {
    return await this.findAll({
      where: { patient_id: patientId },
      order: [['requested_at', 'DESC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'fromProfessional',
          attributes: ['id', 'full_name']
        },
        {
          model: sequelize.models.User,
          as: 'toProfessional',
          attributes: ['id', 'full_name']
        },
        {
          model: sequelize.models.User,
          as: 'processedBy',
          attributes: ['id', 'full_name']
        }
      ]
    });
  };

  /**
   * Verificar se paciente tem transferência pendente
   */
  Transfer.hasPendingTransfer = async function(patientId) {
    const count = await this.count({
      where: {
        patient_id: patientId,
        status: 'pending'
      }
    });
    return count > 0;
  };

  /**
   * Estatísticas de transferências
   */
  Transfer.getStats = async function(startDate = null, endDate = null) {
    const where = {};
    
    if (startDate || endDate) {
      where.requested_at = {};
      if (startDate) where.requested_at[sequelize.Sequelize.Op.gte] = startDate;
      if (endDate) where.requested_at[sequelize.Sequelize.Op.lte] = endDate;
    }

    const transfers = await this.findAll({ where });

    const stats = {
      total: transfers.length,
      pending: transfers.filter(t => t.status === 'pending').length,
      approved: transfers.filter(t => t.status === 'approved').length,
      rejected: transfers.filter(t => t.status === 'rejected').length,
      completed: transfers.filter(t => t.status === 'completed').length,
      cancelled: transfers.filter(t => t.status === 'cancelled').length
    };

    stats.approval_rate = stats.total > 0
      ? ((stats.approved / (stats.approved + stats.rejected)) * 100).toFixed(2)
      : 0;

    stats.completion_rate = stats.approved > 0
      ? ((stats.completed / stats.approved) * 100).toFixed(2)
      : 0;

    return stats;
  };

  return Transfer;
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. CRIAR TRANSFERÊNCIA:
 *    const transfer = await Transfer.create({
 *      patient_id: patientId,
 *      from_user_id: currentProfId,
 *      to_user_id: newProfId,
 *      reason: 'Motivo da transferência'
 *    });
 * 
 * 2. APROVAR:
 *    await transfer.approve(adminId, 'Aprovado conforme solicitado');
 *    await transfer.complete(); // Executa a transferência
 * 
 * 3. REJEITAR:
 *    await transfer.reject(adminId, 'Motivo da rejeição');
 * 
 * 4. BUSCAR PENDENTES:
 *    const pending = await Transfer.findPending();
 * 
 * 5. HISTÓRICO DO PACIENTE:
 *    const history = await Transfer.findByPatient(patientId);
 * 
 * 6. VERIFICAR SE TEM PENDENTE:
 *    const hasPending = await Transfer.hasPendingTransfer(patientId);
 * 
 * 7. ESTATÍSTICAS:
 *    const stats = await Transfer.getStats(startDate, endDate);
 */