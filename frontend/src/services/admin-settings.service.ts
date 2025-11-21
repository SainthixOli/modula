import api from './api';

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  allow_new_registrations: boolean;
  require_email_verification: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
}

// Configurações de Email
export const getEmailSettings = async (): Promise<EmailSettings> => {
  const response = await api.get('/admin/settings/email');
  return response.data;
};

export const updateEmailSettings = async (data: EmailSettings): Promise<EmailSettings> => {
  const response = await api.put('/admin/settings/email', data);
  return response.data;
};

// Configurações do Sistema
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await api.get('/admin/settings/system');
  return response.data;
};

export const updateSystemSettings = async (data: SystemSettings): Promise<SystemSettings> => {
  const response = await api.put('/admin/settings/system', data);
  return response.data;
};

// Perfil do Admin
export const getAdminProfile = async () => {
  const response = await api.get('/admin/profile');
  return response.data;
};

export const updateAdminProfile = async (data: any) => {
  const response = await api.put('/admin/profile', data);
  
  // Atualizar localStorage se o nome foi alterado
  if (data.full_name) {
    localStorage.setItem('userName', data.full_name);
    window.dispatchEvent(new Event('userNameUpdated'));
  }
  
  return response.data;
};

export const changeAdminPassword = async (currentPassword: string, newPassword: string) => {
  await api.post('/admin/change-password', { currentPassword, newPassword });
};

// Funções de Aparência para Admin
export const getAdminAppearanceSettings = (profile: any) => {
  const metadata = profile?.metadata || {};
  const appearance = metadata.appearance_settings || {};
  
  return {
    theme: appearance.theme || 'light',
    fontSize: appearance.fontSize || 'medium',
  };
};

export const saveAdminAppearanceSettings = async (settings: { theme: string; fontSize: string }) => {
  await updateAdminProfile({
    appearance_settings: settings,
  });
  
  // Aplicar tema
  applyAdminAppearanceSettings(settings);
};

export const applyAdminAppearanceSettings = (settings: { theme: string; fontSize: string }) => {
  const root = document.documentElement;
  
  // Aplicar tema
  if (settings.theme === 'dark') {
    root.classList.add('dark');
  } else if (settings.theme === 'light') {
    root.classList.remove('dark');
  } else if (settings.theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  
  // Aplicar tamanho da fonte
  root.classList.remove('font-small', 'font-medium', 'font-large');
  if (settings.fontSize === 'small') {
    root.classList.add('font-small');
  } else if (settings.fontSize === 'large') {
    root.classList.add('font-large');
  } else {
    root.classList.add('font-medium');
  }
};
