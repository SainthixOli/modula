import api from './api';

// --- Interfaces para Pacientes ---

export interface Patient {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  status: 'active' | 'inactive';
}

export interface PatientDetails {
  id: string; 
  user_id?: string; 
  full_name: string; 
  birth_date?: string | null; 
  gender?: string | null; 
  cpf?: string | null; 
  rg?: string | null; 
  phone?: string | null; 
  email?: string | null; 
  address?: string | null; 
  emergency_contact?: object | null; 
  marital_status?: string | null; 
  occupation?: string | null; 
  insurance_info?: object | null; 
  status: 'active' | 'inactive'; 
  notes?: string | null; 
  medical_history?: string | null; 
  current_medications?: string | null; 
  allergies?: string | null; 
  first_appointment?: string | null; 
  last_appointment?: string | null;
  metadata?: object | null; 
  created_at?: string; 
  updated_at?: string; 
  deleted_at?: string | null; 
  age?: number; 
  sessions?: any[]; 
}

export interface CreatePatientData {
  full_name: string;
  birth_date: string;
  cpf: string;
  phone: string;
  gender?: string;
  rg?: string;
  marital_status?: string;
  occupation?: string;
  email?: string;
  address?: string;
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
  notes?: string;
}

export interface PatientFormData {
  full_name?: string;
  birth_date?: string;
  cpf?: string;
  phone?: string;
  gender?: string; 
  rg?: string;
  marital_status?: string; 
  occupation?: string;
  email?: string;
  address?: string; 
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
  notes?: string;
}

// --- Interfaces para Sessões (Agenda) ---

export interface Session {
  id: string;
  session_date: string; // Vem como string da API
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  duration: number;
  notes?: string;
  patient: {
    id: string;
    full_name: string;
  };
}

export interface SessionPayload {
  patientId: string;
  sessionDate: Date;
  duration: number;
  notes?: string;
  status?: Session['status'];
}


// --- Funções de Pacientes ---

export const getMyPatients = async (): Promise<Patient[]> => {
  const response = await api.get('/professional/patients');
  return response.data.data;
};

export const createPatient = async (patientData: CreatePatientData) => {
  const response = await api.post('/professional/patients', patientData);
  return response.data;
};

export const getPatientDetails = async (id: string): Promise<PatientDetails> => {
  console.log(`Buscando detalhes do paciente com ID: ${id}`);
  const response = await api.get(`/professional/patients/${id}`);
  return response.data.data;
};

/**
 * Busca os detalhes de um paciente específico pelo ID.
 */
const getPatientById = async (id: string): Promise<Patient> => {
  console.log(`Buscando detalhes do paciente com ID: ${id}`);
  const response = await api.get(`/professional/patients/${id}`); 
  return response.data.data; 
};

/**
 * Atualiza os dados de um paciente existente.
 * @param id - O ID do paciente a ser atualizado.
 * @param patientData - Os novos dados do paciente (interface PatientFormData).
 */
const updatePatient = async (id: string, patientData: Partial<PatientFormData>): Promise<Patient> => {
  console.log(`Enviando atualização para o paciente com ID: ${id}`, patientData);
  // Usa a rota PUT que já existe no backend
  const response = await api.put(`/professional/patients/${id}`, patientData);
  return response.data.data; // Retorna o paciente atualizado
};

// Adiciona as funções novas no objeto exportado
export const professionalService = {
 getMyPatients, 
  createPatient, 
  getPatientById,
  updatePatient,
  getPatientDetails, 
};


// --- Funções para a Agenda ---

/**
 * Busca as sessões de um profissional em um determinado período.
 * Mapeia para a função 'listSessions' do backend.
 */
export const getSessions = async (startDate: Date, endDate: Date): Promise<Session[]> => {
  const response = await api.get('/sessions', {
    params: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }
  });

  return Array.isArray(response.data.data) ? response.data.data : [];
};

/**
 * Cria uma nova sessão.
 * Mapeia para a função 'createSession' do backend.
 */
export const createSession = async (data: SessionPayload): Promise<Session> => {
  const response = await api.post('/sessions', data);
  return response.data.data;
};

/**
 * Atualiza uma sessão existente.
 * Mapeia para a função 'updateScheduledSession' do backend.
 */
export const updateSession = async (id: string, data: Partial<SessionPayload>): Promise<Session> => {
  // Vamos assumir que a rota de update é a padrão 'PUT /api/professional/sessions/:id'
  const response = await api.put(`/sessions/${id}`, data);
  return response.data.data;
};

/**
 * Exclui/Cancela uma sessão.
 * Mapeia para a função 'cancelSession' do backend (que é mais segura).
 */
export const deleteSession = async (id: string): Promise<void> => {
  
  await api.delete(`/sessions/${id}`);
};

