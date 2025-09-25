/**
 * MÓDULA - VALIDAÇÕES DE ANAMNESE
 * 
 * Middlewares de validação específicos para o sistema de anamnese digital.
 * Validações inteligentes por seção, contextuais e com feedback detalhado.
 * 
 * Validações implementadas:
 * - Criação e atualização de anamneses
 * - Validações específicas por seção
 * - Auto-save com controle de conflitos
 * - Templates e estrutura de dados
 * - Query parameters para listagem
 * 
 */

const Joi = require('joi');
const { createValidationError } = require('./errorHandler');

/**
 * SCHEMAS BASE PARA ANAMNESE
 */

// Schema para UUID
const uuidSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .messages({
    'string.uuid': 'ID deve ser um UUID válido'
  });

// Schema para timestamps
const timestampSchema = Joi.date()
  .iso()
  .messages({
    'date.format': 'Data deve estar em formato ISO válido'
  });

// Schema para status da anamnese
const anamnesisStatusSchema = Joi.string()
  .valid('draft', 'in_progress', 'completed', 'reviewed')
  .messages({
    'any.only': 'Status deve ser: draft, in_progress, completed ou reviewed'
  });

// Schema para nomes de seção
const sectionNameSchema = Joi.string()
  .valid(
    'identification', 'family_history', 'medical_history',
    'psychological_history', 'current_complaint', 'lifestyle',
    'relationships', 'treatment_goals'
  )
  .messages({
    'any.only': 'Nome de seção inválido'
  });

/**
 * SCHEMAS ESPECÍFICOS POR SEÇÃO
 */

// Schema para Identificação
const identificationSchema = Joi.object({
  birthplace: Joi.string().max(100).optional().allow(''),
  nationality: Joi.string().max(50).optional().default('Brasileira'),
  education_level: Joi.string().valid(
    'fundamental_incompleto', 'fundamental_completo', 'medio_incompleto',
    'medio_completo', 'superior_incompleto', 'superior_completo', 'pos_graduacao'
  ).optional(),
  current_occupation: Joi.string().max(100).optional().allow(''),
  work_situation: Joi.string().valid(
    'employed', 'unemployed', 'student', 'retired', 'self_employed'
  ).optional(),
  monthly_income: Joi.string().valid(
    'ate_1000', '1000_3000', '3000_5000', '5000_10000', 'acima_10000'
  ).optional(),
  housing_situation: Joi.string().valid(
    'own_house', 'rented', 'family_house', 'shared'
  ).optional(),
  family_composition: Joi.array().items(Joi.string()).optional(),
  emergency_contact: Joi.object({
    name: Joi.string().max(150).optional(),
    relationship: Joi.string().max(50).optional(),
    phone: Joi.string().pattern(/^\d{10,11}$/).optional(),
    email: Joi.string().email().optional()
  }).optional()
}).options({ stripUnknown: true });

// Schema para História Familiar
const familyHistorySchema = Joi.object({
  father: Joi.object({
    alive: Joi.boolean().optional(),
    age: Joi.number().integer().min(0).max(150).optional(),
    health_condition: Joi.string().max(500).optional().allow(''),
    relationship_quality: Joi.string().valid(
      'excelente', 'boa', 'regular', 'ruim', 'sem_contato'
    ).optional()
  }).optional(),
  
  mother: Joi.object({
    alive: Joi.boolean().optional(),
    age: Joi.number().integer().min(0).max(150).optional(),
    health_condition: Joi.string().max(500).optional().allow(''),
    relationship_quality: Joi.string().valid(
      'excelente', 'boa', 'regular', 'ruim', 'sem_contato'
    ).optional()
  }).optional(),
  
  siblings: Joi.array().items(
    Joi.object({
      gender: Joi.string().valid('male', 'female').optional(),
      age: Joi.number().integer().min(0).max(150).optional(),
      health_condition: Joi.string().max(500).optional().allow(''),
      relationship_quality: Joi.string().valid(
        'excelente', 'boa', 'regular', 'ruim', 'sem_contato'
      ).optional()
    })
  ).optional(),
  
  family_mental_health: Joi.array().items(
    Joi.object({
      member: Joi.string().max(100).required(),
      condition: Joi.string().max(200).required(),
      treatment: Joi.string().max(300).optional().allow('')
    })
  ).optional(),
  
  genetic_conditions: Joi.array().items(Joi.string().max(100)).optional(),
  family_dynamics: Joi.string().max(1000).optional().allow('')
  
}).options({ stripUnknown: true });

// Schema para História Médica
const medicalHistorySchema = Joi.object({
  chronic_diseases: Joi.array().items(
    Joi.object({
      condition: Joi.string().max(200).required(),
      diagnosed_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
      treatment: Joi.string().max(300).optional().allow(''),
      controlled: Joi.boolean().optional()
    })
  ).optional(),
  
  surgeries: Joi.array().items(
    Joi.object({
      procedure: Joi.string().max(200).required(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
      complications: Joi.boolean().optional(),
      details: Joi.string().max(500).optional().allow('')
    })
  ).optional(),
  
  hospitalizations: Joi.array().items(
    Joi.object({
      reason: Joi.string().max(300).required(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
      duration_days: Joi.number().integer().min(1).max(365).optional()
    })
  ).optional(),
  
  current_medications: Joi.array().items(
    Joi.object({
      name: Joi.string().max(200).required(),
      dosage: Joi.string().max(100).optional().allow(''),
      frequency: Joi.string().max(100).optional().allow(''),
      purpose: Joi.string().max(200).optional().allow('')
    })
  ).optional(),
  
  allergies: Joi.array().items(
    Joi.object({
      allergen: Joi.string().max(200).required(),
      reaction: Joi.string().max(300).optional().allow(''),
      severity: Joi.string().valid('leve', 'moderada', 'grave').optional()
    })
  ).optional(),
  
  current_physician: Joi.string().max(300).optional().allow('')
  
}).options({ stripUnknown: true });

// Schema para História Psicológica
const psychologicalHistorySchema = Joi.object({
  previous_treatments: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('psicoterapia', 'psiquiatria', 'psicanalise', 'terapia_casal', 'terapia_familiar').required(),
      period: Joi.string().max(100).optional().allow(''),
      professional: Joi.string().max(200).optional().allow(''),
      reason: Joi.string().max(300).optional().allow(''),
      outcome: Joi.string().valid('melhora_significativa', 'melhora_parcial', 'sem_melhora', 'piora', 'interrupcao').optional()
    })
  ).optional(),
  
  psychiatric_medications: Joi.array().items(
    Joi.object({
      name: Joi.string().max(200).required(),
      period: Joi.string().max(100).optional().allow(''),
      dosage: Joi.string().max(100).optional().allow(''),
      prescriber: Joi.string().max(200).optional().allow(''),
      effectiveness: Joi.string().valid('excelente', 'boa', 'regular', 'ruim', 'sem_efeito').optional()
    })
  ).optional(),
  
  psychiatric_hospitalizations: Joi.array().items(
    Joi.object({
      reason: Joi.string().max(300).required(),
      year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
      duration_days: Joi.number().integer().min(1).max(365).optional(),
      voluntary: Joi.boolean().optional()
    })
  ).optional(),
  
  suicide_attempts: Joi.object({
    occurred: Joi.boolean().required(),
    details: Joi.when('occurred', {
      is: true,
      then: Joi.object({
        count: Joi.number().integer().min(1).optional(),
        most_recent: Joi.string().max(100).optional(),
        method: Joi.string().max(200).optional(),
        trigger: Joi.string().max(500).optional()
      }).optional(),
      otherwise: Joi.forbidden()
    })
  }).optional(),
  
  self_harm: Joi.object({
    occurred: Joi.boolean().required(),
    details: Joi.when('occurred', {
      is: true,
      then: Joi.object({
        frequency: Joi.string().valid('passado', 'ocasional', 'frequente').optional(),
        methods: Joi.array().items(Joi.string().max(100)).optional(),
        triggers: Joi.string().max(500).optional()
      }).optional(),
      otherwise: Joi.forbidden()
    })
  }).optional(),
  
  traumatic_events: Joi.array().items(
    Joi.object({
      event: Joi.string().max(300).required(),
      age: Joi.number().integer().min(0).max(100).optional(),
      impact: Joi.string().valid('leve', 'moderado', 'grave').optional(),
      treatment_received: Joi.boolean().optional()
    })
  ).optional()
  
}).options({ stripUnknown: true });

// Schema para Queixa Atual (SEÇÃO CRÍTICA)
const currentComplaintSchema = Joi.object({
  main_complaint: Joi.string().min(10).max(1000).required().messages({
    'any.required': 'Queixa principal é obrigatória',
    'string.min': 'Queixa principal deve ter pelo menos 10 caracteres',
    'string.max': 'Queixa principal não pode ter mais que 1000 caracteres'
  }),
  
  onset: Joi.object({
    when: Joi.string().max(200).required().messages({
      'any.required': 'Informação sobre quando começou é obrigatória'
    }),
    trigger: Joi.string().max(500).optional().allow('')
  }).required(),
  
  symptoms: Joi.array().items(
    Joi.object({
      symptom: Joi.string().max(200).required(),
      frequency: Joi.string().valid(
        'diária', 'semanal', 'mensal', 'ocasional', 'constante'
      ).required(),
      intensity: Joi.number().integer().min(1).max(10).required(),
      situations: Joi.array().items(Joi.string().max(200)).optional()
    }).required()
  ).min(1).optional().messages({
    'array.min': 'Pelo menos um sintoma deve ser informado'
  }),
  
  impact_on_life: Joi.object({
    work: Joi.number().integer().min(1).max(10).optional(),
    relationships: Joi.number().integer().min(1).max(10).optional(),
    social_life: Joi.number().integer().min(1).max(10).optional(),
    self_care: Joi.number().integer().min(1).max(10).optional(),
    overall: Joi.number().integer().min(1).max(10).optional()
  }).optional(),
  
  coping_strategies: Joi.array().items(
    Joi.object({
      strategy: Joi.string().max(200).required(),
      effectiveness: Joi.number().integer().min(1).max(10).optional(),
      frequency: Joi.string().max(100).optional().allow('')
    })
  ).optional(),
  
  what_helps: Joi.string().max(500).optional().allow(''),
  what_worsens: Joi.string().max(500).optional().allow('')
  
}).options({ stripUnknown: true });

// Schema para Estilo de Vida
const lifestyleSchema = Joi.object({
  sleep: Joi.object({
    bedtime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    wake_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quality: Joi.string().valid('excelente', 'boa', 'regular', 'ruim', 'muito_ruim').optional(),
    difficulties: Joi.array().items(
      Joi.string().valid('adormecer', 'despertar_noturno', 'despertar_precoce', 'sono_nao_reparador')
    ).optional(),
    sleep_aids: Joi.boolean().optional()
  }).optional(),
  
  nutrition: Joi.object({
    eating_pattern: Joi.string().max(100).optional().allow(''),
    diet_restrictions: Joi.array().items(Joi.string().max(100)).optional(),
    water_intake: Joi.string().max(50).optional().allow(''),
    appetite: Joi.string().valid('aumentado', 'normal', 'diminuido', 'ausente').optional(),
    weight_changes: Joi.boolean().optional()
  }).optional(),
  
  physical_activity: Joi.object({
    type: Joi.string().max(100).optional().allow(''),
    frequency: Joi.string().max(50).optional().allow(''),
    duration: Joi.string().max(50).optional().allow(''),
    enjoys: Joi.boolean().optional()
  }).optional(),
  
  substance_use: Joi.object({
    alcohol: Joi.object({
      frequency: Joi.string().valid('nunca', 'raro', 'social', 'semanal', 'diario').optional(),
      quantity: Joi.string().max(100).optional().allow(''),
      problems: Joi.boolean().optional()
    }).optional(),
    
    tobacco: Joi.object({
      current: Joi.boolean().optional(),
      past: Joi.boolean().optional(),
      quit_date: Joi.string().max(50).optional().allow('')
    }).optional(),
    
    drugs: Joi.object({
      current: Joi.boolean().optional(),
      past: Joi.boolean().optional(),
      details: Joi.string().max(300).optional().allow('')
    }).optional(),
    
    caffeine: Joi.object({
      daily: Joi.boolean().optional(),
      quantity: Joi.string().max(100).optional().allow('')
    }).optional()
  }).optional(),
  
  leisure_activities: Joi.array().items(Joi.string().max(100)).optional(),
  
  social_life: Joi.object({
    frequency: Joi.string().valid('diaria', 'semanal', 'mensal', 'rara', 'nunca').optional(),
    satisfaction: Joi.number().integer().min(1).max(10).optional(),
    close_friends: Joi.number().integer().min(0).max(50).optional()
  }).optional()
  
}).options({ stripUnknown: true });

// Schema para Relacionamentos
const relationshipsSchema = Joi.object({
  marital_status: Joi.object({
    current: Joi.string().valid('single', 'dating', 'married', 'divorced', 'widowed').optional(),
    partner_name: Joi.string().max(150).optional().allow(''),
    relationship_duration: Joi.string().max(50).optional().allow(''),
    relationship_quality: Joi.number().integer().min(1).max(10).optional(),
    conflicts: Joi.string().max(300).optional().allow(''),
    support_level: Joi.number().integer().min(1).max(10).optional()
  }).optional(),
  
  children: Joi.array().items(
    Joi.object({
      age: Joi.number().integer().min(0).max(50).required(),
      gender: Joi.string().valid('male', 'female').optional(),
      relationship_quality: Joi.number().integer().min(1).max(10).optional(),
      any_issues: Joi.boolean().optional(),
      details: Joi.string().max(300).optional().allow('')
    })
  ).optional(),
  
  family_relationships: Joi.object({
    parents: Joi.number().integer().min(1).max(10).optional(),
    siblings: Joi.number().integer().min(1).max(10).optional(),
    extended_family: Joi.number().integer().min(1).max(10).optional()
  }).optional(),
  
  friendships: Joi.object({
    close_friends_count: Joi.number().integer().min(0).max(50).optional(),
    social_satisfaction: Joi.number().integer().min(1).max(10).optional(),
    social_anxiety: Joi.boolean().optional()
  }).optional(),
  
  work_relationships: Joi.object({
    colleagues: Joi.number().integer().min(1).max(10).optional(),
    supervisor: Joi.number().integer().min(1).max(10).optional(),
    work_stress: Joi.number().integer().min(1).max(10).optional()
  }).optional()
  
}).options({ stripUnknown: true });

// Schema para Objetivos do Tratamento (SEÇÃO CRÍTICA)
const treatmentGoalsSchema = Joi.object({
  patient_goals: Joi.array().items(
    Joi.string().min(5).max(200)
  ).min(1).required().messages({
    'any.required': 'Pelo menos um objetivo do paciente é obrigatório',
    'array.min': 'Pelo menos um objetivo deve ser informado'
  }),
  
  expectations: Joi.object({
    treatment_duration: Joi.string().valid(
      '3_months', '6_months', '1_year', 'long_term', 'indefinite'
    ).optional(),
    session_frequency: Joi.string().valid(
      'weekly', 'biweekly', 'monthly', 'as_needed'
    ).optional(),
    main_focus: Joi.string().max(200).optional().allow(''),
    concerns: Joi.string().max(500).optional().allow('')
  }).optional(),
  
  motivation: Joi.object({
    level: Joi.number().integer().min(1).max(10).optional(),
    reasons: Joi.array().items(Joi.string().max(200)).optional()
  }).optional(),
  
  previous_therapy_experience: Joi.object({
    helpful_aspects: Joi.string().max(300).optional().allow(''),
    unhelpful_aspects: Joi.string().max(300).optional().allow(''),
    preferred_approach: Joi.string().max(300).optional().allow('')
  }).optional(),
  
  availability: Joi.object({
    preferred_days: Joi.array().items(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    ).optional(),
    preferred_times: Joi.array().items(
      Joi.string().valid('early_morning', 'morning', 'afternoon', 'early_evening', 'evening')
    ).optional(),
    scheduling_flexibility: Joi.string().valid('high', 'moderate', 'low').optional()
  }).optional()
  
}).options({ stripUnknown: true });

/**
 * MAPA DE SCHEMAS POR SEÇÃO
 */
const SECTION_SCHEMAS = {
  identification: identificationSchema,
  family_history: familyHistorySchema,
  medical_history: medicalHistorySchema,
  psychological_history: psychologicalHistorySchema,
  current_complaint: currentComplaintSchema,
  lifestyle: lifestyleSchema,
  relationships: relationshipsSchema,
  treatment_goals: treatmentGoalsSchema
};

/**
 * SCHEMAS PRINCIPAIS
 */

// Schema para criação de anamnese
const createAnamnesisSchema = Joi.object({
  initial_section: sectionNameSchema.optional(),
  initial_data: Joi.object().optional()
}).options({ stripUnknown: true });

// Schema para atualização de seção
const updateSectionSchema = Joi.object().unknown(true); // Validação específica é feita no controller

// Schema para auto-save
const autoSaveSchema = Joi.object({
  section: sectionNameSchema.required().messages({
    'any.required': 'Nome da seção é obrigatório para auto-save'
  }),
  data: Joi.object().required().messages({
    'any.required': 'Dados são obrigatórios para auto-save'
  }),
  timestamp: timestampSchema.required().messages({
    'any.required': 'Timestamp é obrigatório para controle de conflitos'
  })
}).options({ stripUnknown: true });

// Schema para finalização
const completeAnamnesisSchema = Joi.object({
  professional_observations: Joi.string().max(2000).optional().allow(''),
  clinical_impression: Joi.string().max(1000).optional().allow(''),
  initial_treatment_plan: Joi.string().max(2000).optional().allow('')
}).options({ stripUnknown: true });

// Schema para query de listagem
const anamnesisQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(1000).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  status: anamnesisStatusSchema.optional().allow(''),
  completion_min: Joi.number().integer().min(0).max(100).optional().default(0),
  completion_max: Joi.number().integer().min(0).max(100).optional().default(100),
  sortBy: Joi.string().valid(
    'created_at', 'updated_at', 'completion_percentage', 'status'
  ).optional().default('updated_at'),
  order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional().default('DESC')
}).options({ stripUnknown: true });

/**
 * MIDDLEWARES DE VALIDAÇÃO
 */

// Middleware factory para validação de body
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createValidationError('body', errorMessage);
    }
    
    req.body = value;
    next();
  };
};

// Middleware factory para validação de query
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createValidationError('query', errorMessage);
    }
    
    req.query = value;
    next();
  };
};

// Validação de UUID no parâmetro
const validateUUIDParam = (paramName = 'id') => {
  return (req, res, next) => {
    const paramValue = req.params[paramName];
    const { error } = uuidSchema.validate(paramValue);
    
    if (error) {
      throw createValidationError('params', `${paramName} deve ser um UUID válido`);
    }
    
    next();
  };
};

// Validação específica de seção
const validateSectionData = (req, res, next) => {
  const { sectionName } = req.params;
  const sectionData = req.body;
  
  // Obter schema específico da seção
  const sectionSchema = SECTION_SCHEMAS[sectionName];
  
  if (!sectionSchema) {
    throw createValidationError('section', 'Seção não encontrada ou sem validação definida');
  }
  
  // Validar dados da seção
  const { error, value } = sectionSchema.validate(sectionData);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw createValidationError('sectionData', `Erro na seção ${sectionName}: ${errorMessage}`);
  }
  
  // Substituir body pelos dados validados
  req.body = value;
  next();
};

/**
 * MIDDLEWARES ESPECÍFICOS EXPORTADOS
 */

// Validação para criação de anamnese
const validateCreateAnamnesis = validateBody(createAnamnesisSchema);

// Validação para atualização de seção (combinada)
const validateUpdateSection = [
  validateSectionData
];

// Validação para auto-save
const validateAutoSave = validateBody(autoSaveSchema);

// Validação para finalização
const validateCompleteAnamnesis = validateBody(completeAnamnesisSchema);

// Validação para listagem
const validateAnamnesisQuery = validateQuery(anamnesisQuerySchema);

// Validação de parâmetros
const validatePatientId = validateUUIDParam('patientId');
const validateAnamnesisId = validateUUIDParam('id');

// Validação de nome de seção
const validateSectionName = (req, res, next) => {
  const { sectionName } = req.params;
  const { error } = sectionNameSchema.validate(sectionName);
  
  if (error) {
    throw createValidationError('sectionName', 'Nome de seção inválido');
  }
  
  next();
};

/**
 * VALIDAÇÕES CONTEXTUAIS AVANÇADAS
 */

// Validação condicional baseada na idade do paciente
const validateByPatientAge = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const Patient = require('../models/Patient');
    
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      throw createValidationError('patient', 'Paciente não encontrado');
    }
    
    const age = patient.getAge();
    const { sectionName } = req.params;
    const sectionData = req.body;
    
    // Validações específicas por idade
    if (age && age < 18 && sectionName === 'substance_use') {
      // Para menores, ser mais rigoroso com substâncias
      if (sectionData.alcohol?.frequency === 'diario' || sectionData.drugs?.current === true) {
        throw createValidationError('substance_use', 
          'Dados de uso de substâncias em menores precisam de atenção especial');
      }
    }
    
    if (age && age > 65 && sectionName === 'medical_history') {
      // Para idosos, medicamentos são mais críticos
      if (sectionData.current_medications && sectionData.current_medications.length > 10) {
        // Apenas um aviso, não erro
        req.validationWarnings = req.validationWarnings || [];
        req.validationWarnings.push('Paciente idoso com muitas medicações - verificar interações');
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Validação de completude mínima para finalização
const validateMinimumCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Anamnesis = require('../models/Anamnesis');
    
    const anamnesis = await Anamnesis.findByPk(id);
    if (!anamnesis) {
      throw createValidationError('anamnesis', 'Anamnese não encontrada');
    }
    
    // Verificar seções obrigatórias
    const requiredSections = ['current_complaint', 'treatment_goals'];
    const missingSections = [];
    
    for (const section of requiredSections) {
      const sectionData = anamnesis[section];
      if (!sectionData || Object.keys(sectionData).length === 0) {
        missingSections.push(section);
      }
    }
    
    if (missingSections.length > 0) {
      throw createValidationError('completion', 
        `Seções obrigatórias não preenchidas: ${missingSections.join(', ')}`);
    }
    
    // Verificar completude mínima
    const completionPercentage = anamnesis.calculateCompletionPercentage();
    if (completionPercentage < 60) {
      throw createValidationError('completion', 
        `Anamnese deve estar pelo menos 60% completa para finalização. Atual: ${completionPercentage}%`);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * VALIDAÇÃO DE CONFLITOS NO AUTO-SAVE
 */
const validateAutoSaveConflicts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timestamp } = req.body;
    
    const Anamnesis = require('../models/Anamnesis');
    const anamnesis = await Anamnesis.findByPk(id);
    
    if (!anamnesis) {
      throw createValidationError('anamnesis', 'Anamnese não encontrada');
    }
    
    // Verificar conflitos temporais
    const requestTime = new Date(timestamp);
    const lastModified = new Date(anamnesis.updated_at);
    
    if (lastModified > requestTime) {
      // Conflito detectado - não é erro, mas precisa ser tratado
      req.conflictDetected = {
        server_time: lastModified,
        request_time: requestTime,
        message: 'Dados foram modificados por outra sessão'
      };
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Exportar todos os middlewares
module.exports = {
  // Middlewares principais
  validateCreateAnamnesis,
  validateUpdateSection,
  validateAutoSave,
  validateCompleteAnamnesis,
  validateAnamnesisQuery,
  
  // Validação de parâmetros
  validatePatientId,
  validateAnamnesisId,
  validateSectionName,
  
  // Validações contextuais
  validateByPatientAge,
  validateMinimumCompletion,
  validateAutoSaveConflicts,
  
  // Funções utilitárias
  validateBody,
  validateQuery,
  validateUUIDParam,
  
  // Schemas para uso direto
  schemas: {
    createAnamnesis: createAnamnesisSchema,
    updateSection: updateSectionSchema,
    autoSave: autoSaveSchema,
    completeAnamnesis: completeAnamnesisSchema,
    anamnesisQuery: anamnesisQuerySchema,
    sections: SECTION_SCHEMAS
  },
  
  // Constantes
  SECTION_SCHEMAS,
  VALID_SECTIONS: [
    'identification', 'family_history', 'medical_history',
    'psychological_history', 'current_complaint', 'lifestyle',
    'relationships', 'treatment_goals'
  ]
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. VALIDAÇÃO POR SEÇÃO:
 *    - Cada seção tem seu schema específico
 *    - Validações contextuais baseadas no paciente
 *    - Seções críticas têm validação mais rigorosa
 * 
 * 2. AUTO-SAVE INTELIGENTE:
 *    - Detecta conflitos temporais
 *    - Valida integridade dos dados
 *    - Controle de versioning básico
 * 
 * 3. VALIDAÇÃO CONDICIONAL:
 *    - Por idade do paciente
 *    - Por contexto clínico
 *    - Por completude mínima
 * 
 * 4. SCHEMAS FLEXÍVEIS:
 *    - Permitem campos opcionais
 *    - Validação progressiva
 *    - Estruturas aninhadas complexas
 * 
 * EXEMPLO DE USO:
 * 
 * // Validação de seção crítica
 * router.put('/:id/section/:sectionName',
 *   requireProfessional,
 *   validateAnamnesisId,
 *   validateSectionName,
 *   validateByPatientAge,        // Validação contextual
 *   validateUpdateSection,       // Validação da estrutura
 *   asyncHandler(controller.updateSection)
 * );
 * 
 * // Auto-save com controle de conflitos
 * router.post('/:id/auto-save',
 *   requireProfessional,
 *   validateAnamnesisId,
 *   validateAutoSaveConflicts,   // Detectar conflitos
 *   validateAutoSave,           // Validar dados
 *   asyncHandler(controller.autoSave)
 * );
 */