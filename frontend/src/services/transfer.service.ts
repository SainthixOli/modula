import api from './api';

export interface Transfer {
  id: string;
  patient_id: string;
  from_professional_id: string;
  to_professional_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    full_name: string;
  };
  from_professional?: {
    id: string;
    full_name: string;
  };
  to_professional?: {
    id: string;
    full_name: string;
  };
}

export interface CreateTransferData {
  patient_id: string;
  to_professional_id: string;
  reason: string;
}

/**
 * Busca transferências (admin vê todas, profissional vê as suas)
 * GET /api/transfers
 */
export const getTransfers = async (): Promise<Transfer[]> => {
  const response = await api.get('/transfers');
  return response.data.data || [];
};

/**
 * Cria uma nova solicitação de transferência
 * POST /api/transfers
 */
export const createTransfer = async (data: CreateTransferData): Promise<Transfer> => {
  const response = await api.post('/transfers', data);
  return response.data.data;
};

/**
 * Aprova uma transferência (admin)
 * PUT /api/transfers/:id/approve
 */
export const approveTransfer = async (id: string): Promise<void> => {
  await api.put(`/transfers/${id}/approve`);
};

/**
 * Rejeita uma transferência (admin)
 * PUT /api/transfers/:id/reject
 */
export const rejectTransfer = async (id: string, reason?: string): Promise<void> => {
  await api.put(`/transfers/${id}/reject`, { reason });
};

/**
 * Cancela uma transferência (profissional que solicitou)
 * DELETE /api/transfers/:id
 */
export const cancelTransfer = async (id: string): Promise<void> => {
  await api.delete(`/transfers/${id}`);
};
