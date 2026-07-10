import { API_URL } from '../config/api';

export const dashboardService = {
  // Get dashboard stats
  getStats: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data dashboard');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get chart data
  getCharts: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/charts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data chart');
    }
    
    const data = await response.json();
    return data.data;
  },

  // Get mahasiswa summary
  getMahasiswaSummary: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/mahasiswa`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data ringkasan mahasiswa');
    }
    
    const data = await response.json();
    return data.data;
  }
};
