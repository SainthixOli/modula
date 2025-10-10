// src/services/auth.service.ts
import api from './api';

/**
 * DOCUMENTAÇÃO - Serviço de Autenticação
 * * Este serviço é responsável por toda a comunicação com os endpoints
 * de autenticação da API Módula (/api/auth/*).
 */

// Define o formato da resposta de login, baseado na sua documentação
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

// ---- FUNÇÕES EXPORTADAS ----

/**
 * Realiza o login do usuário.
 * @param email - O email do usuário.
 * @param password - A senha do usuário.
 * @returns Os dados do usuário logado.
 */
export const login = async (email, password) => {
  console.log('Executando serviço de login...');
  
  // Faz a chamada POST para o endpoint de login
  const response = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  });

  const { data } = response.data; // Pega o campo "data" da resposta

  if (data?.tokens?.access_token) {
    const { access_token } = data.tokens;
    const { user } = data;

    // 1. Armazena o token no localStorage
    localStorage.setItem('authToken', access_token);

    // 2. Define o token no header de autorização padrão do Axios
    // A partir daqui, toda requisição feita com 'api' já vai com esse header
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    console.log('Login realizado e token armazenado com sucesso!');
    
    // 3. Retorna os dados do usuário para o componente
    return user;
  }

  // Se algo der errado e não vier um token, lança um erro
  throw new Error('Token de acesso não encontrado na resposta da API.');
};

/**
 * Desloga o usuário.
 */
export const logout = () => {
  console.log('Executando serviço de logout...');

  // 1. Remove o token do localStorage
  localStorage.removeItem('authToken');

  // 2. Remove o header de autorização do Axios
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Verifica se existe um token salvo e o configura no Axios.
 * ESSA FUNÇÃO DEVE SER CHAMADA QUANDO A APLICAÇÃO INICIA.
 */
export const setupAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('Token encontrado no localStorage. Configurando header...');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};