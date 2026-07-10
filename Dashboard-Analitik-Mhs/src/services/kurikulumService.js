const API_URL = 'http://localhost:5000/api';

export const kurikulumService = {
    // ============ KURIKULUM ============
    getAll: async (page = 1, limit = 100) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data kurikulum');
        }

        const data = await response.json();
        return data;
    },

    getById: async (id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil detail kurikulum');
        }

        const data = await response.json();
        return data;
    },

    create: async (data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal membuat kurikulum');
        }

        const result = await response.json();
        return result;
    },

    update: async (id, data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengupdate kurikulum');
        }

        const result = await response.json();
        return result;
    },

    delete: async (id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal menghapus kurikulum');
        }

        const result = await response.json();
        return result;
    },

    // ============ MATA KULIAH ============
    getAllMataKuliah: async (params = {}) => {
        const token = localStorage.getItem('token');
        const { semester, sifat, search, page = 1, limit = 100 } = params;
        
        const url = new URL(`${API_URL}/kurikulum/mata-kuliah`);
        url.searchParams.append('page', page);
        url.searchParams.append('limit', limit);
        if (semester && semester !== 'all') url.searchParams.append('semester', semester);
        if (sifat && sifat !== 'all') url.searchParams.append('sifat', sifat);
        if (search) url.searchParams.append('search', search);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data mata kuliah');
        }

        const data = await response.json();
        return data;
    },

    getMataKuliahById: async (id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/mata-kuliah/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data mata kuliah');
        }

        const data = await response.json();
        return data;
    },

    createMataKuliah: async (data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/mata-kuliah`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal membuat mata kuliah');
        }

        const result = await response.json();
        return result;
    },

    updateMataKuliah: async (id, data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/mata-kuliah/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengupdate mata kuliah');
        }

        const result = await response.json();
        return result;
    },

    deleteMataKuliah: async (id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/mata-kuliah/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal menghapus mata kuliah');
        }

        const result = await response.json();
        return result;
    },

    getMataKuliahByKurikulum: async (kurikulum_id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/${kurikulum_id}/mata-kuliah`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data mata kuliah');
        }

        const data = await response.json();
        return data;
    },

    getSummary: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/kurikulum/summary`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil ringkasan kurikulum');
        }

        const result = await response.json();
        return result;
    }
};