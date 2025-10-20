/**
 * MÓDULA - VALIDAÇÕES DE TRANSFERÊNCIA
 * 
 * Middlewares de validação usando Joi para operações de transferência.
 * Garante integridade dos dados antes de processar solicitações.
 */

const Joi = require('joi');

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

/**
 * Schema para solicitação de transferência
 */
const requestTransferSchema = Joi.object({
  patient_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do paciente deve ser um UUID válido',
      'any.required': 'ID do paciente é obrigatório',
    }),

  to_user_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do profissional destino deve ser um UUID válido',
      'any.required': 'ID do profissional destino é obrigatório',
    }),

  reason: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Motivo deve ter no mínimo 10 caracteres',
      'string.max': 'Motivo deve ter no máximo 1000 caracteres',
      'any.required': 'Motivo da transferência é obrigatório',
      'string.empty': 'Motivo não pode estar vazio',
    }),
});

/**
 * Schema para aprovação de transferência
 */
const approveTransferSchema = Joi.object({
  notes: Joi.string()
    .max(500)
    .trim()
    .allow('', null)
    .messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres',
    }),

  auto_complete: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'auto_complete deve ser um valor booleano',
    }),
});

/**
 * Schema para rejeição de transferência
 */
const rejectTransferSchema = Joi.object({
  reason: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Motivo da rejeição deve ter no mínimo 10 caracteres',
      'string.max': 'Motivo da rejeição deve ter no máximo 1000 caracteres',
      'any.required': 'Motivo da rejeição é obrigatório',
      'string.empty': 'Motivo da rejeição não pode estar vazio',
    }),
});

/**
 * Schema para cancelamento de transferência
 */
const cancelTransferSchema = Joi.object({
  reason: Joi.string()
    .min(10)
    .max(500)
    .trim()
    .allow('', null)
    .messages({
      'string.min': 'Motivo do cancelamento deve ter no mínimo 10 caracteres',
      'string.max': 'Motivo do cancelamento deve ter no máximo 500 caracteres',
    }),
});

/**
 * Schema para listagem de transferências
 */
const listTransfersSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Página deve ser um número',
      'number.min': 'Página deve ser no mínimo 1',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limite deve ser um número',
      'number.min': 'Limite deve ser no mínimo 1',
      'number.max': 'Limite deve ser no máximo 100',
    }),

  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'completed', 'cancelled')
    .allow('', null)
    .messages({
      'any.only': 'Status inválido. Valores permitidos: pending, approved, rejected, completed, cancelled',
    }),

  direction: Joi.string()
    .valid('sent', 'received', 'all')
    .default('all')
    .messages({
      'any.only': 'Direção inválida. Valores permitidos: sent, received, all',
    }),

  sortBy: Joi.string()
    .valid('requested_at', 'processed_at', 'completed_at', 'status')
    .default('requested_at')
    .messages({
      'any.only': 'Campo de ordenação inválido',
    }),

  order: Joi.string()
    .valid('ASC', 'DESC')
    .uppercase()
    .default('DESC')
    .messages({
      'any.only': 'Ordem deve ser ASC ou DESC',
    }),
});

/**
 * Schema para filtros de histórico (admin)
 */
const historyFiltersSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'completed', 'cancelled')
    .allow('', null),

  from_date: Joi.date()
    .iso()
    .allow('', null)
    .messages({
      'date.format': 'Data inicial deve estar no formato ISO (YYYY-MM-DD)',
    }),

  to_date: Joi.date()
    .iso()
    .min(Joi.ref('from_date'))
    .allow('', null)
    .messages({
      'date.format': 'Data final deve estar no formato ISO (YYYY-MM-DD)',
      'date.min': 'Data final deve ser posterior à data inicial',
    }),

  patient_id: Joi.string()
    .uuid()
    .allow('', null)
    .messages({
      'string.guid': 'ID do paciente deve ser um UUID válido',
    }),

  professional_id: Joi.string()
    .uuid()
    .allow('', null)
    .messages({
      'string.guid': 'ID do profissional deve ser um UUID válido',
    }),
});

/**
 * Schema para validação de UUID em params
 */
const transferIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID da transferência inválido',
      'any.required': 'ID da transferência é obrigatório',
    }),
});

// ============================================
// MIDDLEWARES DE VALIDAÇÃO
// ============================================

/**
 * Validar solicitação de transferência
 */
const validateRequestTransfer = (req, res, next) => {
  const { error } = requestTransferSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de solicitação inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validar aprovação de transferência
 */
const validateApproveTransfer = (req, res, next) => {
  const { error } = approveTransferSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de aprovação inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validar rejeição de transferência
 */
const validateRejectTransfer = (req, res, next) => {
  const { error } = rejectTransferSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de rejeição inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validar cancelamento de transferência
 */
const validateCancelTransfer = (req, res, next) => {
  const { error } = cancelTransferSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de cancelamento inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validar query params de listagem
 */
const validateListTransfers = (req, res, next) => {
  const { error, value } = listTransfersSchema.validate(req.query, { 
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros de listagem inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  // Substituir req.query pelos valores validados e com defaults
  req.query = value;
  next();
};

/**
 * Validar filtros de histórico
 */
const validateHistoryFilters = (req, res, next) => {
  const { error, value } = historyFiltersSchema.validate(req.query, { 
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Filtros de histórico inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  // Substituir req.query pelos valores validados
  req.query = value;
  next();
};

/**
 * Validar ID da transferência em params
 */
const validateTransferId = (req, res, next) => {
  const { error } = transferIdSchema.validate(req.params, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'ID da transferência inválido',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Schemas (exportar para testes)
  requestTransferSchema,
  approveTransferSchema,
  rejectTransferSchema,
  cancelTransferSchema,
  listTransfersSchema,
  historyFiltersSchema,
  transferIdSchema,

  // Middlewares
  validateRequestTransfer,
  validateApproveTransfer,
  validateRejectTransfer,
  validateCancelTransfer,
  validateListTransfers,
  validateHistoryFilters,
  validateTransferId,
};