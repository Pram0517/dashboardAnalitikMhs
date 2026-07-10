// [REVISI] Menggunakan data kurikulum real Semester 1 dan realistis Semester 2-8 sesuai aturan UAD (144 SKS total).
export const dummyKurikulum = [
  // SEMESTER 1 (19 SKS + 2 AIK)
  { id: "S1-01", kode: "231610220", nama: "Bahasa Inggris", sks: 3, semester: 1, jenis: "Wajib" },
  { id: "S1-02", kode: "231610520", nama: "Komunikasi Interpersonal", sks: 2, semester: 1, jenis: "Wajib" },
  { id: "S1-03", kode: "231610730", nama: "Matematika Dasar", sks: 3, semester: 1, jenis: "Wajib" },
  { id: "S1-04", kode: "231610331", nama: "Dasar Pemrograman", sks: 2, semester: 1, jenis: "Wajib" },
  { id: "S1-05", kode: "231610430", nama: "Kepemimpinan dan Manajemen Organisasi", sks: 3, semester: 1, jenis: "Wajib" },
  { id: "S1-06", kode: "231610820", nama: "Pancasila", sks: 2, semester: 1, jenis: "Wajib" },
  { id: "S1-07", kode: "AIK-24032", nama: "Bahasa Arab", sks: 0, semester: 1, jenis: "Wajib" },
  // { id: "S1-08", kode: "231610920", nama: "Islam dan Agama-Agama Dunia", sks: 2, semester: 1, jenis: "Wajib" },
  { id: "S1-09", kode: "231610530", nama: "Konsep Sistem Informasi", sks: 2, semester: 1, jenis: "Wajib" },
  { id: "S1-10", kode: "AIK-24021", nama: "Tahsinul Quran", sks: 0, semester: 1, jenis: "Wajib" },

  // SEMESTER 2 (20 SKS)
  { id: "S2-01", kode: "231620130", nama: "Algoritma dan Pemrograman", sks: 3, semester: 2, jenis: "Wajib" },
  { id: "S2-02", kode: "231620230", nama: "Analisis Proses Bisnis", sks: 3, semester: 2, jenis: "Wajib" },
  { id: "S2-03", kode: "231620330", nama: "Kewirausahaan", sks: 3, semester: 2, jenis: "Wajib" },
  { id: "S2-04", kode: "231620430", nama: "Konsep Basis Data", sks: 3, semester: 2, jenis: "Wajib" },
  { id: "S2-05", kode: "231620520", nama: "Matematika Diskrit", sks: 2, semester: 2, jenis: "Wajib" },
  { id: "S2-06", kode: "231620630", nama: "Pendidikan Kewarganegaraan", sks: 3, semester: 2, jenis: "Wajib" },
  { id: "S2-07", kode: "AIK-24042", nama: "Fiqih Ibadah dan Munakahat", sks: 0, semester: 2, jenis: "Wajib" },
  { id: "S2-08", kode: "AIK-24041", nama: "Islam Interdisplininer", sks: 2, semester: 2, jenis: "Wajib" },

  // SEMESTER 3 (20 SKS)
  { id: "S3-01", kode: "231630130", nama: "Analisis Kebutuhan Sistem Informasi", sks: 3, semester: 3, jenis: "Wajib" },
  { id: "S3-02", kode: "231630230", nama: "Konsep Kecerdasan Buatan", sks: 3, semester: 3, jenis: "Wajib" },
  { id: "S3-03", kode: "231630330", nama: "Sistem Basis Data", sks: 3, semester: 3, jenis: "Wajib" },
  { id: "S3-04", kode: "231630430", nama: "Statistika dan Probabilitas", sks: 3, semester: 3, jenis: "Wajib" },
  { id: "S3-05", kode: "231630530", nama: "Tata kelola Teknologi Informasi", sks: 3, semester: 3, jenis: "Wajib" },
  { id: "S3-06", kode: "231630630", nama: "Teknologi Web", sks: 3, semester: 3, jenis: "Wajib" },
  { id: "S3-07", kode: "231630720", nama: "Kemuhammadiyahan", sks: 2, semester: 3, jenis: "Wajib" },
  { id: "S3-08", kode: "AIK-24051", nama: "Dakwah Digital", sks: 0, semester: 3, jenis: "Pilihan" },
  { id: "S3-09", kode: "231630721", nama: "Pengembangan Perangkat Lunak", sks: 2, semester: 3, jenis: "Wajib" },
  { id: "S3-10", kode: "231630730", nama: "Pra Nikah", sks: 2, semester: 3, jenis: "Pilihan" },

  
  // SEMESTER 4 (21 SKS)
  { id: "S4-01", kode: "231640130", nama: "Arsitektur Enterprise", sks: 3, semester: 4, jenis: "Wajib" },
  { id: "S4-02", kode: "231640230", nama: "Desain dan Pengembangan Sistem Informasi", sks: 3, semester: 4, jenis: "Wajib" },
  { id: "S4-03", kode: "231640330", nama: "Jaringan Komputer", sks: 3, semester: 4, jenis: "Wajib" },
  { id: "S4-04", kode: "231640430", nama: "Riset dan Desain Pengalaman Pengguna", sks: 3, semester: 4, jenis: "Wajib" },
  { id: "S4-05", kode: "231640530", nama: "Teknologi Mobile", sks: 3, semester: 4, jenis: "Wajib" },
  { id: "S4-06", kode: "231640630", nama: "Bahasa Indonesias", sks: 3, semester: 4, jenis: "Wajib" },
  { id: "S4-07", kode: "231640730", nama: "Keamanan Informasi", sks: 3, semester: 4, jenis: "Wajib" },
  { id: "S4-08", kode: "AIK-24061", nama: "Bimbingan Umroh", sks: 0, semester: 4, jenis: "Pilihan" },

  // SEMESTER 5 (20 SKS)
  { id: "S5-01", kode: "231650130", nama: "Tata Kelola TI", sks: 3, semester: 5, jenis: "Wajib" },
  { id: "S5-02", kode: "231650230", nama: "Audit Sistem Informasi", sks: 3, semester: 5, jenis: "Wajib" },
  { id: "S5-03", kode: "231650330", nama: "Infrastruktur TI untuk Organisasi", sks: 3, semester: 5, jenis: "Wajib" },
  { id: "S5-04", kode: "231650430", nama: "Manajemen Layanan Teknologi Informasi", sks: 3, semester: 5, jenis: "Wajib" },
  { id: "S5-05", kode: "231650520", nama: "Manajemen Proyek Sistem Informasi", sks: 3, semester: 5, jenis: "Wajib" },
  { id: "S5-06", kode: "231650630", nama: "Manajemen Risiko Sistem Informasi", sks: 2, semester: 5, jenis: "Wajib" },
  { id: "S5-07", kode: "231650730", nama: "Penambangan Data", sks: 3, semester: 5, jenis: "Wajib" },

  // SEMESTER 6 (24 SKS)
  { id: "S6-01", kode: "231660130", nama: "E-Business", sks: 3, semester: 6, jenis: "Wajib" },
  { id: "S6-02", kode: "231660230", nama: "Manajemen Rantai Pasok", sks: 3, semester: 6, jenis: "Wajib" },
  { id: "S6-03", kode: "231660330", nama: "Visualisasi data dan informasi", sks: 3, semester: 6, jenis: "Wajib" },
  { id: "S6-04", kode: "231660430", nama: "kapita selekta", sks: 3, semester: 6, jenis: "Wajib" },
  { id: "S6-05", kode: "231660520", nama: "Analisis dan Desain Berientasi Obyek", sks: 3, semester: 6, jenis: "Pilihan" },
  { id: "S6-06", kode: "231660630", nama: "Business Intelligence", sks: 3, semester: 6, jenis: "Pilihan" },
  { id: "S6-07", kode: "231660730", nama: "Metodologi Penelitian", sks: 3, semester: 6, jenis: "Wajib" },
  { id: "S6-08", kode: "231660830", nama: "Capstone Project", sks: 6, semester: 6, jenis: "Wajib" },

  // SEMESTER 7 (18 SKS)
  { id: "S7-01", kode: "231670140", nama: "Kuliah Kerja Nyata (KKN)", sks: 4, semester: 7, jenis: "Wajib" },
  { id: "S7-02", kode: "231670220", nama: "Administrasi sistem dan jaringan", sks: 2, semester: 7, jenis: "Wajib" },
  { id: "S7-03", kode: "231670330", nama: "Arsitektur dan organisasi komputer", sks: 3, semester: 7, jenis: "Wajib" },
  { id: "S7-04", kode: "231670430", nama: "Fisika untuk SI", sks: 3, semester: 7, jenis: "Wajib" },
  { id: "S4-08", kode: "AIK-24261", nama: "Hukum Waris", sks: 0, semester: 7, jenis: "Pilihan" },
  { id: "S7-05", kode: "231670530", nama: "Manajemen hubungan pelanggan", sks: 3, semester: 7, jenis: "Pilihan" },
  { id: "S7-06", kode: "231670630", nama: "Manajemen merk digital", sks: 3, semester: 7, jenis: "Pilihan" },
  { id: "S7-10", kode: "231670632", nama: "Multimedia online", sks: 3, semester: 7, jenis: "Pilihan" },
  { id: "S7-11", kode: "231670633", nama: "Pembelajaran Mesin", sks: 3, semester: 7, jenis: "Pilihan" },
  { id: "S7-12", kode: "231670634", nama: "Perancangan antar muka pengguna", sks: 3, semester: 7, jenis: "Pilihan" },
  { id: "S7-13", kode: "231673634", nama: "Perilaku organisasi", sks: 3, semester: 7, jenis: "Pilihan" },
  { id: "S7-14", kode: "231672634", nama: "Sistem Informasi Geografis", sks: 3, semester: 7, jenis: "Pilihan" },
  { id: "S7-15", kode: "231674634", nama: "Sistem pengambilan keputusan", sks: 3, semester: 7, jenis: "Pilihan" },

  // SEMESTER 8 (6 SKS)
  { id: "S8-01", kode: "231680160", nama: "Skripsi", sks: 6, semester: 8, jenis: "Wajib" },
  { id: "S8-02", kode: "231680162", nama: "Kuliah Kerja Nyata", sks: 6, semester: 8, jenis: "Wajib" },
];
