// backend/services/khsService.js
const { supabaseKhs } = require('../config/supabase');

class KHSService {
  // ============ GET ALL MAHASISWA DENGAN PAGINATION & FILTER ============
  async getAllMahasiswa(page = 1, limit = 10, filters = {}) {
    try {
      console.log('📊 Fetching all mahasiswa from Supabase KHS...', { page, limit, filters });

      let query = supabaseKhs
        .from('mhs_khs')
        .select('*', { count: 'exact' });

      // Filter status
      if (filters.status && filters.status !== 'Semua') {
        query = query.eq('status', filters.status);
      }

      // Filter angkatan
      if (filters.angkatan && filters.angkatan !== 'Semua Angkatan') {
        query = query.eq('angkatan', parseInt(filters.angkatan));
      }

      // Search
      if (filters.search && filters.search.trim() !== '') {
        // Coba dengan 'npm' atau 'nim' atau 'nama'
        query = query.or(`npm.ilike.%${filters.search}%,nama.ilike.%${filters.search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      // Transform data ke format yang diharapkan frontend
      const transformedData = (data || []).map(item => ({
        id: item.id,
        nim: item.npm || item.nim || '-',  // Sesuaikan dengan nama kolom yang benar
        nama: item.nama || '-',
        nama_lengkap: item.nama || '-',
        angkatan: item.angkatan || '-',
        ipk: item.ipk || 0,
        semester: item.semester || 1,
        status: item.status || 'Aktif',
        total_sks: item.total_sks || 0,
        // Data tambahan untuk detail
        sks_kumulatif: item.sks_kumulatif || 0,
        sks_semester: item.sks_semester || 0,
        ips: item.ips || 0,
        predikat: item.predikat || '-'
      }));

      return {
        success: true,
        data: transformedData,
        pagination: {
          total: count || 0,
          page: page,
          limit: limit,
          pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error in getAllMahasiswa:', error);
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 }
      };
    }
  }

  // ============ GET MAHASISWA BY NIM ============
  async getMahasiswaByNim(nim) {
    try {
      console.log(`📊 Fetching mahasiswa by NIM: ${nim}`);

      const { data, error } = await supabaseKhs
        .from('mhs_khs')
        .select('*')
        .eq('npm', nim)  // Sesuaikan dengan nama kolom yang benar
        .single();

      if (error) throw error;

      if (!data) {
        return {
          success: false,
          message: 'Mahasiswa tidak ditemukan'
        };
      }

      // Transform data
      const transformedData = {
        id: data.id,
        nim: data.npm || data.nim || '-',
        nama: data.nama || '-',
        nama_lengkap: data.nama || '-',
        angkatan: data.angkatan || '-',
        ipk: data.ipk || 0,
        semester: data.semester || 1,
        status: data.status || 'Aktif',
        total_sks: data.total_sks || 0,
        sks_kumulatif: data.sks_kumulatif || 0,
        ips: data.ips || 0
      };

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error('❌ Error in getMahasiswaByNim:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ============ GET MATA KULIAH MAHASISWA BY NIM ============
  async getMataKuliahByNim(nim, semester = null) {
    try {
      console.log(`📊 Fetching mata kuliah for NIM: ${nim}, Semester: ${semester || 'all'}`);

      let query = supabaseKhs
        .from('mhs_khs')
        .select('*')
        .eq('npm', nim);  // Sesuaikan dengan nama kolom yang benar

      if (semester && semester !== 'all' && semester !== 'undefined') {
        query = query.eq('semester', parseInt(semester));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform ke format mata kuliah
      // Asumsikan setiap row adalah satu mata kuliah
      const mataKuliah = (data || []).map(item => ({
        id: item.id,
        kode_mk: item.kode_mk || item.kode_matkul || 'MK001',
        nama_mata_kuliah: item.nama_mk || item.nama_matkul || item.mata_kuliah || 'Mata Kuliah',
        sks: item.sks || 3,
        semester: item.semester || 1,
        nilai: item.nilai_huruf || item.nilai || '-',
        bobot: item.bobot || item.nilai_angka || 0,
        status: item.status || (item.nilai ? 'Lulus' : 'Belum Dinilai')
      }));

      return {
        success: true,
        data: mataKuliah
      };
    } catch (error) {
      console.error('❌ Error in getMataKuliahByNim:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  // ============ GET SUMMARY/STATISTICS ============
  async getSummary() {
    try {
      console.log('📊 Fetching summary from Supabase KHS...');

      const { data, error, count } = await supabaseKhs
        .from('mhs_khs')
        .select('*', { count: 'exact' });

      if (error) throw error;

      // Calculate statistics
      let totalMahasiswa = count || 0;
      let totalAktif = 0;
      let berisiko = 0;
      let evaluasiCount = 0;
      let lulus = 0;

      data?.forEach(mhs => {
        const status = mhs.status?.toLowerCase() || '';
        if (status === 'aktif' || status === 'active') totalAktif++;
        if (status === 'berisiko' || status === 'risk') berisiko++;
        if (status === 'evaluasi' || status === 'evaluation') evaluasiCount++;
        if (status === 'lulus' || status === 'graduated') lulus++;
      });

      return {
        success: true,
        data: {
          totalMahasiswa,
          totalAktif,
          berisiko,
          evaluasi: evaluasiCount,
          lulus
        }
      };
    } catch (error) {
      console.error('❌ Error in getSummary:', error);
      return {
        success: false,
        message: error.message,
        data: {
          totalMahasiswa: 0,
          totalAktif: 0,
          berisiko: 0,
          evaluasi: 0,
          lulus: 0
        }
      };
    }
  }

  // ============ SEARCH MAHASISWA ============
  async searchMahasiswa(searchTerm) {
    try {
      console.log(`🔍 Searching mahasiswa: ${searchTerm}`);

      const { data, error } = await supabaseKhs
        .from('mhs_khs')
        .select('*')
        .or(`npm.ilike.%${searchTerm}%,nama.ilike.%${searchTerm}%`);

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        id: item.id,
        nim: item.npm || item.nim || '-',
        nama: item.nama || '-',
        nama_lengkap: item.nama || '-',
        angkatan: item.angkatan || '-',
        ipk: item.ipk || 0,
        semester: item.semester || 1,
        status: item.status || 'Aktif',
        total_sks: item.total_sks || 0
      }));

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error('❌ Error in searchMahasiswa:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }
}

module.exports = new KHSService();