import api from './api';

// --- INTERFACES UNIFICADAS ---

// Esta é a interface para a LISTA de profissionais
export interface Professional {
  id: string;
  full_name: string; // Unificado para full_name
  email: string;
  phone: string;
  specialty: string;
  professional_register: string; // Unificado
  patient_count: number; 
  status: 'active' | 'inactive';
}

// Esta é a interface para as ESTATÍSTICAS
export interface DashboardStats {
  professionals: {
    total: number;
    active: number;
    inactive: number;
  };
  patients: {
    total: number;
  };
}

// Esta é a interface para os DETALHES de um profissional
export interface ProfessionalDetails {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  professional_register: string;
  status: 'active' | 'inactive';
  last_login: string;
  created_at: string;
  
  // <<< CORREÇÃO DO ALIAS (P maiúsculo) >>>
  Patients: { 
    id: string; 
    full_name: string; 
    status: string;
  }[];
  
  statistics: {
    total_patients: number;
    active_patients: number;
    sessions_in_month: number;
    attendance_rate: number;
    total_sessions: number;
  };
}

// --- FUNÇÕES DA API ---

/**
 * Busca a lista de todos os profissionais.
 */
export const getProfessionalsList = async (): Promise<Professional[]> => {
  console.log("Buscando a lista de profissionais...");
  const response = await api.get('/admin/professionals');
  return response.data.data; 
};

/**
 * Busca as estatísticas do dashboard administrativo.
 */
export const getAdminDashboardStats = async (): Promise<DashboardStats> => {
  console.log("Buscando estatísticas do dashboard...");
  const response = await api.get('/admin/dashboard');
  return response.data.data.overview; 
};

/**
 * Cria um novo profissional no banco de dados.
 */
export const createProfessional = async (professionalData: { 
  full_name: string; 
  email: string; 
  professional_register: string;
  phone?: string;
  specialty?: string;
}) => {
  console.log("Enviando dados para criar novo profissional...", professionalData);
  const response = await api.post('/admin/professionals', professionalData);
  return response.data;
};

/**
 * Busca os detalhes completos de um profissional específico.
 */
export const getProfessionalDetails = async (id: string): Promise<ProfessionalDetails> => {
  console.log(`Buscando detalhes do profissional com ID: ${id}`);
  const response = await api.get(`/admin/professionals/${id}`);
  return response.data.data;
};

/**
 * Reseta a senha de um profissional específico.
 */
export const resetPassword = async (professionalId: string) => {
  console.log(`Enviando requisição para resetar senha do ID: ${professionalId}`);
  const response = await api.post(`/admin/professionals/${professionalId}/reset-password`, {
    sendEmail: false 
  });
  return response.data;
};