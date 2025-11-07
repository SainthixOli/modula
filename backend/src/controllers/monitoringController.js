/**
 * Controller de Monitoramento
 * 
 * Endpoints para health check, métricas e status do sistema
 */

const metricsService = require('../services/metricsService');
const alertService = require('../services/alertService');
const auditService = require('../services/auditService');
const { sequelize } = require('../models');

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
    await auditService.logRead(
      req.user.id,
      'monitoring',
      null,
      'health_check_advanced',
      req
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
      metrics: health.metrics
    });
  } catch (error) {
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
    await auditService.logRead(
      req.user.id,
      'monitoring',
      null,
      'metrics_view',
      req
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
    await auditService.log(
      req.user.id,
      'monitoring',
      null,
      'metrics_reset',
      req,
      null,
      { timestamp: new Date() }
    );

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
    await auditService.log(
      req.user.id,
      'monitoring',
      null,
      'alerts_history_clear',
      req,
      null,
      { timestamp: new Date() }
    );

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

module.exports = {
  healthCheck,
  advancedHealthCheck,
  getMetrics,
  getMetricsSummary,
  resetMetrics,
  getStatus,
  getAlertsConfig,
  clearAlertsHistory,
  checkSystemHealth
};
