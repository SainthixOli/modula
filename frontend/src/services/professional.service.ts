import api from './api';

// --- Interfaces para Pacientes ---

export interface Patient {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  status: 'active' | 'inactive';
}

export interface PatientDetails extends Patient {
  cpf: string;
  phone: string;
  email: string;
  address: { street?: string, number?: string, city?: string } | string | null;
  marital_status: string;
  occupation: string;
  first_appointment: string;
  last_appointment: string;
  sessions: any[];
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


// --- Funções de Pacientes (EXISTENTES) ---

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
  // Vamos assumir que a rota para cancelar é 'DELETE /api/professional/sessions/:id'
  // ou 'PUT /api/professional/sessions/:id/cancel'. DELETE é mais padrão.
  await api.delete(`/sessions/${id}`);
};