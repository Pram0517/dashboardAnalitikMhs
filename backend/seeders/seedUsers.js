const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedUsers = async () => {
    try {
        // Password hash untuk 'admin123', 'kaprodi123', 'mahasiswa123'
        const adminPassword = await bcrypt.hash('admin123', 10);
        const kaprodiPassword = await bcrypt.hash('kaprodi123', 10);
        const mahasiswaPassword = await bcrypt.hash('mahasiswa123', 10);

        // Insert Admin
        await pool.query(
            `INSERT INTO users (name, email, password, role, nim)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING`,
            ['Administrator', 'admin@uad.ac.id', adminPassword, 'admin', null]
        );
        console.log('✅ Admin created');

        // Insert Kaprodi
        await pool.query(
            `INSERT INTO users (name, email, password, role, nim)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING`,
            ['Kepala Program Studi', 'kaprodi@uad.ac.id', kaprodiPassword, 'kaprodi', null]
        );
        console.log('✅ Kaprodi created');

        // Insert Mahasiswa 1
        await pool.query(
            `INSERT INTO users (name, email, password, role, nim)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING`,
            ['Citra Kirana', 'citra@student.com', mahasiswaPassword, 'mahasiswa', '2200018001']
        );
        console.log('✅ Mahasiswa 1 created');

        // Insert Mahasiswa 2
        await pool.query(
            `INSERT INTO users (name, email, password, role, nim)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING`,
            ['Budi Santoso', 'budi@student.com', mahasiswaPassword, 'mahasiswa', '2200018002']
        );
        console.log('✅ Mahasiswa 2 created');

        console.log('🎉 Users seeding completed!');
    } catch (error) {
        console.error('❌ Error seeding users:', error);
    }
};

module.exports = seedUsers;