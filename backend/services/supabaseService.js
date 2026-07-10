// server/services/mahasiswaService.js
const { supabase } = require('../config/supabase');

class MahasiswaService {
  // Get all mahasiswa with pagination and filters
  async getAllMahasiswa(page = 1, limit = 10, filters = {}) {
    try {
      let query = supabase
        .from('mhs_khs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status && filters.status !== 'Semua') {
        query = query.eq('status', filters.status);
      }

      if (filters.angkatan && filters.angkatan !== 'Semua Angkatan') {
        query = query.eq('angkatan', parseInt(filters.angkatan));
      }

      if (filters.search) {
        query = query.or(`nim.ilike.%${filters.search}%,nama.ilike.%${filters.search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllMahasiswa:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get mahasiswa by NIM
  async getMahasiswaByNim(nim) {
    try {
      const { data, error } = await supabase
        .from('mhs_khs')
        .select('*')
        .eq('nim', nim)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in getMahasiswaByNim:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get summary/statistics
  async getSummary() {
    try {
      // Get total count
      const { count: totalMahasiswa, error: countError } = await supabase
        .from('mhs_khs')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get all data for statistics
      const { data: allData, error: dataError } = await supabase
        .from('mhs_khs')
        .select('status, ipk, semester, total_sks');

      if (dataError) throw dataError;

      // Calculate statistics
      let totalAktif = 0;
      let berisiko = 0;
      let evaluasiCount = 0;
      let lulus = 0;

      allData?.forEach(mhs => {
        const status = mhs.status?.toLowerCase() || '';
        if (status === 'aktif' || status === 'active') totalAktif++;
        if (status === 'berisiko' || status === 'risk') berisiko++;
        if (status === 'evaluasi' || status === 'evaluation') evaluasiCount++;
        if (status === 'lulus' || status === 'graduated') lulus++;
      });

      return {
        success: true,
        data: {
          totalMahasiswa: totalMahasiswa || 0,
          totalAktif,
          berisiko,
          evaluasi: evaluasiCount,
          lulus
        }
      };
    } catch (error) {
      console.error('Error in getSummary:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get mata kuliah mahasiswa by NIM
  async getMataKuliahByNim(nim, semester = null) {
    try {
      // Asumsikan ada tabel mhs_nilai atau kurikulum
      // Jika belum ada, kita bisa menggunakan data dari mhs_khs
      // atau join dengan tabel lain
      
      let query = supabase
        .from('mhs_khs') // Ganti dengan tabel yang sesuai jika ada
        .select('*')
        .eq('nim', nim);

      if (semester) {
        query = query.eq('semester', semester);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data ke format mata kuliah
      // Ini hanya contoh, sesuaikan dengan struktur data Anda
      const mataKuliah = data?.map(item => ({
        kode_mk: item.kode_mk || 'MK001',
        nama_mata_kuliah: item.nama_mk || 'Mata Kuliah',
        sks: item.sks || 3,
        semester: item.semester || 1,
        nilai: item.nilai || '-',
        status: item.status_nilai || 'Belum Dinilai'
      })) || [];

      return {
        success: true,
        data: mataKuliah
      };
    } catch (error) {
      console.error('Error in getMataKuliahByNim:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  // Search mahasiswa
  async searchMahasiswa(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('mhs_khs')
        .select('*')
        .or(`nim.ilike.%${searchTerm}%,nama.ilike.%${searchTerm}%`);

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error in searchMahasiswa:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new MahasiswaService();