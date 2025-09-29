/**
 * MÓDULA - MODELO DE SESSÕES/CONSULTAS
 * 
 * Define a estrutura completa das consultas e sessões realizadas pelos profissionais.
 * Sistema robusto para agendamento, registro de evolução e controle de tratamento.
 * 
 * Funcionalidades implementadas:
 * - Agendamento de consultas com tipos específicos
 * - Registro de evolução e notas clínicas
 * - Controle de duração e status de sessões
 * - Planejamento de próximas sessões
 * - Métricas e indicadores de progresso
 * - Sistema de cobrança e faturamento básico
 * 
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * MODELO SESSION
 * Representa consultas, sessões e atendimentos realizados
 */
const Session = sequelize.define('Session', {
  // Campo ID (chave primária)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único da sessão'
  },

  // Relacionamentos obrigatórios
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    comment: 'ID do paciente atendido'
  },

  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID do profissional responsável'
  },

  // Controle sequencial por paciente
  session_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Número sequencial da sessão por paciente (1, 2, 3...)',
    validate: {
      min: {
        args: [1],
        msg: 'Número da sessão deve ser maior que zero'
      }
    }
  },

  // Dados da sessão
  session_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data e hora da sessão',
    validate: {
      isDate: {
        msg: 'Data da sessão deve ser uma data válida'
      }
    }
  },

  session_type: {
    type: DataTypes.ENUM(
      'first_consultation',    // Primeira consulta
      'follow_up',            // Consulta de retorno
      'therapy_session',      // Sessão de terapia
      'evaluation',           // Avaliação
      'emergency',            // Atendimento de emergência
      'group_session',        // Sessão em grupo
      'family_session',       // Terapia familiar
      'discharge',            // Sessão de alta
      'reassessment'          // Reavaliação
    ),
    allowNull: false,
    defaultValue: 'follow_up',
    comment: 'Tipo da sessão realizada'
  },

  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 50,
    comment: 'Duração da sessão em minutos',
    validate: {
      min: {
        args: [15],
        msg: 'Duração mínima de 15 minutos'
      },
      max: {
        args: [300],
        msg: 'Duração máxima de 5 horas'
      }
    }
  },

  // Status da sessão
  status: {
    type: DataTypes.ENUM(
      'scheduled',     // Agendada
      'confirmed',     // Confirmada pelo paciente
      'in_progress',   // Em andamento
      'completed',     // Realizada
      'cancelled',     // Cancelada
      'no_show',       // Paciente faltou
      'rescheduled'    // Reagendada
    ),
    defaultValue: 'scheduled',
    comment: 'Status atual da sessão'
  },

  // Conteúdo clínico
  session_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Anotações e evolução da sessão',
    validate: {
      len: {
        args: [0, 10000],
        msg: 'Notas não podem exceder 10.000 caracteres'
      }
    }
  },

  // Avaliação da sessão
  patient_mood: {
    type: DataTypes.ENUM(
      'excellent',     // Excelente
      'good',          // Bom
      'neutral',       // Neutro
      'anxious',       // Ansioso
      'sad',           // Triste
      'angry',         // Irritado
      'confused',      // Confuso
      'resistant'      // Resistente
    ),
    allowNull: true,
    comment: 'Estado emocional observado do paciente'
  },

  progress_assessment: {
    type: DataTypes.ENUM(
      'significant_improvement',  // Melhora significativa
      'mild_improvement',        // Melhora leve
      'stable',                  // Estável
      'mild_decline',           // Piora leve
      'significant_decline',     // Piora significativa
      'no_change'               // Sem mudanças
    ),
    allowNull: true,
    comment: 'Avaliação do progresso desde a última sessão'
  },

  patient_engagement: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Nível de engajamento do paciente (1-10)',
    validate: {
      min: {
        args: [1],
        msg: 'Engajamento mínimo é 1'
      },
      max: {
        args: [10],
        msg: 'Engajamento máximo é 10'
      }
    }
  },

  // Tópicos e intervenções
  main_topics: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Principais tópicos abordados na sessão',
    // Estrutura esperada: ["ansiedade", "trabalho", "relacionamentos"]
  },

  interventions_used: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Técnicas e intervenções utilizadas',
    // Estrutura esperada: [
    //   {
    //     technique: "respiracao_diafragmatica",
    //     effectiveness: 8,
    //     patient_response: "positive"
    //   }
    // ]
  },

  homework_assigned: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Tarefas e exercícios recomendados para casa'
  },

  homework_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: 'Se as tarefas da sessão anterior foram realizadas'
  },

  // Planejamento
  next_session_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data agendada para próxima sessão'
  },

  next_session_goals: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Objetivos planejados para próxima sessão'
  },

  treatment_plan_updates: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Atualizações no plano de tratamento'
  },

  // Dados administrativos
  scheduled_start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Horário agendado para início'
  },

  actual_start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Horário real de início'
  },

  actual_end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Horário real de término'
  },

  // Sistema de cobrança
  is_billable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se a sessão deve ser faturada'
  },

  session_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor da sessão'
  },

  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded'),
    defaultValue: 'pending',
    comment: 'Status do pagamento'
  },

  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'insurance', 'free'),
    allowNull: true,
    comment: 'Forma de pagamento'
  },

  // Dados de cancelamento/reagendamento
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do cancelamento ou reagendamento'
  },

  cancelled_by: {
    type: DataTypes.ENUM('patient', 'professional', 'system'),
    allowNull: true,
    comment: 'Quem cancelou a sessão'
  },

  cancellation_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data do cancelamento'
  },

  // Metadados e observações
  private_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas privadas do profissional (não compartilhadas)'
  },

  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Dados adicionais em formato JSON'
  },

  // Controle de qualidade
  supervision_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas de supervisão (para profissionais em formação)'
  },

  quality_indicators: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Indicadores de qualidade da sessão'
  }

}, {
  // Configurações do modelo
  tableName: 'sessions',
  timestamps: true,
  paranoid: false, // Não usar soft delete para sessões
  
  // Índices para otimização
  indexes: [
    {
      fields: ['patient_id', 'session_date'],
      name: 'idx_sessions_patient_date'
    },
    {
      fields: ['user_id', 'session_date'],
      name: 'idx_sessions_user_date'
    },
    {
      fields: ['patient_id', 'session_number'],
      name: 'idx_sessions_patient_number'
    },
    {
      fields: ['status'],
      name: 'idx_sessions_status'
    },
    {
      fields: ['session_type'],
      name: 'idx_sessions_type'
    },
    {
      fields: ['session_date'],
      name: 'idx_sessions_date'
    },
    {
      fields: ['is_billable', 'payment_status'],
      name: 'idx_sessions_billing'
    }
  ],

  // Hooks do modelo
  hooks: {
    // Antes de criar, calcular session_number
    beforeCreate: async (session) => {
      if (!session.session_number) {
        const lastSession = await Session.findOne({
          where: { patient_id: session.patient_id },
          order: [['session_number', 'DESC']]
        });
        
        session.session_number = lastSession ? lastSession.session_number + 1 : 1;
      }

      // Definir horário de início agendado se não informado
      if (!session.scheduled_start_time && session.session_date) {
        session.scheduled_start_time = session.session_date;
      }
    },

    // Após criar, atualizar dados do paciente
    afterCreate: async (session) => {
      const Patient = require('./Patient');
      const patient = await Patient.findByPk(session.patient_id);
      
      if (patient) {
        // Se é primeira consulta, definir first_appointment
        if (session.session_type === 'first_consultation' && !patient.first_appointment) {
          await patient.update({ first_appointment: session.session_date });
        }
        
        // Sempre atualizar last_appointment se sessão foi realizada
        if (session.status === 'completed') {
          await patient.update({ last_appointment: session.session_date });
        }
      }
    },

    // Após atualizar, sincronizar com paciente
    afterUpdate: async (session) => {
      if (session.changed('status') && session.status === 'completed') {
        const Patient = require('./Patient');
        await Patient.update(
          { last_appointment: session.session_date },
          { where: { id: session.patient_id } }
        );
      }
    }
  }
});

/**
 * MÉTODOS DE INSTÂNCIA
 * Métodos específicos para cada instância de sessão
 */

// Verificar se sessão está completa
Session.prototype.isCompleted = function() {
  return this.status === 'completed';
};

// Calcular duração real da sessão
Session.prototype.getActualDuration = function() {
  if (this.actual_start_time && this.actual_end_time) {
    const start = new Date(this.actual_start_time);
    const end = new Date(this.actual_end_time);
    return Math.round((end - start) / (1000 * 60)); // em minutos
  }
  return this.duration_minutes || 0;
};

// Obter duração formatada
Session.prototype.getDurationFormatted = function() {
  const minutes = this.getActualDuration();
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
};

// Verificar se está atrasada
Session.prototype.isLate = function() {
  if (this.scheduled_start_time && this.actual_start_time) {
    const scheduled = new Date(this.scheduled_start_time);
    const actual = new Date(this.actual_start_time);
    return actual > scheduled;
  }
  return false;
};

// Calcular tempo de atraso em minutos
Session.prototype.getDelayMinutes = function() {
  if (this.isLate()) {
    const scheduled = new Date(this.scheduled_start_time);
    const actual = new Date(this.actual_start_time);
    return Math.round((actual - scheduled) / (1000 * 60));
  }
  return 0;
};

// Verificar se pode ser cancelada
Session.prototype.canBeCancelled = function() {
  const now = new Date();
  const sessionDate = new Date(this.session_date);
  const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60);
  
  return this.status === 'scheduled' && hoursUntilSession > 2; // 2 horas de antecedência
};

// Marcar como iniciada
Session.prototype.markAsStarted = async function() {
  this.status = 'in_progress';
  this.actual_start_time = new Date();
  return this.save();
};

// Marcar como finalizada
Session.prototype.markAsCompleted = async function(notes = null, duration = null) {
  this.status = 'completed';
  this.actual_end_time = new Date();
  
  if (notes) {
    this.session_notes = notes;
  }
  
  if (duration) {
    this.duration_minutes = duration;
  } else if (this.actual_start_time) {
    // Calcular duração automaticamente
    const start = new Date(this.actual_start_time);
    const end = new Date(this.actual_end_time);
    this.duration_minutes = Math.round((end - start) / (1000 * 60));
  }
  
  return this.save();
};

// Cancelar sessão
Session.prototype.cancel = async function(reason, cancelledBy = 'professional') {
  this.status = 'cancelled';
  this.cancellation_reason = reason;
  this.cancelled_by = cancelledBy;
  this.cancellation_date = new Date();
  return this.save();
};

// Reagendar sessão
Session.prototype.reschedule = async function(newDate, reason = null) {
  this.session_date = newDate;
  this.scheduled_start_time = newDate;
  this.status = 'rescheduled';
  
  if (reason) {
    this.cancellation_reason = reason;
  }
  
  return this.save();
};

// Obter resumo da sessão
Session.prototype.getSummary = function() {
  return {
    id: this.id,
    session_number: this.session_number,
    session_type: this.session_type,
    session_date: this.session_date,
    duration: this.getDurationFormatted(),
    status: this.status,
    patient_mood: this.patient_mood,
    progress_assessment: this.progress_assessment,
    main_topics: this.main_topics || [],
    has_homework: !!this.homework_assigned,
    homework_completed: this.homework_completed,
    next_session_date: this.next_session_date
  };
};

/**
 * MÉTODOS ESTÁTICOS
 * Métodos da classe Session
 */

// Buscar sessões por paciente
Session.findByPatientId = function(patientId, options = {}) {
  return this.findAll({
    where: { patient_id: patientId },
    order: [['session_date', 'DESC']],
    ...options
  });
};

// Buscar sessões por profissional
Session.findByProfessionalId = function(userId, options = {}) {
  return this.findAll({
    where: { user_id: userId },
    order: [['session_date', 'DESC']],
    ...options
  });
};

// Buscar sessões por período
Session.findByDateRange = function(userId, startDate, endDate, options = {}) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['session_date', 'ASC']],
    ...options
  });
};

// Buscar próximas sessões
Session.findUpcoming = function(userId, days = 7) {
  const { Op } = require('sequelize');
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return this.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.between]: [now, future]
      },
      status: ['scheduled', 'confirmed']
    },
    order: [['session_date', 'ASC']]
  });
};

// Estatísticas por profissional
Session.getStatsByProfessional = async function(userId, startDate, endDate) {
  const { Op } = require('sequelize');
  
  const whereCondition = { user_id: userId };
  if (startDate && endDate) {
    whereCondition.session_date = { [Op.between]: [startDate, endDate] };
  }
  
  const stats = await this.findAll({
    where: whereCondition,
    attributes: [
      'status',
      [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'count'],
      [this.sequelize.fn('AVG', this.sequelize.col('duration_minutes')), 'avg_duration'],
      [this.sequelize.fn('AVG', this.sequelize.col('patient_engagement')), 'avg_engagement']
    ],
    group: ['status'],
    raw: true
  });
  
  return stats.reduce((acc, stat) => {
    acc[stat.status] = {
      count: parseInt(stat.count),
      avg_duration: Math.round(stat.avg_duration || 0),
      avg_engagement: Math.round(stat.avg_engagement || 0)
    };
    return acc;
  }, {});
};

// Verificar conflitos de horário
Session.findConflicts = async function(userId, sessionDate, duration = 50, excludeId = null) {
  const { Op } = require('sequelize');
  
  const startTime = new Date(sessionDate);
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
  
  const whereCondition = {
    user_id: userId,
    status: ['scheduled', 'confirmed', 'in_progress'],
    [Op.or]: [
      {
        // Sessão começa durante outra sessão
        session_date: {
          [Op.between]: [startTime, endTime]
        }
      },
      {
        // Sessão termina durante outra sessão
        [Op.and]: [
          {
            session_date: { [Op.lte]: startTime }
          },
          this.sequelize.literal(`
            session_date + INTERVAL duration_minutes MINUTE >= '${startTime.toISOString()}'
          `)
        ]
      }
    ]
  };
  
  if (excludeId) {
    whereCondition.id = { [Op.ne]: excludeId };
  }
  
  return this.findAll({ where: whereCondition });
};

// Relatório de produtividade
Session.getProductivityReport = async function(userId, year, month = null) {
  const { Op } = require('sequelize');
  
  let startDate, endDate;
  if (month) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
  }
  
  const [totalSessions, completedSessions, totalDuration, avgEngagement] = await Promise.all([
    this.count({
      where: {
        user_id: userId,
        session_date: { [Op.between]: [startDate, endDate] }
      }
    }),
    
    this.count({
      where: {
        user_id: userId,
        session_date: { [Op.between]: [startDate, endDate] },
        status: 'completed'
      }
    }),
    
    this.sum('duration_minutes', {
      where: {
        user_id: userId,
        session_date: { [Op.between]: [startDate, endDate] },
        status: 'completed'
      }
    }),
    
    this.findOne({
      where: {
        user_id: userId,
        session_date: { [Op.between]: [startDate, endDate] },
        status: 'completed',
        patient_engagement: { [Op.ne]: null }
      },
      attributes: [
        [this.sequelize.fn('AVG', this.sequelize.col('patient_engagement')), 'avg_engagement']
      ],
      raw: true
    })
  ]);
  
  return {
    period: month ? `${month}/${year}` : year.toString(),
    total_sessions: totalSessions,
    completed_sessions: completedSessions,
    completion_rate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    total_duration_hours: totalDuration ? Math.round(totalDuration / 60) : 0,
    avg_engagement: avgEngagement?.avg_engagement ? Math.round(avgEngagement.avg_engagement) : null
  };
};

module.exports = Session;