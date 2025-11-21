import api from './api';

export interface NotificationTrigger {
  id: string;
  name: string;
  description: string;
  type: 'transfer' | 'session' | 'anamnesis' | 'patient' | 'system';
  event: string;
  enabled: boolean;
  schedule?: string; // Para triggers cron
  last_triggered?: string;
  trigger_count?: number;
}

export interface TriggerStats {
  total_triggers: number;
  active_triggers: number;
  inactive_triggers: number;
  total_notifications_sent: number;
  triggers_by_type: {
    [key: string]: number;
  };
}

/**
 * Busca todas as configurações de triggers
 * GET /api/notifications/admin/triggers
 */
export const getAllTriggers = async (): Promise<NotificationTrigger[]> => {
  try {
    const response = await api.get('/notifications/admin/triggers');
    return response.data.data?.triggers || [];
  } catch (error: any) {
    console.error('❌ Erro ao buscar triggers:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Atualiza o status de um trigger (ativar/desativar)
 * PUT /api/notifications/admin/triggers/:id
 */
export const updateTriggerStatus = async (
  id: string,
  enabled: boolean
): Promise<void> => {
  await api.put(`/notifications/admin/triggers/${id}`, { enabled });
};

/**
 * Testa um trigger manualmente
 * POST /api/notifications/admin/triggers/:id/test
 */
export const testTrigger = async (id: string): Promise<void> => {
  await api.post(`/notifications/admin/triggers/${id}/test`);
};

/**
 * Busca estatísticas dos triggers
 * GET /api/notifications/admin/triggers/stats
 */
export const getTriggerStats = async (): Promise<TriggerStats> => {
  try {
    const response = await api.get('/notifications/admin/triggers/stats');
    return response.data.data || {};
  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Força execução de um trigger específico
 * POST /api/notifications/admin/triggers/:type/execute
 */
export const executeTrigger = async (triggerType: string): Promise<void> => {
  await api.post(`/notifications/admin/triggers/${triggerType}/execute`);
};

// ============================================
// CRUD DE TRIGGERS CUSTOMIZADOS
// ============================================

export interface CustomTriggerInput {
  name: string;
  description?: string;
  type: 'transfer' | 'session' | 'anamnesis' | 'patient' | 'system' | 'custom';
  category: string;
  event_type: string;
  conditions?: Record<string, any>;
  notification_template: {
    type: string;
    priority: string;
    title: string;
    message: string;
    action_url?: string;
  };
  target_user_type: 'admin' | 'professional' | 'specific_user' | 'all';
  target_user_ids?: string[];
  schedule?: string;
  is_scheduled?: boolean;
  enabled?: boolean;
}

/**
 * Criar novo trigger customizado
 * POST /api/notifications/admin/triggers/custom
 */
export const createCustomTrigger = async (data: CustomTriggerInput): Promise<NotificationTrigger> => {
  const response = await api.post('/notifications/admin/triggers/custom', data);
  return response.data.data.trigger;
};

/**
 * Atualizar trigger customizado
 * PUT /api/notifications/admin/triggers/custom/:id
 */
export const updateCustomTrigger = async (id: string, data: Partial<CustomTriggerInput>): Promise<NotificationTrigger> => {
  const response = await api.put(`/notifications/admin/triggers/custom/${id}`, data);
  return response.data.data.trigger;
};

/**
 * Deletar trigger customizado
 * DELETE /api/notifications/admin/triggers/custom/:id
 */
export const deleteCustomTrigger = async (id: string): Promise<void> => {
  await api.delete(`/notifications/admin/triggers/custom/${id}`);
};
