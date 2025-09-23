/**
 * MÓDULA - MODELO DE ANAMNESE
 * 
 * Define a estrutura completa da anamnese digital estruturada.
 * Organizada em seções específicas para coleta sistemática de dados clínicos.
 * 
 * Seções implementadas:
 * - Identificação e dados pessoais
 * - História pessoal e familiar
 * - História médica e psicológica
 * - Queixa principal e atual
 * - Hábitos e estilo de vida
 * - Objetivos do tratamento
 * 
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * MODELO ANAMNESIS
 * Sistema completo de anamnese digital com seções estruturadas
 */
const Anamnesis = sequelize.define('Anamnesis', {
  // Campo ID (chave primária)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único da anamnese'
  },

  // Relacionamentos
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    comment: 'ID do paciente (um paciente = uma anamnese)'
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

  // Controle de status e progresso
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'reviewed'),
    defaultValue: 'draft',
    comment: 'Status atual da anamnese',
    validate: {
      isIn: {
        args: [['draft', 'in_progress', 'completed', 'reviewed']],
        msg: 'Status deve ser: draft, in_progress, completed ou reviewed'
      }
    }
  },

  completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Percentual de completude (0-100)',
    validate: {
      min: {
        args: [0],
        msg: 'Percentual não pode ser negativo'
      },
      max: {
        args: [100],
        msg: 'Percentual não pode ser maior que 100'
      }
    }
  },

  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora da finalização'
  },

  last_modified_section: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Última seção modificada'
  },

  // ===== SEÇÃO 1: IDENTIFICAÇÃO E DADOS PESSOAIS =====
  identification: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Dados de identificação pessoal',
    // Estrutura esperada:
    // {
    //   birthplace: "Cidade, Estado",
    //   nationality: "Brasileira",
    //   education_level: "superior_completo",
    //   current_occupation: "Engenheiro",
    //   work_situation: "employed",
    //   monthly_income: "5000-10000",
    //   housing_situation: "own_house",
    //   family_composition: ["spouse", "child1", "child2"],
    //   emergency_contact: {
    //     name: "Nome",
    //     relationship: "spouse",
    //     phone: "11999999999"
    //   }
    // }
  },

  // ===== SEÇÃO 2: HISTÓRIA FAMILIAR =====
  family_history: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'História familiar detalhada',
    // Estrutura esperada:
    // {
    //   father: {
    //     alive: true,
    //     age: 65,
    //     health_condition: "Hipertensão",
    //     relationship_quality: "boa"
    //   },
    //   mother: {
    //     alive: true,
    //     age: 60,
    //     health_condition: "Saudável",
    //     relationship_quality: "excelente"
    //   },
    //   siblings: [
    //     {
    //       gender: "male",
    //       age: 35,
    //       health_condition: "Saudável",
    //       relationship_quality: "boa"
    //     }
    //   ],
    //   family_mental_health: [
    //     {
    //       member: "tio_paterno",
    //       condition: "depressão",
    //       treatment: "medicamentoso"
    //     }
    //   ],
    //   genetic_conditions: ["diabetes_tipo2"],
    //   family_dynamics: "Família unida, comunicação aberta"
    // }
  },

  // ===== SEÇÃO 3: HISTÓRIA MÉDICA =====
  medical_history: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'História médica completa',
    // Estrutura esperada:
    // {
    //   chronic_diseases: [
    //     {
    //       condition: "hipertensao",
    //       diagnosed_year: 2020,
    //       treatment: "medicamentoso",
    //       controlled: true
    //     }
    //   ],
    //   surgeries: [
    //     {
    //       procedure: "apendicectomia",
    //       year: 2015,
    //       complications: false
    //     }
    //   ],
    //   hospitalizations: [
    //     {
    //       reason: "pneumonia",
    //       year: 2018,
    //       duration_days: 7
    //     }
    //   ],
    //   current_medications: [
    //     {
    //       name: "Losartana",
    //       dosage: "50mg",
    //       frequency: "1x dia",
    //       purpose: "hipertensao"
    //     }
    //   ],
    //   allergies: [
    //     {
    //       allergen: "penicilina",
    //       reaction: "urticaria",
    //       severity: "moderada"
    //     }
    //   ],
    //   current_physician: "Dr. João Silva - Cardiologia"
    // }
  },

  // ===== SEÇÃO 4: HISTÓRIA PSICOLÓGICA/PSIQUIÁTRICA =====
  psychological_history: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'História psicológica e psiquiátrica',
    // Estrutura esperada:
    // {
    //   previous_treatments: [
    //     {
    //       type: "psicoterapia",
    //       period: "2019-2020",
    //       professional: "Psicóloga Maria",
    //       reason: "ansiedade",
    //       outcome: "melhora_significativa"
    //     }
    //   ],
    //   psychiatric_medications: [
    //     {
    //       name: "Sertralina",
    //       period: "2020-2021",
    //       dosage: "50mg",
    //       prescriber: "Dr. Paulo",
    //       effectiveness: "boa"
    //     }
    //   ],
    //   psychiatric_hospitalizations: [],
    //   suicide_attempts: {
    //     occurred: false,
    //     details: null
    //   },
    //   self_harm: {
    //     occurred: false,
    //     details: null
    //   },
    //   traumatic_events: [
    //     {
    //       event: "acidente_carro",
    //       age: 25,
    //       impact: "moderado",
    //       treatment_received: false
    //     }
    //   ]
    // }
  },

  // ===== SEÇÃO 5: QUEIXA PRINCIPAL E ATUAL =====
  current_complaint: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Queixa principal e situação atual',
    // Estrutura esperada:
    // {
    //   main_complaint: "Ansiedade excessiva no trabalho",
    //   onset: {
    //     when: "3 meses atrás",
    //     trigger: "Promoção no trabalho"
    //   },
    //   symptoms: [
    //     {
    //       symptom: "palpitações",
    //       frequency: "diária",
    //       intensity: 7,
    //       situations: ["reuniões", "apresentações"]
    //     },
    //     {
    //       symptom: "insônia",
    //       frequency: "3x semana",
    //       intensity: 6,
    //       situations: ["véspera de reunião"]
    //     }
    //   ],
    //   impact_on_life: {
    //     work: 8,
    //     relationships: 5,
    //     social_life: 6,
    //     self_care: 4,
    //     overall: 7
    //   },
    //   coping_strategies: [
    //     {
    //       strategy: "exercício físico",
    //       effectiveness: 6,
    //       frequency: "3x semana"
    //     }
    //   ],
    //   what_helps: "Conversar com esposa, exercitar-se",
    //   what_worsens: "Pressão no trabalho, falta de sono"
    // }
  },

  // ===== SEÇÃO 6: ESTILO DE VIDA E HÁBITOS =====
  lifestyle: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Hábitos e estilo de vida',
    // Estrutura esperada:
    // {
    //   sleep: {
    //     bedtime: "23:00",
    //     wake_time: "07:00",
    //     quality: "ruim",
    //     difficulties: ["adormecer", "despertar_noturno"],
    //     sleep_aids: false
    //   },
    //   nutrition: {
    //     eating_pattern: "3_meals_2_snacks",
    //     diet_restrictions: ["lactose"],
    //     water_intake: "2_liters",
    //     appetite: "normal",
    //     weight_changes: false
    //   },
    //   physical_activity: {
    //     type: "caminhada",
    //     frequency: "3x_week",
    //     duration: "30_min",
    //     enjoys: true
    //   },
    //   substance_use: {
    //     alcohol: {
    //       frequency: "social",
    //       quantity: "1-2_drinks",
    //       problems: false
    //     },
    //     tobacco: {
    //       current: false,
    //       past: true,
    //       quit_date: "2020"
    //     },
    //     drugs: {
    //       current: false,
    //       past: false
    //     },
    //     caffeine: {
    //       daily: true,
    //       quantity: "2_cups"
    //     }
    //   },
    //   leisure_activities: [
    //     "leitura", "cinema", "jardinagem"
    //   ],
    //   social_life: {
    //     frequency: "weekly",
    //     satisfaction: 7,
    //     close_friends: 3
    //   }
    // }
  },

  // ===== SEÇÃO 7: RELACIONAMENTOS =====
  relationships: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Relacionamentos e suporte social',
    // Estrutura esperada:
    // {
    //   marital_status: {
    //     current: "married",
    //     partner_name: "Maria Silva",
    //     relationship_duration: "10_years",
    //     relationship_quality: 8,
    //     conflicts: "occasional_minor",
    //     support_level: 9
    //   },
    //   children: [
    //     {
    //       age: 8,
    //       gender: "female",
    //       relationship_quality: 9,
    //       any_issues: false
    //     }
    //   ],
    //   family_relationships: {
    //     parents: 7,
    //     siblings: 6,
    //     extended_family: 5
    //   },
    //   friendships: {
    //     close_friends_count: 3,
    //     social_satisfaction: 7,
    //     social_anxiety: false
    //   },
    //   work_relationships: {
    //     colleagues: 6,
    //     supervisor: 5,
    //     work_stress: 8
    //   }
    // }
  },

  // ===== SEÇÃO 8: OBJETIVOS E EXPECTATIVAS =====
  treatment_goals: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Objetivos do tratamento e expectativas',
    // Estrutura esperada:
    // {
    //   patient_goals: [
    //     "Reduzir ansiedade no trabalho",
    //     "Melhorar qualidade do sono",
    //     "Desenvolver estratégias de enfrentamento"
    //   ],
    //   expectations: {
    //     treatment_duration: "6_months",
    //     session_frequency: "weekly",
    //     main_focus: "anxiety_management",
    //     concerns: "Tempo disponível para sessões"
    //   },
    //   motivation: {
    //     level: 9,
    //     reasons: [
    //       "Impacto no trabalho",
    //       "Bem-estar familiar",
    //       "Qualidade de vida"
    //     ]
    //   },
    //   previous_therapy_experience: {
    //     helpful_aspects: "Técnicas de respiração",
    //     unhelpful_aspects: "Muito foco no passado",
    //     preferred_approach: "Prático e focado no presente"
    //   },
    //   availability: {
    //     preferred_days: ["tuesday", "thursday"],
    //     preferred_times: ["morning", "early_evening"],
    //     scheduling_flexibility: "moderate"
    //   }
    // }
  },

  // ===== OBSERVAÇÕES DO PROFISSIONAL =====
  professional_observations: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações e impressões do profissional'
  },

  clinical_impression: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Impressão clínica inicial'
  },

  initial_treatment_plan: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Plano inicial de tratamento'
  },

  // ===== METADADOS =====
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadados adicionais para controle interno'
  },

  // Controle de revisões
  revision_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de revisões realizadas'
  },

  last_auto_save: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp do último auto-save'
  }

}, {
  // Configurações do modelo
  tableName: 'anamnesis',
  timestamps: true,
  paranoid: false, // Não usar soft delete para anamneses
  
  // Índices para otimização
  indexes: [
    {
      fields: ['patient_id'],
      unique: true, // Um paciente = uma anamnese
      name: 'idx_anamnesis_patient_unique'
    },
    {
      fields: ['user_id'],
      name: 'idx_anamnesis_user'
    },
    {
      fields: ['status'],
      name: 'idx_anamnesis_status'
    },
    {
      fields: ['completion_percentage'],
      name: 'idx_anamnesis_completion'
    },
    {
      fields: ['created_at'],
      name: 'idx_anamnesis_created'
    }
  ]
});

/**
 * MÉTODOS DE INSTÂNCIA
 * Métodos específicos para cada instância de anamnese
 */

// Calcular percentual de completude
Anamnesis.prototype.calculateCompletionPercentage = function() {
  const sections = [
    'identification',
    'family_history', 
    'medical_history',
    'psychological_history',
    'current_complaint',
    'lifestyle',
    'relationships',
    'treatment_goals'
  ];
  
  let completedSections = 0;
  let totalWeight = 0;
  
  // Pesos por seção (algumas são mais importantes)
  const sectionWeights = {
    current_complaint: 3,    // Mais importante
    medical_history: 2,      // Importante
    psychological_history: 2, // Importante
    treatment_goals: 2,      // Importante
    identification: 1,
    family_history: 1,
    lifestyle: 1,
    relationships: 1
  };
  
  sections.forEach(section => {
    const weight = sectionWeights[section] || 1;
    totalWeight += weight;
    
    const sectionData = this[section];
    if (sectionData && Object.keys(sectionData).length > 0) {
      // Verificar se a seção tem conteúdo significativo
      const hasContent = Object.values(sectionData).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) {
          return Object.keys(value).length > 0;
        }
        return value !== null && value !== undefined && value !== '';
      });
      
      if (hasContent) {
        completedSections += weight;
      }
    }
  });
  
  const percentage = totalWeight > 0 ? Math.round((completedSections / totalWeight) * 100) : 0;
  
  // Atualizar no banco se mudou
  if (this.completion_percentage !== percentage) {
    this.completion_percentage = percentage;
  }
  
  return percentage;
};

// Verificar se anamnese está completa
Anamnesis.prototype.isCompleted = function() {
  const completionPercentage = this.calculateCompletionPercentage();
  return completionPercentage >= 80; // 80% considerado completo
};

// Marcar como completa
Anamnesis.prototype.markAsCompleted = async function() {
  if (!this.isCompleted()) {
    throw new Error('Anamnese deve estar pelo menos 80% completa para ser finalizada');
  }
  
  this.status = 'completed';
  this.completed_at = new Date();
  this.completion_percentage = this.calculateCompletionPercentage();
  
  return this.save();
};

// Obter resumo da anamnese
Anamnesis.prototype.getSummary = function() {
  const summary = {
    id: this.id,
    patient_id: this.patient_id,
    status: this.status,
    completion_percentage: this.calculateCompletionPercentage(),
    created_at: this.created_at,
    completed_at: this.completed_at,
    last_modified: this.updated_at
  };
  
  // Adicionar destaques das seções principais
  if (this.current_complaint?.main_complaint) {
    summary.main_complaint = this.current_complaint.main_complaint;
  }
  
  if (this.treatment_goals?.patient_goals) {
    summary.treatment_goals = this.treatment_goals.patient_goals.slice(0, 3); // Primeiros 3
  }
  
  return summary;
};

// Validar seção específica
Anamnesis.prototype.validateSection = function(sectionName) {
  const validSections = [
    'identification', 'family_history', 'medical_history',
    'psychological_history', 'current_complaint', 'lifestyle',
    'relationships', 'treatment_goals'
  ];
  
  if (!validSections.includes(sectionName)) {
    throw new Error(`Seção inválida: ${sectionName}`);
  }
  
  const sectionData = this[sectionName];
  
  // Validações específicas por seção
  switch (sectionName) {
    case 'current_complaint':
      return !!(sectionData?.main_complaint);
      
    case 'medical_history':
      return !!(sectionData && Object.keys(sectionData).length > 0);
      
    case 'treatment_goals':
      return !!(sectionData?.patient_goals?.length > 0);
      
    default:
      return !!(sectionData && Object.keys(sectionData).length > 0);
  }
};

// Atualizar timestamp de auto-save
Anamnesis.prototype.updateAutoSave = function() {
  this.last_auto_save = new Date();
  return this.save({ fields: ['last_auto_save', 'updated_at'] });
};

/**
 * MÉTODOS ESTÁTICOS
 * Métodos da classe Anamnesis
 */

// Buscar anamnese por paciente
Anamnesis.findByPatientId = function(patientId) {
  return this.findOne({
    where: { patient_id: patientId }
  });
};

// Buscar anamneses incompletas de um profissional
Anamnesis.findIncompleteByProfessional = function(userId) {
  return this.findAll({
    where: {
      user_id: userId,
      status: ['draft', 'in_progress'],
      completion_percentage: { [sequelize.Sequelize.Op.lt]: 80 }
    },
    order: [['updated_at', 'DESC']]
  });
};

// Estatísticas de anamneses por profissional
Anamnesis.getStatsByProfessional = async function(userId) {
  const stats = await this.findAll({
    where: { user_id: userId },
    attributes: [
      'status',
      [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'count'],
      [this.sequelize.fn('AVG', this.sequelize.col('completion_percentage')), 'avg_completion']
    ],
    group: ['status'],
    raw: true
  });
  
  return stats.reduce((acc, stat) => {
    acc[stat.status] = {
      count: parseInt(stat.count),
      avg_completion: Math.round(stat.avg_completion || 0)
    };
    return acc;
  }, {});
};

module.exports = Anamnesis;