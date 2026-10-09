// Base URL of the backend. Empty in dev (Vite proxies /api). Set VITE_API_URL in production, e.g. https://blackbox-api.onrender.com
export const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
