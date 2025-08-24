/**
 * MÓDULA - MIDDLEWARE DE TRATAMENTO DE ERROS
 * 
 * Centraliza o tratamento de todos os erros da aplicação,
 * padronizando as respostas e garantindo que informações
 * sensíveis não sejam expostas em produção.
 * 
 * Funcionalidades:
 * - Tratamento de erros do Sequelize (banco de dados)
 * - Tratamento de erros de validação
 * - Tratamento de erros de autenticação
 * - Logs detalhados para debugging
 * - Respostas padronizadas
 * 
 * 
 */

const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

/**
 * MIDDLEWARE PRINCIPAL DE TRATAMENTO DE ERROS
 * Deve ser o último middleware da aplicação
 */
const errorHandler = (error, req, res, next) => {
  let customError = {
    statusCode: error.statusCode || 500,
    message: error.message || 'Erro interno do servidor',
    code: error.code || 'INTERNAL_ERROR'
  };

  // Log do erro (apenas em desenvolvimento e com detalhes)
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Erro capturado:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    // Em produção, log mais simples
    console.error(`Erro: ${error.message} - ${req.method} ${req.path}`);
  }

  // TRATAMENTO DE ERROS DO SEQUELIZE

  // Erro de validação
  if (error instanceof ValidationError) {
    const messages = error.errors.map(err => err.message);
    customError = {
      statusCode: 400,
      message: 'Dados inválidos fornecidos',
      code: 'VALIDATION_ERROR',
      details: messages
    };
  }

  // Erro de constraint única (email duplicado, etc.)
  if (error instanceof UniqueConstraintError) {
    const field = error.errors[0]?.path || 'campo';
    customError = {
      statusCode: 409,
      message: `${field} já está em uso`,
      code: 'DUPLICATE_ENTRY',
      field: field
    };
  }

  // Erro de chave estrangeira
  if (error instanceof ForeignKeyConstraintError) {
    customError = {
      statusCode: 400,
      message: 'Referência inválida nos dados fornecidos',
      code: 'FOREIGN_KEY_ERROR'
    };
  }

  // TRATAMENTO DE OUTROS ERROS COMUNS

  // Erro de cast (ID inválido, etc.)
  if (error.name === 'CastError') {
    customError = {
      statusCode: 400,
      message: 'Formato de ID inválido',
      code: 'INVALID_ID_FORMAT'
    };
  }

  // Erro de JSON malformado
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    customError = {
      statusCode: 400,
      message: 'Formato JSON inválido',
      code: 'INVALID_JSON'
    };
  }

  // Erro de token JWT
  if (error.name === 'JsonWebTokenError') {
    customError = {
      statusCode: 401,
      message: 'Token de acesso inválido',
      code: 'INVALID_TOKEN'
    };
  }

  if (error.name === 'TokenExpiredError') {
    customError = {
      statusCode: 401,
      message: 'Token de acesso expirado',
      code: 'TOKEN_EXPIRED'
    };
  }

  // RESPOSTA PADRONIZADA
  const response = {
    success: false,
    message: customError.message,
    code: customError.code
  };

  // Adicionar detalhes apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    response.details = customError.details;
    response.stack = error.stack;
    response.path = req.path;
    response.method = req.method;
  }

  res.status(customError.statusCode).json(response);
};

/**
 * MIDDLEWARE PARA CAPTURAR ROTAS NÃO ENCONTRADAS (404)
 * Deve ser usado antes do errorHandler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Rota ${req.originalUrl} não encontrada`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

/**
 * CLASSE CUSTOMIZADA PARA ERROS DA APLICAÇÃO
 * Facilita a criação de erros específicos com códigos e status
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * FUNÇÃO AUXILIAR PARA ASYNC ERROR HANDLING
 * Evita a necessidade de try/catch em todas as rotas async
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * FUNÇÃO PARA CRIAR ERROS DE VALIDAÇÃO CUSTOMIZADOS
 */
const createValidationError = (field, message) => {
  const error = new AppError(`Erro de validação: ${message}`, 400, 'VALIDATION_ERROR');
  error.field = field;
  return error;
};

/**
 * FUNÇÃO PARA CRIAR ERROS DE AUTORIZAÇÃO
 */
const createAuthorizationError = (message = 'Acesso negado') => {
  return new AppError(message, 403, 'AUTHORIZATION_ERROR');
};

/**
 * FUNÇÃO PARA CRIAR ERROS DE AUTENTICAÇÃO
 */
const createAuthenticationError = (message = 'Credenciais inválidas') => {
  return new AppError(message, 401, 'AUTHENTICATION_ERROR');
};

/**
 * FUNÇÃO PARA CRIAR ERROS DE RECURSO NÃO ENCONTRADO
 */
const createNotFoundError = (resource = 'Recurso') => {
  return new AppError(`${resource} não encontrado`, 404, 'NOT_FOUND');
};

module.exports = {
  errorHandler,
  notFound,
  AppError,
  asyncHandler,
  createValidationError,
  createAuthorizationError,
  createAuthenticationError,
  createNotFoundError
};