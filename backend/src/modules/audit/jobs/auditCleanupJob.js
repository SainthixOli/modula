/**
 * Job de Limpeza de Logs de Auditoria
 * 
 * Remove logs expirados conforme política de retenção LGPD
 */

const cron = require('node-cron');
const auditService = require('../../../services/auditService');

class AuditCleanupJob {
  constructor() {
    this.task = null;
  }

  /**
   * Iniciar job de limpeza automática
   */
  start() {
    const enabled = process.env.AUDIT_CLEANUP_ENABLED !== 'false';
    
    if (!enabled) {
      console.log('[AuditCleanupJob] Limpeza automática de logs desabilitada');
      return;
    }

    // Schedule padrão: Todo dia às 3h da manhã (após backup)
    const schedule = process.env.AUDIT_CLEANUP_SCHEDULE || '0 3 * * *';

    // Validar expressão cron
    if (!cron.validate(schedule)) {
      console.error(`[AuditCleanupJob] Schedule inválido: ${schedule}`);
      return;
    }

    this.task = cron.schedule(schedule, async () => {
      try {
        console.log('[AuditCleanupJob] Iniciando limpeza de logs expirados...');
        const count = await auditService.cleanExpiredLogs();
        console.log(`[AuditCleanupJob] Limpeza concluída: ${count} logs removidos`);
      } catch (error) {
        console.error('[AuditCleanupJob] Erro na limpeza automática:', error);
      }
    });

    console.log(`[AuditCleanupJob] Job iniciado. Schedule: ${schedule}`);
    console.log(`[AuditCleanupJob] Próxima execução: ${this.getNextExecution()}`);
  }

  /**
   * Parar job de limpeza
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('[AuditCleanupJob] Job de limpeza parado');
    }
  }

  /**
   * Executar limpeza imediatamente (para testes)
   */
  async executeNow() {
    try {
      console.log('[AuditCleanupJob] Executando limpeza manual via job...');
      const count = await auditService.cleanExpiredLogs();
      console.log(`[AuditCleanupJob] Limpeza manual concluída: ${count} logs removidos`);
      return count;
    } catch (error) {
      console.error('[AuditCleanupJob] Erro ao executar limpeza manual:', error);
      throw error;
    }
  }

  /**
   * Obter próxima execução do job
   */
  getNextExecution() {
    const schedule = process.env.AUDIT_CLEANUP_SCHEDULE || '0 3 * * *';
    const parts = schedule.split(' ');
    const minute = parts[0];
    const hour = parts[1];
    
    const now = new Date();
    const next = new Date();
    
    next.setHours(parseInt(hour) || 3);
    next.setMinutes(parseInt(minute) || 0);
    next.setSeconds(0);
    
    // Se já passou hoje, agendar para amanhã
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.toISOString();
  }

  /**
   * Verificar se o job está rodando
   */
  isRunning() {
    return this.task !== null;
  }

  /**
   * Obter informações do job
   */
  getInfo() {
    return {
      enabled: process.env.AUDIT_CLEANUP_ENABLED !== 'false',
      schedule: process.env.AUDIT_CLEANUP_SCHEDULE || '0 3 * * *',
      retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS) || 90,
      running: this.isRunning(),
      nextExecution: this.isRunning() ? this.getNextExecution() : null
    };
  }
}

module.exports = new AuditCleanupJob();
