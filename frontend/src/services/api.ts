import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

if (rawBaseUrl && !rawBaseUrl.includes('.') && !rawBaseUrl.startsWith('/') && !rawBaseUrl.startsWith('http')) {
  rawBaseUrl = `https://${rawBaseUrl}.onrender.com`;
}

if (!rawBaseUrl || rawBaseUrl === '/api') {
  if (typeof window !== 'undefined' && window.location.hostname.includes('render.com')) {
    rawBaseUrl = 'https://autorescue-backend-koso.onrender.com';
  } else {
    rawBaseUrl = '/api';
  }
}

if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://') && !rawBaseUrl.startsWith('/')) {
  rawBaseUrl = `https://${rawBaseUrl}`;
}
if (rawBaseUrl.startsWith('http') && !rawBaseUrl.endsWith('/api')) {
  rawBaseUrl = `${rawBaseUrl.replace(/\/+$/, '')}/api`;
}
const API_BASE_URL = rawBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('autorescue_jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      sessionStorage.removeItem('autorescue_jwt');
      sessionStorage.removeItem('autorescue_user');
      window.dispatchEvent(new CustomEvent('autorescue:session-expired'));
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(err: unknown, fallback = 'An unexpected error occurred.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
