// DASHBOARD-ANALITIK-MHS/src/services/authService.js
import { API_URL } from '../config/api';

export const authService = {
    // ============ LOGIN ============
    login: async (username, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login gagal');
        }

        if (data.status !== 'Success') {
            throw new Error(data.message || 'Login gagal');
        }

        return data.data;
    },

    // ============ REGISTER ============
    register: async (userData) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registrasi gagal');
        }

        return data.data;
    },

    // ============ LOGOUT ============
    logout: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        return data;
    },

    // ============ GET PROFILE ============
    getProfile: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengambil profile');
        }

        return data.data;
    },

    // ============ UPDATE PROFILE ============
    updateProfile: async (data) => {
        const token = localStorage.getItem('token');
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
            throw new Error(result.message || 'Gagal update profile');
        }

        return result.data;
    },

    // ============ CHANGE PASSWORD ============
    changePassword: async (oldPassword, newPassword) => {
        const token = localStorage.getItem('token');
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
            throw new Error(data.message || 'Gagal mengubah password');
        }

        return data;
    },

    // ============ REQUEST RESET PASSWORD ============
    requestResetPassword: async (email) => {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal request reset password');
        }

        return data;
    },

    // ============ VERIFY RESET TOKEN ============
    verifyResetToken: async (token) => {
        const response = await fetch(`${API_URL}/auth/reset-password/${token}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Token tidak valid');
        }

        return data;
    },

    // ============ RESET PASSWORD ============
    resetPassword: async (token, newPassword) => {
        const response = await fetch(`${API_URL}/auth/reset-password/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Gagal reset password');
        }

        return data;
    }
};
