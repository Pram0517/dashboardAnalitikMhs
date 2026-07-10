// FRONTEND/src/services/authService.js
import { API_URL } from '../config/api';

console.log('🔧 Auth Service - API_URL:', API_URL);

export const authService = {
    // ============ LOGIN ============
    login: async (username, password) => {
        try {
            console.log('📤 Login request to:', `${API_URL}/auth/login`);
            
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('📥 Response status:', response.status);

            // Coba parse response
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('❌ Failed to parse JSON:', parseError);
                throw new Error('Response tidak valid dari server');
            }

            console.log('📥 Response data:', data);

            // ❌ HAPUS validasi status 'Success' karena backend tidak pakai ini
            // if (data.status !== 'Success') {
            //     throw new Error(data.message || 'Login gagal');
            // }

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Login gagal');
            }

            // ✅ Backend langsung mengembalikan { token, user }
            if (data.token && data.user) {
                console.log('✅ Login success - token received');
                return {
                    token: data.token,
                    user: data.user
                };
            }

            // ❌ Jika format tidak sesuai
            console.error('❌ Unexpected response format:', data);
            throw new Error('Format response tidak dikenali');

        } catch (error) {
            console.error('❌ Login service error:', error);
            throw error;
        }
    },

    // ============ REGISTER ============
    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Registrasi gagal');
            }

            // Backend mungkin return user data langsung
            return data.user || data;

        } catch (error) {
            console.error('❌ Register error:', error);
            throw error;
        }
    },

    // ============ LOGOUT ============
    logout: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return { success: true };

            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Logout error:', error);
            return { success: true };
        }
    },

    // ============ GET PROFILE ============
    getProfile: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Gagal mengambil profile');
            }

            // Backend return user langsung
            return data.user || data;

        } catch (error) {
            console.error('❌ Get profile error:', error);
            throw error;
        }
    },

    // ============ UPDATE PROFILE ============
    updateProfile: async (data) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || 'Gagal update profile');
            }

            return result.user || result;

        } catch (error) {
            console.error('❌ Update profile error:', error);
            throw error;
        }
    },

    // ============ CHANGE PASSWORD ============
    changePassword: async (oldPassword, newPassword) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Gagal mengubah password');
            }

            return data;

        } catch (error) {
            console.error('❌ Change password error:', error);
            throw error;
        }
    },

    // ============ REQUEST RESET PASSWORD ============
    requestResetPassword: async (email) => {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Gagal request reset password');
            }

            return data;

        } catch (error) {
            console.error('❌ Request reset password error:', error);
            throw error;
        }
    },

    // ============ RESET PASSWORD ============
    resetPassword: async (token, newPassword) => {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Gagal reset password');
            }

            return data;

        } catch (error) {
            console.error('❌ Reset password error:', error);
            throw error;
        }
    }
};