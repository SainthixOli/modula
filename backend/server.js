/**
 * MÓDULA - SISTEMA DE GESTÃO DE CLÍNICAS
 * Servidor principal do backend
 * 
 * Este arquivo configura e inicializa o servidor Express.js
 * com todas as rotas, middlewares e configurações necessárias.
 * 
 * Autor: Equipe Módula
 * Versão: 1.0.0
 * Data: 24/08/2025
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Importar configurações do banco de dados
const { connectDB } = require('./src/config/database');

// Importar middlewares personalizados
const errorHandler = require('./src/middleware/errorHandler');
const { validateToken } = require('./src/middleware/auth');

// Importar rotas
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const professionalRoutes = require('./src/routes/professional');
const patientRoutes = require('./src/routes/patient');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * CONFIGURAÇÕES DE SEGURANÇA
 * - Helmet: Headers de segurança
 * - CORS: Política de compartilhamento de recursos
 * - Rate Limiting: Proteção contra ataques de força bruta
 */
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Rate limiting - máximo 100 requests por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: 'Muitas tentativas realizadas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

/**
 * MIDDLEWARES GLOBAIS
 */
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded
app.use(morgan('combined')); // Logs de requisições

/**
 * ROTA DE HEALTH CHECK
 * Endpoint para verificar se o servidor está funcionando
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Módula API está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * ROTAS DA API
 * Todas as rotas estão organizadas em módulos separados
 */
app.use('/api/auth', authRoutes);                    // Autenticação
app.use('/api/admin', validateToken, adminRoutes);   // Admin (protegida)
app.use('/api/professional', validateToken, professionalRoutes); // Profissional (protegida)
app.use('/api/patient', validateToken, patientRoutes); // Paciente (protegida)

/**
 * MIDDLEWARE DE TRATAMENTO DE ERROS
 * Deve ser o último middleware *SEMPRE*
 */
app.use(errorHandler);

/**
 * INICIALIZAÇÃO DO SERVIDOR
 * Conecta ao banco de dados antes de iniciar o servidor
 */
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDB();
    console.log('✅ Conexão com banco de dados estabelecida');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Módula rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Inicializar servidor
startServer();

module.exports = app;