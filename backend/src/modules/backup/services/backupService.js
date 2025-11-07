/**
 * Serviço de Backup
 * 
 * Gerencia operações de backup e restore do banco de dados PostgreSQL
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');
const backupConfig = require('../../../config/backup');

const execAsync = promisify(exec);
const pipelineAsync = promisify(pipeline);

class BackupService {
  constructor() {
    this.backupPath = backupConfig.path;
    this.retentionDays = backupConfig.retention;
  }

  /**
   * Criar backup completo do banco de dados
   * @returns {Object} Informações do backup criado
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup_${timestamp}`;
      const sqlFile = path.join(this.backupPath, `${backupName}.sql`);
      const gzFile = path.join(this.backupPath, `${backupName}.sql.gz`);

      // Garantir que o diretório existe
      await this.ensureBackupDirectory();

      console.log(`[Backup] Iniciando backup: ${backupName}`);

      // Executar pg_dump
      const dumpCommand = this.buildDumpCommand(sqlFile);
      await execAsync(dumpCommand);

      console.log(`[Backup] Dump SQL criado: ${sqlFile}`);

      // Comprimir arquivo se habilitado
      if (backupConfig.compression.enabled) {
        await this.compressFile(sqlFile, gzFile);
        await fs.unlink(sqlFile); // Remove arquivo não comprimido
        console.log(`[Backup] Arquivo comprimido: ${gzFile}`);
      }

      const finalFile = backupConfig.compression.enabled ? gzFile : sqlFile;

      // Registrar backup no log
      const backupInfo = {
        name: backupName,
        file: finalFile,
        size: await this.getFileSize(finalFile),
        sizeFormatted: await this.formatFileSize(finalFile),
        timestamp: new Date(),
        type: 'automatic',
        compressed: backupConfig.compression.enabled
      };

      await this.logBackup(backupInfo);

      // Limpar backups antigos
      await this.rotateBackups();

      console.log(`[Backup] Backup concluído com sucesso: ${backupName}`);

      return backupInfo;
    } catch (error) {
      console.error('[Backup] Erro ao criar backup:', error);
      throw new Error(`Falha ao criar backup: ${error.message}`);
    }
  }

  /**
   * Restaurar backup do banco de dados
   * @param {string} backupName - Nome do backup a ser restaurado
   * @returns {Object} Informações da restauração
   */
  async restoreBackup(backupName) {
    try {
      const backupFile = await this.findBackupFile(backupName);
      
      if (!backupFile) {
        throw new Error('Backup não encontrado');
      }

      console.log(`[Backup] Iniciando restauração: ${backupName}`);

      let sqlFile = backupFile;

      // Se estiver comprimido, descompactar primeiro
      if (backupFile.endsWith('.gz')) {
        sqlFile = backupFile.replace('.gz', '');
        await this.decompressFile(backupFile, sqlFile);
        console.log(`[Backup] Arquivo descomprimido: ${sqlFile}`);
      }

      // Executar restore
      const restoreCommand = this.buildRestoreCommand(sqlFile);
      await execAsync(restoreCommand);

      console.log(`[Backup] Restauração executada: ${backupName}`);

      // Remover arquivo SQL temporário se foi descompactado
      if (backupFile.endsWith('.gz')) {
        await fs.unlink(sqlFile);
      }

      const result = {
        success: true,
        backup: backupName,
        restoredAt: new Date()
      };

      console.log(`[Backup] Backup restaurado com sucesso: ${backupName}`);

      return result;
    } catch (error) {
      console.error('[Backup] Erro ao restaurar backup:', error);
      throw new Error(`Falha ao restaurar backup: ${error.message}`);
    }
  }

  /**
   * Listar todos os backups disponíveis
   * @returns {Array} Lista de backups
   */
  async listBackups() {
    try {
      await this.ensureBackupDirectory();
      
      const files = await fs.readdir(this.backupPath);
      const backups = [];

      for (const file of files) {
        if (file.startsWith('backup_') && (file.endsWith('.sql') || file.endsWith('.sql.gz'))) {
          const filePath = path.join(this.backupPath, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            name: file.replace('.sql.gz', '').replace('.sql', ''),
            file: file,
            size: stats.size,
            sizeFormatted: this.formatBytes(stats.size),
            createdAt: stats.birthtime,
            compressed: file.endsWith('.gz')
          });
        }
      }

      return backups.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('[Backup] Erro ao listar backups:', error);
      throw new Error(`Falha ao listar backups: ${error.message}`);
    }
  }

  /**
   * Deletar backup específico
   * @param {string} backupName - Nome do backup a ser deletado
   * @returns {Object} Resultado da operação
   */
  async deleteBackup(backupName) {
    try {
      const backupFile = await this.findBackupFile(backupName);
      
      if (!backupFile) {
        throw new Error('Backup não encontrado');
      }

      await fs.unlink(backupFile);
      console.log(`[Backup] Backup deletado: ${backupName}`);

      return { success: true, deleted: backupName };
    } catch (error) {
      console.error('[Backup] Erro ao deletar backup:', error);
      throw new Error(`Falha ao deletar backup: ${error.message}`);
    }
  }

  /**
   * Rotacionar backups (remover backups antigos)
   * @returns {Object} Quantidade de backups removidos
   */
  async rotateBackups() {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      let deletedCount = 0;

      for (const backup of backups) {
        if (backup.createdAt < cutoffDate) {
          await this.deleteBackup(backup.name);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`[Backup] Rotação: ${deletedCount} backups antigos removidos`);
      }

      return { deleted: deletedCount };
    } catch (error) {
      console.error('[Backup] Erro ao rotacionar backups:', error);
      throw new Error(`Falha ao rotacionar backups: ${error.message}`);
    }
  }

  /**
   * Verificar integridade do backup
   * @param {string} backupName - Nome do backup a ser verificado
   * @returns {Object} Status da verificação
   */
  async verifyBackup(backupName) {
    try {
      const backupFile = await this.findBackupFile(backupName);
      
      if (!backupFile) {
        throw new Error('Backup não encontrado');
      }

      const stats = await fs.stat(backupFile);
      
      return {
        valid: stats.size > 0,
        name: backupName,
        size: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        compressed: backupFile.endsWith('.gz'),
        createdAt: stats.birthtime
      };
    } catch (error) {
      console.error('[Backup] Erro ao verificar backup:', error);
      return { valid: false, error: error.message };
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Garantir que o diretório de backup existe
   */
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupPath);
    } catch {
      await fs.mkdir(this.backupPath, { recursive: true });
      console.log(`[Backup] Diretório criado: ${this.backupPath}`);
    }
  }

  /**
   * Construir comando pg_dump
   * @param {string} outputFile - Arquivo de saída
   * @returns {string} Comando pg_dump
   */
  buildDumpCommand(outputFile) {
    const { host, port, name, user, password } = backupConfig.database;
    
    return `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${name} -F p -f "${outputFile}"`;
  }

  /**
   * Construir comando psql restore
   * @param {string} inputFile - Arquivo de entrada
   * @returns {string} Comando psql
   */
  buildRestoreCommand(inputFile) {
    const { host, port, name, user, password } = backupConfig.database;
    
    return `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${user} -d ${name} -f "${inputFile}"`;
  }

  /**
   * Comprimir arquivo com GZip
   * @param {string} inputFile - Arquivo de entrada
   * @param {string} outputFile - Arquivo de saída comprimido
   */
  async compressFile(inputFile, outputFile) {
    const gzip = zlib.createGzip({ level: backupConfig.compression.level });
    const source = require('fs').createReadStream(inputFile);
    const destination = require('fs').createWriteStream(outputFile);

    await pipelineAsync(source, gzip, destination);
  }

  /**
   * Descomprimir arquivo GZip
   * @param {string} inputFile - Arquivo comprimido
   * @param {string} outputFile - Arquivo de saída descomprimido
   */
  async decompressFile(inputFile, outputFile) {
    const gunzip = zlib.createGunzip();
    const source = require('fs').createReadStream(inputFile);
    const destination = require('fs').createWriteStream(outputFile);

    await pipelineAsync(source, gunzip, destination);
  }

  /**
   * Encontrar arquivo de backup (com ou sem .gz)
   * @param {string} backupName - Nome do backup
   * @returns {string|null} Caminho do arquivo ou null
   */
  async findBackupFile(backupName) {
    const possibleFiles = [
      path.join(this.backupPath, `${backupName}.sql.gz`),
      path.join(this.backupPath, `${backupName}.sql`)
    ];

    for (const file of possibleFiles) {
      try {
        await fs.access(file);
        return file;
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Obter tamanho do arquivo
   * @param {string} filePath - Caminho do arquivo
   * @returns {number} Tamanho em bytes
   */
  async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Obter tamanho formatado do arquivo
   * @param {string} filePath - Caminho do arquivo
   * @returns {string} Tamanho formatado
   */
  async formatFileSize(filePath) {
    const size = await this.getFileSize(filePath);
    return this.formatBytes(size);
  }

  /**
   * Formatar bytes para formato legível
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Registrar backup em arquivo de log
   * @param {Object} backupInfo - Informações do backup
   */
  async logBackup(backupInfo) {
    const logFile = path.join(this.backupPath, 'backup-log.json');
    let logs = [];

    try {
      const content = await fs.readFile(logFile, 'utf-8');
      logs = JSON.parse(content);
    } catch {
      // Arquivo não existe ainda
    }

    logs.push(backupInfo);
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
  }
}

module.exports = new BackupService();
