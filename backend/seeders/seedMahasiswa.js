const pool = require('../config/database');

const seedMahasiswa = async () => {
    try {
        // Get user IDs
        const users = await pool.query(
            "SELECT id, nim FROM users WHERE role = 'mahasiswa'"
        );

        for (const user of users.rows) {
            await pool.query(
                `INSERT INTO mahasiswa (user_id, npm, nama_lengkap, email, semester, gpa, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (npm) DO NOTHING`,
                [
                    user.id,
                    user.nim,
                    user.nim === '2200018001' ? 'Citra Kirana' : 'Budi Santoso',
                    user.nim === '2200018001' ? 'citra@student.com' : 'budi@student.com',
                    8,
                    user.nim === '2200018001' ? 3.55 : 3.20,
                    'aktif'
                ]
            );
        }

        console.log('✅ Mahasiswa seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding mahasiswa:', error);
    }
};

module.exports = seedMahasiswa;