const pool = require('../config/database');

// Konversi nilai huruf ke angka
function konversiNilaiHuruf(nilaiHuruf) {
    if (!nilaiHuruf) return 0;
    
    const mapping = {
        'A': 4.00,
        'A-': 3.67,
        'B+': 3.33,
        'B': 3.00,
        'B-': 2.67,
        'C+': 2.33,
        'C': 2.00,
        'D': 1.00,
        'E': 0.00
    };
    
    const clean = nilaiHuruf.toString().toUpperCase().trim();
    return mapping[clean] !== undefined ? mapping[clean] : 0;
}

async function migrateKhsToNilai() {
    console.log('🔄 Memulai migrasi data KHS ke tabel nilai_mahasiswa...');
    console.log('='.repeat(60));

    try {
        // Ambil semua data KHS yang memiliki details (tidak kosong)
        const khsResult = await pool.query(
            `SELECT id, nim, semester, details 
             FROM khs 
             WHERE details IS NOT NULL AND details != '[]' 
             ORDER BY nim, semester`
        );

        console.log(`📊 Ditemukan ${khsResult.rows.length} data KHS yang memiliki detail nilai`);
        console.log('='.repeat(60));

        let stats = {
            totalKhs: khsResult.rows.length,
            totalMk: 0,
            success: 0,
            failed: 0,
            skipped: 0,
            mahasiswaNotFound: 0
        };

        const errors = [];

        // Proses setiap KHS
        for (let i = 0; i < khsResult.rows.length; i++) {
            const khs = khsResult.rows[i];
            const nim = khs.nim?.toString().trim() || '';
            const semester = parseInt(khs.semester) || 0;
            const details = khs.details;

            // Progress
            const progress = Math.round(((i + 1) / khsResult.rows.length) * 100);
            process.stdout.write(`\r⏳ Progress: ${progress}% [${'#'.repeat(Math.floor(progress/5))}${'.'.repeat(20 - Math.floor(progress/5))}]`);

            if (!nim || semester === 0) {
                stats.skipped++;
                continue;
            }

            // Cari mahasiswa berdasarkan NIM
            const mahasiswaResult = await pool.query(
                'SELECT id, npm, nama_lengkap FROM mahasiswa WHERE npm = $1',
                [nim]
            );

            if (mahasiswaResult.rows.length === 0) {
                stats.mahasiswaNotFound++;
                console.log(`\n⚠️ Mahasiswa tidak ditemukan: NIM ${nim}`);
                continue;
            }

            const mahasiswa = mahasiswaResult.rows[0];

            // Parse details (JSON)
            let nilaiList = [];
            try {
                nilaiList = typeof details === 'string' ? JSON.parse(details) : details;
                if (!Array.isArray(nilaiList)) {
                    nilaiList = [];
                }
            } catch (e) {
                console.log(`\n⚠️ Error parsing JSON untuk NIM ${nim}, semester ${semester}`);
                stats.failed++;
                continue;
            }

            // Proses setiap mata kuliah dalam detail
            for (const item of nilaiList) {
                const kodeMK = item.kode_mk?.toString().trim() || '';
                const namaMK = item.nama_mk?.toString().trim() || '';
                const sks = parseInt(item.sks) || 0;
                const bobot = parseFloat(item.bobot) || 0;
                const nilaiHuruf = item.nilai_huruf?.toString().trim() || '';

                // Skip jika SKS 0 atau tidak ada kode
                if (sks === 0 || !kodeMK) {
                    stats.skipped++;
                    continue;
                }

                // Tentukan nilai angka
                let nilaiAngka = bobot;
                if (nilaiAngka === 0 && nilaiHuruf) {
                    nilaiAngka = konversiNilaiHuruf(nilaiHuruf);
                }

                try {
                    // Cek apakah data sudah ada
                    const checkResult = await pool.query(
                        `SELECT id FROM nilai_mahasiswa 
                         WHERE mahasiswa_id = $1 AND semester = $2 AND kode_mata_kuliah = $3`,
                        [mahasiswa.id, semester, kodeMK]
                    );

                    if (checkResult.rows.length > 0) {
                        // Update data yang sudah ada
                        await pool.query(
                            `UPDATE nilai_mahasiswa 
                             SET nama_mata_kuliah = $1, 
                                 sks = $2, 
                                 nilai_huruf = $3, 
                                 nilai_angka = $4,
                                 updated_at = NOW()
                             WHERE id = $5`,
                            [namaMK, sks, nilaiHuruf, nilaiAngka, checkResult.rows[0].id]
                        );
                    } else {
                        // Insert data baru
                        await pool.query(
                            `INSERT INTO nilai_mahasiswa 
                             (mahasiswa_id, semester, kode_mata_kuliah, nama_mata_kuliah, 
                              sks, nilai_huruf, nilai_angka, created_at, updated_at)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                            [mahasiswa.id, semester, kodeMK, namaMK, sks, nilaiHuruf, nilaiAngka]
                        );
                    }

                    stats.totalMk++;

                } catch (rowError) {
                    stats.failed++;
                    errors.push({
                        nim,
                        semester,
                        kodeMK,
                        namaMK,
                        error: rowError.message
                    });
                }
            }

            stats.success++;
        }

        console.log('\n');

        // Hitung ulang IPK untuk semua mahasiswa
        console.log('🔄 Menghitung ulang IPK untuk semua mahasiswa...');
        const mahasiswaList = await pool.query('SELECT id FROM mahasiswa');
        let ipkUpdated = 0;

        for (const mhs of mahasiswaList.rows) {
            const ipkResult = await pool.query(
                `SELECT 
                    SUM(sks * nilai_angka) as total_bobot,
                    SUM(sks) as total_sks
                 FROM nilai_mahasiswa
                 WHERE mahasiswa_id = $1`,
                [mhs.id]
            );

            const totalSks = ipkResult.rows[0].total_sks || 0;
            const totalBobot = ipkResult.rows[0].total_bobot || 0;
            const ipk = totalSks > 0 ? parseFloat((totalBobot / totalSks).toFixed(2)) : 0;

            await pool.query(
                'UPDATE mahasiswa SET gpa = $1, ipk = $1, updated_at = NOW() WHERE id = $2',
                [ipk, mhs.id]
            );
            ipkUpdated++;
        }

        // Tampilkan ringkasan
        console.log('\n' + '='.repeat(60));
        console.log('📊 RINGKASAN MIGRASI');
        console.log('='.repeat(60));
        console.log(`📋 Total KHS diproses: ${stats.totalKhs}`);
        console.log(`✅ Berhasil: ${stats.success} KHS`);
        console.log(`❌ Gagal: ${stats.failed} KHS`);
        console.log(`⏭️ Skip: ${stats.skipped} KHS`);
        console.log(`⚠️ Mahasiswa tidak ditemukan: ${stats.mahasiswaNotFound}`);
        console.log(`📚 Total mata kuliah: ${stats.totalMk}`);
        console.log(`🔄 IPK diupdate: ${ipkUpdated} mahasiswa`);

        if (errors.length > 0) {
            console.log('\n📝 10 ERROR PERTAMA:');
            errors.slice(0, 10).forEach((err, index) => {
                console.log(`  ${index + 1}. NIM: ${err.nim} - Semester ${err.semester} - ${err.kodeMK}`);
                console.log(`     Error: ${err.error}`);
            });
            if (errors.length > 10) {
                console.log(`  ... dan ${errors.length - 10} error lainnya`);
            }
        }

        // Verifikasi final
        console.log('\n' + '='.repeat(60));
        console.log('🔍 VERIFIKASI FINAL');
        console.log('='.repeat(60));

        const verifyResult = await pool.query(
            `SELECT 
                COUNT(DISTINCT mahasiswa_id) as total_mahasiswa,
                COUNT(*) as total_nilai
             FROM nilai_mahasiswa`
        );
        console.log(`📊 Total mahasiswa dengan nilai: ${verifyResult.rows[0].total_mahasiswa}`);
        console.log(`📊 Total data nilai: ${verifyResult.rows[0].total_nilai}`);

        // Sample IPS per mahasiswa
        const sampleResult = await pool.query(
            `SELECT 
                m.npm,
                m.nama_lengkap,
                m.gpa as ipk,
                COUNT(n.id) as jumlah_mk,
                SUM(n.sks) as total_sks
             FROM mahasiswa m
             LEFT JOIN nilai_mahasiswa n ON m.id = n.mahasiswa_id
             GROUP BY m.id, m.npm, m.nama_lengkap, m.gpa
             HAVING COUNT(n.id) > 0
             ORDER BY m.id DESC
             LIMIT 5`
        );

        console.log('\n📋 5 Mahasiswa terakhir dengan nilai:');
        sampleResult.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. ${row.npm} - ${row.nama_lengkap}`);
            console.log(`     IPK: ${row.ipk || 0}, MK: ${row.jumlah_mk}, SKS: ${row.total_sks}`);
        });

        console.log('\n✅ Migrasi selesai!');

    } catch (error) {
        console.error('❌ Error fatal:', error.message);
        throw error;
    }
}

// Jalankan script
if (require.main === module) {
    migrateKhsToNilai()
        .then(() => {
            console.log('\n✅ Migrasi KHS selesai!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migrasi gagal:', error.message);
            process.exit(1);
        });
}

module.exports = migrateKhsToNilai;