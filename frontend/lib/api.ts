import axios from 'axios';
import { IAssignment } from '../store/assignmentStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAssignments = async (): Promise<IAssignment[]> => {
  const response = await apiClient.get('/assignments');
  return response.data;
};

export const getAssignment = async (id: string): Promise<IAssignment> => {
  const response = await apiClient.get(`/assignments/${id}`);
  return response.data;
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await apiClient.delete(`/assignments/${id}`);
};

export const regenerateAssignment = async (id: string): Promise<IAssignment> => {
  const response = await apiClient.post(`/assignments/${id}/regenerate`);
  return response.data;
};

export const regenerateSection = async (id: string, configIndex: number): Promise<IAssignment> => {
  const response = await apiClient.post(`/assignments/${id}/sections/${configIndex}/regenerate`);
  return response.data;
};

export const createAssignment = async (
  title: string,
  questionConfigs: any[],
  dueDate?: string,
  additionalInfo?: string,
  file?: File | null
): Promise<IAssignment> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('questionConfigs', JSON.stringify(questionConfigs));
  
  if (dueDate) {
    formData.append('dueDate', dueDate);
  }
  if (additionalInfo) {
    formData.append('additionalInfo', additionalInfo);
  }
  if (file) {
    formData.append('file', file);
  }

  const response = await apiClient.post('/assignments/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
