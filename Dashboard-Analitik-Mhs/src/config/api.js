// src/config/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboardanalitikmhs-production.up.railway.app';
export const API_URL = `${BASE_URL}/api`;
export default API_URL;