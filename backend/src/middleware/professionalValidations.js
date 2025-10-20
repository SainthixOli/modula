/**
 * MÓDULA - VALIDAÇÕES DO PROFISSIONAL
 * 
 * Middlewares de validação usando Joi para operações dos profissionais.
 * Foca em validações específicas para gestão de pacientes e operações clínicas.
 * 
 * Validações implementadas:
 * - CRUD de pacientes
 * - Alteração de status
 * - Transferências
 * - Parâmetros de query
 * - Dados pessoais e clínicos
 * 
 */

const Joi = require('joi');
const { createValidationError } = require('./errorHandler');

/**
 * SCHEMAS REUTILIZÁVEIS
 * Definições específicas para dados de pacientes
 */

// Schema para nome completo
const fullNameSchema = Joi.string()
  .min(2)
  .max(150)
  .pattern(/^[a-zA-ZÀ-ÿ\s'.-]+$/)
  .trim()
  .messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome não pode ter mais que 150 caracteres',
    'string.pattern.base': 'Nome deve conter apenas letras, espaços e acentos',
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

// Schema para CPF
const cpfSchema = Joi.string()
  .pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
  .messages({
    'string.pattern.base': 'CPF deve ter formato válido (000.000.000-00 ou 00000000000)'
  });

// Schema para telefone
const phoneSchema = Joi.string()
  .pattern(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$|^\d{10,11}$/)
  .messages({
    'string.pattern.base': 'Telefone deve ter formato válido ((11) 99999-9999 ou 11999999999)'
  });

// Schema para data de nascimento
const birthDateSchema = Joi.date()
  .less('now')
  .greater('1900-01-01')
  .messages({
    'date.less': 'Data de nascimento deve ser anterior à data atual',
    'date.greater': 'Data de nascimento deve ser posterior a 1900'
  });

// Schema para gênero
const genderSchema = Joi.string()
  .valid('male', 'female', 'other', 'not_informed')
  .messages({
    'any.only': 'Gênero deve ser: male, female, other ou not_informed'
  });

// Schema para estado civil
const maritalStatusSchema = Joi.string()
  .valid('single', 'married', 'divorced', 'widowed', 'other')
  .messages({
    'any.only': 'Estado civil deve ser: single, married, divorced, widowed ou other'
  });

// Schema para status do paciente
const patientStatusSchema = Joi.string()
  .valid('active', 'inactive', 'discharged', 'transferred')
  .messages({
    'any.only': 'Status deve ser: active, inactive, discharged ou transferred'
  });

// Schema para UUID
const uuidSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .messages({
    'string.uuid': 'ID deve ser um UUID válido'
  });

/**
 * SCHEMAS COMPLEXOS PARA OBJETOS JSON
 */

// Schema para endereço
const addressSchema = Joi.object({
  street: Joi.string().max(255).optional(),
  number: Joi.string().max(20).optional(),
  complement: Joi.string().max(100).optional().allow(''),
  neighborhood: Joi.string().max(100).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().length(2).uppercase().optional(),
  zip_code: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
  country: Joi.string().max(50).optional().default('Brasil')
}).messages({
  'string.length': 'Estado deve ter 2 caracteres (ex: SP)',
  'string.pattern.base': 'CEP deve ter formato válido (00000-000)'
});

// Schema para contato de emergência
const emergencyContactSchema = Joi.object({
  name: Joi.string().max(150).optional(),
  relationship: Joi.string().max(50).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional()
});

// Schema para informações de convênio
const insuranceInfoSchema = Joi.object({
  has_insurance: Joi.boolean().optional(),
  insurance_name: Joi.string().max(100).optional().allow(''),
  policy_number: Joi.string().max(50).optional().allow(''),
  expiry_date: Joi.date().optional().allow(null)
});

/**
 * SCHEMAS PRINCIPAIS PARA PACIENTES
 */

/**
 * Schema para criação de paciente
 * POST /api/professional/patients
 */
const createPatientSchema = Joi.object({
  // Dados obrigatórios
  full_name: fullNameSchema.required().messages({
    'any.required': 'Nome completo é obrigatório'
  }),
  
  // Dados pessoais opcionais
  birth_date: birthDateSchema.optional().allow(null),
  gender: genderSchema.optional(),
  cpf: cpfSchema.optional().allow(''),
  rg: Joi.string().max(20).optional().allow(''),
  
  // Contato
  phone: phoneSchema.optional().allow(''),
  email: emailSchema.optional().allow(''),
  
  // Endereço
  address: addressSchema.optional(),
  
  // Contato de emergência
  emergency_contact: emergencyContactSchema.optional(),
  
  // Dados complementares
  marital_status: maritalStatusSchema.optional(),
  occupation: Joi.string().max(100).optional().allow(''),
  insurance_info: insuranceInfoSchema.optional(),
  
  // Dados clínicos
  medical_history: Joi.string().max(5000).optional().allow(''),
  current_medications: Joi.string().max(2000).optional().allow(''),
  allergies: Joi.string().max(1000).optional().allow(''),
  notes: Joi.string().max(2000).optional().allow('')
  
}).options({
  stripUnknown: true,
  abortEarly: false
});

/**
 * Schema para atualização de paciente
 * PUT /api/professional/patients/:id
 */
const updatePatientSchema = Joi.object({
  // Todos os campos são opcionais na atualização
  full_name: fullNameSchema.optional(),
  birth_date: birthDateSchema.optional().allow(null),
  gender: genderSchema.optional(),
  cpf: cpfSchema.optional().allow(''),
  rg: Joi.string().max(20).optional().allow(''),
  phone: phoneSchema.optional().allow(''),
  email: emailSchema.optional().allow(''),
  address: addressSchema.optional(),
  emergency_contact: emergencyContactSchema.optional(),
  marital_status: maritalStatusSchema.optional(),
  occupation: Joi.string().max(100).optional().allow(''),
  insurance_info: insuranceInfoSchema.optional(),
  medical_history: Joi.string().max(5000).optional().allow(''),
  current_medications: Joi.string().max(2000).optional().allow(''),
  allergies: Joi.string().max(1000).optional().allow(''),
  notes: Joi.string().max(2000).optional().allow('')
  
}).min(1) // Pelo menos um campo deve estar presente
  .options({
    stripUnknown: true,
    abortEarly: false
  })
  .messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
  });

/**
 * Schema para alteração de status do paciente
 * PUT /api/professional/patients/:id/status
 */
const patientStatusUpdateSchema = Joi.object({
  status: patientStatusSchema.required().messages({
    'any.required': 'Status é obrigatório'
  }),
  
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Motivo não pode ter mais que 500 caracteres'
  })
  
}).options({
  stripUnknown: true
});

/**
 * Schema para solicitação de transferência
 * POST /api/professional/patients/:id/transfer
 */
const transferRequestSchema = Joi.object({
  to_professional_id: uuidSchema.required().messages({
    'any.required': 'ID do profissional destino é obrigatório'
  }),
  
  reason: Joi.string().min(10).max(500).required().messages({
    'any.required': 'Motivo da transferência é obrigatório',
    'string.min': 'Motivo deve ter pelo menos 10 caracteres',
    'string.max': 'Motivo não pode ter mais que 500 caracteres'
  })
  
}).options({
  stripUnknown: true
});

/**
 * SCHEMAS PARA QUERY PARAMETERS
 */

/**
 * Schema para listagem de pacientes
 * GET /api/professional/patients
 */
const listPatientsQuerySchema = Joi.object({
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
  
  search: Joi.string().trim().min(1).max(100).optional().allow('').messages({
    'string.min': 'Busca deve ter pelo menos 1 caractere',
    'string.max': 'Busca não pode ter mais que 100 caracteres'
  }),
  
  status: patientStatusSchema.optional().allow(''),
  
  sortBy: Joi.string().valid(
    'full_name', 'email', 'status', 'created_at', 
    'updated_at', 'last_appointment', 'birth_date'
  ).optional().default('full_name').messages({
    'any.only': 'sortBy deve ser: full_name, email, status, created_at, updated_at, last_appointment ou birth_date'
  }),
  
  order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
    .optional().default('ASC').messages({
      'any.only': 'order deve ser: asc ou desc'
    })
    
}).options({
  stripUnknown: true
});

/**
 * Schema para busca avançada
 * GET /api/professional/patients/search
 */
const searchPatientsQuerySchema = Joi.object({
  q: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Termo de busca é obrigatório',
    'string.min': 'Termo de busca deve ter pelo menos 2 caracteres',
    'string.max': 'Termo de busca não pode ter mais que 100 caracteres'
  }),
  
  limit: Joi.number().integer().min(1).max(50).optional().default(10).messages({
    'number.base': 'Limit deve ser um número',
    'number.integer': 'Limit deve ser um número inteiro',
    'number.min': 'Limit deve ser maior que 0',
    'number.max': 'Limit não pode ser maior que 50'
  })
  
}).options({
  stripUnknown: true
});

/**
 * Schema para pacientes recentes
 * GET /api/professional/patients/recent
 */
const recentPatientsQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).optional().default(30).messages({
    'number.base': 'Days deve ser um número',
    'number.integer': 'Days deve ser um número inteiro',
    'number.min': 'Days deve ser maior que 0',
    'number.max': 'Days não pode ser maior que 365'
  })
}).options({
  stripUnknown: true
});

/**
 * Schema para estatísticas
 * GET /api/professional/stats
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
 * SCHEMAS PARA FUNCIONALIDADES FUTURAS
 */

/**
 * Schema para agendamento rápido
 * POST /api/professional/quick-actions/new-appointment
 */
const quickAppointmentSchema = Joi.object({
  patient_id: uuidSchema.required().messages({
    'any.required': 'ID do paciente é obrigatório'
  }),
  
  date: Joi.date().greater('now').required().messages({
    'any.required': 'Data da consulta é obrigatória',
    'date.greater': 'Data da consulta deve ser no futuro'
  }),
  
  duration_minutes: Joi.number().integer().min(15).max(300).optional().default(50).messages({
    'number.min': 'Duração deve ser pelo menos 15 minutos',
    'number.max': 'Duração não pode ser maior que 300 minutos'
  }),
  
  notes: Joi.string().max(500).optional().allow('')
  
}).options({
  stripUnknown: true
});

/**
 * Schema para alteração de senha
 * POST /api/professional/change-password
 */
const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Senha atual é obrigatória'
  }),
  
  new_password: Joi.string().min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required().messages({
      'any.required': 'Nova senha é obrigatória',
      'string.min': 'Nova senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'Nova senha deve conter: 1 minúscula, 1 maiúscula, 1 número e 1 caractere especial'
    }),
    
  confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
    'any.required': 'Confirmação de senha é obrigatória',
    'any.only': 'Confirmação deve ser igual à nova senha'
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
 * VALIDAÇÕES CUSTOMIZADAS
 */

/**
 * Validação customizada para CPF
 */
const validateCPF = (cpf) => {
  if (!cpf) return true; // CPF é opcional
  
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verificar se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  
  return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10]);
};

/**
 * Middleware de validação de CPF
 */
const validateCPFMiddleware = (req, res, next) => {
  const { cpf } = req.body;
  
  if (cpf && !validateCPF(cpf)) {
    throw createValidationError('cpf', 'CPF inválido');
  }
  
  next();
};

/**
 * MIDDLEWARES ESPECÍFICOS EXPORTADOS
 */

// Validação para criação de paciente
const validateCreatePatient = [
  validateBody(createPatientSchema),
  validateCPFMiddleware
];

// Validação para atualização de paciente
const validateUpdatePatient = [
  validateBody(updatePatientSchema),
  validateCPFMiddleware
];

// Validação para alteração de status
const validatePatientStatusUpdate = validateBody(patientStatusUpdateSchema);

// Validação para transferência
const validateTransferRequest = validateBody(transferRequestSchema);

// Validação para listagem
const validateListPatientsQuery = validateQuery(listPatientsQuerySchema);

// Validação para busca
const validateSearchPatientsQuery = validateQuery(searchPatientsQuerySchema);

// Validação para pacientes recentes
const validateRecentPatientsQuery = validateQuery(recentPatientsQuerySchema);

// Validação para estatísticas
const validateStatsQuery = validateQuery(statsQuerySchema);

// Validação de UUID para pacientes
const validatePatientId = validateUUIDParam('id');

// Validações futuras
const validateQuickAppointment = validateBody(quickAppointmentSchema);
const validateChangePassword = validateBody(changePasswordSchema);

/**
 * VALIDAÇÃO CONDICIONAL PARA STATUS
 */
const validateStatusChange = (req, res, next) => {
  const { status, reason } = req.body;
  
  // Motivo obrigatório para alta e transferência
  if ((status === 'discharged' || status === 'transferred') && !reason) {
    throw createValidationError('reason', 
      `Motivo é obrigatório para ${status === 'discharged' ? 'dar alta' : 'transferir'}`);
  }
  
  // Validação adicional para transferência
  if (status === 'transferred') {
    throw createValidationError('status', 
      'Use o endpoint de transferência (/transfer) para transferir pacientes');
  }
  
  next();
};

/**
 * MIDDLEWARE COMBINADO PARA VALIDAÇÕES COMPLEXAS
 */
const validatePatientStatusUpdateComplete = [
  validatePatientStatusUpdate,
  validateStatusChange
];

// Exportar todas as validações
module.exports = {
  // Middlewares principais
  validateCreatePatient,
  validateUpdatePatient,
  validatePatientStatusUpdate: validatePatientStatusUpdateComplete,
  validateTransferRequest,
  validateListPatientsQuery,
  validateSearchPatientsQuery,
  validateRecentPatientsQuery,
  validateStatsQuery,
  validatePatientId,
  
  // Middlewares futuros
  validateQuickAppointment,
  validateChangePassword,
  
  // Funções utilitárias
  validateBody,
  validateQuery,
  validateUUIDParam,
  validateCPF,
  validateCPFMiddleware,
  
  // Schemas para uso direto
  schemas: {
    createPatient: createPatientSchema,
    updatePatient: updatePatientSchema,
    patientStatusUpdate: patientStatusUpdateSchema,
    transferRequest: transferRequestSchema,
    listPatientsQuery: listPatientsQuerySchema,
    searchPatientsQuery: searchPatientsQuerySchema,
    statsQuery: statsQuerySchema,
    quickAppointment: quickAppointmentSchema,
    changePassword: changePasswordSchema
  },
  
  // Validações customizadas
  customValidations: {
    validateCPF,
    validateStatusChange
  }
};

/**
 * EXEMPLOS DE USO NAS ROTAS:
 * 
 * // Validação simples
 * router.post('/patients', 
 *   requireProfessional,
 *   validateCreatePatient, // Array de middlewares
 *   asyncHandler(professionalController.createPatient)
 * );
 * 
 * // Validação com parâmetro UUID
 * router.put('/patients/:id',
 *   requireProfessional,
 *   validatePatientId,
 *   checkResourceOwnership(Patient),
 *   validateUpdatePatient,
 *   asyncHandler(professionalController.updatePatient)
 * );
 * 
 * // Validação de query parameters
 * router.get('/patients',
 *   requireProfessional,
 *   validateListPatientsQuery,
 *   asyncHandler(professionalController.listMyPatients)
 * );
 * 
 * RECURSOS ESPECIAIS:
 * 
 * 1. VALIDAÇÃO DE CPF:
 *    - Aceita formatos: 000.000.000-00 ou 00000000000
 *    - Valida algoritmo oficial do CPF
 *    - Campo opcional mas válido quando preenchido
 * 
 * 2. ENDEREÇO ESTRUTURADO:
 *    - Objeto JSON com campos padronizados
 *    - CEP com validação de formato
 *    - Estado com 2 caracteres obrigatórios
 * 
 * 3. VALIDAÇÃO CONDICIONAL:
 *    - Motivo obrigatório para alta/transferência
 *    - Validações específicas por status
 *    - Proteção contra operações inválidas
 * 
 * 4. PERFORMANCE:
 *    - stripUnknown: true (remove campos extras)
 *    - abortEarly: false (retorna todos os erros)
 *    - Validações otimizadas para rapidez
 */