/**
 * MÓDULA - CONFIGURAÇÃO DO BANCO DE DADOS
 * 
 * Este arquivo contém a configuração da conexão com PostgreSQL
 * utilizando Sequelize como ORM.
 * 
 * Funcionalidades:
 * - Configuração de conexão com PostgreSQL
 * - Pool de conexões otimizado
 * - Tratamento de erros
 * - Logs de conexão
 * 
 * 
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * CONFIGURAÇÃO DA CONEXÃO COM O BANCO
 * Utiliza variáveis de ambiente para segurança
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'modula_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '130520',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    
    // Configuração do pool de conexões
    pool: {
      max: 20,          // Máximo de conexões simultâneas
      min: 0,           // Mínimo de conexões
      acquire: 30000,   // Tempo máximo para obter conexão (30s)
      idle: 10000       // Tempo máximo que uma conexão pode ficar inativa (10s)
    },

    // Configurações de log
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Configurações de timezone
    timezone: '-03:00', // Horário de Brasília
    
    // Configurações para produção
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },

    // Definições padrão para modelos
    define: {
      timestamps: true,        // Cria automaticamente createdAt e updatedAt
      underscored: true,       // Usa snake_case ao invés de camelCase
      freezeTableName: true,   // Não pluraliza nomes das tabelas
      charset: 'utf8',
      collate: 'utf8_general_ci'
    }
  }
);

/**
 * FUNÇÃO PARA TESTAR E ESTABELECER CONEXÃO
 * Testa a conexão com o banco e configura as associações
 */
async function connectDB() {
  try {
    // Testar conexão
    await sequelize.authenticate();
    console.log('🔗 Conexão com PostgreSQL estabelecida com sucesso');
    
    // Sincronizar modelos em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Modelos sincronizados com o banco de dados');
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    throw error;
  }
}

/**
 * FUNÇÃO PARA FECHAR CONEXÃO COM O BANCO
 * Utilizada principalmente em testes e shutdown da aplicação
 */
async function closeDB() {
  try {
    await sequelize.close();
    console.log('🔒 Conexão com banco de dados fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão com banco:', error);
    throw error;
  }
}

/**
 * CONFIGURAÇÕES ESPECÍFICAS POR AMBIENTE
 * Diferentes configurações para desenvolvimento, teste e produção
 */
const dbConfig = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'modula_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME_TEST || 'modula_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB,
  dbConfig
};