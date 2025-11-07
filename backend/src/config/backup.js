/**
 * Configuração do Sistema de Backup
 * 
 * Define parâmetros para backup automático e manual do banco de dados
 */

module.exports = {
  // Habilitar/desabilitar backup automático
  enabled: process.env.BACKUP_ENABLED === 'true',
  
  // Schedule do cron (formato: segundo minuto hora dia mês dia-da-semana)
  // Padrão: "0 2 * * *" = Todo dia às 2h da manhã
  schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
  
  // Diretório onde os backups serão armazenados
  path: process.env.BACKUP_PATH || './backups',
  
  // Quantos dias manter os backups antes de deletá-los
  retention: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  
  // Configurações de compressão
  compression: {
    enabled: true,
    level: 9 // Nível de compressão (0-9, sendo 9 o máximo)
  },
  
  // Configurações do banco de dados para pg_dump
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
};
