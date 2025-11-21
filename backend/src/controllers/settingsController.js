/**
 * Controller de Configurações do Sistema
 * 
 * Gerencia configurações gerais da clínica e sistema
 */

const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Tabela virtual de configurações do sistema (pode ser movida para banco depois)
let systemConfig = {
  clinic: {
    name: "Clínica Módula",
    cnpj: "12.345.678/0001-90",
    phone: "(11) 3456-7890",
    email: "contato@clinicamodula.com.br",
    address: "Rua Exemplo, 123 - São Paulo, SP",
    workHours: "Segunda a Sexta: 8h - 18h",
  },
  email: {
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: process.env.SMTP_PORT || "587",
    smtpUser: process.env.SMTP_USER || "noreply@clinica.com",
  },
  system: {
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
  }
};

/**
 * GET /api/admin/settings/clinic
 * Obter configurações da clínica
 */
const getClinicSettings = async (req, res) => {
  res.json({
    success: true,
    data: systemConfig.clinic
  });
};

/**
 * PUT /api/admin/settings/clinic
 * Atualizar configurações da clínica
 */
const updateClinicSettings = async (req, res) => {
  const { name, cnpj, phone, email, address, workHours } = req.body;
  
  systemConfig.clinic = {
    ...systemConfig.clinic,
    ...(name !== undefined && { name }),
    ...(cnpj !== undefined && { cnpj }),
    ...(phone !== undefined && { phone }),
    ...(email !== undefined && { email }),
    ...(address !== undefined && { address }),
    ...(workHours !== undefined && { workHours }),
  };

  res.json({
    success: true,
    message: 'Configurações da clínica atualizadas com sucesso',
    data: systemConfig.clinic
  });
};

/**
 * GET /api/admin/settings/email
 * Obter configurações de email
 */
const getEmailSettings = async (req, res) => {
  res.json({
    success: true,
    data: {
      ...systemConfig.email,
      smtpPassword: '********' // Não retornar senha
    }
  });
};

/**
 * PUT /api/admin/settings/email
 * Atualizar configurações de email
 */
const updateEmailSettings = async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPassword } = req.body;
  
  systemConfig.email = {
    ...systemConfig.email,
    ...(smtpHost !== undefined && { smtpHost }),
    ...(smtpPort !== undefined && { smtpPort }),
    ...(smtpUser !== undefined && { smtpUser }),
    ...(smtpPassword !== undefined && { smtpPassword }),
  };

  res.json({
    success: true,
    message: 'Configurações de email atualizadas com sucesso',
    data: {
      ...systemConfig.email,
      smtpPassword: '********'
    }
  });
};

/**
 * GET /api/admin/settings/system
 * Obter configurações do sistema
 */
const getSystemSettings = async (req, res) => {
  res.json({
    success: true,
    data: systemConfig.system
  });
};

/**
 * PUT /api/admin/settings/system
 * Atualizar configurações do sistema
 */
const updateSystemSettings = async (req, res) => {
  const {
    maintenanceMode,
    allowRegistrations,
    requireEmailVerification,
    sessionTimeout,
    maxLoginAttempts
  } = req.body;
  
  systemConfig.system = {
    ...systemConfig.system,
    ...(maintenanceMode !== undefined && { maintenanceMode }),
    ...(allowRegistrations !== undefined && { allowRegistrations }),
    ...(requireEmailVerification !== undefined && { requireEmailVerification }),
    ...(sessionTimeout !== undefined && { sessionTimeout }),
    ...(maxLoginAttempts !== undefined && { maxLoginAttempts }),
  };

  res.json({
    success: true,
    message: 'Configurações do sistema atualizadas com sucesso',
    data: systemConfig.system
  });
};

/**
 * GET /api/admin/profile
 * Obter perfil do admin
 */
const getAdminProfile = async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findByPk(userId, {
    attributes: ['id', 'full_name', 'email', 'user_type', 'metadata', 'created_at']
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.json({
    success: true,
    data: user
  });
};

/**
 * PUT /api/admin/profile
 * Atualizar perfil do admin
 */
const updateAdminProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, email, phone, bio, appearance_settings, notification_preferences } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Validar email se foi alterado
  if (email && email !== user.email) {
    const emailExists = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: userId }
      }
    });

    if (emailExists) {
      throw new AppError('Este email já está em uso', 400);
    }
  }

  // Atualizar campos permitidos
  const updateData = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (email !== undefined) updateData.email = email;

  // Atualizar metadata
  const currentMetadata = user.metadata || {};
  updateData.metadata = {
    ...currentMetadata,
    bio: bio !== undefined ? bio : currentMetadata.bio,
    phone: phone !== undefined ? phone : currentMetadata.phone,
    appearance_settings: appearance_settings !== undefined ? appearance_settings : currentMetadata.appearance_settings,
    notification_preferences: notification_preferences !== undefined ? notification_preferences : currentMetadata.notification_preferences,
  };

  await user.update(updateData);
  await user.reload();

  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      user_type: user.user_type,
      metadata: user.metadata,
    }
  });
};

/**
 * POST /api/admin/change-password
 * Alterar senha do admin
 */
const changeAdminPassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Todos os campos são obrigatórios', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('As senhas não coincidem', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('A senha deve ter no mínimo 8 caracteres', 400);
  }

  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  if (!hasLetter || !hasNumber) {
    throw new AppError('A senha deve conter letras e números', 400);
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const bcrypt = require('bcryptjs');
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    throw new AppError('Senha atual incorreta', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
};

module.exports = {
  getClinicSettings,
  updateClinicSettings,
  getEmailSettings,
  updateEmailSettings,
  getSystemSettings,
  updateSystemSettings,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
};
