const API_URL = 'http://localhost:5000/api';

export const skripsiService = {
  // Get all skripsi (dengan filter role)
  getAll: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/skripsi?page=${page}&limit=${limit}`, {
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

  // Get skripsi by NIM
  getByNim: async (nim) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/skripsi/nim/${nim}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data skripsi mahasiswa');
    }
    
    const data = await response.json();
    return data;
  },

  // Get skripsi by ID
  getById: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/skripsi/${id}`, {
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

  // Create skripsi
  create: async (skripsiData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/skripsi`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(skripsiData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal membuat skripsi');
    }
    
    const data = await response.json();
    return data;
  },

  // Update skripsi
  update: async (id, skripsiData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/skripsi/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(skripsiData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate skripsi');
    }
    
    const data = await response.json();
    return data;
  },

  // Delete skripsi
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/skripsi/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus skripsi');
    }
    
    const data = await response.json();
    return data;
  }
};