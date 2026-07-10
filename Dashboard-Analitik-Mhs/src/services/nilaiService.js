import { API_URL } from '../config/api';

export const nilaiService = {
    // Get konversi nilai
    getKonversiNilai: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/konversi`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data konversi nilai');
        }

        const data = await response.json();
        return data;
    },

    // Get IPS per semester
    getIPS: async (nim, semester) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/${nim}/ips/${semester}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal menghitung IPS');
        }

        const data = await response.json();
        return data;
    },

    // Get IPK
    getIPK: async (nim) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/${nim}/ipk`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal menghitung IPK');
        }

        const data = await response.json();
        return data;
    },

    // Get semua nilai mahasiswa
    getNilaiMahasiswa: async (nim) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/${nim}/nilai`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data nilai');
        }

        const data = await response.json();
        return data;
    },

    // Get IPS semua semester
    getIPSAllSemester: async (nim) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/${nim}/ips-all`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data IPS per semester');
        }

        const data = await response.json();
        return data;
    },

    // Get statistik nilai
    getStatistikNilai: async (nim) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/${nim}/statistik`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil statistik nilai');
        }

        const data = await response.json();
        return data;
    },

    // Tambah/update nilai (admin/kaprodi only)
    upsertNilai: async (nim, data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/${nim}/nilai`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal menyimpan nilai');
        }

        const result = await response.json();
        return result;
    },

    // Hapus nilai (admin/kaprodi only)
    deleteNilai: async (nim, id) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/nilai/${nim}/nilai/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal menghapus nilai');
        }

        const result = await response.json();
        return result;
    }
};
