export const IS_SERVERLESS = true;

// For local API testing only, you could use: const LOCAL_API = 'http://localhost:3001/api';
const origin = typeof window !== 'undefined' ? window.location.origin : '';
export const BASE_URL = IS_SERVERLESS ? '' : `${origin}/api`;

export const API_ENDPOINTS = {
  notes: `${BASE_URL}/notes`,
  noteById: (id: string) => `${BASE_URL}/notes/${id}`,
  settings: `${BASE_URL}/settings`,
  tasks: `${BASE_URL}/tasks`,
  taskById: (id: string) => `${BASE_URL}/tasks/${id}`,
};
