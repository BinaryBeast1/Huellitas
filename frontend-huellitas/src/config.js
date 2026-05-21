export const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const DEMO_EMAIL = 'demo@huellitas.cl';
export const DEMO_PASSWORD = 'demo2026';

export const headersAuth = (token) => ({
  'Content-Type': 'application/json',
  'x-auth-token': token
});
