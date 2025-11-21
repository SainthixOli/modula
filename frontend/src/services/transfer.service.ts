import api from './api';

export interface Transfer {
  id: string;
  patient_id: string;
  from_user_id: string;
  to_user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  cancelled_at?: string;
  completed_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  Patient?: {
    id: string;
    full_name: string;
    cpf: string;
  };
  FromUser?: {
    id: string;
    full_name: string;
    email: string;
  };
  ToUser?: {
    id: string;
    full_name: string;
    email: string;
  };
  ApprovedBy?: {
    id: string;
    full_name: string;
  };
}

export interface TransferStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

export interface CreateTransferData {
  patient_id: string;
  to_user_id: string;
  reason: string;
}

// ============================================
// PROFISSIONAL - Solicitações
// ============================================

/**
 * Solicitar transferência de paciente
 */
export const requestTransfer = async (data: CreateTransferData): Promise<Transfer> => {
  const response = await api.post('/transfers', data);
  return response.data.data.transfer;
};

/**
 * Listar minhas solicitações de transferência
 */
export const getMyTransferRequests = async (status?: string): Promise<Transfer[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/transfers/my-requests', { params });
  return response.data.data.transfers;
};

/**
 * Cancelar solicitação de transferência
 */
export const cancelTransfer = async (id: string): Promise<void> => {
  await api.post(`/transfers/${id}/cancel`);
};

// ============================================
// ADMIN - Gerenciamento
// ============================================

/**
 * Listar todas as transferências (admin)
 */
export const getAllTransfers = async (status?: string): Promise<Transfer[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/admin/transfers', { params });
  return response.data.data.transfers;
};

/**
 * Aprovar transferência (admin)
 */
export const approveTransfer = async (id: string): Promise<void> => {
  await api.put(`/admin/transfers/${id}/approve`);
};

/**
 * Rejeitar transferência (admin)
 */
export const rejectTransfer = async (id: string, reason: string): Promise<void> => {
  await api.put(`/admin/transfers/${id}/reject`, { reason });
};

/**
 * Estatísticas de transferências (admin)
 */
export const getTransferStats = async (): Promise<TransferStats> => {
  const response = await api.get('/admin/transfers/stats');
  return response.data.data.stats;
};

/**
 * Listar profissionais ativos (para seleção)
 */
export const getActiveProfessionals = async () => {
  const response = await api.get('/transfers/professionals');
  return response.data.data.professionals;
};
