const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dashboard_analitik_mhs',
  password: 'root', // ganti dengan password PostgreSQL Anda
  port: 5432,
});

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const setupUsers = async () => {
  try {
    // Hash passwords
    const adminHash = await hashPassword('admin123');
    const kaprodiHash = await hashPassword('kaprodi123');
    const mahasiswaHash = await hashPassword('mahasiswa123');

    console.log('✓ Passwords hashed successfully');

    // Insert Admin
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
      ['Administrator', 'admin@uad.ac.id', adminHash, 'admin']
    );
    console.log('✓ Admin created: admin@uad.ac.id / admin123');

    // Insert Kaprodi
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
      ['Kepala Program Studi', 'kaprodi@uad.ac.id', kaprodiHash, 'kaprodi']
    );
    console.log('✓ Kaprodi created: kaprodi@uad.ac.id / kaprodi123');

    // Insert Mahasiswa
    await pool.query(
      `INSERT INTO users (name, email, password, role, nim) VALUES ($1, $2, $3, $4, $5)`,
      ['Ahmad Fahrurrozi', 'mahasiswa@uad.ac.id', mahasiswaHash, 'mahasiswa', '2200018001']
    );
    console.log('✓ Mahasiswa created: 2200018001 / mahasiswa123');

    // Insert ke tabel mahasiswa (relasi)
    await pool.query(
      `INSERT INTO mahasiswa (user_id, npm, nama_lengkap, email, semester, status) 
       VALUES ((SELECT id FROM users WHERE nim = '2200018001'), '2200018001', 'Ahmad Fahrurrozi', 'mahasiswa@uad.ac.id', 6, 'aktif')`
    );
    console.log('✓ Mahasiswa data inserted to mahasiswa table');

    console.log('\n✅ All users created successfully!');
    console.log('=====================================');
    console.log('Admin:    admin@uad.ac.id / admin123');
    console.log('Kaprodi:  kaprodi@uad.ac.id / kaprodi123');
    console.log('Mahasiswa: 2200018001 / mahasiswa123');
    console.log('=====================================');

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

setupUsers();