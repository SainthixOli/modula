/**
 * MÓDULA - ROTAS DE AUTENTICAÇÃO
 * 
 * Gerencia todas as operações relacionadas à autenticação:
 * - Login de usuários
 * - Recuperação de senha
 * - Redefinição de senha
 * - Primeiro acesso
 * - Refresh de tokens
 * 
 * 
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Joi = require('joi');

const User = require('../models/User');
const { 
  generateToken, 
  generateRefreshToken, 
  validateToken,
  validateRefreshToken 
} = require('../middleware/auth');
const { 
  asyncHandler, 
  AppError,
  createAuthenticationError,
  createValidationError,
  createNotFoundError
} = require('../middleware/errorHandler');

const router = express.Router();

/**
 * CONFIGURAÇÃO DO NODEMAILER
 * Para envio de emails de recuperação de senha
 */
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * SCHEMAS DE VALIDAÇÃO
 * Utiliza Joi para validar dados de entrada
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'E-mail deve ter formato válido',
    'any.required': 'E-mail é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'E-mail deve ter formato válido',
    'any.required': 'E-mail é obrigatório'
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token de recuperação é obrigatório'
  }),
  password: Joi.string().min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required().messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
      'any.required': 'Senha é obrigatória'
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirmação de senha deve ser igual à senha',
    'any.required': 'Confirmação de senha é obrigatória'
  })
});

/**
 * POST /api/auth/login
 * Autentica um usuário e retorna tokens de acesso
 */
router.post('/login', asyncHandler(async (req, res) => {
  // 1. Validar dados de entrada
  const { error } = loginSchema.validate(req.body);
  if (error) {
    throw createValidationError('dados', error.details[0].message);
  }

  const { email, password } = req.body;

  // 2. Buscar usuário pelo email
  const user = await User.findByEmail(email.toLowerCase());
  if (!user) {
    throw createAuthenticationError('Credenciais inválidas');
  }

  // 3. Verificar se o usuário está ativo
  if (!user.isActive()) {
    throw createAuthenticationError('Conta inativa ou suspensa. Contate o administrador.');
  }

  // 4. Verificar senha
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    throw createAuthenticationError('Credenciais inválidas');
  }

  // 5. Atualizar último login
  await user.updateLastLogin();

  // 6. Gerar tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // 7. Resposta de sucesso
  res.status(200).json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        user_type: user.user_type,
        is_first_access: user.is_first_access,
        professional_register: user.professional_register
      },
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '24h'
      }
    }
  });
}));

/**
 * POST /api/auth/refresh-token
 * Gera um novo access token usando o refresh token
 */
router.post('/refresh-token', validateRefreshToken, asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Gerar novo access token
  const accessToken = generateToken(user);
  
  res.status(200).json({
    success: true,
    message: 'Token renovado com sucesso',
    data: {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '24h'
    }
  });
}));

/**
 * POST /api/auth/forgot-password
 * Envia email com link para recuperação de senha
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  // 1. Validar dados de entrada
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) {
    throw createValidationError('email', error.details[0].message);
  }

  const { email } = req.body;

  // 2. Buscar usuário
  const user = await User.findByEmail(email.toLowerCase());
  if (!user) {
    // Por segurança, não revelar se o email existe ou não
    return res.status(200).json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.'
    });
  }

  // 3. Gerar token de recuperação
  const resetToken = user.generateResetToken();
  await user.save();

  // 4. Criar URL de recuperação
  const resetURL = `${process.env.FRONTEND_URL}/redefinir-senha/${resetToken}`;

  // 5. Configurar email
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: user.email,
    subject: 'Módula - Recuperação de Senha',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Recuperação de Senha - Módula</h2>
        <p>Olá, <strong>${user.full_name}</strong>!</p>
        <p>Você solicitou a recuperação de sua senha. Clique no link abaixo para definir uma nova senha:</p>
        <p style="margin: 20px 0;">
          <a href="${resetURL}" 
             style="background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Senha
          </a>
        </p>
        <p><strong>Importante:</strong> Este link é válido por apenas 1 hora por questões de segurança.</p>
        <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          Este é um e-mail automático. Não responda a esta mensagem.
        </p>
      </div>
    `
  };

  // 6. Enviar email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Limpar token em caso de erro no envio
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();
    
    console.error('Erro ao enviar email de recuperação:', error);
    throw new AppError('Erro ao enviar email de recuperação. Tente novamente.', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Instruções de recuperação enviadas para seu e-mail.'
  });
}));

/**
 * POST /api/auth/reset-password
 * Redefine a senha usando o token de recuperação
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  // 1. Validar dados de entrada
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    throw createValidationError('dados', error.details[0].message);
  }

  const { token, password } = req.body;

  // 2. Buscar usuário pelo token
  const user = await User.findByResetToken(token);
  if (!user) {
    throw createAuthenticationError('Token inválido ou expirado');
  }

  // 3. Atualizar senha
  user.password = password;
  user.reset_password_token = null;
  user.reset_password_expires = null;
  user.is_first_access = false; // Marca que não é mais primeiro acesso
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Senha redefinida com sucesso. Faça login com sua nova senha.'
  });
}));

/**
 * POST /api/auth/first-access
 * Permite que o usuário altere a senha no primeiro acesso
 */
router.post('/first-access', validateToken, asyncHandler(async (req, res) => {
  const user = req.user;

  // 1. Verificar se realmente é primeiro acesso
  if (!user.is_first_access) {
    throw new AppError('Esta ação só é permitida no primeiro acesso', 400);
  }

  // 2. Validar nova senha
  const schema = Joi.object({
    password: Joi.string().min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw createValidationError('senha', error.details[0].message);
  }

  const { password } = req.body;

  // 3. Atualizar senha e marcar que não é mais primeiro acesso
  user.password = password;
  user.is_first_access = false;
  await user.save();

  // 4. Gerar novos tokens
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(200).json({
    success: true,
    message: 'Senha alterada com sucesso. Bem-vindo ao Módula!',
    data: {
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer'
      }
    }
  });
}));

/**
 * POST /api/auth/validate-token
 * Valida se um token ainda é válido
 */
router.post('/validate-token', validateToken, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido',
    data: {
      user: {
        id: req.user.id,
        full_name: req.user.full_name,
        email: req.user.email,
        user_type: req.user.user_type,
        is_first_access: req.user.is_first_access
      }
    }
  });
}));

/**
 * POST /api/auth/logout
 * Logout do usuário (atualmente apenas confirmação)
 */
router.post('/logout', validateToken, asyncHandler(async (req, res) => {
  // Em uma implementação mais avançada, poderíamos adicionar o token a uma blacklist
  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
}));

module.exports = router;