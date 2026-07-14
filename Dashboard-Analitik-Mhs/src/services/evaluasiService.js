import { API_URL } from '../config/api';

export const evaluasiService = {
  // Get all evaluasi
  getAll: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/evaluasi?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data evaluasi');
    }
    
    const data = await response.json();
    return data;
  },

  // Get evaluasi by NIM
  getByNim: async (nim) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/evaluasi/nim/${nim}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data evaluasi mahasiswa');
    }
    
    const data = await response.json();
    return data;
  },

  // ====== GET ALL MAHASISWA WITH DETAILS (ANGKATAN & SKS) ======
getAllWithDetails: async (page = 1, limit = 10, search = '', filterStatus = '', filterAngkatan = '') => {
  const token = localStorage.getItem('token');
  const url = new URL(`${API_URL}/mahasiswa/with-details`);
  url.searchParams.append('page', page);
  url.searchParams.append('limit', limit);
  if (search) url.searchParams.append('search', search);
  if (filterStatus && filterStatus !== 'Semua') url.searchParams.append('filterStatus', filterStatus);
  if (filterAngkatan && filterAngkatan !== 'Semua Angkatan') url.searchParams.append('filterAngkatan', filterAngkatan);

  console.log('📤 Fetching with filters:', { page, limit, search, filterStatus, filterAngkatan });

  const response = await fetch(url, {
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
  console.log('📥 Response data:', data);
  return data;
},

  // ====== GET MAHASISWA BY NIM WITH DETAILS ======
  getByNimWithDetails: async (nim) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/mahasiswa/${nim}/with-details`, {
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

  // ====== GET KURIKULUM WITH NILAI ======
  getKurikulumWithNilai: async (nim, semester = null) => {
    const token = localStorage.getItem('token');
    let url = `${API_URL}/nilai/${nim}/kurikulum-nilai`;
    
    if (semester && semester !== 'all' && semester !== 'undefined') {
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
      throw new Error(error.message || 'Gagal mengambil data kurikulum');
    }

    const data = await response.json();
    return data;
  },

  // ====== GET MATA KULIAH MAHASISWA ======
  getMataKuliahMahasiswa: async (nim, semester = null) => {
    const token = localStorage.getItem('token');
    let url = `${API_URL}/mahasiswa/${nim}/mata-kuliah`;
    
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
      throw new Error(error.message || 'Gagal mengambil mata kuliah mahasiswa');
    }

    const data = await response.json();
    
    const transformedData = (data.data || []).map(function(item) {
      return {
        id: item.id,
        kode_mk: item.kode_mk,
        nama_mata_kuliah: item.nama_mata_kuliah,
        sks: item.sks,
        semester: item.semester,
        nilai: item.nilai,
        bobot: item.bobot || 0,
        status: item.status || (item.nilai ? 'Lulus' : 'Belum Dinilai')
      };
    });
    
    return {
      ...data,
      data: transformedData
    };
  },

  // ====== GET RIWAYAT NILAI ======
  getRiwayatNilai: async (nim) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/mahasiswa/${nim}/riwayat-nilai`, {
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

  // ====== GET IPS PER SEMESTER ======
  getIPS: async (nim, semester) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/mahasiswa/${nim}/riwayat-nilai`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil IPS');
    }

    const data = await response.json();
    const riwayat = data.data?.riwayat || [];
    const nilaiSemester = riwayat.filter(function(n) {
      return n.semester === parseInt(semester);
    });
    const totalBobot = nilaiSemester.reduce(function(sum, n) {
      return sum + (n.bobot || 0) * n.sks;
    }, 0);
    const totalSks = nilaiSemester.reduce(function(sum, n) {
      return sum + n.sks;
    }, 0);
    const ips = totalSks > 0 ? totalBobot / totalSks : 0;
    
    return {
      status: 'Success',
      data: {
        nim: nim,
        semester: parseInt(semester),
        ips: parseFloat(ips.toFixed(2)),
        total_sks: totalSks,
        total_bobot: totalBobot
      }
    };
  },

  // ====== GET IPK ======
  getIPK: async (nim) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/mahasiswa/${nim}/riwayat-nilai`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil IPK');
    }

    const data = await response.json();
    return {
      status: 'Success',
      data: {
        ipk: data.data?.ipk || 0,
        total_sks: data.data?.total_sks || 0
      }
    };
  },

  // ====== GET EVALUASI STUDI (ES-1, ES-2, ES-3) ======
  getEvaluasiStudi: async (nim) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/evaluasi/studi/${nim}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data evaluasi studi');
    }

    const data = await response.json();
    return data;
  },

  // ====== GET EVALUASI STUDI ALL ======
  getEvaluasiStudiAll: async (angkatan = 'Semua Angkatan', status = 'Semua') => {
    const token = localStorage.getItem('token');
    const url = new URL(`${API_URL}/evaluasi/studi/all`);
    if (angkatan !== 'Semua Angkatan') url.searchParams.append('angkatan', angkatan);
    if (status !== 'Semua') url.searchParams.append('status', status);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data evaluasi studi');
    }

    const data = await response.json();
    return data;
  },

  // Create evaluasi
  create: async (evaluasiData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/evaluasi`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(evaluasiData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal membuat evaluasi');
    }
    
    const data = await response.json();
    return data;
  },

  // Update evaluasi
  update: async (id, evaluasiData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/evaluasi/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(evaluasiData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate evaluasi');
    }
    
    const data = await response.json();
    return data;
  },

  // Delete evaluasi
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/evaluasi/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus evaluasi');
    }
    
    const data = await response.json();
    return data;
  },

  // Get evaluasi summary
  getSummary: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/evaluasi/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil ringkasan evaluasi');
    }
    
    const data = await response.json();
    return data;
  }
};
