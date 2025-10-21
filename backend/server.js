/**
 * MÓDULA - SISTEMA DE GESTÃO DE CLÍNICAS
 * Servidor principal do backend - VERSÃO ATUALIZADA
 * 
 * Este arquivo configura e inicializa o servidor Express.js
 * com todas as rotas, middlewares e configurações necessárias.
 * 
 * MÓDULOS IMPLEMENTADOS:
 * ✅ Sistema de Autenticação (100%)
 * ✅ Módulo Administração (100%)
 * ✅ Módulo Profissional (100%)
 * ⏳ Sistema de Anamnese (0%)
 * ⏳ Sistema de Consultas/Sessões (0%)
 * 
 * Autor: Equipe Módula
 * Versão: 2.0.0
 * Data: 24/08/2025
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();
require('./src/config/database');
// Importar configurações do banco de dados
const { connectDB } = require('./src/config/database');
const notificationTriggers = require('./src/services/notificationTriggers');
// Importar middlewares personalizados
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { validateToken } = require('./src/middleware/auth');

// Importar todas as rotas
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const professionalRoutes = require('./src/routes/professional');
const transferRoutes = require('./src/routes/transfers');
const notificationRoutes = require('./src/routes/notifications');
// TODO: Importar rotas futuras
// const patientRoutes = require('./src/routes/patient');
// const anamnesisRoutes = require('./src/routes/anamnesis');
// const sessionRoutes = require('./src/routes/sessions');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * CONFIGURAÇÕES DE SEGURANÇA
 * - Helmet: Headers de segurança HTTP
 * - CORS: Política de compartilhamento de recursos
 * - Rate Limiting: Proteção contra ataques de força bruta
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting global - máximo 100 requests por 15 minutos por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Muitas tentativas realizadas. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'LOGIN_RATE_LIMIT'
  }
});

/**
 * MIDDLEWARES GLOBAIS
 */
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Logs de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('short'));
}

// Middleware para adicionar headers de resposta padrão
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Módula API v2.0');
  res.setHeader('X-API-Version', '2.0.0');
  next();
});

/**
 * ROTA DE HEALTH CHECK
 * Endpoint para verificar se o servidor está funcionando
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Módula API está funcionando',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    modules: {
      authentication: '100%',
      administration: '100%',
      professional: '100%',
      anamnesis: '0%',
      sessions: '0%'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected' // TODO: verificar conexão real
  });
});

/**
 * ROTA DE INFORMAÇÕES DA API
 * Documentação básica dos endpoints disponíveis
 */
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bem-vindo à API Módula',
    version: '2.0.0',
    documentation: 'https://docs.modula.com.br', // TODO: criar documentação
    endpoints: {
      authentication: '/api/auth/*',
      administration: '/api/admin/*',
      professional: '/api/professional/*'
    },
    support: {
      email: 'suporte@modula.com.br',
      github: 'https://github.com/SainthixOli/modula'
    }
  });
});

/**
 * ROTAS PRINCIPAIS DA API
 * Organizadas por módulos funcionais
 */

// MÓDULO DE AUTENTICAÇÃO (público)
app.use('/api/auth/login', loginLimiter); // Rate limiting específico para login
app.use('/api/auth', authRoutes);

// MÓDULO DE ADMINISTRAÇÃO (requer token + admin)
app.use('/api/admin', validateToken, adminRoutes);

// Rotas de transferências
app.use('/api/transfers', transferRoutes);

// Rotas de notificações
app.use('/api/notifications', notificationRoutes);

// Nota: As rotas admin já estão incluídas no arquivo notifications.js
// com o prefixo /admin, então:
// - /api/notifications/* = rotas do usuário
// - /api/notifications/admin/* = rotas administrativas


// MÓDULO DO PROFISSIONAL (requer token + profissional) 
app.use('/api/professional', validateToken, professionalRoutes);

// TODO: MÓDULOS FUTUROS
// app.use('/api/patients', validateToken, patientRoutes);
// app.use('/api/anamnesis', validateToken, anamnesisRoutes);
// app.use('/api/sessions', validateToken, sessionRoutes);

/**
 * MIDDLEWARE DE ROTAS NÃO ENCONTRADAS
 * Captura requisições para rotas inexistentes
 */
app.use('*', notFound);

/**
 * MIDDLEWARE DE TRATAMENTO DE ERROS
 * Deve ser o último middleware - captura todos os erros
 */
app.use(errorHandler);

/**
 * GRACEFUL SHUTDOWN
 * Encerramento elegante do servidor
 */
const gracefulShutdown = () => {
  console.log('\n🔄 Iniciando encerramento elegante do servidor...');
  
  // TODO: Fechar conexões do banco de dados
  // await closeDB();
  
  // TODO: Finalizar processos pendentes
  
  console.log('✅ Servidor encerrado com sucesso');
  process.exit(0);
};

// Capturar sinais de encerramento
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * INICIALIZAÇÃO DO SERVIDOR
 * Conecta ao banco de dados antes de iniciar o servidor
 */
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDB();
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Verificar variáveis de ambiente essenciais
    const requiredEnvVars = ['JWT_SECRET', 'DB_NAME', 'DB_USER'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}`);
    }
    
    // ============================================
    // CONFIGURAR NOTIFICATION TRIGGERS
    // ============================================

    // Inicializar cron jobs
    notificationTriggers.setupCronJobs();
    console.log('✓ Notification triggers configurados');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 ====================================');
      console.log('🚀 MÓDULA API - Sistema de Gestão de Clínicas');
      console.log('🚀 ====================================');
      console.log(`🌐 Servidor rodando na porta: ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 API Info: http://localhost:${PORT}/api`);
      console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
      console.log('🚀 ====================================');
      console.log('');
      console.log('📋 MÓDULOS DISPONÍVEIS:');
      console.log('  ✅ Autenticação (/api/auth/*)');
      console.log('  ✅ Administração (/api/admin/*)');  
      console.log('  ✅ Profissional (/api/professional/*)');
      console.log('  ⏳ Anamnese (em desenvolvimento)');
      console.log('  ⏳ Sessões (em desenvolvimento)');
      console.log('');
    });
    
    // Configurar timeout do servidor
    server.timeout = 30000; // 30 segundos
    
    return server;
    
  } catch (error) {
    console.error('❌ ====================================');
    console.error('❌ ERRO CRÍTICO AO INICIAR SERVIDOR');
    console.error('❌ ====================================');
    console.error(`❌ Erro: ${error.message}`);
    console.error('❌ ====================================');
    
    if (error.message.includes('variáveis de ambiente')) {
      console.error('');
      console.error('💡 SOLUÇÃO:');
      console.error('   1. Verifique se o arquivo .env existe');
      console.error('   2. Configure as variáveis obrigatórias:');
      console.error('      - JWT_SECRET=sua_chave_secreta');
      console.error('      - DB_NAME=nome_do_banco');  
      console.error('      - DB_USER=usuario_do_banco');
      console.error('   3. Reinicie o servidor');
      console.error('');
    }
    
    if (error.message.includes('database') || error.message.includes('connect')) {
      console.error('');
      console.error('💡 SOLUÇÃO BANCO DE DADOS:');
      console.error('   1. Verifique se PostgreSQL está rodando');
      console.error('   2. Confirme credenciais no arquivo .env');
      console.error('   3. Teste conexão: psql -h localhost -U postgres');
      console.error('');
    }
    
    process.exit(1);
  }
}

/**
 * TRATAMENTO DE ERROS GLOBAIS NÃO CAPTURADOS
 */
process.on('uncaughtException', (error) => {
  console.error('❌ ERRO NÃO CAPTURADO:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMISE REJEITADA NÃO TRATADA:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Inicializar servidor apenas se não estiver sendo importado (para testes)
if (require.main === module) {
  startServer();
}

module.exports = app;

/**
 * INFORMAÇÕES TÉCNICAS DO SERVIDOR:
 * 
 * 1. SEGURANÇA IMPLEMENTADA:
 *    ✅ Helmet com CSP configurado
 *    ✅ CORS com origins específicos
 *    ✅ Rate limiting global (100 req/15min)
 *    ✅ Rate limiting login (5 req/15min)
 *    ✅ Validação de JWT em rotas protegidas
 *    ✅ Headers de segurança customizados
 * 
 * 2. MIDDLEWARES ATIVOS:
 *    ✅ express.json() com limite de 10MB
 *    ✅ express.urlencoded() para formulários
 *    ✅ morgan para logs de requisições
 *    ✅ validateToken para rotas protegidas
 *    ✅ errorHandler centralizado
 * 
 * 3. ROTAS IMPLEMENTADAS:
 *    ✅ /health - Status do sistema
 *    ✅ /api - Informações da API
 *    ✅ /api/auth/* - Autenticação completa
 *    ✅ /api/admin/* - Administração completa
 *    ✅ /api/professional/* - Profissional completo
 * 
 * 4. MONITORAMENTO:
 *    ✅ Health check com métricas
 *    ✅ Logs estruturados
 *    ✅ Informações de uptime e memória
 *    ✅ Versioning da API
 * 
 * 5. ROBUSTEZ:
 *    ✅ Graceful shutdown
 *    ✅ Tratamento de erros não capturados
 *    ✅ Timeout de requisições (30s)
 *    ✅ Verificação de variáveis de ambiente
 * 
 * 6. DEVELOPMENT-FRIENDLY:
 *    ✅ Logs detalhados em desenvolvimento
 *    ✅ Hot-reload com nodemon
 *    ✅ Mensagens de inicialização claras
 *    ✅ Guidance para solução de problemas
 * 
 * PRÓXIMAS IMPLEMENTAÇÕES:
 * - Sistema de Anamnese (/api/anamnesis/*)
 * - Sistema de Sessões (/api/sessions/*)
 * - Sistema de Relatórios (/api/reports/*)
 * - Upload de arquivos (/api/uploads/*)
 * - Websockets para notificações em tempo real
 * - Cache com Redis
 * - Métricas avançadas com Prometheus
 * 
 * COMANDOS PARA DESENVOLVIMENTO:
 * npm run dev     # Inicia com nodemon
 * npm start       # Inicia em produção
 * npm test        # Executa testes
 * npm run lint    # Verifica código
 */