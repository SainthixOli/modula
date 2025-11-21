/**
 * Serviço de Auditoria
 * 
 * Funções para acessar logs de auditoria
 */

import api from './api';

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string | null;
  timestamp?: string;
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
  const rawLogs = response.data.data || [];
  
  // Mapear campos do backend para o formato esperado pelo frontend
  const logs = rawLogs.map((log: any) => ({
    ...log,
    createdAt: log.created_at || log.createdAt,
    userName: log.user_name || log.userName,
    userEmail: log.user_email || log.userEmail,
    userId: log.user_id || log.userId,
    resourceId: log.resource_id || log.resourceId,
    ipAddress: log.ip_address || log.ipAddress,
    userAgent: log.user_agent || log.userAgent,
    errorMessage: log.error_message || log.errorMessage
  }));
  
  const total = response.data.count || logs.length;
  const limit = filters?.limit || 100;
  const page = Math.floor((filters?.offset || 0) / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: response.data.success,
    logs,
    total,
    page,
    totalPages
  };
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
