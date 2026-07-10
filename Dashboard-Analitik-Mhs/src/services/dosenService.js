import { API_URL } from '../config/api';

export const dosenService = {
  // Get all dosen
  getAll: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dosen?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data dosen');
    }
    
    const data = await response.json();
    return data;
  },

  // Get dosen by ID
  getById: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dosen/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data dosen');
    }
    
    const data = await response.json();
    return data;
  },

  // Create dosen
  create: async (dosenData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dosen`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dosenData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal membuat dosen');
    }
    
    const data = await response.json();
    return data;
  },

  // Update dosen
  update: async (id, dosenData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dosen/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dosenData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate dosen');
    }
    
    const data = await response.json();
    return data;
  },

  // Delete dosen
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dosen/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus dosen');
    }
    
    const data = await response.json();
    return data;
  },

  // Get dosen by prodi
  getByProdi: async (prodi) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dosen/prodi/${prodi}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data dosen');
    }
    
    const data = await response.json();
    return data;
  },

  // Get dosen pembimbing skripsi
  getPembimbingSkripsi: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dosen/pembimbing-skripsi`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data pembimbing skripsi');
    }
    
    const data = await response.json();
    return data;
  }
};
