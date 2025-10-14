import api from './api';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  register: string;
  patient_count: number; 
  status: 'active' | 'inactive';
}

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


export interface Professional {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  professional_register: string; 
  patient_count: number;
  status: 'active' | 'inactive';
}

/**
 * Cria um novo profissional no banco de dados.
 * @param professionalData - Os dados do novo profissional.
 * @returns A resposta da API.
 */
export const createProfessional = async (professionalData: { 
  full_name: string; 
  email: string; 
  professional_register: string 
}) => {
  console.log("Enviando dados para criar novo profissional...", professionalData);
  const response = await api.post('/admin/professionals', professionalData);
  return response.data;
};
