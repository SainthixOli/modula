/**
 * MÓDULA - MODELO DE USUÁRIOS
 * Define a estrutura da tabela de usuários do sistema.
 */

const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

/**
 * MODELO USER
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único do usuário'
  },

  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome completo é obrigatório' },
      len: { args: [2, 150], msg: 'Nome deve ter entre 2 e 150 caracteres' }
    }
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'E-mail deve ter formato válido' },
      notEmpty: { msg: 'E-mail é obrigatório' }
    }
  },

  professional_register: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: { args: [3, 20], msg: 'Registro profissional deve ter entre 3 e 20 caracteres' }
    }
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Senha é obrigatória' }
    }
  },

  is_first_access: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  user_type: {
    type: DataTypes.ENUM('admin', 'professional'),
    allowNull: false,
    defaultValue: 'professional'
  },

  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },

  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },

  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },

  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,

  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
    }
  },

  defaultScope: {
    attributes: { exclude: ['password', 'reset_password_token'] }
  },

  indexes: [
    { fields: ['email'] },
    { fields: ['professional_register'] },
    { fields: ['user_type'] },
    { fields: ['status'] }
  ]
});

/**
 * MÉTODOS DE INSTÂNCIA
 */

// Verifica senha
User.prototype.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Gera token de recuperação de senha
User.prototype.generateResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.reset_password_token = crypto.createHash('sha256').update(token).digest('hex');
  this.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  return token;
};

// Verifica se usuário é admin
User.prototype.isAdmin = function() {
  return this.user_type === 'admin';
};

// Verifica se usuário é profissional
User.prototype.isProfessional = function() {
  return this.user_type === 'professional';
};

// Verifica se usuário está ativo
User.prototype.isActive = function() {
  return this.status === 'active';
};

// Atualiza último login
User.prototype.updateLastLogin = function() {
  this.last_login = new Date();
  return this.save();
};

/**
 * MÉTODOS ESTÁTICOS
 */

// Busca por email
User.findByEmail = function(email) {
  return this.findOne({ where: { email: email.toLowerCase() } });
};

// Busca por token de recuperação
User.findByResetToken = function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return this.findOne({
    where: {
      reset_password_token: hashedToken,
      reset_password_expires: { [Op.gt]: new Date() }
    }
  });
};

// Busca profissionais ativos
User.findActiveProfessionals = function() {
  return this.findAll({
    where: { user_type: 'professional', status: 'active' },
    order: [['full_name', 'ASC']]
  });
};

module.exports = User;
