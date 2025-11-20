import api from './api';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  professional_register?: string;
  bio?: string;
  metadata?: {
    bio?: string;
    phone?: string;
    appearance_settings?: AppearanceSettings;
    notification_preferences?: NotificationPreferences;
  };
}

export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationPreferences {
  emailAppointments: boolean;
  emailReports: boolean;
  pushNotifications: boolean;
  smsReminders: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}

/**
 * Buscar perfil do usuário atual
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/professional/profile');
  return response.data.data;
};

/**
 * Atualizar perfil do usuário
 */
export const updateProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const response = await api.put('/professional/profile', data);
  
  // Se o nome foi atualizado, atualizar localStorage e disparar evento
  if (data.full_name) {
    localStorage.setItem('userName', data.full_name);
    // Disparar evento customizado para atualizar outras páginas
    window.dispatchEvent(new Event('userNameUpdated'));
  }
  
  return response.data.data;
};

/**
 * Alterar senha
 */
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await api.post('/professional/change-password', data);
};

/**
 * Buscar preferências de notificação do perfil do usuário
 */
export const getNotificationPreferences = (profile?: UserProfile): NotificationPreferences => {
  if (profile?.metadata?.notification_preferences) {
    return profile.metadata.notification_preferences;
  }
  return {
    emailAppointments: true,
    emailReports: true,
    pushNotifications: false,
    smsReminders: true,
  };
};

/**
 * Salvar preferências de notificação no backend
 */
export const saveNotificationPreferences = async (preferences: NotificationPreferences): Promise<void> => {
  await api.put('/professional/profile', {
    notification_preferences: preferences,
  });
};

/**
 * Buscar configurações de aparência do perfil do usuário
 */
export const getAppearanceSettings = (profile?: UserProfile): AppearanceSettings => {
  if (profile?.metadata?.appearance_settings) {
    return profile.metadata.appearance_settings;
  }
  return {
    theme: 'light',
    fontSize: 'medium',
  };
};

/**
 * Salvar configurações de aparência no backend
 */
export const saveAppearanceSettings = async (settings: AppearanceSettings): Promise<void> => {
  await api.put('/professional/profile', {
    appearance_settings: settings,
  });
  
  applyAppearanceSettings(settings);
};

/**
 * Aplicar configurações de aparência na interface
 */
export const applyAppearanceSettings = (settings: AppearanceSettings): void => {
  // Aplicar tema
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (settings.theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // Aplicar tamanho de fonte
  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };
  document.documentElement.style.fontSize = fontSizes[settings.fontSize];
};
