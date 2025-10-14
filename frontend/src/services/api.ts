import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Interceptor: Header de autorização anexado com sucesso!');
    } else {
      console.log('Interceptor: Nenhuma requisição autenticada (sem token).');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// ===================================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Interceptado erro 401: Token inválido ou expirado. Deslogando...");
      
    }
    return Promise.reject(error);
  }
);

export default api;