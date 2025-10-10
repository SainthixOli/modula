// src/services/api.ts
import axios from 'axios';

/**
 * DOCUMENTAÇÃO
 * Este arquivo cria e exporta uma instância do Axios pré-configurada.
 * - baseURL: Aponta para o endereço do nosso backend Módula.
 * * Esta instância será a base para todas as chamadas de API no projeto.
 */

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
});

// Interceptor de Resposta: Para tratar erros globais (opcional, mas recomendado)
api.interceptors.response.use(
  (response) => response, // Se a resposta for sucesso, apenas a retorna
  (error) => {
    
    // Se o erro for 401 (Não Autorizado), pode ser um token expirado.
    if (error.response?.status === 401) {
      console.error("Erro de autorização. Token pode ser inválido ou expirado.");
    }
    // Rejeita a promise para que o erro possa ser tratado no local da chamada
    return Promise.reject(error);
  }
);


export default api;