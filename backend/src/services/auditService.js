/**
 * Serviço de Auditoria LGPD
 * 
 * Gerencia logs de auditoria para compliance com LGPD.
 * Registra todas as operações sensíveis do sistema.
 */

const AuditLog = require('../models/AuditLog');

class AuditService {
  /**
   * Calcular data de retenção baseado na configuração
   * @param {number} days - Dias de retenção (padrão: 90 dias para LGPD)
   */
  calculateRetentionDate(days = null) {
    const retentionDays = days || parseInt(process.env.AUDIT_RETENTION_DAYS) || 90;
    const date = new Date();
    date.setDate(date.getDate() + retentionDays);
    return date;
  }

  /**
   * Extrair informações do request
   */
  extractRequestInfo(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
  }

  /**
   * Extrair informações do usuário
   */
  extractUserInfo(user) {
    if (!user) return {};
    
    return {
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name || user.name,
      userRole: user.role || user.user_type
    };
  }

  /**
   * Registrar ação genérica de auditoria
   */
  async logAction(data) {
    try {
      const retentionUntil = this.calculateRetentionDate(data.retentionDays);

      const logData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        userRole: data.userRole,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        oldData: data.oldData,
        newData: data.newData,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status || 'success',
        errorMessage: data.errorMessage,
        metadata: data.metadata || {},
        retentionUntil
      };

      const audit = await AuditLog.log(logData);
      
      console.log(`[Audit] ${data.action} em ${data.resource}${data.resourceId ? ` (${data.resourceId})` : ''} por ${data.userEmail || 'system'}`);
      
      return audit;
    } catch (error) {
      console.error('[AuditService] Erro ao registrar log:', error);
      // Não lançar erro para não quebrar o fluxo principal
      return null;
    }
  }

  /**
   * Registrar criação de recurso
   */
  async logCreate(req, resource, resourceData, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'CREATE',
      resource,
      resourceId: resourceData.id,
      newData: this.sanitizeData(resourceData),
      description: description || `${resource} criado`
    });
  }

  /**
   * Registrar atualização de recurso
   */
  async logUpdate(req, resource, resourceId, oldData, newData, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'UPDATE',
      resource,
      resourceId,
      oldData: this.sanitizeData(oldData),
      newData: this.sanitizeData(newData),
      description: description || `${resource} atualizado`
    });
  }

  /**
   * Registrar exclusão de recurso
   */
  async logDelete(req, resource, resourceId, oldData, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'DELETE',
      resource,
      resourceId,
      oldData: this.sanitizeData(oldData),
      description: description || `${resource} excluído`
    });
  }

  /**
   * Registrar acesso a recurso sensível
   */
  async logAccess(req, resource, resourceId, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'READ',
      resource,
      resourceId,
      description: description || `${resource} acessado`
    });
  }

  /**
   * Registrar login bem-sucedido
   */
  async logLogin(req, user, description = null) {
    const requestInfo = this.extractRequestInfo(req);

    return await this.logAction({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
      userRole: user.role || user.user_type,
      ...requestInfo,
      action: 'LOGIN',
      resource: 'user',
      resourceId: user.id,
      description: description || 'Login bem-sucedido'
    });
  }

  /**
   * Registrar tentativa de login falhada
   */
  async logLoginFailed(req, email, reason, description = null) {
    const requestInfo = this.extractRequestInfo(req);

    return await this.logAction({
      userEmail: email,
      ...requestInfo,
      action: 'LOGIN_FAILED',
      resource: 'user',
      status: 'failure',
      errorMessage: reason,
      description: description || `Login falhou: ${reason}`
    });
  }

  /**
   * Registrar logout
   */
  async logLogout(req, user, description = null) {
    const requestInfo = this.extractRequestInfo(req);

    return await this.logAction({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
      userRole: user.role || user.user_type,
      ...requestInfo,
      action: 'LOGOUT',
      resource: 'user',
      resourceId: user.id,
      description: description || 'Logout realizado'
    });
  }

  /**
   * Registrar reset de senha
   */
  async logPasswordReset(req, user, description = null) {
    const requestInfo = this.extractRequestInfo(req);

    return await this.logAction({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
      userRole: user.role || user.user_type,
      ...requestInfo,
      action: 'PASSWORD_RESET',
      resource: 'user',
      resourceId: user.id,
      description: description || 'Senha redefinida'
    });
  }

  /**
   * Registrar mudança de senha
   */
  async logPasswordChanged(req, user, description = null) {
    const requestInfo = this.extractRequestInfo(req);

    return await this.logAction({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
      userRole: user.role || user.user_type,
      ...requestInfo,
      action: 'PASSWORD_CHANGED',
      resource: 'user',
      resourceId: user.id,
      description: description || 'Senha alterada'
    });
  }

  /**
   * Registrar exportação de dados
   */
  async logExport(req, resource, filters, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'EXPORT',
      resource,
      metadata: { filters },
      description: description || `Exportação de ${resource}`
    });
  }

  /**
   * Registrar transferência
   */
  async logTransfer(req, transferData, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'TRANSFER',
      resource: 'transfer',
      resourceId: transferData.id,
      newData: this.sanitizeData(transferData),
      description: description || 'Transferência realizada'
    });
  }

  /**
   * Registrar backup
   */
  async logBackup(req, backupInfo, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'BACKUP',
      resource: 'backup',
      metadata: backupInfo,
      description: description || 'Backup criado',
      retentionDays: 365 // Backups têm retenção maior (1 ano)
    });
  }

  /**
   * Registrar restore
   */
  async logRestore(req, backupName, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'RESTORE',
      resource: 'backup',
      metadata: { backupName },
      description: description || `Restore do backup ${backupName}`,
      retentionDays: 365 // Restores têm retenção maior (1 ano)
    });
  }

  /**
   * Registrar acesso negado
   */
  async logAccessDenied(req, resource, resourceId, reason, description = null) {
    const requestInfo = this.extractRequestInfo(req);
    const userInfo = this.extractUserInfo(req.user);

    return await this.logAction({
      ...userInfo,
      ...requestInfo,
      action: 'ACCESS_DENIED',
      resource,
      resourceId,
      status: 'failure',
      errorMessage: reason,
      description: description || `Acesso negado: ${reason}`
    });
  }

  /**
   * Buscar logs com filtros
   */
  async getLogs(filters = {}) {
    try {
      const logs = await AuditLog.findLogs(filters);
      return logs;
    } catch (error) {
      console.error('[AuditService] Erro ao buscar logs:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de auditoria
   */
  async getStats(filters = {}) {
    try {
      const stats = await AuditLog.getStats(filters);
      return stats;
    } catch (error) {
      console.error('[AuditService] Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Limpar logs expirados
   */
  async cleanExpiredLogs() {
    try {
      const count = await AuditLog.cleanExpiredLogs();
      console.log(`[AuditService] ${count} logs expirados removidos`);
      return count;
    } catch (error) {
      console.error('[AuditService] Erro ao limpar logs:', error);
      throw error;
    }
  }

  /**
   * Sanitizar dados sensíveis antes de armazenar
   * Remove senhas e tokens
   */
  sanitizeData(data) {
    if (!data) return null;

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'refresh_token', 'reset_token'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Gerar relatório de auditoria em formato legível
   */
  async generateReport(filters = {}) {
    try {
      const logs = await this.getLogs(filters);
      const stats = await this.getStats(filters);

      return {
        summary: stats,
        logs: logs.map(log => ({
          timestamp: log.created_at,
          user: log.user_email || 'system',
          action: log.action,
          resource: log.resource,
          resourceId: log.resource_id,
          status: log.status,
          description: log.description
        }))
      };
    } catch (error) {
      console.error('[AuditService] Erro ao gerar relatório:', error);
      throw error;
    }
  }
}

module.exports = new AuditService();
