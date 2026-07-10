import { API_URL } from '../config/api';

export const mahasiswaDetailService = {
    // Get mahasiswa by NIM
    getByNim: async(nim) => {
        const token = localStorage.getItem('token');
        const target = nim || 'self';
        const response = await fetch(`${API_URL}/mahasiswa/${target}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data mahasiswa');
        }

        const data = await response.json();
        return data;
    },

    // Get KHS by NIM
    getKhs: async(nim) => {
        const token = localStorage.getItem('token');
        const target = nim || 'self';
        const response = await fetch(`${API_URL}/mahasiswa/${target}/khs`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data KHS');
        }

        const data = await response.json();
        return data;
    },

    // ====== BARU: Get mata kuliah by NIM ======
    getMataKuliah: async(nim, semester = null) => {
        const token = localStorage.getItem('token');
        const target = nim || 'self';
        let url = `${API_URL}/mahasiswa/${target}/mata-kuliah`;
        if (semester && semester !== 'all') {
            url += `?semester=${semester}`;
        }

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

    // ====== BARU: Get riwayat nilai ======
    getRiwayatNilai: async(nim) => {
        const token = localStorage.getItem('token');
        const target = nim || 'self';
        const response = await fetch(`${API_URL}/mahasiswa/${target}/riwayat-nilai`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil riwayat nilai');
        }

        const data = await response.json();
        return data;
    },

    // Get capstone by NIM
    getCapstone: async(nim) => {
        const token = localStorage.getItem('token');
        const target = nim || 'self';
        const response = await fetch(`${API_URL}/mahasiswa/${target}/capstone`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data capstone');
        }

        const data = await response.json();
        return data;
    },

    // Get skripsi by NIM
    getSkripsi: async(nim) => {
        const token = localStorage.getItem('token');
        const target = nim || 'self';
        const response = await fetch(`${API_URL}/mahasiswa/${target}/skripsi`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Gagal mengambil data skripsi');
        }

        const data = await response.json();
        return data;
    },

    // Get all data mahasiswa in one call
    getAllData: async(nim) => {
        const token = localStorage.getItem('token');
        const target = nim || 'self';

        const [mahasiswa, khs, mataKuliah, capstone, skripsi] = await Promise.all([
            fetch(`${API_URL}/mahasiswa/${target}`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_URL}/mahasiswa/${target}/khs`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_URL}/mahasiswa/${target}/mata-kuliah`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_URL}/mahasiswa/${target}/capstone`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_URL}/mahasiswa/${target}/skripsi`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const mahasiswaData = await mahasiswa.json();
        const khsData = await khs.json();
        const mataKuliahData = await mataKuliah.json();
        const capstoneData = await capstone.json();
        const skripsiData = await skripsi.json();

        if (!mahasiswa.ok) {
            throw new Error(mahasiswaData.message || 'Gagal mengambil data mahasiswa');
        }

        return {
            mahasiswa: mahasiswaData.data,
            khs: khsData.data || [],
            mataKuliah: mataKuliahData.data || [],
            capstone: capstoneData.data || null,
            skripsi: skripsiData.data || null
        };
    }
};
