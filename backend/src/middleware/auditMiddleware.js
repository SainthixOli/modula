/**
 * Middleware de Auditoria
 * 
 * Intercepta requisições e registra automaticamente ações de auditoria
 */

const auditService = require('../services/auditService');

/**
 * Middleware para auditar automaticamente operações
 * Deve ser aplicado após a autenticação (validateToken)
 */
const auditMiddleware = (options = {}) => {
  return async (req, res, next) => {
    // Armazenar dados originais para comparação
    req.auditData = {
      startTime: new Date(),
      resource: options.resource,
      action: options.action || req.method
    };

    // Interceptar res.json para capturar resposta
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Registrar auditoria apenas se a operação foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Agendar log de auditoria (não bloquear resposta)
        setImmediate(async () => {
          try {
            await logAuditFromResponse(req, res, data, options);
          } catch (error) {
            console.error('[AuditMiddleware] Erro ao registrar log:', error);
          }
        });
      }
      
      return originalJson(data);
    };

    next();
  };
};

/**
 * Registrar log baseado na resposta
 */
async function logAuditFromResponse(req, res, responseData, options) {
  const requestInfo = auditService.extractRequestInfo(req);
  const userInfo = auditService.extractUserInfo(req.user);

  const action = mapMethodToAction(req.method, options.action);
  const resource = options.resource || 'unknown';
  
  // Extrair ID do recurso da resposta ou params
  let resourceId = null;
  if (responseData && responseData.data && responseData.data.id) {
    resourceId = responseData.data.id;
  } else if (req.params && req.params.id) {
    resourceId = req.params.id;
  }

  // Construir descrição
  const description = options.description || `${action} em ${resource}`;

  await auditService.logAction({
    ...userInfo,
    ...requestInfo,
    action,
    resource,
    resourceId,
    newData: options.includeData ? responseData.data : null,
    description,
    metadata: {
      method: req.method,
      path: req.path,
      query: req.query,
      statusCode: res.statusCode
    }
  });
}

/**
 * Mapear método HTTP para ação de auditoria
 */
function mapMethodToAction(method, customAction) {
  if (customAction) return customAction;

  const mapping = {
    'GET': 'READ',
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };

  return mapping[method] || 'READ';
}

/**
 * Middleware específico para auditar criação
 */
const auditCreate = (resource) => {
  return auditMiddleware({
    resource,
    action: 'CREATE',
    includeData: true
  });
};

/**
 * Middleware específico para auditar leitura de dados sensíveis
 */
const auditRead = (resource) => {
  return auditMiddleware({
    resource,
    action: 'READ',
    includeData: false
  });
};

/**
 * Middleware específico para auditar atualização
 */
const auditUpdate = (resource) => {
  return auditMiddleware({
    resource,
    action: 'UPDATE',
    includeData: true
  });
};

/**
 * Middleware específico para auditar exclusão
 */
const auditDelete = (resource) => {
  return auditMiddleware({
    resource,
    action: 'DELETE',
    includeData: false
  });
};

/**
 * Middleware para auditar exportação de dados
 */
const auditExport = (resource) => {
  return async (req, res, next) => {
    const originalSend = res.send.bind(res);
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            await auditService.logExport(
              req,
              resource,
              req.query,
              `Exportação de ${resource}`
            );
          } catch (error) {
            console.error('[AuditMiddleware] Erro ao registrar exportação:', error);
          }
        });
      }
      
      return originalSend(data);
    };

    next();
  };
};

/**
 * Middleware para auditar acesso negado
 */
const auditAccessDenied = async (req, resource, reason) => {
  try {
    await auditService.logAccessDenied(
      req,
      resource,
      req.params.id,
      reason
    );
  } catch (error) {
    console.error('[AuditMiddleware] Erro ao registrar acesso negado:', error);
  }
};

module.exports = {
  auditMiddleware,
  auditCreate,
  auditRead,
  auditUpdate,
  auditDelete,
  auditExport,
  auditAccessDenied
};
