/**
 * Job de Health Check
 * 
 * Executa verificações periódicas de saúde do sistema
 */

const cron = require('node-cron');
const alertService = require('../../../services/alertService');
const metricsService = require('../../../services/metricsService');

class HealthCheckJob {
  constructor() {
    this.task = null;
    this.schedule = process.env.HEALTH_CHECK_SCHEDULE || '*/5 * * * *'; // A cada 5 minutos
    this.enabled = process.env.HEALTH_CHECK_ENABLED !== 'false';
  }

  /**
   * Iniciar job de health check
   */
  start() {
    if (!this.enabled) {
      console.log('[HealthCheckJob] Job desabilitado via configuração');
      return;
    }

    if (this.task) {
      console.log('[HealthCheckJob] Job já está em execução');
      return;
    }

    this.task = cron.schedule(this.schedule, async () => {
      try {
        await this.execute();
      } catch (error) {
        console.error('[HealthCheckJob] Erro ao executar health check:', error);
      }
    });

    console.log(`[HealthCheckJob] ✅ Job iniciado (${this.schedule})`);
    console.log(`[HealthCheckJob] Próxima execução: ${this.getNextExecution()}`);
  }

  /**
   * Parar job de health check
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('[HealthCheckJob] Job parado');
    }
  }

  /**
   * Executar verificação de saúde
   */
  async execute() {
    const startTime = Date.now();
    
    console.log('[HealthCheckJob] Iniciando verificação de saúde...');

    try {
      // Verificar saúde geral do sistema
      alertService.checkSystemHealth();

      // Obter métricas
      const health = metricsService.getHealthStatus();
      const summary = metricsService.getSummary();

      // Log de status
      console.log('[HealthCheckJob] Status:', health.status);
      console.log('[HealthCheckJob] Requisições:', summary.requests.total);
      console.log('[HealthCheckJob] Taxa de Sucesso:', summary.requests.successRate + '%');
      console.log('[HealthCheckJob] Tempo Médio:', summary.performance.avgResponseTime);
      console.log('[HealthCheckJob] Uso de Memória:', summary.memory.percentUsed);

      // Alertar se houver problemas
      if (health.issues.length > 0) {
        console.warn('[HealthCheckJob] Problemas detectados:');
        health.issues.forEach(issue => {
          console.warn(`  - ${issue}`);
        });
      }

      const duration = Date.now() - startTime;
      console.log(`[HealthCheckJob] ✅ Verificação concluída em ${duration}ms`);
    } catch (error) {
      console.error('[HealthCheckJob] ❌ Erro na verificação:', error);
      throw error;
    }
  }

  /**
   * Executar health check imediatamente
   */
  async executeNow() {
    console.log('[HealthCheckJob] Executando verificação manual...');
    await this.execute();
  }

  /**
   * Obter próxima execução
   */
  getNextExecution() {
    if (!this.task) {
      return 'Job não iniciado';
    }

    // Calcular próxima execução baseado no schedule
    const now = new Date();
    const parts = this.schedule.split(' ');
    
    // Formato: minuto hora dia mês dia-da-semana
    const minute = parts[0];
    
    if (minute.startsWith('*/')) {
      const interval = parseInt(minute.replace('*/', ''));
      const nextMinute = Math.ceil(now.getMinutes() / interval) * interval;
      const next = new Date(now);
      next.setMinutes(nextMinute);
      next.setSeconds(0);
      
      if (next <= now) {
        next.setMinutes(next.getMinutes() + interval);
      }
      
      return next.toLocaleString('pt-BR');
    }

    return 'Calculando...';
  }

  /**
   * Obter informações do job
   */
  getInfo() {
    return {
      enabled: this.enabled,
      running: this.task !== null,
      schedule: this.schedule,
      nextExecution: this.getNextExecution()
    };
  }
}

module.exports = new HealthCheckJob();
