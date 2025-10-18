/**
 * MÓDULA - VALIDAÇÕES DE NOTIFICAÇÕES
 * 
 * Middlewares de validação usando Joi para operações de notificações.
 */

const Joi = require('joi');

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

/**
 * Schema para criar notificação
 */
const createNotificationSchema = Joi.object({
  user_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do usuário deve ser um UUID válido',
      'any.required': 'ID do usuário é obrigatório',
    }),

  type: Joi.string()
    .valid('info', 'success', 'warning', 'error', 'reminder')
    .default('info')
    .messages({
      'any.only': 'Tipo inválido. Use: info, success, warning, error, reminder',
    }),

  category: Joi.string()
    .valid('system', 'transfer', 'session', 'patient', 'anamnesis', 'admin', 'backup', 'security')
    .default('system')
    .messages({
      'any.only': 'Categoria inválida',
    }),

  title: Joi.string()
    .min(3)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Título deve ter no mínimo 3 caracteres',
      'string.max': 'Título deve ter no máximo 200 caracteres',
      'any.required': 'Título é obrigatório',
    }),

  message: Joi.string()
    .min(5)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Mensagem deve ter no mínimo 5 caracteres',
      'string.max': 'Mensagem deve ter no máximo 1000 caracteres',
      'any.required': 'Mensagem é obrigatória',
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('medium')
    .messages({
      'any.only': 'Prioridade inválida. Use: low, medium, high, critical',
    }),

  action_type: Joi.string()
    .valid('none', 'link', 'approve_transfer', 'reject_transfer', 'view_session', 'view_patient', 'complete_anamnesis', 'custom')
    .default('none')
    .messages({
      'any.only': 'Tipo de ação inválido',
    }),

  action_url: Joi.string()
    .uri({ allowRelative: true })
    .max(500)
    .allow('', null)
    .messages({
      'string.uri': 'URL de ação inválida',
      'string.max': 'URL deve ter no máximo 500 caracteres',
    }),

  action_data: Joi.object()
    .default({})
    .allow(null),

  related_entity_type: Joi.string()
    .valid('transfer', 'session', 'patient', 'anamnesis', 'user', 'backup', 'system')
    .allow('', null)
    .messages({
      'any.only': 'Tipo de entidade relacionada inválido',
    }),

  related_entity_id: Joi.string()
    .uuid()
    .allow('', null)
    .messages({
      'string.guid': 'ID da entidade relacionada deve ser um UUID válido',
    }),

  expires_at: Joi.date()
    .iso()
    .min('now')
    .allow('', null)
    .messages({
      'date.format': 'Data de expiração deve estar no formato ISO',
      'date.min': 'Data de expiração deve ser futura',
    }),
});

/**
 * Schema para criar notificações em lote
 */
const createBulkNotificationSchema = Joi.object({
  user_ids: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
    .messages({
      'array.min': 'É necessário fornecer ao menos um usuário',
      'any.required': 'Lista de usuários é obrigatória',
      'string.guid': 'Todos os IDs devem ser UUIDs válidos',
    }),

  type: Joi.string()
    .valid('info', 'success', 'warning', 'error', 'reminder')
    .default('info'),

  category: Joi.string()
    .valid('system', 'transfer', 'session', 'patient', 'anamnesis', 'admin', 'backup', 'security')
    .default('system'),

  title: Joi.string()
    .min(3)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Título deve ter no mínimo 3 caracteres',
      'string.max': 'Título deve ter no máximo 200 caracteres',
      'any.required': 'Título é obrigatório',
    }),

  message: Joi.string()
    .min(5)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Mensagem deve ter no mínimo 5 caracteres',
      'string.max': 'Mensagem deve ter no máximo 1000 caracteres',
      'any.required': 'Mensagem é obrigatória',
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('medium'),

  action_type: Joi.string()
    .valid('none', 'link', 'approve_transfer', 'reject_transfer', 'view_session', 'view_patient', 'complete_anamnesis', 'custom')
    .default('none'),

  action_url: Joi.string()
    .uri({ allowRelative: true })
    .max(500)
    .allow('', null),

  action_data: Joi.object()
    .default({})
    .allow(null),
});

/**
 * Schema para listagem de notificações
 */
const listNotificationsSchema = Joi.object({
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

  is_read: Joi.string()
    .valid('true', 'false')
    .allow('', null)
    .messages({
      'any.only': 'is_read deve ser "true" ou "false"',
    }),

  type: Joi.string()
    .valid('info', 'success', 'warning', 'error', 'reminder')
    .allow('', null),

  category: Joi.string()
    .valid('system', 'transfer', 'session', 'patient', 'anamnesis', 'admin', 'backup', 'security')
    .allow('', null),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .allow('', null),
});

/**
 * Schema para marcar todas como lidas
 */
const markAllReadSchema = Joi.object({
  category: Joi.string()
    .valid('system', 'transfer', 'session', 'patient', 'anamnesis', 'admin', 'backup', 'security')
    .allow('', null),

  type: Joi.string()
    .valid('info', 'success', 'warning', 'error', 'reminder')
    .allow('', null),
});

/**
 * Schema para limpeza de notificações antigas
 */
const cleanupSchema = Joi.object({
  days_old: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .default(30)
    .messages({
      'number.base': 'days_old deve ser um número',
      'number.min': 'days_old deve ser no mínimo 1',
      'number.max': 'days_old deve ser no máximo 365',
    }),
});

/**
 * Schema para validação de UUID em params
 */
const notificationIdSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID da notificação inválido',
      'any.required': 'ID da notificação é obrigatório',
    }),
});

// ============================================
// MIDDLEWARES DE VALIDAÇÃO
// ============================================

/**
 * Validar criação de notificação
 */
const validateCreateNotification = (req, res, next) => {
  const { error } = createNotificationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de notificação inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validar criação em lote
 */
const validateCreateBulk = (req, res, next) => {
  const { error } = createBulkNotificationSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados de notificações em lote inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validar listagem
 */
const validateListNotifications = (req, res, next) => {
  const { error, value } = listNotificationsSchema.validate(req.query, {
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

  req.query = value;
  next();
};

/**
 * Validar marcar todas como lidas
 */
const validateMarkAllRead = (req, res, next) => {
  const { error } = markAllReadSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  next();
};

/**
 * Validar limpeza
 */
const validateCleanup = (req, res, next) => {
  const { error, value } = cleanupSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros de limpeza inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.query = value;
  next();
};

/**
 * Validar ID da notificação
 */
const validateNotificationId = (req, res, next) => {
  const { error } = notificationIdSchema.validate(req.params, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'ID da notificação inválido',
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
  // Schemas
  createNotificationSchema,
  createBulkNotificationSchema,
  listNotificationsSchema,
  markAllReadSchema,
  cleanupSchema,
  notificationIdSchema,

  // Middlewares
  validateCreateNotification,
  validateCreateBulk,
  validateListNotifications,
  validateMarkAllRead,
  validateCleanup,
  validateNotificationId,
};