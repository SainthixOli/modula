import api from './api';

// --- Interfaces para Dashboard ---

export interface ProfessionalDashboardStats {
  totalPatients: number;
  activePatients: number;
  todaySessions: number;
  completedSessions: number;
  canceledSessions: number;
  upcomingSessions: any[];
  recentPatients: any[];
}

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
  patient_id: string;
  user_id: string;
  session_number: number;
  session_date: string; // ISO string da API
  session_type: string;
  duration_minutes: number;
  duration: number; // Alias para compatibilidade
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  is_billable?: boolean;
  reminder_sent?: boolean;
  patient: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
  Patient?: { // Alias para compatibilidade
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
}

export interface SessionPayload {
  patient_id: string;
  session_date: string; // ISO string
  session_time: string; // HH:MM formato 24h
  session_type: string; // first_consultation, follow_up, etc.
  duration_minutes: number;
  notes?: string;
  status?: Session['status'];
}

// --- Interfaces para Anamnese ---

export interface AnamnesisIdentification {
  assessment_date?: string | Date;
  [key: string]: any;
}

export interface AnamnesisFamilyHistory {
  description?: string;
  [key: string]: any;
}

interface MedicationObject {
  name: string;
  dose?: string;
  frequency?: string;
  [key: string]: any;
}

export interface AnamnesisMedicalHistory {
  current_medications?: MedicationObject[]; 
  [key: string]: any;
}

export interface AnamnesisPsychologicalHistory {
  current_mood?: 'Estável' | 'Ansioso' | 'Deprimido' | 'Eufórico' | string;
  previous_treatment_history?: string;
  suicidal_thoughts?: 'Sim' | 'Não' | 'Não informado' | string;
  [key: string]: any;
}

export interface AnamnesisCurrentComplaint {
  main_complaint?: string;
  onset?: string | object; 
  duration?: string;
  symptoms?: string[];
  [key: string]: any;
}


export interface Anamnesis {
  id: string;
  patient_id: string;
  user_id: string; // ID do profissional
  status: 'draft' | 'completed' | string;
  completion_percentage: number;
  completed_at: string | null;
  last_modified_section: string | null;
  
  // Seções JSONB
  identification: AnamnesisIdentification;
  family_history: AnamnesisFamilyHistory;
  medical_history: AnamnesisMedicalHistory;
  psychological_history: AnamnesisPsychologicalHistory;
  current_complaint: AnamnesisCurrentComplaint;
  
  // Outras seções (pode preencher depois)
  lifestyle: object;
  relationships: object;
  treatment_goals: object;
  
  // Campos de texto
  professional_observations: string | null;
  clinical_impression: string | null;
  initial_treatment_plan: string | null;
  
  metadata: object;
  revision_count: number;
  last_auto_save: string | null;
  created_at: string;
  updated_at: string;
}


export interface CreateAnamnesisPayload {
  patientId: string; // O backend deve converter para patient_id
  
  // Enviamos os objetos JSONB correspondentes ao formulário
  identification?: AnamnesisIdentification;
  family_history?: AnamnesisFamilyHistory;
  medical_history?: AnamnesisMedicalHistory;
  psychological_history?: AnamnesisPsychologicalHistory;
  current_complaint?: AnamnesisCurrentComplaint;

  // Outros campos de texto (se o seu form de criação já tiver)
  professional_observations?: string;
  clinical_impression?: string;
  initial_treatment_plan?: string;
}


export type UpdateAnamnesisPayload = Omit<Partial<CreateAnamnesisPayload>, 'patientId'> & {
  status?: 'draft' | 'completed';
};

// --- Funções de Pacientes ---

export const getMyPatients = async (): Promise<Patient[]> => {
  const response = await api.get('/professional/patients');
  return response.data.data;
};

export const createPatient = async (patientData: CreatePatientData) => {
  const response = await api.post('/professional/patients', patientData);
  return response.data;
};

/**
 * Atualiza o status de um paciente (ex: 'active', 'inactive').
 * @param id - O ID do paciente.
 * @param newStatus - O novo status ('active' ou 'inactive').
 * @param reason - Opcional: Motivo da alteração (para auditoria).
 */
export const updatePatientStatus = async (id: string, newStatus: 'active' | 'inactive', reason?: string): Promise<PatientDetails> => { // Retorna os detalhes atualizados
  console.log(`Atualizando status do paciente ${id} para ${newStatus}`);
  const payload: { status: string; reason?: string } = { status: newStatus };
  if (reason) {
    payload.reason = reason;
  }
  const response = await api.put(`/professional/patients/${id}/status`, payload);
  return response.data.data; // A API retorna o paciente atualizado
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

// --- Funções para a Agenda ---

/**
 * Busca as sessões de um profissional em um determinado período.
 * Mapeia para a função 'listSessions' do backend.
 */
export const getSessions = async (startDate: Date, endDate: Date): Promise<Session[]> => {
  const response = await api.get('/sessions', {
    params: {
      date_from: startDate.toISOString(),
      date_to: endDate.toISOString(),
    }
  });

  // Backend retorna { success, data: { sessions, pagination } }
  return Array.isArray(response.data.data?.sessions) ? response.data.data.sessions : [];
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
export const deleteSession = async (id: string, cancellation_reason?: string): Promise<void> => {
  await api.delete(`/sessions/${id}`, {
    data: { 
      cancellation_reason: cancellation_reason || 'Cancelado pelo profissional' 
    }
  });
};

// --- Funções para Anamnese ---

/**
 * 
 * Rota: POST /api/anamnesis
 */
export async function createAnamnesis(data: CreateAnamnesisPayload): Promise<Anamnesis> {
  console.log('Enviando dados da anamnese:', data);
  const { patientId, ...restOfData } = data; 
  const response = await api.post(`/anamnesis/patient/${patientId}`, restOfData); 
  return response.data.data; 
};

export async function getAnamnesisByPatient(patientId: string): Promise<Anamnesis[]> {
  console.log(`Buscando anamneses para o paciente: ${patientId}`);
  
  try {
    const response = await api.get(`/anamnesis/patient/${patientId}`); 
    
    
    const anamnesis = response.data.data.anamnesis; 

    if (anamnesis && anamnesis.id) {
      console.log('getAnamnesisByPatient SUCESSO, ID encontrado:', anamnesis.id);
      return [anamnesis]; // Retorna a anamnese num array
    }
    
    // Se o backend retornou 200 mas o 'data.data.anamnesis' tá zoado
    console.error('getAnamnesisByPatient FALHOU: O objeto data.data.anamnesis está inválido.', response.data);
    return [];

  } catch (error) {
    // Se o GET deu 404, 500, etc.
    console.error('getAnamnesisByPatient ERRO CRÍTICO (catch):', error);
    return [];
  }
};

/**
 * Rota: GET /api/anamnesis/:id
 */
export async function getAnamnesisById(id: string): Promise<Anamnesis> {
  console.log(`Buscando anamnese com ID: ${id}`);
  const response = await api.get(`/anamnesis/${id}`);
  return response.data.data;
};

/**
 * GET /api/professional/dashboard
 * Buscar estatísticas do dashboard do profissional
 */
export async function getProfessionalDashboard(): Promise<ProfessionalDashboardStats> {
  const response = await api.get('/professional/dashboard');
  return response.data.data;
}

/**
 * Rota: PUT /api/anamnesis/:id/section/:sectionName
 */
export async function updateAnamnesisSection(
  id: string, 
  sectionName: string, 
  data: object 
): Promise<Anamnesis> {
  console.log(`Atualizando seção ${sectionName} da anamnese ${id}`, data);
  const response = await api.put(`/anamnesis/${id}/section/${sectionName}`, data);
  return response.data.data; // Retorna a anamnese atualizada
};


// Adiciona as funções novas no objeto exportado
export const professionalService = {
 getMyPatients, 
  createPatient, 
  getPatientById,
  updatePatient,
  getPatientDetails, 
  updatePatientStatus,
  createAnamnesis,
  getAnamnesisByPatient,
  getAnamnesisById,
  updateAnamnesisSection,
  getProfessionalDashboard,
};



