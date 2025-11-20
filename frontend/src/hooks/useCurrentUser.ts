import { useState, useEffect } from 'react';

/**
 * Hook para obter o nome do usuário logado
 * Busca do localStorage e atualiza quando há mudanças
 */
export const useCurrentUser = () => {
  const [userName, setUserName] = useState<string>('');
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    // Função para carregar dados do usuário
    const loadUserData = () => {
      const name = localStorage.getItem('userName') || 'Usuário';
      const type = localStorage.getItem('userType') || 'professional';
      setUserName(name);
      setUserType(type);
    };

    // Carregar dados iniciais
    loadUserData();

    // Listener para mudanças no localStorage (quando atualiza em outra aba ou componente)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userName' && e.newValue) {
        setUserName(e.newValue);
      }
      if (e.key === 'userType' && e.newValue) {
        setUserType(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listener customizado para mudanças na mesma aba
    const handleUserNameUpdate = () => {
      loadUserData();
    };

    window.addEventListener('userNameUpdated', handleUserNameUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userNameUpdated', handleUserNameUpdate);
    };
  }, []);

  return { userName, userType };
};
