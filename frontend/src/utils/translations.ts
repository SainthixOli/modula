/**
 * Utilitário para traduzir valores de campos do banco de dados para português
 */

export const translateGender = (gender: string | null | undefined): string => {
  if (!gender) return 'Não informado';
  
  const translations: Record<string, string> = {
    'male': 'Masculino',
    'female': 'Feminino',
    'other': 'Outro',
    'not_informed': 'Não informado'
  };
  
  return translations[gender] || gender;
};

export const translateMaritalStatus = (status: string | null | undefined): string => {
  if (!status) return 'Não informado';
  
  const translations: Record<string, string> = {
    'single': 'Solteiro(a)',
    'married': 'Casado(a)',
    'divorced': 'Divorciado(a)',
    'widowed': 'Viúvo(a)',
    'other': 'Outro'
  };
  
  return translations[status] || status;
};

export const translateSessionStatus = (status: string | null | undefined): string => {
  if (!status) return 'Não informado';
  
  const translations: Record<string, string> = {
    'scheduled': 'Agendada',
    'confirmed': 'Confirmada',
    'completed': 'Realizada',
    'cancelled': 'Cancelada',
    'no_show': 'Falta'
  };
  
  return translations[status] || status;
};

export const translatePatientStatus = (status: string | null | undefined): string => {
  if (!status) return 'Não informado';
  
  const translations: Record<string, string> = {
    'active': 'Ativo',
    'inactive': 'Inativo'
  };
  
  return translations[status] || status;
};

export const translateSessionType = (type: string | null | undefined): string => {
  if (!type) return 'Sessão';
  
  const translations: Record<string, string> = {
    // Traduções para valores já em português
    'Consulta': 'Consulta',
    'Retorno': 'Retorno',
    'Avaliação': 'Avaliação',
    'Sessão': 'Sessão',
    // Traduções para valores em inglês do banco
    'first_consultation': 'Primeira Consulta',
    'follow_up': 'Retorno',
    'evaluation': 'Avaliação',
    'session': 'Sessão',
    'therapy': 'Terapia',
    'therapy_session': 'Sessão de Terapia',
    'initial': 'Consulta Inicial',
    'Acompanhamento': 'Acompanhamento'
  };
  
  return translations[type] || type;
};

export const translateAnamnesisStatus = (status: string | null | undefined): string => {
  if (!status) return 'Não informado';
  
  const translations: Record<string, string> = {
    'draft': 'Rascunho',
    'in_progress': 'Em Andamento',
    'completed': 'Completa',
    'pending': 'Pendente',
    'reviewed': 'Revisada'
  };
  
  return translations[status] || status;
};
