/**
 * Controller de Auditoria
 * 
 * Gerencia endpoints para consulta de logs de auditoria
 * Acesso restrito a administradores
 */

const auditService = require('../services/auditService');

class AuditController {
  /**
   * GET /api/audit/logs
   * Listar logs de auditoria com filtros
   */
  async getLogs(req, res, next) {
    try {
      const {
        userId,
        action,
        resource,
        resourceId,
        status,
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = req.query;

      const filters = {
        userId,
        action,
        resource,
        resourceId,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const logs = await auditService.getLogs(filters);

      res.json({
        success: true,
        data: logs,
        count: logs.length,
        filters
      });
    } catch (error) {
      console.error('[AuditController] Erro ao buscar logs:', error);
      next(error);
    }
  }

  /**
   * GET /api/audit/logs/:id
   * Obter detalhes de um log específico
   */
  async getLogById(req, res, next) {
    try {
      const { id } = req.params;
      const AuditLog = require('../models/AuditLog');

      const log = await AuditLog.findByPk(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log de auditoria não encontrado'
        });
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('[AuditController] Erro ao buscar log:', error);
      next(error);
    }
  }

  /**
   * GET /api/audit/stats
   * Obter estatísticas de auditoria
   */
  async getStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      };

      const stats = await auditService.getStats(filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('[AuditController] Erro ao obter estatísticas:', error);
      next(error);
    }
  }

  /**
   * GET /api/audit/report
   * Gerar relatório de auditoria
   */
  async generateReport(req, res, next) {
    try {
      const {
        userId,
        action,
        resource,
        startDate,
        endDate,
        limit = 1000
      } = req.query;

      const filters = {
        userId,
        action,
        resource,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        limit: parseInt(limit)
      };

      const report = await auditService.generateReport(filters);

      // Registrar geração de relatório
      await auditService.logExport(
        req,
        'audit',
        filters,
        'Relatório de auditoria gerado'
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('[AuditController] Erro ao gerar relatório:', error);
      next(error);
    }
  }

  /**
   * GET /api/audit/user/:userId
   * Obter logs de um usuário específico
   */
  async getUserLogs(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit = 100, offset = 0, startDate, endDate } = req.query;

      const filters = {
        userId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const logs = await auditService.getLogs(filters);

      res.json({
        success: true,
        data: logs,
        count: logs.length,
        userId
      });
    } catch (error) {
      console.error('[AuditController] Erro ao buscar logs do usuário:', error);
      next(error);
    }
  }

  /**
   * GET /api/audit/resource/:resource/:resourceId
   * Obter logs de um recurso específico
   */
  async getResourceLogs(req, res, next) {
    try {
      const { resource, resourceId } = req.params;
      const { limit = 100, offset = 0, startDate, endDate } = req.query;

      const filters = {
        resource,
        resourceId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const logs = await auditService.getLogs(filters);

      res.json({
        success: true,
        data: logs,
        count: logs.length,
        resource,
        resourceId
      });
    } catch (error) {
      console.error('[AuditController] Erro ao buscar logs do recurso:', error);
      next(error);
    }
  }

  /**
   * POST /api/audit/clean
   * Limpar logs expirados manualmente
   */
  async cleanExpiredLogs(req, res, next) {
    try {
      console.log(`[AuditController] Limpeza manual solicitada por ${req.user.email}`);

      const count = await auditService.cleanExpiredLogs();

      // Registrar limpeza
      await auditService.logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.full_name,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        action: 'DELETE',
        resource: 'audit',
        description: `Limpeza manual: ${count} logs expirados removidos`,
        metadata: { count },
        retentionDays: 365 // Log da limpeza tem retenção maior
      });

      res.json({
        success: true,
        message: 'Logs expirados removidos com sucesso',
        data: { count }
      });
    } catch (error) {
      console.error('[AuditController] Erro ao limpar logs:', error);
      next(error);
    }
  }

  /**
   * GET /api/audit/actions
   * Listar tipos de ações disponíveis
   */
  async getActions(req, res, next) {
    try {
      const actions = [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'LOGIN_FAILED',
        'PASSWORD_RESET',
        'PASSWORD_CHANGED',
        'EXPORT',
        'TRANSFER',
        'BACKUP',
        'RESTORE',
        'ACCESS_DENIED'
      ];

      res.json({
        success: true,
        data: actions
      });
    } catch (error) {
      console.error('[AuditController] Erro ao listar ações:', error);
      next(error);
    }
  }

  /**
   * GET /api/audit/resources
   * Listar tipos de recursos disponíveis
   */
  async getResources(req, res, next) {
    try {
      const resources = [
        'user',
        'patient',
        'session',
        'anamnesis',
        'transfer',
        'notification',
        'backup',
        'system'
      ];

      res.json({
        success: true,
        data: resources
      });
    } catch (error) {
      console.error('[AuditController] Erro ao listar recursos:', error);
      next(error);
    }
  }
}

module.exports = new AuditController();
