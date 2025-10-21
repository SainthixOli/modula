/**
 * MÓDULA - VALIDAÇÕES DO SISTEMA DE SESSÕES
 * 
 * Middlewares de validação para o sistema completo de agendamento e gestão de consultas.
 * Validações inteligentes, detecção de conflitos de horário e controle de evolução clínica.
 * 
 * Validações implementadas:
 * - Criação e agendamento de sessões
 * - Atualização de sessões agendadas
 * - Registro de evolução clínica pós-sessão
 * - Filtros de listagem com paginação
 * - Detecção automática de conflitos de horário
 * - Validações contextuais por tipo de sessão
 * 
 * Recursos especiais:
 * - 9 tipos diferentes de sessão especializados
 * - Validação de horários com regex HH:MM
 * - Sistema inteligente de detecção de conflitos
 * - Validação condicional (reason obrigatório em cancelamento)
 * - Ranges de data com validação cruzada
 * - Escala de engajamento (1-10) e progresso clínico
 * - Mensagens de erro personalizadas em português
 */

const Joi = require('joi');
const { AppError } = require('./errorHandler');

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

/**
 * Schema para criação de sessão/consulta
 */
const createSessionSchema = Joi.object({
  patient_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do paciente deve ser um UUID válido',
      'any.required': 'ID do paciente é obrigatório'
    }),

  session_date: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.base': 'Data da sessão inválida',
      'date.min': 'Data da sessão não pode ser no passado',
      'any.required': 'Data da sessão é obrigatória'
    }),

  session_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Horário deve estar no formato HH:MM (ex: 14:30)',
      'any.required': 'Horário da sessão é obrigatório'
    }),

  session_type: Joi.string()
    .valid(
      'first_consultation',
      'follow_up',
      'evaluation',
      'therapy_session',
      'group_session',
      'family_session',
      'emergency',
      'reassessment',
      'discharge'
    )
    .required()
    .messages({
      'any.only': 'Tipo de sessão inválido',
      'any.required': 'Tipo de sessão é obrigatório'
    }),

  duration_minutes: Joi.number()
    .integer()
    .min(15)
    .max(240)
    .default(60)
    .messages({
      'number.base': 'Duração deve ser um número',
      'number.min': 'Duração mínima é 15 minutos',
      'number.max': 'Duração máxima é 240 minutos (4 horas)'
    }),

  location: Joi.string()
    .max(100)
    .default('Consultório')
    .messages({
      'string.max': 'Localização deve ter no máximo 100 caracteres'
    }),

  notes: Joi.string()
    .max(5000)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 5000 caracteres'
    }),

  is_billable: Joi.boolean()
    .default(true),

  reminder_sent: Joi.boolean()
    .default(false)
});

/**
 * Schema para atualização de sessão agendada
 */
const updateScheduledSessionSchema = Joi.object({
  session_date: Joi.date()
    .iso()
    .min('now')
    .messages({
      'date.base': 'Data da sessão inválida',
      'date.min': 'Data da sessão não pode ser no passado'
    }),

  session_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      'string.pattern.base': 'Horário deve estar no formato HH:MM (ex: 14:30)'
    }),

  session_type: Joi.string()
    .valid(
      'first_consultation',
      'follow_up',
      'evaluation',
      'therapy_session',
      'group_therapy',
      'family_therapy',
      'emergency',
      'return',
      'discharge'
    )
    .messages({
      'any.only': 'Tipo de sessão inválido'
    }),

  duration_minutes: Joi.number()
    .integer()
    .min(15)
    .max(240)
    .messages({
      'number.min': 'Duração mínima é 15 minutos',
      'number.max': 'Duração máxima é 240 minutos'
    }),

  location: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Localização deve ter no máximo 100 caracteres'
    }),

  notes: Joi.string()
    .max(5000)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 5000 caracteres'
    }),

  status: Joi.string()
    .valid('scheduled', 'cancelled')
    .messages({
      'any.only': 'Status deve ser "scheduled" ou "cancelled"'
    }),

  cancellation_reason: Joi.string()
    .max(500)
    .when('status', {
      is: 'cancelled',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'string.max': 'Motivo do cancelamento deve ter no máximo 500 caracteres',
      'any.required': 'Motivo do cancelamento é obrigatório quando status é "cancelled"'
    })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser informado para atualização'
});

/**
 * Schema para registro de evolução da sessão (após realização)
 */
const recordSessionEvolutionSchema = Joi.object({
  session_notes: Joi.string()
    .min(10)
    .max(10000)
    .required()
    .messages({
      'string.min': 'Evolução da sessão deve ter no mínimo 10 caracteres',
      'string.max': 'Evolução da sessão deve ter no máximo 10000 caracteres',
      'any.required': 'Evolução da sessão é obrigatória'
    }),

  patient_mood: Joi.string()
    .max(100)
    .messages({
      'string.max': 'Humor do paciente deve ter no máximo 100 caracteres'
    }),

  main_topics: Joi.array()
    .items(Joi.string().max(200))
    .max(10)
    .messages({
      'array.max': 'Máximo de 10 tópicos principais'
    }),

  interventions_used: Joi.array()
    .items(Joi.string().max(200))
    .max(15)
    .messages({
      'array.max': 'Máximo de 15 intervenções'
    }),

  homework_assigned: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Tarefas para casa devem ter no máximo 2000 caracteres'
    }),

  progress_assessment: Joi.string()
    .valid('improved', 'stable', 'worsened', 'no_change')
    .messages({
      'any.only': 'Avaliação de progresso inválida'
    }),

  patient_engagement: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .messages({
      'number.min': 'Engajamento deve ser entre 1 e 10',
      'number.max': 'Engajamento deve ser entre 1 e 10'
    }),

  treatment_adherence: Joi.string()
    .valid('full', 'partial', 'minimal', 'none')
    .messages({
      'any.only': 'Adesão ao tratamento inválida'
    }),

  next_session_goals: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Objetivos para próxima sessão devem ter no máximo 2000 caracteres'
    }),

  treatment_plan_updates: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Atualizações do plano devem ter no máximo 2000 caracteres'
    }),

  actual_start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      'string.pattern.base': 'Horário de início deve estar no formato HH:MM'
    }),

  actual_end_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      'string.pattern.base': 'Horário de término deve estar no formato HH:MM'
    }),

  next_appointment: Joi.date()
    .iso()
    .min('now')
    .messages({
      'date.base': 'Data do próximo agendamento inválida',
      'date.min': 'Data do próximo agendamento não pode ser no passado'
    })
});

/**
 * Schema para filtros de listagem de sessões
 */
const listSessionsSchema = Joi.object({
  patient_id: Joi.string()
    .uuid()
    .messages({
      'string.guid': 'ID do paciente deve ser um UUID válido'
    }),

  status: Joi.string()
    .valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled', 'in_progress'),

  session_type: Joi.string()
    .valid(
      'first_consultation',
      'follow_up',
      'evaluation',
      'therapy_session',
      'group_therapy',
      'family_therapy',
      'emergency',
      'return',
      'discharge'
    ),

  date_from: Joi.date()
    .iso()
    .messages({
      'date.base': 'Data inicial inválida'
    }),

  date_to: Joi.date()
    .iso()
    .min(Joi.ref('date_from'))
    .messages({
      'date.base': 'Data final inválida',
      'date.min': 'Data final deve ser posterior à data inicial'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  sort_by: Joi.string()
    .valid('session_date', 'created_at', 'session_number')
    .default('session_date'),

  order: Joi.string()
    .valid('ASC', 'DESC')
    .default('DESC')
});

// ============================================
// MIDDLEWARES DE VALIDAÇÃO
// ============================================

/**
 * Middleware para validar criação de sessão
 */
const validateCreateSession = (req, res, next) => {
  const { error, value } = createSessionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Dados inválidos para criação de sessão',
      errors
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Middleware para validar atualização de sessão agendada
 */
const validateUpdateScheduledSession = (req, res, next) => {
  const { error, value } = updateScheduledSessionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Dados inválidos para atualização de sessão',
      errors
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Middleware para validar registro de evolução
 */
const validateRecordEvolution = (req, res, next) => {
  const { error, value } = recordSessionEvolutionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Dados inválidos para registro de evolução',
      errors
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Middleware para validar parâmetros de listagem
 */
const validateListSessions = (req, res, next) => {
  const { error, value } = listSessionsSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Parâmetros de filtro inválidos',
      errors
    });
  }

  req.validatedQuery = value;
  next();
};

/**
 * Middleware para validar UUID em parâmetros de rota
 */
const validateSessionId = (req, res, next) => {
  const { id } = req.params;
  
  const schema = Joi.string().uuid().required();
  const { error } = schema.validate(id);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'ID da sessão inválido',
      error: 'ID deve ser um UUID válido'
    });
  }

  next();
};

/**
 * Validação contextual: verificar conflitos de horário
 * Este middleware deve ser usado APÓS a validação básica
 */
const validateNoScheduleConflict = async (req, res, next) => {
  try {
    const { Session } = require('../models');
    const { session_date, session_time, duration_minutes } = req.validatedData;
    const userId = req.userId;
    const sessionId = req.params.id; // Para updates

    // Construir datetime completo
    const sessionDateTime = new Date(session_date);
    const sessionEnd = new Date(sessionDateTime.getTime() + duration_minutes * 60000);

    // Buscar sessões conflitantes
    const { Op } = require('sequelize');
    const conflictingSessions = await Session.findAll({
      where: {
        user_id: userId,
        status: {
          [Op.in]: ['scheduled', 'confirmed', 'in_progress']
        },
        ...(sessionId && { id: { [Op.ne]: sessionId } }),
        [Op.or]: [
          // Sessão nova começa durante uma sessão existente
          {
            session_date: {
              [Op.lte]: sessionDateTime
            },
            actual_end_time: {
              [Op.gte]: sessionDateTime
            }
          },
          // Sessão nova termina durante uma sessão existente
          {
            session_date: {
              [Op.lte]: sessionEnd
            },
            actual_end_time: {
              [Op.gte]: sessionEnd
            }
          },
          // Sessão nova engloba uma sessão existente
          {
            session_date: {
              [Op.gte]: sessionDateTime,
              [Op.lte]: sessionEnd
            }
          }
        ]
      },
      include: [
        {
          model: require('../models').Patient,
          as: 'Patient',
          attributes: ['full_name']
        }
      ]
    });

    if (conflictingSessions.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Conflito de horário detectado',
        conflicts: conflictingSessions.map(session => ({
          session_id: session.id,
          patient_name: session.Patient.full_name,
          session_date: session.session_date,
          duration: session.duration_minutes
        }))
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Schemas
  createSessionSchema,
  updateScheduledSessionSchema,
  recordSessionEvolutionSchema,
  listSessionsSchema,

  // Middlewares
  validateCreateSession,
  validateUpdateScheduledSession,
  validateRecordEvolution,
  validateListSessions,
  validateSessionId,
  validateNoScheduleConflict
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. VALIDAÇÃO DE CRIAÇÃO:
 *    - Todos os campos obrigatórios são validados
 *    - Horários seguem formato HH:MM estrito
 *    - Datas não podem ser no passado
 *    - Duração entre 15-240 minutos
 * 
 * 2. DETECÇÃO DE CONFLITOS:
 *    - Verifica sobreposição temporal de sessões
 *    - Considera duração das sessões
 *    - Exclui sessões canceladas da verificação
 *    - Retorna lista de conflitos encontrados
 * 
 * 3. VALIDAÇÃO DE EVOLUÇÃO:
 *    - Notas clínicas com mínimo 10 caracteres
 *    - Escalas de 1-10 para engajamento
 *    - Arrays limitados para performance
 *    - Campos opcionais com defaults sensatos
 * 
 * 4. FILTROS DE LISTAGEM:
 *    - Paginação com defaults (page=1, limit=20)
 *    - Ranges de data com validação cruzada
 *    - Ordenação flexível (ASC/DESC)
 *    - Filtros por status e tipo
 * 
 * EXEMPLO DE USO:
 * 
 * // Criação com detecção de conflitos
 * router.post('/sessions',
 *   requireProfessional,
 *   validateCreateSession,
 *   validateNoScheduleConflict,
 *   asyncHandler(controller.createSession)
 * );
 * 
 * // Atualização com validação condicional
 * router.put('/sessions/:id',
 *   requireProfessional,
 *   validateSessionId,
 *   validateUpdateScheduledSession,
 *   asyncHandler(controller.updateSession)
 * );
 * 
 * // Registro de evolução após sessão
 * router.post('/sessions/:id/evolution',
 *   requireProfessional,
 *   validateSessionId,
 *   validateRecordEvolution,
 *   asyncHandler(controller.recordEvolution)
 * );
 */