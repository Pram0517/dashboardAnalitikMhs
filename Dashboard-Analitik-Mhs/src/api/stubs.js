// ============ [API STUBS] ============
// File ini hanya berisi placeholder endpoint untuk referensi integrasi backend.
// Nantinya implementasikan dengan axios atau fetch.

export const apiStubs = {
  // --- AUTHENTICATION ---
  // [BACKEND] POST /api/auth/login
  // Desc: Memverifikasi username dan password, mengembalikan JWT token
  
  // [BACKEND] POST /api/auth/reset-password
  // Desc: Mengirimkan email reset password jika email valid

  // [BACKEND] POST /api/auth/logout
  // Desc: Menghapus sesi/token di sisi server

  // --- DASHBOARD ---
  // [BACKEND] GET /api/dashboard/stats
  // Desc: Mendapatkan ringkasan KPI (Total Mahasiswa, IPK, Lulus Tepat Waktu, dll)
  
  // [BACKEND] GET /api/dashboard/charts
  // Desc: Mendapatkan data untuk grafik GPA trend, Grad status, dan Problematic courses
  // Query params: ?angkatan=2020

  // --- MAHASISWA ---
  // [BACKEND] GET /api/mahasiswa
  // Desc: Mendapatkan daftar mahasiswa berisiko (pagination, search, filter)
  
  // [BACKEND] POST /api/mahasiswa/upload
  // Desc: Menerima multipart/form-data CSV, memproses dan menyimpan ke PostgreSQL

  // [BACKEND] GET /api/mahasiswa/:id
  // Desc: Mendapatkan detail lengkap mahasiswa (profil, progress sks)

  // [BACKEND] GET /api/mahasiswa/:id/riwayat-nilai
  // Desc: Mendapatkan riwayat nilai per semester

  // --- CAPSTONE ---
  // [BACKEND] GET /api/capstone
  // Desc: Mendapatkan status tugas akhir mahasiswa (pagination, search, filter)

  // --- PEMBIMBING ---
  // [BACKEND] GET /api/pembimbing
  // Desc: Mendapatkan daftar dosen beserta beban bimbingan

  // [BACKEND] PUT /api/pembimbing/:id
  // Desc: Update data kuota maksimal bimbingan dosen

  // --- EXPORT ---
  // [BACKEND] GET /api/export/excel
  // Desc: Menggenerate file Excel dan mengirim stream ke client

  // [BACKEND] GET /api/export/pdf
  // Desc: Menggenerate file PDF laporan dan mengirim stream ke client
};
