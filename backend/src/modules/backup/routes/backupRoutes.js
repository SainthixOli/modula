/**
 * Rotas de Backup
 * 
 * Endpoints para gerenciamento de backups do banco de dados
 * Requer autenticação e permissão de administrador
 */

const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { validateToken } = require('../../../middleware/auth');

// Middleware de autorização para admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar backups.'
    });
  }
  next();
};

// Todas as rotas requerem autenticação e permissão de admin
router.use(validateToken);
router.use(authorizeAdmin);

/**
 * POST /api/backups
 * Criar novo backup manual
 */
router.post('/', backupController.createBackup);

/**
 * GET /api/backups
 * Listar todos os backups disponíveis
 */
router.get('/', backupController.listBackups);

/**
 * POST /api/backups/rotate
 * Rotacionar backups (limpar backups antigos)
 */
router.post('/rotate', backupController.rotateBackups);

/**
 * POST /api/backups/:name/restore
 * Restaurar backup específico
 */
router.post('/:name/restore', backupController.restoreBackup);

/**
 * GET /api/backups/:name/verify
 * Verificar integridade do backup
 */
router.get('/:name/verify', backupController.verifyBackup);

/**
 * DELETE /api/backups/:name
 * Deletar backup específico
 */
router.delete('/:name', backupController.deleteBackup);

module.exports = router;
