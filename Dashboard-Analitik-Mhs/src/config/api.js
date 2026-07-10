// src/config/api.js
// ✅ PASTIKAN TIDAK ADA TRAILING SLASH
const BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboardanalitikmhs-production.up.railway.app';
export const API_URL = `${BASE_URL}/api`;
console.log('🔧 API_URL:', API_URL);
// Harusnya: https://dashboardanalitikmhs-production.up.railway.app/api
// BUKAN: https://...//api