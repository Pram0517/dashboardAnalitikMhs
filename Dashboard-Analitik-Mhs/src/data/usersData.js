// [REVISI] Data dummy user untuk autentikasi - ditambahkan role Mahasiswa
// Digunakan oleh AuthContext.js
export const usersData = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin UAD'
  },
  {
    id: 2,
    username: 'kaprodi',
    password: 'kaprodi123',
    role: 'kaprodi',
    name: 'Kaprodi Sistem Informasi'
  },
  {
    id: 3,
    username: '2200018001',
    password: 'mahasiswa123',
    role: 'mahasiswa',
    name: 'Budi Santoso',
    nim: '2200018001',
    angkatan: '2022'
  }
];
