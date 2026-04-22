import axios, { AxiosHeaders } from 'axios';

// Use empty baseURL to hit the Vite dev proxy (same origin); undefined/null falls back to API host
const envBase = import.meta.env.VITE_API_URL;
const baseURL = envBase === undefined || envBase === null ? 'http://localhost:5000' : envBase;

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT — Axios v1 merges per-method headers; set via AxiosHeaders so Authorization is not dropped
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lafieplus_token');
  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// Only auto-redirect on 401 for protected routes, not for auth routes themselves
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const is401 = err.response?.status === 401;
    const isAuthRoute = url.includes('/auth/login') ||
                        url.includes('/auth/register') ||
                        url.includes('/auth/me');

    if (is401 && !isAuthRoute) {
      localStorage.removeItem('lafieplus_token');
      localStorage.removeItem('lafieplus_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;