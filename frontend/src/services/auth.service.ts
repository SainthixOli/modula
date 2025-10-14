import api from './api';

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

