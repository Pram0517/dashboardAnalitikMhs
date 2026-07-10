const pool = require('../config/database');

async function checkKhsData() {
    console.log('🔍 Cek Data KHS');
    console.log('='.repeat(60));

    // Total KHS
    const totalKhs = await pool.query('SELECT COUNT(*) FROM khs');
    console.log(`📊 Total KHS: ${totalKhs.rows[0].count}`);

    // KHS dengan details
    const withDetails = await pool.query(
        "SELECT COUNT(*) FROM khs WHERE details IS NOT NULL AND details != '[]'"
    );
    console.log(`📊 KHS dengan details: ${withDetails.rows[0].count}`);

    // Total mahasiswa di tabel mahasiswa
    const totalMahasiswa = await pool.query('SELECT COUNT(*) FROM mahasiswa');
    console.log(`📊 Total mahasiswa: ${totalMahasiswa.rows[0].count}`);

    // Mahasiswa dengan KHS
    const mhsWithKhs = await pool.query(
        `SELECT COUNT(DISTINCT nim) FROM khs WHERE details IS NOT NULL AND details != '[]'`
    );
    console.log(`📊 Mahasiswa dengan KHS: ${mhsWithKhs.rows[0].count}`);

    // Sample NIM dengan KHS
    const sample = await pool.query(
        `SELECT DISTINCT nim, COUNT(*) as jumlah 
         FROM khs 
         WHERE details IS NOT NULL AND details != '[]' 
         GROUP BY nim 
         ORDER BY jumlah DESC 
         LIMIT 10`
    );
    console.log('\n📋 10 NIM dengan KHS terbanyak:');
    sample.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.nim} - ${row.jumlah} KHS`);
    });

    // Cek mahasiswa yang tidak punya KHS
    const mhsWithoutKhs = await pool.query(
        `SELECT COUNT(*) 
         FROM mahasiswa m 
         LEFT JOIN khs k ON m.npm = k.nim 
         WHERE k.id IS NULL`
    );
    console.log(`\n📊 Mahasiswa tanpa KHS: ${mhsWithoutKhs.rows[0].count}`);

    process.exit(0);
}

checkKhsData();