// FRONTEND/src/config/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;

console.log('🔧 API Config:');
console.log('  BASE_URL:', BASE_URL);
console.log('  API_URL:', API_URL);