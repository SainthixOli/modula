/**
 * MÓDULA - MODELO DE USUÁRIOS
 * 
 * Define a estrutura da tabela de usuários do sistema.
 * Inclui tanto administradores quanto profissionais de saúde.
 * 
 * Campos principais:
 * - Dados pessoais (nome, email, registro profissional)
 * - Autenticação (senha, tokens)
 * - Controle de acesso (tipo, status)
 * - Auditoria (criação, atualização)
 * 
 * 
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * MODELO USER
 * Representa todos os usuários do sistema (admin e profissionais)
 */
const User = sequelize.define('User', {
  // Campo ID (chave primária)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Identificador único do usuário'
  },

  // Dados pessoais
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Nome completo do usuário',
    validate: {
      notEmpty: {
        msg: 'Nome completo é obrigatório'
      },
      len: {
        args: [2, 150],
        msg: 'Nome deve ter entre 2 e 150 caracteres'
      }
    }
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'E-mail único do usuário',
    validate: {
      isEmail: {
        msg: 'E-mail deve ter formato válido'
      },
      notEmpty: {
        msg: 'E-mail é obrigatório'
      }
    }
  },

  // Registro profissional (CRP para psicólogos, CRM para médicos, etc.)
  professional_register: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'Registro profissional (CRP, CRM, etc.)',
    validate: {
      len: {
        args: [3, 20],
        msg: 'Registro profissional deve ter entre 3 e 20 caracteres'
      }
    }
  },

  // Autenticação
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Senha hasheada do usuário',
    validate: {
      notEmpty: {
        msg: 'Senha é obrigatória'
      }
    }
  },

  // Controle de primeiro acesso
  is_first_access: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indica se é o primeiro acesso do usuário'
  },

  // Tipo de usuário
  user_type: {
    type: DataTypes.ENUM('admin', 'professional'),
    allowNull: false,
    defaultValue: 'professional',
    comment: 'Tipo do usuário no sistema',
    validate: {
      isIn: {
        args: [['admin', 'professional']],
        msg: 'Tipo de usuário deve ser "admin" ou "professional"'
      }
    }
  },

  // Status do usuário
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    comment: 'Status atual do usuário',
    validate: {
      isIn: {
        args: [['active', 'inactive', 'suspended']],
        msg: 'Status deve ser "active", "inactive" ou "suspended"'
      }
    }
  },

  // Tokens para recuperação de senha
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token para recuperação de senha'
  },

  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração do token de recuperação'
  },

  // Último login
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data e hora do último login'
  },

  // Metadados adicionais
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Dados adicionais em formato JSON'
  }
}, {
  // Configurações do modelo
  tableName: 'users',
  timestamps: true,
  paranoid: true, // Soft delete
  
  // Hooks do modelo
  hooks: {
    // Hash da senha antes de salvar
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },

    // Hash da senha antes de atualizar
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },

    // Remover campos sensíveis ao converter para JSON
    afterFind: (users) => {
      if (Array.isArray(users)) {
        users.forEach(user => {
          if (user.dataValues) {
            delete user.dataValues.password;
            delete user.dataValues.reset_password_token;
          }
        });
      } else if (users && users.dataValues) {
        delete users.dataValues.password;
        delete users.dataValues.reset_password_token;
      }
    }
  },

  // Índices para otimização
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['professional_register']
    },
    {
      fields: ['user_type']
    },
    {
      fields: ['status']
    }
  ]
});

/**
 * MÉTODOS DE INSTÂNCIA
 * Métodos específicos para cada instância do usuário
 */

// Verificar senha
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Gerar token de recuperação de senha
User.prototype.generateResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.reset_password_token = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Token expira em 1 hora
  this.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000);
  
  return token;
};

// Verificar se é admin
User.prototype.isAdmin = function() {
  return this.user_type === 'admin';
};

// Verificar se é profissional
User.prototype.isProfessional = function() {
  return this.user_type === 'professional';
};

// Verificar se está ativo
User.prototype.isActive = function() {
  return this.status === 'active';
};

// Atualizar último login
User.prototype.updateLastLogin = function() {
  this.last_login = new Date();
  return this.save();
};

/**
 * MÉTODOS ESTÁTICOS
 * Métodos da classe User
 */

// Buscar usuário por email
User.findByEmail = function(email) {
  return this.findOne({
    where: { email: email.toLowerCase() }
  });
};

// Buscar usuário por token de recuperação
User.findByResetToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return this.findOne({
    where: {
      reset_password_token: hashedToken,
      reset_password_expires: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    }
  });
};

// Buscar profissionais ativos
User.findActiveProfessionals = function() {
  return this.findAll({
    where: {
      user_type: 'professional',
      status: 'active'
    },
    order: [['full_name', 'ASC']]
  });
};

module.exports = User;