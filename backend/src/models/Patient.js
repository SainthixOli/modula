/**
 * MÓDULA - MODELO DE PACIENTES
 * 
 * Define a estrutura da tabela de pacientes do sistema.
 * Cada paciente pertence a um profissional específico.
 * 
 * Campos principais:
 * - Dados pessoais (nome, contato, documentos)
 * - Dados clínicos (histórico, observações)
 * - Controle de acesso (profissional responsável)
 * - Auditoria (criação, atualização)
 * 
 * 
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * MODELO PATIENT
 * Representa os pacientes cadastrados no sistema
 */
const Patient = sequelize.define('Patient', {
  // Campo ID (chave primária)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único do paciente'
  },

  // Relacionamento com usuário (profissional responsável)
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID do profissional responsável pelo paciente'
  },

  // Dados pessoais
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Nome completo do paciente',
    validate: {
      notEmpty: {
        msg: 'Nome completo é obrigatório'
      },
      len: {
        args: [2, 150],
        msg: 'Nome deve ter entre 2 e 150 caracteres'
      }
    }
  },

  // Data de nascimento
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de nascimento do paciente',
    validate: {
      isDate: {
        msg: 'Data de nascimento deve ser uma data válida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento deve ser anterior à data atual'
      }
    }
  },

  // Gênero
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'not_informed'),
    allowNull: true,
    comment: 'Gênero do paciente',
    validate: {
      isIn: {
        args: [['male', 'female', 'other', 'not_informed']],
        msg: 'Gênero deve ser uma das opções válidas'
      }
    }
  },

  // Documentos
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    unique: true,
    comment: 'CPF do paciente (formato: 000.000.000-00)',
    validate: {
      len: {
        args: [11, 14],
        msg: 'CPF deve ter formato válido'
      }
    }
  },

  rg: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'RG do paciente'
  },

  // Contato
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone de contato',
    validate: {
      len: {
        args: [10, 20],
        msg: 'Telefone deve ter formato válido'
      }
    }
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'E-mail do paciente (opcional)',
    validate: {
      isEmail: {
        msg: 'E-mail deve ter formato válido'
      }
    }
  },

  // Endereço
  address: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Endereço completo em formato JSON',
    defaultValue: {}
  },

  // Contato de emergência
  emergency_contact: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados do contato de emergência',
    defaultValue: {}
  },

  // Estado civil
  marital_status: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed', 'other'),
    allowNull: true,
    comment: 'Estado civil do paciente'
  },

  // Profissão
  occupation: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Profissão/ocupação do paciente'
  },

  // Convênio/plano de saúde
  insurance_info: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Informações do convênio/plano de saúde',
    defaultValue: {}
  },

  // Status do paciente
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'discharged', 'transferred'),
    defaultValue: 'active',
    comment: 'Status atual do paciente',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'discharged', 'transferred']],
        msg: 'Status deve ser uma das opções válidas'
      }
    }
  },

  // Observações gerais
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações gerais sobre o paciente'
  },

  // Histórico médico resumido
  medical_history: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Histórico médico relevante'
  },

  // Medicações atuais
  current_medications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Medicações em uso atual'
  },

  // Alergias
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alergias conhecidas'
  },

  // Data da primeira consulta
  first_appointment: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da primeira consulta'
  },

  // Data da última consulta
  last_appointment: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da última consulta'
  },

  // Metadados adicionais
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados adicionais em formato JSON',
    defaultValue: {}
  }
}, {
  // Configurações do modelo
  tableName: 'patients',
  timestamps: true,
  paranoid: true, // Soft delete
  
  // Índices para otimização
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['full_name']
    },
    {
      fields: ['cpf'],
      unique: true,
      where: {
        cpf: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

/**
 * MÉTODOS DE INSTÂNCIA
 * Métodos específicos para cada instância do paciente
 */

// Calcular idade
Patient.prototype.getAge = function() {
  if (!this.birth_date) return null;
  
  const today = new Date();
  const birthDate = new Date(this.birth_date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Verificar se está ativo
Patient.prototype.isActive = function() {
  return this.status === 'active';
};

// Atualizar última consulta
Patient.prototype.updateLastAppointment = function() {
  this.last_appointment = new Date();
  return this.save();
};

// Obter informações básicas (sem dados sensíveis)
Patient.prototype.getBasicInfo = function() {
  return {
    id: this.id,
    full_name: this.full_name,
    age: this.getAge(),
    phone: this.phone,
    status: this.status,
    last_appointment: this.last_appointment
  };
};

/**
 * MÉTODOS ESTÁTICOS
 * Métodos da classe Patient
 */

// Buscar pacientes ativos de um profissional
Patient.findActiveByProfessional = function(userId) {
  return this.findAll({
    where: {
      user_id: userId,
      status: 'active'
    },
    order: [['full_name', 'ASC']]
  });
};

// Buscar paciente por CPF
Patient.findByCpf = function(cpf) {
  return this.findOne({
    where: { cpf: cpf.replace(/[^\d]/g, '') }
  });
};

// Estatísticas de pacientes por profissional
Patient.getStatsByProfessional = async function(userId) {
  const stats = await this.findAll({
    where: { user_id: userId },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });
  
  return stats.reduce((acc, stat) => {
    acc[stat.status] = parseInt(stat.count);
    return acc;
  }, {});
};

// Buscar pacientes com consulta recente
Patient.findWithRecentAppointments = function(userId, days = 30) {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);
  
  return this.findAll({
    where: {
      user_id: userId,
      last_appointment: {
        [sequelize.Sequelize.Op.gte]: dateLimit
      }
    },
    order: [['last_appointment', 'DESC']]
  });
};

module.exports = Patient;