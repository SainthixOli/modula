/**
 * MÓDULA - VALIDAÇÕES ADMINISTRATIVAS
 * 
 * Middlewares de validação usando Joi para todas as operações administrativas.
 * Garante que os dados de entrada estejam no formato correto antes de processar.
 * 
 * Validações implementadas:
 * - Criação de profissionais
 * - Atualização de profissionais
 * - Alteração de status
 * - Parâmetros de query
 * 
 */

const Joi = require('joi');
const { createValidationError } = require('./errorHandler');

/**
 * SCHEMAS REUTILIZÁVEIS
 * Definições comuns para evitar repetição
 */

// Schema para nome completo
const fullNameSchema = Joi.string()
  .min(2)
  .max(150)
  .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
  .trim()
  .messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome não pode ter mais que 150 caracteres',
    'string.pattern.base': 'Nome deve conter apenas letras e espaços',
    'string.empty': 'Nome não pode estar vazio'
  });

// Schema para email
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .max(100)
  .messages({
    'string.email': 'Email deve ter formato válido (exemplo@dominio.com)',
    'string.max': 'Email não pode ter mais que 100 caracteres'
  });

// Schema para registro profissional
const professionalRegisterSchema = Joi.string()
  .alphanum()
  .min(3)
  .max(20)
  .trim()
  .uppercase()
  .messages({
    'string.alphanum': 'Registro profissional deve conter apenas letras e números',
    'string.min': 'Registro deve ter pelo menos 3 caracteres',
    'string.max': 'Registro não pode ter mais que 20 caracteres'
  });

// Schema para status de usuário
const userStatusSchema = Joi.string()
  .valid('active', 'inactive', 'suspended')
  .messages({
    'any.only': 'Status deve ser: active, inactive ou suspended'
  });

// Schema para UUID
const uuidSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .messages({
    'string.uuid': 'ID deve ser um UUID válido'
  });

/**
 * SCHEMAS PRINCIPAIS
 */

/**
 * Schema para criação de profissional
 * POST /api/admin/professionals
 */
const createProfessionalSchema = Joi.object({
  full_name: fullNameSchema.required().messages({
    'any.required': 'Nome completo é obrigatório'
  }),
  
  email: emailSchema.required().messages({
    'any.required': 'Email é obrigatório'
  }),
  
  professional_register: professionalRegisterSchema.optional().allow(null, '')
    .messages({
      'string.empty': 'Registro profissional não pode estar vazio (remova o campo ou forneça um valor)'
    })
}).options({
  stripUnknown: true, // Remove campos não especificados
  abortEarly: false   // Retorna todos os erros, não apenas o primeiro
});

/**
 * Schema para atualização de profissional
 * PUT /api/admin/professionals/:id
 */
const updateProfessionalSchema = Joi.object({
  full_name: fullNameSchema.optional(),
  
  email: emailSchema.optional(),
  
  professional_register: professionalRegisterSchema.optional().allow(null, '')
}).min(1) // Pelo menos um campo deve estar presente
  .options({
    stripUnknown: true,
    abortEarly: false
  })
  .messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
  });

/**
 * Schema para alteração de status
 * PUT /api/admin/professionals/:id/status
 */
const statusUpdateSchema = Joi.object({
  status: userStatusSchema.required().messages({
    'any.required': 'Status é obrigatório'
  })
}).options({
  stripUnknown: true
});

/**
 * Schema para reset de senha
 * POST /api/admin/professionals/:id/reset-password
 */
const resetPasswordSchema = Joi.object({
  sendEmail: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'sendEmail deve ser true ou false'
  })
}).options({
  stripUnknown: true
});

/**
 * Schema para parâmetros de listagem
 * GET /api/admin/professionals
 */
const listProfessionalsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).max(1000).optional().default(1).messages({
    'number.base': 'Página deve ser um número',
    'number.integer': 'Página deve ser um número inteiro',
    'number.min': 'Página deve ser maior que 0',
    'number.max': 'Página não pode ser maior que 1000'
  }),
  
  limit: Joi.number().integer().min(1).max(100).optional().default(20).messages({
    'number.base': 'Limit deve ser um número',
    'number.integer': 'Limit deve ser um número inteiro',
    'number.min': 'Limit deve ser maior que 0',
    'number.max': 'Limit não pode ser maior que 100'
  }),
  
  search: Joi.string().trim().max(100).optional().allow('').messages({
    'string.max': 'Busca não pode ter mais que 100 caracteres'
  }),
  
  status: userStatusSchema.optional().allow(''),
  
  sortBy: Joi.string().valid('full_name', 'email', 'status', 'created_at', 'last_login')
    .optional().default('full_name').messages({
      'any.only': 'sortBy deve ser: full_name, email, status, created_at ou last_login'
    }),
    
  order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
    .optional().default('ASC').messages({
      'any.only': 'order deve ser: asc ou desc'
    })
}).options({
  stripUnknown: true
});

/**
 * Schema para parâmetros de estatísticas
 * GET /api/admin/stats/*
 */
const statsQuerySchema = Joi.object({
  period: Joi.string().valid('week', 'month', 'quarter', 'year')
    .optional().default('month').messages({
      'any.only': 'period deve ser: week, month, quarter ou year'
    })
}).options({
  stripUnknown: true
});

/**
 * MIDDLEWARES DE VALIDAÇÃO
 */

/**
 * Middleware factory para validação de body
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createValidationError('body', errorMessage);
    }
    
    // Substituir req.body pelos dados validados e limpos
    req.body = value;
    next();
  };
};

/**
 * Middleware factory para validação de query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw createValidationError('query', errorMessage);
    }
    
    // Substituir req.query pelos dados validados
    req.query = value;
    next();
  };
};

/**
 * Middleware para validar UUID nos parâmetros
 */
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

/**
 * MIDDLEWARES ESPECÍFICOS EXPORTADOS
 */

// Validação para criação de profissional
const validateCreateProfessional = validateBody(createProfessionalSchema);

// Validação para atualização de profissional
const validateUpdateProfessional = validateBody(updateProfessionalSchema);

// Validação para alteração de status
const validateStatusUpdate = validateBody(statusUpdateSchema);

// Validação para reset de senha
const validateResetPassword = validateBody(resetPasswordSchema);

// Validação para listagem de profissionais
const validateListProfessionals = validateQuery(listProfessionalsQuerySchema);

// Validação para estatísticas
const validateStatsQuery = validateQuery(statsQuerySchema);

// Validação de UUID nos parâmetros
const validateProfessionalId = validateUUIDParam('id');

/**
 * MIDDLEWARE COMBINADO PARA ROTAS COMPLETAS
 */

/**
 * Middleware que combina validação de parâmetro UUID + body
 * Útil para rotas como PUT /professionals/:id
 */
const validateProfessionalUpdate = [
  validateProfessionalId,
  validateUpdateProfessional
];

const validateProfessionalStatusUpdate = [
  validateProfessionalId,
  validateStatusUpdate
];

const validateProfessionalPasswordReset = [
  validateProfessionalId,
  validateResetPassword
];

/**
 * FUNÇÃO AUXILIAR PARA VALIDAÇÃO CUSTOMIZADA
 */

/**
 * Valida se um campo específico atende a critérios personalizados
 */
const customValidation = (fieldName, value, validationRules) => {
  const schema = Joi.object({
    [fieldName]: validationRules
  });
  
  const { error } = schema.validate({ [fieldName]: value });
  
  if (error) {
    throw createValidationError(fieldName, error.details[0].message);
  }
  
  return true;
};

// Exportar todos os middlewares e funções
module.exports = {
  // Middlewares individuais
  validateCreateProfessional,
  validateUpdateProfessional,
  validateStatusUpdate,
  validateResetPassword,
  validateListProfessionals,
  validateStatsQuery,
  validateProfessionalId,
  
  // Middlewares combinados
  validateProfessionalUpdate,
  validateProfessionalStatusUpdate,
  validateProfessionalPasswordReset,
  
  // Schemas para uso direto (se necessário)
  schemas: {
    createProfessional: createProfessionalSchema,
    updateProfessional: updateProfessionalSchema,
    statusUpdate: statusUpdateSchema,
    resetPassword: resetPasswordSchema,
    listProfessionals: listProfessionalsQuerySchema,
    statsQuery: statsQuerySchema
  },
  
  // Funções utilitárias
  validateBody,
  validateQuery,
  validateUUIDParam,
  customValidation
};

/**
 * COMO USAR NAS ROTAS:
 * 
 * // Validação simples de body
 * router.post('/professionals', 
 *   requireAdmin, 
 *   validateCreateProfessional,
 *   asyncHandler(adminController.createProfessional)
 * );
 * 
 * // Validação combinada (parâmetro + body)
 * router.put('/professionals/:id',
 *   requireAdmin,
 *   ...validateProfessionalUpdate, // Spread do array
 *   asyncHandler(adminController.updateProfessional)
 * );
 * 
 * // Validação de query parameters
 * router.get('/professionals',
 *   requireAdmin,
 *   validateListProfessionals,
 *   asyncHandler(adminController.listProfessionals)
 * );
 * 
 * NOTAS IMPORTANTES:
 * 
 * 1. ORDEM DOS MIDDLEWARES:
 *    - Autenticação (validateToken) - aplicado no server.js
 *    - Autorização (requireAdmin)
 *    - Validação (validate*)
 *    - Controller (asyncHandler)
 * 
 * 2. TRATAMENTO DE ERROS:
 *    - Erros de validação são capturados pelo errorHandler global
 *    - Status 400 para erros de validação
 *    - Mensagens em português
 * 
 * 3. PERFORMANCE:
 *    - stripUnknown: true remove campos não especificados
 *    - abortEarly: false retorna todos os erros de uma vez
 *    - Validações são executadas apenas uma vez por request
 */