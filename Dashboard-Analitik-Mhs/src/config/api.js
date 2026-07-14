// FRONTEND/src/config/api.js
// ✅ PASTIKAN TIDAK ADA TRAILING SLASH
const BASE_URL = import.meta.env.VITE_API_URL || 'https://dashboardanalitikmhs-production.up.railway.app';

// Hapus semua trailing slash
const cleanBaseURL = BASE_URL.replace(/\/+$/, '');

// ✅ CEK APAKAH BASE_URL SUDAH MENGANDUNG /api
const hasApi = cleanBaseURL.endsWith('/api');
export const API_URL = hasApi ? cleanBaseURL : `${cleanBaseURL}/api`;

console.log('🔧 API Config:');
console.log('  BASE_URL:', cleanBaseURL);
console.log('  API_URL:', API_URL);
console.log('  Has API:', hasApi);

// Export endpoints
export const ENDPOINTS = {
    auth: `${API_URL}/auth`,
    user: `${API_URL}/user`,
    mahasiswa: `${API_URL}/mahasiswa`,
    dosen: `${API_URL}/dosen`,
    dashboard: `${API_URL}/dashboard`,
    preferences: `${API_URL}/user/preferences`,
    profileImage: `${API_URL}/user/profile-image`,
};

console.log('  ENDPOINTS:', ENDPOINTS);