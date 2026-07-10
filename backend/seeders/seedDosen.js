const pool = require('../config/database');

const seedDosen = async () => {
    try {
        const dosenData = [
            {
                nip: '1234567890',
                nama_lengkap: 'Dr. Ahmad Budiman, M.Kom',
                email: 'ahmad.budiman@uad.ac.id',
                no_hp: '081234567890',
                bidang_keahlian: 'Sistem Informasi, Data Mining',
                gelar: 'Dr., M.Kom',
                kuota: 10
            },
            {
                nip: '1234567891',
                nama_lengkap: 'Dr. Siti Rahayu, M.Sc',
                email: 'siti.rahayu@uad.ac.id',
                no_hp: '081234567891',
                bidang_keahlian: 'Basis Data, Sistem Informasi',
                gelar: 'Dr., M.Sc',
                kuota: 8
            },
            {
                nip: '1234567892',
                nama_lengkap: 'Dr. Budi Santoso, M.T',
                email: 'budi.santoso@uad.ac.id',
                no_hp: '081234567892',
                bidang_keahlian: 'Jaringan Komputer, Keamanan Siber',
                gelar: 'Dr., M.T',
                kuota: 10
            }
        ];

        for (const dosen of dosenData) {
            await pool.query(
                `INSERT INTO dosen (nip, nama_lengkap, email, no_hp, bidang_keahlian, gelar, kuota)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (nip) DO NOTHING`,
                [dosen.nip, dosen.nama_lengkap, dosen.email, dosen.no_hp, dosen.bidang_keahlian, dosen.gelar, dosen.kuota]
            );
        }

        console.log('✅ Dosen seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding dosen:', error);
    }
};

module.exports = seedDosen;