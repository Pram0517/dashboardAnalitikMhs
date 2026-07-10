// FRONTEND/src/config/api.js
// ✅ PASTIKAN TIDAK ADA TRAILING SLASH
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Hapus trailing slash jika ada
const cleanBaseURL = BASE_URL.replace(/\/+$/, '');
export const API_URL = `${cleanBaseURL}/api`;

console.log('🔧 API Config:');
console.log('  BASE_URL:', cleanBaseURL);
console.log('  API_URL:', API_URL);
// Harusnya: https://dashboardanalitikmhs-production.up.railway.app/api
// BUKAN: https://...com//api