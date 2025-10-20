import api from './api';

export const setupAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('Token encontrado. Configurando header de autorização...');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      full_name: string;
      email: string;
      user_type: 'admin' | 'professional';
      is_first_access: boolean;
    };
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
}

/**
 * Realiza o login do usuário.
 */
export const login = async (email, password) => {
  console.log('Executando serviço de login...');
  const response = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  });

  const { data } = response.data;

  if (data?.tokens?.access_token) {
    const { access_token } = data.tokens;
    localStorage.setItem('authToken', access_token);
    window.dispatchEvent(new Event("authChange"));
    console.log('Login realizado, token salvo e evento "authChange" disparado!');
    return data.user;
  }

  throw new Error('Token de acesso não encontrado na resposta da API.');
};

/**
 * Desloga o usuário.
 */
export const logout = () => {
  console.log('Executando serviço de logout...');
  localStorage.removeItem('authToken');
  window.dispatchEvent(new Event("authChange"));
  console.log('Logout realizado, token removido e evento "authChange" disparado!');
};

/**
 * Solicita recuperação de senha.
 */
export const forgotPassword = async (email: string) => {
  console.log('Executando serviço de forgotPassword para:', email);
  const response = await api.post('/auth/forgot-password', { email });
  return response;
};

/**
 * Redefine a senha usando o token enviado por email.
 */
export const resetPassword = async (token: string, password: string) => {
  console.log('Executando resetPassword com token:', token);
  const response = await api.post('/auth/reset-password', { token, password });
  return response;
};

/**
 * Altera a senha do usuário no primeiro acesso.
 */
export const changeFirstPassword = async (password: string, confirmPassword: string) => {
  console.log("Enviando nova senha para a API...");
  const response = await api.post('/auth/first-access', { password, confirmPassword });

  if (response.data.data?.tokens?.access_token) {
    const { access_token } = response.data.data.tokens;
    localStorage.setItem('authToken', access_token);
    window.dispatchEvent(new Event("authChange"));
  }
  
  return response.data;
};