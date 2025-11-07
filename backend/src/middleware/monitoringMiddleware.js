/**
 * Middleware de Monitoramento
 * 
 * Coleta métricas de todas as requisições
 */

const metricsService = require('../services/metricsService');
const alertService = require('../services/alertService');

/**
 * Middleware para coletar métricas de requisições
 */
const collectMetrics = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturar o método original de res.json para interceptar a resposta
  const originalJson = res.json;
  const originalSend = res.send;
  const originalEnd = res.end;

  // Função para registrar a métrica
  const recordMetric = () => {
    const responseTime = Date.now() - startTime;
    const endpoint = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    // Registrar métrica
    metricsService.recordRequest(method, endpoint, statusCode, responseTime);

    // Verificar se é erro crítico
    if (statusCode >= 500) {
      const error = {
        message: `Erro ${statusCode} em ${method} ${endpoint}`,
        statusCode,
        method,
        endpoint,
        responseTime
      };
      alertService.checkAndAlert('critical_error', error);
    }

    // Verificar tempo de resposta lento
    if (responseTime > 5000) {
      alertService.checkAndAlert('slow_response', {
        endpoint: `${method} ${endpoint}`,
        responseTime,
        threshold: 5000
      });
    }
  };

  // Interceptar res.json
  res.json = function (data) {
    recordMetric();
    return originalJson.call(this, data);
  };

  // Interceptar res.send
  res.send = function (data) {
    recordMetric();
    return originalSend.call(this, data);
  };

  // Interceptar res.end
  res.end = function (data) {
    recordMetric();
    return originalEnd.call(this, data);
  };

  next();
};

/**
 * Middleware para capturar erros não tratados
 */
const captureErrors = (err, req, res, next) => {
  const endpoint = req.route ? req.route.path : req.path;
  const method = req.method;
  const statusCode = err.statusCode || 500;

  // Registrar erro nas métricas
  metricsService.recordError(method, endpoint, statusCode, err);

  // Enviar alerta de erro crítico
  if (statusCode >= 500) {
    alertService.checkAndAlert('critical_error', {
      message: err.message,
      stack: err.stack,
      method,
      endpoint,
      statusCode
    });
  }

  next(err);
};

module.exports = {
  collectMetrics,
  captureErrors
};
