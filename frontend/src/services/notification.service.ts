import api from './api';

export interface Notification {
  id: string;
  type: 'session_reminder' | 'session_cancelled' | 'transfer_request' | 'system' | 'other';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

/**
 * Busca notificações do usuário logado
 * GET /api/notifications
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/notifications');
    console.log('📬 Resposta da API de notificações:', response.data);
    
    // Backend pode retornar { data: notifications } ou { data: { notifications } }
    const notifications = response.data.data?.notifications || response.data.data || response.data.notifications || [];
    console.log('📬 Notificações processadas:', notifications);
    
    return Array.isArray(notifications) ? notifications : [];
  } catch (error: any) {
    console.error('❌ Erro ao buscar notificações:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Marca notificação como lida
 * PUT /api/notifications/:id/read
 */
export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

/**
 * Marca todas as notificações como lidas
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};

/**
 * Deleta uma notificação
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
