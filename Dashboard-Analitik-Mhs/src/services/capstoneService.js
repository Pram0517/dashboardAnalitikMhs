import { API_URL } from '../config/api';

export const capstoneService = {
  // Get all capstone (dengan filter role)
  getAll: async (page = 1, limit = 10) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/capstone?page=${page}&limit=${limit}`, {
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

  // Get capstone by NIM
  getByNim: async (nim) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/capstone/nim/${nim}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data capstone mahasiswa');
    }
    
    const data = await response.json();
    return data;
  },

  // Get capstone by ID
  getById: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/capstone/${id}`, {
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

  // Create capstone
  create: async (capstoneData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/capstone`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(capstoneData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal membuat capstone');
    }
    
    const data = await response.json();
    return data;
  },

  // Update capstone
  update: async (id, capstoneData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/capstone/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(capstoneData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate capstone');
    }
    
    const data = await response.json();
    return data;
  },

  // Delete capstone
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/capstone/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus capstone');
    }
    
    const data = await response.json();
    return data;
  }
};
