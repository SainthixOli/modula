/**
 * MÓDULA - MIDDLEWARE DE AUTENTICAÇÃO
 * 
 * Responsável pela validação de tokens JWT e controle de acesso.
 * Garante que apenas usuários autenticados e autorizados acessem as rotas protegidas.
 * 
 * Funcionalidades:
 * - Validação de tokens JWT
 * - Verificação de permissões por tipo de usuário
 * - Controle de acesso baseado em roles
 * - Tratamento de erros de autenticação
 * 
 * 
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * MIDDLEWARE PRINCIPAL DE VALIDAÇÃO DE TOKEN
 * Verifica se o token JWT é válido e se o usuário existe e está ativo
 */
const validateToken = async (req, res, next) => {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // 2. Verificar e decodificar o token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      } else {
        throw error;
      }
    }

    // 3. Buscar usuário no banco de dados
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // 4. Verificar se o usuário está ativo
    if (!user.isActive()) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo ou suspenso',
        code: 'USER_INACTIVE'
      });
    }

    // 5. Adicionar usuário ao objeto req para uso nas rotas
    req.user = user;
    req.userId = user.id;
    req.userType = user.user_type;

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * MIDDLEWARE PARA VERIFICAR SE O USUÁRIO É ADMIN
 * Deve ser usado após validateToken
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Privilégios de administrador necessários.',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

/**
 * MIDDLEWARE PARA VERIFICAR SE O USUÁRIO É PROFISSIONAL
 * Deve ser usado após validateToken
 */
const requireProfessional = (req, res, next) => {
  if (!req.user || !req.user.isProfessional()) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Acesso restrito a profissionais.',
      code: 'PROFESSIONAL_REQUIRED'
    });
  }
  
  next();
};

/**
 * MIDDLEWARE FLEXÍVEL PARA MÚLTIPLOS TIPOS DE USUÁRIO
 * Permite acesso para usuários de tipos específicos
 * 
 * Uso: requireUserTypes(['admin', 'professional'])
 */
const requireUserTypes = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Tipo de usuário não autorizado.',
        code: 'USER_TYPE_NOT_ALLOWED',
        allowedTypes
      });
    }
    
    next();
  };
};

/**
 * MIDDLEWARE PARA VERIFICAR PRIMEIRO ACESSO
 * Força usuários em primeiro acesso a alterar a senha
 */
const checkFirstAccess = (req, res, next) => {
  if (req.user && req.user.is_first_access) {
    // Permitir apenas acesso às rotas de alteração de senha
    const allowedPaths = ['/change-password', '/first-access'];
    const currentPath = req.path;
    
    if (!allowedPaths.some(path => currentPath.includes(path))) {
      return res.status(403).json({
        success: false,
        message: 'Primeiro acesso detectado. Altere sua senha para continuar.',
        code: 'FIRST_ACCESS_REQUIRED',
        redirectTo: '/first-access'
      });
    }
  }
  
  next();
};

/**
 * MIDDLEWARE PARA VERIFICAR PROPRIEDADE DE RECURSO
 * Verifica se um recurso pertence ao usuário autenticado
 * Usado para proteger dados de pacientes de outros profissionais
 */
const checkResourceOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.userId;
      
      // Buscar o recurso
      const resource = await resourceModel.findByPk(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso não encontrado',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Verificar se o recurso pertence ao usuário (exceto para admins)
      if (req.user.user_type !== 'admin' && resource.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Recurso não pertence ao usuário.',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }
      
      // Adicionar recurso ao req para uso na rota
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Erro na verificação de propriedade:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * FUNÇÃO AUXILIAR PARA GERAR TOKENS JWT
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    userType: user.user_type,
    isFirstAccess: user.is_first_access
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'modula-api',
    subject: user.id
  });
};

/**
 * FUNÇÃO AUXILIAR PARA GERAR REFRESH TOKENS
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'modula-api',
    subject: user.id
  });
};

/**
 * MIDDLEWARE PARA VALIDAR REFRESH TOKEN
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não fornecido',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Buscar usuário
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive()) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        code: 'USER_INVALID'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expirado',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Refresh token inválido',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

module.exports = {
  validateToken,
  requireAdmin,
  requireProfessional,
  requireUserTypes,
  checkFirstAccess,
  checkResourceOwnership,
  generateToken,
  generateRefreshToken,
  validateRefreshToken
};