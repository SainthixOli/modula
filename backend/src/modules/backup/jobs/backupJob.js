/**
 * Job de Backup Automático
 * 
 * Executa backups automáticos do banco de dados usando node-cron
 */

const cron = require('node-cron');
const backupService = require('../services/backupService');
const backupConfig = require('../../../config/backup');

class BackupJob {
  constructor() {
    this.task = null;
  }

  /**
   * Iniciar job de backup automático
   */
  start() {
    if (!backupConfig.enabled) {
      console.log('[BackupJob] Backup automático desabilitado');
      return;
    }

    // Validar expressão cron
    if (!cron.validate(backupConfig.schedule)) {
      console.error(`[BackupJob] Schedule inválido: ${backupConfig.schedule}`);
      return;
    }

    this.task = cron.schedule(backupConfig.schedule, async () => {
      try {
        console.log('[BackupJob] Iniciando backup automático...');
        const backup = await backupService.createBackup();
        console.log(`[BackupJob] Backup automático concluído: ${backup.name}`);
      } catch (error) {
        console.error('[BackupJob] Erro no backup automático:', error);
      }
    });

    console.log(`[BackupJob] Job iniciado. Schedule: ${backupConfig.schedule}`);
    console.log(`[BackupJob] Próxima execução: ${this.getNextExecution()}`);
  }

  /**
   * Parar job de backup
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('[BackupJob] Job de backup parado');
    }
  }

  /**
   * Executar backup imediatamente (para testes)
   */
  async executeNow() {
    try {
      console.log('[BackupJob] Executando backup manual via job...');
      const backup = await backupService.createBackup();
      console.log(`[BackupJob] Backup manual concluído: ${backup.name}`);
      return backup;
    } catch (error) {
      console.error('[BackupJob] Erro ao executar backup manual:', error);
      throw error;
    }
  }

  /**
   * Obter próxima execução do job
   */
  getNextExecution() {
    // Parsear cron expression
    const parts = backupConfig.schedule.split(' ');
    const minute = parts[0];
    const hour = parts[1];
    
    const now = new Date();
    const next = new Date();
    
    next.setHours(parseInt(hour) || 2);
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
}

module.exports = new BackupJob();
