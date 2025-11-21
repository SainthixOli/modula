/**
 * Serviço de Alertas
 * 
 * Detecta e envia alertas de problemas críticos no sistema
 */

const metricsService = require('./metricsService');

class AlertService {
  constructor() {
    // Configuração de alertas
    this.config = {
      enabled: process.env.ALERTS_ENABLED !== 'false',
      cooldown: parseInt(process.env.ALERT_COOLDOWN_MINUTES) || 15, // minutos
      thresholds: {
        errorRate: parseFloat(process.env.ALERT_ERROR_RATE_THRESHOLD) || 10, // %
        memoryUsage: parseFloat(process.env.ALERT_MEMORY_THRESHOLD) || 90, // %
        responseTime: parseInt(process.env.ALERT_RESPONSE_TIME_THRESHOLD) || 5000, // ms
        errorCount: parseInt(process.env.ALERT_ERROR_COUNT_THRESHOLD) || 10 // erros em 5 min
      }
    };

    // Histórico de alertas enviados (para cooldown)
    this.alertHistory = {};
  }

  /**
   * Verificar e enviar alerta se necessário
   */
  checkAndAlert(type, data) {
    if (!this.config.enabled) {
      return;
    }

    // Verificar cooldown
    if (this.isInCooldown(type)) {
      return;
    }

    // Processar baseado no tipo
    switch (type) {
      case 'critical_error':
        this.sendAlert('ERRO CRÍTICO', this.formatCriticalError(data), 'critical');
        break;
      
      case 'high_error_rate':
        this.sendAlert('TAXA DE ERROS ALTA', this.formatHighErrorRate(data), 'warning');
        break;
      
      case 'high_memory':
        this.sendAlert('MEMÓRIA ALTA', this.formatHighMemory(data), 'warning');
        break;
      
      case 'slow_response':
        this.sendAlert('RESPOSTA LENTA', this.formatSlowResponse(data), 'warning');
        break;
      
      case 'system_unhealthy':
        this.sendAlert('SISTEMA INSTÁVEL', this.formatSystemUnhealthy(data), 'critical');
        break;
      
      default:
        console.warn(`[AlertService] Tipo de alerta desconhecido: ${type}`);
    }

    // Registrar alerta no histórico
    this.alertHistory[type] = Date.now();
  }

  /**
   * Verificar se o alerta está em cooldown
   */
  isInCooldown(type) {
    const lastAlert = this.alertHistory[type];
    if (!lastAlert) {
      return false;
    }

    const cooldownMs = this.config.cooldown * 60 * 1000;
    const timeSinceLastAlert = Date.now() - lastAlert;

    return timeSinceLastAlert < cooldownMs;
  }

  /**
   * Enviar alerta
   */
  sendAlert(title, message, level = 'warning') {
    const timestamp = new Date().toISOString();
    const separator = '='.repeat(80);

    console.error(`
${separator}
🚨 ALERTA: ${title}
${separator}
Nível: ${level.toUpperCase()}
Horário: ${timestamp}
${separator}
${message}
${separator}
    `);

    // TODO: Implementar envio de email, webhook, Slack, etc.
    // Exemplos de integrações futuras:
    // - this.sendEmail(title, message, level);
    // - this.sendSlackNotification(title, message, level);
    // - this.sendWebhook(title, message, level);
  }

  /**
   * Formatar alerta de erro crítico
   */
  formatCriticalError(data) {
    return `
Mensagem: ${data.message || 'Erro desconhecido'}
Endpoint: ${data.method || ''} ${data.endpoint || ''}
Status Code: ${data.statusCode || 'N/A'}
${data.stack ? `\nStack Trace:\n${data.stack}` : ''}
    `.trim();
  }

  /**
   * Formatar alerta de taxa de erros alta
   */
  formatHighErrorRate(data) {
    return `
Taxa de Erros: ${data.errorRate}%
Threshold: ${this.config.thresholds.errorRate}%
Total de Requisições: ${data.totalRequests}
Total de Erros: ${data.totalErrors}
    `.trim();
  }

  /**
   * Formatar alerta de memória alta
   */
  formatHighMemory(data) {
    return `
Uso de Memória: ${data.memoryPercent}%
Threshold: ${this.config.thresholds.memoryUsage}%
Memória Usada: ${data.usedFormatted}
Memória Total: ${data.totalFormatted}
Memória Livre: ${data.freeFormatted}
    `.trim();
  }

  /**
   * Formatar alerta de resposta lenta
   */
  formatSlowResponse(data) {
    return `
Endpoint: ${data.endpoint}
Tempo de Resposta: ${data.responseTime}ms
Threshold: ${data.threshold}ms
    `.trim();
  }

  /**
   * Formatar alerta de sistema instável
   */
  formatSystemUnhealthy(data) {
    return `
Status: ${data.status}
Problemas Detectados:
${data.issues.map(issue => `  - ${issue}`).join('\n')}

Métricas:
  - Uso de Memória: ${data.metrics.memoryUsage}%
  - Taxa de Erros: ${data.metrics.errorRate}%
  - Tempo Médio de Resposta: ${data.metrics.avgResponseTime}ms
  - Uptime: ${metricsService.formatUptime(data.metrics.uptime)}
    `.trim();
  }

  /**
   * Verificar estado do sistema periodicamente
   */
  checkSystemHealth() {
    const health = metricsService.getHealthStatus();

    // Alertar se o sistema estiver crítico
    if (health.status === 'critical') {
      this.checkAndAlert('system_unhealthy', health);
    }

    // Verificar taxa de erros
    const metrics = metricsService.getAllMetrics();
    if (metrics.requests.total > 0) {
      const errorRate = (metrics.requests.errors / metrics.requests.total) * 100;
      
      if (errorRate > this.config.thresholds.errorRate) {
        this.checkAndAlert('high_error_rate', {
          errorRate: errorRate.toFixed(2),
          totalRequests: metrics.requests.total,
          totalErrors: metrics.requests.errors
        });
      }
    }

    // Verificar uso de memória
    const memoryPercent = parseFloat(metrics.system.memory.percentUsed);
    if (memoryPercent > this.config.thresholds.memoryUsage) {
      this.checkAndAlert('high_memory', {
        memoryPercent: memoryPercent.toFixed(2),
        usedFormatted: metrics.system.memory.usedFormatted,
        totalFormatted: metrics.system.memory.totalFormatted,
        freeFormatted: metrics.system.memory.freeFormatted
      });
    }
  }

  /**
   * Obter configuração de alertas
   */
  getConfig() {
    return {
      ...this.config,
      alertHistory: Object.keys(this.alertHistory).map(type => ({
        type,
        lastAlert: new Date(this.alertHistory[type]),
        inCooldown: this.isInCooldown(type)
      }))
    };
  }

  /**
   * Obter histórico de alertas
   */
  getHistory() {
    return Object.keys(this.alertHistory).map((type, index) => ({
      id: index + 1,
      type,
      timestamp: new Date(this.alertHistory[type]).toISOString(),
      status: 'active',
      acknowledged: false
    }));
  }

  /**
   * Limpar histórico de alertas
   */
  clearHistory() {
    this.alertHistory = {};
    console.log('[AlertService] Histórico de alertas limpo');
  }
}

module.exports = new AlertService();
