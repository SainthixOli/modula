/**
 * Serviço de Backup
 * 
 * Funções para gerenciar backups do banco de dados
 */

import api from './api';

export interface Backup {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  type: 'automatic' | 'manual';
  verified: boolean;
}

export interface BackupListResponse {
  success: boolean;
  backups: Backup[];
  totalBackups: number;
  totalSize: number;
  totalSizeFormatted: string;
}

/**
 * Listar todos os backups
 */
export const getBackups = async (): Promise<BackupListResponse> => {
  const response = await api.get('/backups');
  return response.data;
};

/**
 * Criar backup manual
 */
export const createBackup = async (): Promise<Backup> => {
  const response = await api.post('/backups');
  return response.data.backup;
};

/**
 * Restaurar backup
 */
export const restoreBackup = async (name: string): Promise<void> => {
  await api.post(`/backups/${name}/restore`);
};

/**
 * Verificar integridade de um backup
 */
export const verifyBackup = async (name: string): Promise<{ verified: boolean; message: string }> => {
  const response = await api.get(`/backups/${name}/verify`);
  return response.data;
};

/**
 * Deletar backup
 */
export const deleteBackup = async (name: string): Promise<void> => {
  await api.delete(`/backups/${name}`);
};

/**
 * Rotacionar backups (limpar antigos)
 */
export const rotateBackups = async (): Promise<{ deleted: number }> => {
  const response = await api.post('/backups/rotate');
  return response.data;
};
