export const BASE_URL = '/api';

export const API_ENDPOINTS = {
  notes: `${BASE_URL}/notes`,
  noteById: (id: string) => `${BASE_URL}/notes/${id}`,
  settings: `${BASE_URL}/settings`,
  tasks: `${BASE_URL}/tasks`,
  taskById: (id: string) => `${BASE_URL}/tasks/${id}`,
};
