/**
 * Controller de Backup
 * 
 * Gerencia endpoints REST para operações de backup
 */

const backupService = require('../services/backupService');

class BackupController {
  /**
   * POST /api/backups
   * Criar novo backup manual
   */
  async createBackup(req, res, next) {
    try {
      console.log(`[BackupController] Backup manual solicitado por usuário ${req.user.id}`);
      
      const backup = await backupService.createBackup();

      res.status(201).json({
        success: true,
        message: 'Backup criado com sucesso',
        data: backup
      });
    } catch (error) {
      console.error('[BackupController] Erro ao criar backup:', error);
      next(error);
    }
  }

  /**
   * GET /api/backups
   * Listar todos os backups disponíveis
   */
  async listBackups(req, res, next) {
    try {
      const backups = await backupService.listBackups();

      res.json({
        success: true,
        data: backups,
        count: backups.length
      });
    } catch (error) {
      console.error('[BackupController] Erro ao listar backups:', error);
      next(error);
    }
  }

  /**
   * POST /api/backups/:name/restore
   * Restaurar backup específico
   */
  async restoreBackup(req, res, next) {
    try {
      const { name } = req.params;
      
      console.log(`[BackupController] Restauração solicitada por usuário ${req.user.id}: ${name}`);
      
      const result = await backupService.restoreBackup(name);

      res.json({
        success: true,
        message: 'Backup restaurado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('[BackupController] Erro ao restaurar backup:', error);
      next(error);
    }
  }

  /**
   * DELETE /api/backups/:name
   * Deletar backup específico
   */
  async deleteBackup(req, res, next) {
    try {
      const { name } = req.params;
      
      console.log(`[BackupController] Deleção solicitada por usuário ${req.user.id}: ${name}`);
      
      const result = await backupService.deleteBackup(name);

      res.json({
        success: true,
        message: 'Backup deletado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('[BackupController] Erro ao deletar backup:', error);
      next(error);
    }
  }

  /**
   * POST /api/backups/rotate
   * Rotacionar backups (limpar backups antigos)
   */
  async rotateBackups(req, res, next) {
    try {
      console.log(`[BackupController] Rotação manual solicitada por usuário ${req.user.id}`);
      
      const result = await backupService.rotateBackups();

      res.json({
        success: true,
        message: 'Rotação de backups executada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('[BackupController] Erro ao rotacionar backups:', error);
      next(error);
    }
  }

  /**
   * GET /api/backups/:name/verify
   * Verificar integridade do backup
   */
  async verifyBackup(req, res, next) {
    try {
      const { name } = req.params;
      
      const result = await backupService.verifyBackup(name);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[BackupController] Erro ao verificar backup:', error);
      next(error);
    }
  }
}

module.exports = new BackupController();
