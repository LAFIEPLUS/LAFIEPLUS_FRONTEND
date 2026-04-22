import axios, { AxiosHeaders } from 'axios';

// In Vercel/browser deployments, default to same-origin unless VITE_API_URL is explicitly set.
const envBase = import.meta.env.VITE_API_URL;
const baseURL = envBase === undefined || envBase === null ? '' : envBase;

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