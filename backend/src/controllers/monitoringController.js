/**
 * Controller de Monitoramento
 * 
 * Endpoints para health check, métricas e status do sistema
 */

const metricsService = require('../services/metricsService');
const alertService = require('../services/alertService');
const auditService = require('../services/auditService');
const { sequelize } = require('../config/database');

/**
 * Health check básico (público)
 * GET /api/monitoring/health
 */
const healthCheck = async (req, res) => {
  try {
    // Verificar conexão com o banco
    let dbStatus = 'connected';
    try {
      await sequelize.authenticate();
    } catch (error) {
      dbStatus = 'disconnected';
    }

    const health = metricsService.getHealthStatus();

    res.status(health.status === 'critical' ? 503 : 200).json({
      status: health.status,
      timestamp: health.timestamp,
      uptime: metricsService.formatUptime(process.uptime()),
      database: dbStatus,
      issues: health.issues.length > 0 ? health.issues : undefined
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Erro ao verificar health check',
      error: error.message
    });
  }
};

/**
 * Health check avançado (admin)
 * GET /api/monitoring/health/advanced
 */
const advancedHealthCheck = async (req, res) => {
  try {
    // Verificar conexão com o banco
    let dbStatus = 'connected';
    let dbLatency = null;
    try {
      const startTime = Date.now();
      await sequelize.authenticate();
      dbLatency = Date.now() - startTime;
    } catch (error) {
      dbStatus = 'disconnected';
    }

    const health = metricsService.getHealthStatus();
    const system = metricsService.getSystemMetrics();

    // Registrar auditoria
    await auditService.logAccess(
      req,
      'monitoring',
      'health_check_advanced',
      'Consulta de health check avançado'
    );

    res.status(health.status === 'critical' ? 503 : 200).json({
      status: health.status,
      timestamp: health.timestamp,
      uptime: {
        process: system.process.uptimeFormatted,
        system: system.os.uptimeFormatted
      },
      database: {
        status: dbStatus,
        latency: dbLatency ? `${dbLatency}ms` : null
      },
      memory: {
        percentUsed: system.memory.percentUsed + '%',
        used: system.memory.usedFormatted,
        free: system.memory.freeFormatted,
        total: system.memory.totalFormatted
      },
      cpu: {
        cores: system.cpu.cores,
        load: system.cpu.load
      },
      issues: health.issues,
      metrics: {
        totalRequests: metricsService.metrics.requests.total,
        avgResponseTime: health.metrics.avgResponseTime + 'ms',
        errorRate: health.metrics.errorRate + '%'
      }
    });
  } catch (error) {
    console.error('[MonitoringController] Erro em advancedHealthCheck:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar health check avançado',
      error: error.message
    });
  }
};

/**
 * Obter todas as métricas (admin)
 * GET /api/monitoring/metrics
 */
const getMetrics = async (req, res) => {
  try {
    const metrics = metricsService.getAllMetrics();

    // Registrar auditoria
    await auditService.logAccess(
      req,
      'monitoring',
      'metrics',
      'Consulta de métricas do sistema'
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter métricas',
      error: error.message
    });
  }
};

/**
 * Obter resumo de métricas (admin)
 * GET /api/monitoring/metrics/summary
 */
const getMetricsSummary = async (req, res) => {
  try {
    const summary = metricsService.getSummary();

    // Verificar conexão com banco de dados
    let dbStatus = 'disconnected';
    try {
      await sequelize.authenticate();
      dbStatus = 'connected';
    } catch (error) {
      console.error('[Monitoring] Erro ao conectar com banco:', error.message);
    }

    // Contar usuários ativos (logados nas últimas 24 horas)
    let activeUsers = 0;
    try {
      const { User } = require('../models');
      const { Op } = require('sequelize');
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      activeUsers = await User.count({
        where: {
          last_login: {
            [Op.gte]: twentyFourHoursAgo
          },
          status: 'active'
        }
      });
    } catch (error) {
      console.error('[Monitoring] Erro ao contar usuários ativos:', error.message);
    }

    // Contar sessões ativas (agendadas para hoje ou futuro)
    let activeSessions = 0;
    try {
      const { Session } = require('../models');
      const { Op } = require('sequelize');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      activeSessions = await Session.count({
        where: {
          session_date: {
            [Op.gte]: today
          },
          status: {
            [Op.in]: ['scheduled', 'in_progress']
          }
        }
      });
    } catch (error) {
      console.error('[Monitoring] Erro ao contar sessões ativas:', error.message);
    }

    // Atualizar dados do resumo
    summary.database.status = dbStatus;
    summary.activeUsers = activeUsers;
    summary.activeSessions = activeSessions;

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter resumo de métricas',
      error: error.message
    });
  }
};

/**
 * Resetar métricas (admin)
 * POST /api/monitoring/metrics/reset
 */
const resetMetrics = async (req, res) => {
  try {
    // Registrar auditoria antes de resetar
    await auditService.logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.full_name,
      userRole: req.user.user_type,
      action: 'update',
      resource: 'monitoring',
      resourceId: 'metrics_reset',
      description: 'Reset de métricas do sistema',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    metricsService.reset();

    res.json({
      success: true,
      message: 'Métricas resetadas com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao resetar métricas',
      error: error.message
    });
  }
};

/**
 * Obter status do sistema (admin)
 * GET /api/monitoring/status
 */
const getStatus = async (req, res) => {
  try {
    const metrics = metricsService.getAllMetrics();
    const health = metricsService.getHealthStatus();
    const system = metricsService.getSystemMetrics();

    // Verificar conexão com banco
    let dbStatus = 'connected';
    try {
      await sequelize.authenticate();
    } catch (error) {
      dbStatus = 'disconnected';
    }

    res.json({
      success: true,
      data: {
        health: {
          status: health.status,
          issues: health.issues
        },
        uptime: system.process.uptimeFormatted,
        database: dbStatus,
        requests: {
          total: metrics.requests.total,
          success: metrics.requests.success,
          errors: metrics.requests.errors,
          successRate: metrics.requests.total > 0 
            ? ((metrics.requests.success / metrics.requests.total) * 100).toFixed(2) + '%'
            : '0%'
        },
        performance: {
          avgResponseTime: metrics.performance.avgResponseTime.toFixed(2) + 'ms',
          minResponseTime: metrics.performance.minResponseTime + 'ms',
          maxResponseTime: metrics.performance.maxResponseTime + 'ms'
        },
        system: {
          memory: system.memory.percentUsed + '%',
          cpu: system.cpu.cores + ' cores',
          load: system.cpu.load
        },
        recentErrors: metrics.errors.recent.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter status do sistema',
      error: error.message
    });
  }
};

/**
 * Obter configuração de alertas (admin)
 * GET /api/monitoring/alerts/config
 */
const getAlertsConfig = async (req, res) => {
  try {
    const config = alertService.getConfig();

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter configuração de alertas',
      error: error.message
    });
  }
};

/**
 * Limpar histórico de alertas (admin)
 * POST /api/monitoring/alerts/clear
 */
const clearAlertsHistory = async (req, res) => {
  try {
    // Registrar auditoria
    await auditService.logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.full_name,
      userRole: req.user.user_type,
      action: 'delete',
      resource: 'monitoring',
      resourceId: 'alerts_history',
      description: 'Limpeza de histórico de alertas',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    alertService.clearHistory();

    res.json({
      success: true,
      message: 'Histórico de alertas limpo com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar histórico de alertas',
      error: error.message
    });
  }
};

/**
 * Verificar saúde do sistema manualmente (admin)
 * POST /api/monitoring/check
 */
const checkSystemHealth = async (req, res) => {
  try {
    alertService.checkSystemHealth();

    res.json({
      success: true,
      message: 'Verificação de saúde executada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar saúde do sistema',
      error: error.message
    });
  }
};

/**
 * Obter alertas do sistema (admin)
 * GET /api/monitoring/alerts
 */
const getAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    const alerts = alertService.getHistory();
    
    // Filtrar por status se fornecido
    let filteredAlerts = alerts;
    if (status) {
      filteredAlerts = alerts.filter(alert => alert.status === status);
    }

    res.json({
      success: true,
      data: filteredAlerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter alertas',
      error: error.message
    });
  }
};

/**
 * Reconhecer um alerta (admin)
 * POST /api/monitoring/alerts/:id/acknowledge
 */
const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Registrar auditoria
    await auditService.logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.full_name,
      userRole: req.user.user_type,
      action: 'update',
      resource: 'monitoring_alert',
      resourceId: id,
      description: 'Reconhecimento de alerta',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    // Aqui você pode implementar a lógica de reconhecimento se necessário
    
    res.json({
      success: true,
      message: 'Alerta reconhecido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao reconhecer alerta',
      error: error.message
    });
  }
};

/**
 * Resolver um alerta (admin)
 * POST /api/monitoring/alerts/:id/resolve
 */
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Registrar auditoria
    await auditService.logAction({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.full_name,
      userRole: req.user.user_type,
      action: 'update',
      resource: 'monitoring_alert',
      resourceId: id,
      description: 'Resolução de alerta',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success'
    });

    // Aqui você pode implementar a lógica de resolução se necessário
    
    res.json({
      success: true,
      message: 'Alerta resolvido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao resolver alerta',
      error: error.message
    });
  }
};

module.exports = {
  healthCheck,
  advancedHealthCheck,
  getMetrics,
  getMetricsSummary,
  resetMetrics,
  getStatus,
  getAlertsConfig,
  clearAlertsHistory,
  checkSystemHealth,
  getAlerts,
  acknowledgeAlert,
  resolveAlert
};
