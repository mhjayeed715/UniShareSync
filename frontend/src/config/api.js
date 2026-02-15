// API Configuration - strip trailing slash to avoid double-slash in URLs
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export default API_URL;
