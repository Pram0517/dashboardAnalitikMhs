// API_URL sudah include /api
export const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// Di fungsi login, PANGGIL LANGSUNG tanpa tambahan /api
const response = await fetch(`${API_URL}/auth/login`, {  // ← Perhatikan: /auth/login, BUKAN /api/auth/login
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(credentials),
});