import { hitungStatusEvaluasi } from '../utils/evaluasiUtils';

// ============ [DATA DUMMY] ============
// File ini menampung seluruh state awal aplikasi frontend.

const baseDummyMahasiswa = [
  { 
    id: "1", nim: "2000018001", nama: "Ahmad Rizky", angkatan: "2020", ipk: 3.85, status: "Aktif", semester: 7, sks: 144, 
    statusCapstone: "Selesai", statusKKN: "Selesai", statusHerregistrasi: true, judulSkripsiDiajukan: "Sistem Rekomendasi Pemilihan Mata Kuliah Pilihan Menggunakan KNN", sertifikatAlQuran: true,
    sksDenganNilaiMinC: 140, semesterTidakRegistrasi: 0, tanggalUpdateStatus: "2024-06-10",
    aikData: [
      { id: "aik1", nama: "Tahsinul Quran", jenis: "Wajib", status: "Lulus" },
      { id: "aik2", nama: "Fiqih Ibadah", jenis: "Wajib", status: "Lulus" },
      { id: "aik3", nama: "Dakwah Digital", jenis: "Pilihan", status: "Lulus" },
      { id: "aik4", nama: "Hukum Waris Islam", jenis: "Pilihan", status: "Lulus" }
    ]
  },
  { 
    id: "2", nim: "2100018002", nama: "Budi Santoso", angkatan: "2021", ipk: 2.30, status: "Aktif", semester: 5, sks: 85, 
    statusCapstone: "Belum Mengambil", statusKKN: "Belum", statusHerregistrasi: true, judulSkripsiDiajukan: null, sertifikatAlQuran: false,
    sksDenganNilaiMinC: 65, semesterTidakRegistrasi: 0, tanggalUpdateStatus: "2024-06-10",
    aikData: [
      { id: "aik1", nama: "Tahsinul Quran", jenis: "Wajib", status: "Lulus" },
      { id: "aik2", nama: "Fiqih Ibadah", jenis: "Wajib", status: "Belum Lulus" }
    ]
  },
  { 
    id: "3", nim: "2200018001", nama: "Citra Kirana", angkatan: "2022", ipk: 3.55, status: "Aktif", semester: 3, sks: 55, 
    statusCapstone: "Belum Mengambil", statusKKN: "Belum", statusHerregistrasi: true, judulSkripsiDiajukan: null, sertifikatAlQuran: true,
    sksDenganNilaiMinC: 55, semesterTidakRegistrasi: 0, tanggalUpdateStatus: "2024-06-10",
    aikData: [
      { id: "aik1", nama: "Tahsinul Quran", jenis: "Wajib", status: "Lulus" },
      { id: "aik2", nama: "Fiqih Ibadah", jenis: "Wajib", status: "Lulus" },
      { id: "aik3", nama: "Dakwah Digital", jenis: "Pilihan", status: "Belum Lulus" }
    ]
  },
  { 
    id: "4", nim: "2300018015", nama: "Dewi Lestari", angkatan: "2023", ipk: 1.85, status: "Aktif", semester: 2, sks: 30, 
    statusCapstone: "Belum Mengambil", statusKKN: "Belum", statusHerregistrasi: false, judulSkripsiDiajukan: null, sertifikatAlQuran: false,
    sksDenganNilaiMinC: 15, semesterTidakRegistrasi: 1, tanggalUpdateStatus: "2024-06-10",
    aikData: [
      { id: "aik1", nama: "Tahsinul Quran", jenis: "Wajib", status: "Belum Lulus" }
    ]
  },
  { 
    id: "5", nim: "2400018111", nama: "Eko Prasetyo", angkatan: "2024", ipk: 3.75, status: "Aktif", semester: 1, sks: 19, 
    statusCapstone: "Belum Mengambil", statusKKN: "Belum", statusHerregistrasi: true, judulSkripsiDiajukan: null, sertifikatAlQuran: true,
    sksDenganNilaiMinC: 19, semesterTidakRegistrasi: 0, tanggalUpdateStatus: "2024-06-10",
    aikData: [
      { id: "aik1", nama: "Tahsinul Quran", jenis: "Wajib", status: "Lulus" }
    ]
  },
  { 
    id: "6", nim: "1900018001", nama: "Fajar Ramadan", angkatan: "2019", ipk: 1.95, status: "Aktif", semester: 9, sks: 60, 
    statusCapstone: "Belum Mengambil", statusKKN: "Belum", statusHerregistrasi: true, judulSkripsiDiajukan: null, sertifikatAlQuran: false,
    sksDenganNilaiMinC: 58, semesterTidakRegistrasi: 2, tanggalUpdateStatus: "2024-06-10",
    aikData: []
  },
  { 
    id: "7", nim: "1700018001", nama: "Gugur Studi", angkatan: "2017", ipk: 2.0, status: "Non-Aktif", semester: 14, sks: 100, 
    statusCapstone: "Belum Mengambil", statusKKN: "Belum", statusHerregistrasi: false, judulSkripsiDiajukan: null, sertifikatAlQuran: false,
    sksDenganNilaiMinC: 90, semesterTidakRegistrasi: 4, tanggalUpdateStatus: "2024-06-10",
    aikData: []
  }
];

export const dummyMahasiswa = baseDummyMahasiswa.map(mhs => {
  const evaluasi = hitungStatusEvaluasi(mhs);
  return {
    ...mhs,
    evaluasiStatus: evaluasi.status,
    evaluasiPemicu: evaluasi.pemicu
  };
});

export const dummyPembimbing = [
  { id: "D01", nama: "Dr. Arif Rahman, M.Kom", bebanBimbingan: 8, kuota: 10 },
  { id: "D02", nama: "Iwan Tri Riadi Yanto,S.Si, M.T., Ph.D", bebanBimbingan: 10, kuota: 10 },
  { id: "D03", nama: "Prof. Dr. Imam Riadi,M.Kom", bebanBimbingan: 4, kuota: 12 },
];


export const dummyChartData = {
  gpaTrend: [
    { angkatan: "2018", ipk: 3.1 },
    { angkatan: "2019", ipk: 3.25 },
    { angkatan: "2020", ipk: 3.15 },
    { angkatan: "2021", ipk: 3.4 },
    { angkatan: "2022", ipk: 3.5 },
  ],
  gradStatus: [
    { name: "Lulus Tepat Waktu", value: 65, fill: "#06446B" },
    { name: "Terlambat", value: 25, fill: "#5790AB" },
    { name: "Drop Out", value: 10, fill: "#9CCDDB" },
  ],
  problematicCourses: [
    { course: "Matematika Diskrit", failCount: 45 },
    { course: "Algoritma Pemrograman", failCount: 30 },
    { course: "Basis Data", failCount: 20 },
    { course: "Kapita Selekta", failCount: 15 },
  ]
};
