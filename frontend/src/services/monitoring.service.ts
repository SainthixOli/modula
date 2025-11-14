/**
 * Serviço de Monitoramento
 * 
 * Funções para acessar métricas e health check do sistema
 */

import api from './api';

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'error';
  timestamp: string;
  uptime: string;
  database: string;
  issues?: string[];
}

export interface AdvancedHealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  uptime: {
    process: string;
    system: string;
  };
  database: {
    status: string;
    latency: string | null;
  };
  memory: {
    percentUsed: string;
    used: string;
    free: string;
    total: string;
  };
  cpu: {
    cores: number;
    load: number[];
  };
  issues: string[];
  metrics: {
    totalRequests: number;
    avgResponseTime: string;
    errorRate: string;
  };
}

export interface MetricsSummary {
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  activeSessions: number;
  uptime: string;
  memory: {
    percentUsed: number;
    used: string;
    total: string;
  };
  database: {
    status: string;
    connections: number;
  };
}

export interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  metadata?: any;
}

/**
 * Obter health check básico
 */
export const getHealthCheck = async (): Promise<HealthStatus> => {
  const response = await api.get('/monitoring/health');
  return response.data;
};

/**
 * Obter health check avançado (admin)
 */
export const getAdvancedHealthCheck = async (): Promise<AdvancedHealthStatus> => {
  const response = await api.get('/monitoring/health/advanced');
  return response.data;
};

/**
 * Obter resumo das métricas
 */
export const getMetricsSummary = async (): Promise<MetricsSummary> => {
  const response = await api.get('/monitoring/metrics/summary');
  return response.data;
};

/**
 * Obter alertas ativos
 */
export const getAlerts = async (status?: string): Promise<Alert[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/monitoring/alerts', { params });
  return response.data.alerts || [];
};

/**
 * Reconhecer alerta
 */
export const acknowledgeAlert = async (alertId: number): Promise<void> => {
  await api.patch(`/monitoring/alerts/${alertId}/acknowledge`);
};

/**
 * Resolver alerta
 */
export const resolveAlert = async (alertId: number): Promise<void> => {
  await api.patch(`/monitoring/alerts/${alertId}/resolve`);
};
