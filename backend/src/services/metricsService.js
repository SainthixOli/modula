/**
 * Serviço de Métricas
 * 
 * Coleta e armazena métricas de performance do sistema
 */

const os = require('os');

class MetricsService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byMethod: {},
        byEndpoint: {},
        byStatusCode: {}
      },
      performance: {
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        totalResponseTime: 0
      },
      errors: [],
      startTime: new Date()
    };

    // Limite de erros armazenados
    this.maxErrorsStored = 100;
  }

  /**
   * Registrar requisição
   */
  recordRequest(method, endpoint, statusCode, responseTime, error = null) {
    // Incrementar total
    this.metrics.requests.total++;

    // Incrementar por status
    if (statusCode >= 200 && statusCode < 300) {
      this.metrics.requests.success++;
    } else if (statusCode >= 400) {
      this.metrics.requests.errors++;
    }

    // Incrementar por método
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;

    // Incrementar por endpoint
    const endpointKey = `${method} ${endpoint}`;
    this.metrics.requests.byEndpoint[endpointKey] = (this.metrics.requests.byEndpoint[endpointKey] || 0) + 1;

    // Incrementar por status code
    this.metrics.requests.byStatusCode[statusCode] = (this.metrics.requests.byStatusCode[statusCode] || 0) + 1;

    // Atualizar métricas de performance
    if (responseTime) {
      this.metrics.performance.totalResponseTime += responseTime;
      this.metrics.performance.avgResponseTime = 
        this.metrics.performance.totalResponseTime / this.metrics.requests.total;
      
      if (responseTime < this.metrics.performance.minResponseTime) {
        this.metrics.performance.minResponseTime = responseTime;
      }
      
      if (responseTime > this.metrics.performance.maxResponseTime) {
        this.metrics.performance.maxResponseTime = responseTime;
      }
    }

    // Registrar erro se houver
    if (error) {
      this.recordError(method, endpoint, statusCode, error);
    }
  }

  /**
   * Registrar erro
   */
  recordError(method, endpoint, statusCode, error) {
    const errorRecord = {
      timestamp: new Date(),
      method,
      endpoint,
      statusCode,
      message: error.message || error,
      stack: error.stack,
      type: error.name || 'Error'
    };

    this.metrics.errors.unshift(errorRecord);

    // Manter apenas os últimos N erros
    if (this.metrics.errors.length > this.maxErrorsStored) {
      this.metrics.errors = this.metrics.errors.slice(0, this.maxErrorsStored);
    }
  }

  /**
   * Obter métricas de sistema (CPU, memória)
   */
  getSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        load: os.loadavg()
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        percentUsed: ((usedMem / totalMem) * 100).toFixed(2),
        totalFormatted: this.formatBytes(totalMem),
        freeFormatted: this.formatBytes(freeMem),
        usedFormatted: this.formatBytes(usedMem)
      },
      process: {
        uptime: process.uptime(),
        uptimeFormatted: this.formatUptime(process.uptime()),
        memory: process.memoryUsage(),
        memoryFormatted: {
          rss: this.formatBytes(process.memoryUsage().rss),
          heapTotal: this.formatBytes(process.memoryUsage().heapTotal),
          heapUsed: this.formatBytes(process.memoryUsage().heapUsed),
          external: this.formatBytes(process.memoryUsage().external)
        },
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
      },
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        uptimeFormatted: this.formatUptime(os.uptime())
      }
    };
  }

  /**
   * Obter status de saúde do sistema
   */
  getHealthStatus() {
    const system = this.getSystemMetrics();
    const memoryPercent = parseFloat(system.memory.percentUsed);
    const errorRate = this.metrics.requests.total > 0 
      ? (this.metrics.requests.errors / this.metrics.requests.total) * 100 
      : 0;

    // Determinar status de saúde
    let status = 'healthy';
    let issues = [];

    // Verificar uso de memória
    if (memoryPercent > 90) {
      status = 'critical';
      issues.push('Uso de memória crítico (>90%)');
    } else if (memoryPercent > 75) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push('Uso de memória alto (>75%)');
    }

    // Verificar taxa de erros
    if (errorRate > 10) {
      status = 'critical';
      issues.push(`Taxa de erros alta (${errorRate.toFixed(2)}%)`);
    } else if (errorRate > 5) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push(`Taxa de erros elevada (${errorRate.toFixed(2)}%)`);
    }

    // Verificar tempo de resposta médio
    if (this.metrics.performance.avgResponseTime > 5000) {
      status = 'critical';
      issues.push('Tempo de resposta muito alto (>5s)');
    } else if (this.metrics.performance.avgResponseTime > 2000) {
      status = status === 'healthy' ? 'warning' : status;
      issues.push('Tempo de resposta alto (>2s)');
    }

    return {
      status,
      issues,
      timestamp: new Date(),
      metrics: {
        memoryUsage: memoryPercent,
        errorRate: errorRate.toFixed(2),
        avgResponseTime: this.metrics.performance.avgResponseTime.toFixed(2),
        uptime: system.process.uptime
      }
    };
  }

  /**
   * Obter todas as métricas
   */
  getAllMetrics() {
    return {
      requests: this.metrics.requests,
      performance: {
        ...this.metrics.performance,
        avgResponseTime: parseFloat(this.metrics.performance.avgResponseTime.toFixed(2)),
        minResponseTime: this.metrics.performance.minResponseTime === Infinity ? 0 : this.metrics.performance.minResponseTime,
        maxResponseTime: this.metrics.performance.maxResponseTime
      },
      errors: {
        recent: this.metrics.errors.slice(0, 10),
        total: this.metrics.errors.length
      },
      system: this.getSystemMetrics(),
      health: this.getHealthStatus(),
      uptime: {
        started: this.metrics.startTime,
        seconds: process.uptime(),
        formatted: this.formatUptime(process.uptime())
      }
    };
  }

  /**
   * Obter resumo de métricas
   */
  getSummary() {
    const health = this.getHealthStatus();
    
    return {
      status: health.status,
      uptime: this.formatUptime(process.uptime()),
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        errors: this.metrics.requests.errors,
        successRate: this.metrics.requests.total > 0 
          ? ((this.metrics.requests.success / this.metrics.requests.total) * 100).toFixed(2) 
          : '0.00'
      },
      performance: {
        avgResponseTime: this.metrics.performance.avgResponseTime.toFixed(2) + 'ms'
      },
      memory: {
        percentUsed: health.metrics.memoryUsage + '%'
      },
      recentErrors: this.metrics.errors.slice(0, 5)
    };
  }

  /**
   * Resetar métricas
   */
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byMethod: {},
        byEndpoint: {},
        byStatusCode: {}
      },
      performance: {
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        totalResponseTime: 0
      },
      errors: [],
      startTime: new Date()
    };

    console.log('[MetricsService] Métricas resetadas');
  }

  /**
   * Formatar bytes para formato legível
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Formatar uptime para formato legível
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

module.exports = new MetricsService();
