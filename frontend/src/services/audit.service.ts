/**
 * Serviço de Auditoria
 * 
 * Funções para acessar logs de auditoria
 */

import api from './api';

export interface AuditLog {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  resource: string;
  resourceId: number | null;
  details: any;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'error';
  errorMessage: string | null;
  timestamp: string;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: number;
  action?: string;
  resource?: string;
  resourceId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogsResponse {
  success: boolean;
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Obter logs de auditoria com filtros
 */
export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLogsResponse> => {
  const response = await api.get('/audit/logs', { params: filters });
  return response.data;
};

/**
 * Obter detalhes de um log específico
 */
export const getAuditLogById = async (id: number): Promise<AuditLog> => {
  const response = await api.get(`/audit/logs/${id}`);
  return response.data;
};

/**
 * Obter estatísticas de auditoria
 */
export const getAuditStats = async (): Promise<any> => {
  const response = await api.get('/audit/stats');
  return response.data;
};

/**
 * Exportar logs de auditoria
 */
export const exportAuditLogs = async (filters?: AuditLogFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  const response = await api.get(`/audit/export/${format}`, {
    params: filters,
    responseType: 'blob'
  });
  return response.data;
};
