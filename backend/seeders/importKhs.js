// seeders/importKhs.js
const { Client } = require('pg');
const XLSX = require('xlsx');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dashboard_analitik_mhs',
});

// ============ KONFIGURASI ============
// Gunakan user_id dari user mahasiswa yang sudah ada
const DEFAULT_USER_ID = 3; // mahasiswa@uad.ac.id

// Cache
const mahasiswaCache = new Map();
const mataKuliahCache = new Map();

// ============ FUNGSI UTILITY ============
function getBobotFromHuruf(nilaiHuruf) {
    if (!nilaiHuruf || nilaiHuruf === '' || nilaiHuruf === '-') return null;
    const map = {
        'A': 4, 'A-': 3.7, 'A+': 4.0,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'D+': 1.3,
        'E': 0.0
    };
    return map[nilaiHuruf.toUpperCase()] ?? null;
}

function formatTahunAkademik(ta, sem) {
    const nextYear = ta + 1;
    const semester = sem % 2 === 1 ? 'Ganjil' : 'Genap';
    return `${ta}/${nextYear} ${semester}`;
}

function readExcelFile(filePath) {
    console.log(`📖 Membaca file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File tidak ditemukan: ${filePath}`);
        process.exit(1);
    }

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const rows = data.slice(1).filter(row => {
            return row[0] && row[0] !== 'NIM' && row[0] !== 'Kode_MK' && row[0] !== 'nim';
        });
        
        console.log(`📊 Ditemukan ${rows.length} baris data`);
        return rows;
    } catch (error) {
        console.error('❌ Error membaca file Excel:', error.message);
        process.exit(1);
    }
}

// ============ FUNGSI GET OR CREATE MAHASISWA ============
async function getOrCreateMahasiswa(nim, semester, nama) {
    const nimStr = String(nim).trim();
    
    if (mahasiswaCache.has(nimStr)) {
        return mahasiswaCache.get(nimStr);
    }

    // Cek apakah mahasiswa sudah ada
    const result = await client.query(
        'SELECT id FROM mahasiswa WHERE npm = $1',
        [nimStr]
    );

    let id;
    if (result.rows.length > 0) {
        id = result.rows[0].id;
        // Update semester jika perlu
        if (semester) {
            await client.query(
                'UPDATE mahasiswa SET semester = $1 WHERE id = $2',
                [Math.max(semester, 1), id]
            );
        }
        console.log(`✅ Mahasiswa sudah ada: ${nimStr} (id: ${id})`);
    } else {
        // INSERT dengan user_id = 3 (mahasiswa@uad.ac.id)
        const email = `${nimStr}@student.uad.ac.id`;
        const namaLengkap = nama || `Mahasiswa ${nimStr}`;
        
        const insertResult = await client.query(
            `INSERT INTO mahasiswa (npm, nama_lengkap, email, user_id, semester, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id`,
            [nimStr, namaLengkap, email, DEFAULT_USER_ID, semester || 1, 'aktif']
        );
        id = insertResult.rows[0].id;
        console.log(`👤 Membuat mahasiswa baru: ${nimStr} (id: ${id})`);
    }

    mahasiswaCache.set(nimStr, id);
    return id;
}

// ============ FUNGSI GET OR CREATE MATA KULIAH ============
async function getOrCreateMataKuliah(kodeMK, namaMK, sks) {
    const kodeStr = String(kodeMK).trim();
    
    if (mataKuliahCache.has(kodeStr)) {
        return mataKuliahCache.get(kodeStr);
    }

    const result = await client.query(
        'SELECT id FROM mata_kuliah WHERE kode_mk = $1',
        [kodeStr]
    );

    let id;
    if (result.rows.length > 0) {
        id = result.rows[0].id;
    } else {
        const insertResult = await client.query(
            `INSERT INTO mata_kuliah (kode_mk, nama_mata_kuliah, sks, kurikulum_id) 
             VALUES ($1, $2, $3, 1) 
             RETURNING id`,
            [kodeStr, String(namaMK || kodeStr).trim(), parseInt(sks) || 0]
        );
        id = insertResult.rows[0].id;
        console.log(`📚 Membuat mata kuliah baru: ${kodeStr} - ${namaMK}`);
    }

    mataKuliahCache.set(kodeStr, id);
    return id;
}

// ============ MAIN FUNCTION ============
async function importData() {
    let totalRows = 0;
    let insertedKhs = 0;
    let updatedKhs = 0;
    let errorCount = 0;
    let skippedEmpty = 0;

    const startTime = Date.now();

    try {
        await client.connect();
        console.log('✅ Terhubung ke database');
        console.log(`📦 Database: ${process.env.DB_NAME}`);
        
        // Cek user_id default
        const userCheck = await client.query('SELECT id, email FROM users WHERE id = $1', [DEFAULT_USER_ID]);
        if (userCheck.rows.length === 0) {
            console.log(`❌ User dengan ID ${DEFAULT_USER_ID} tidak ditemukan!`);
            console.log('📋 Daftar user yang tersedia:');
            const users = await client.query('SELECT id, email, role FROM users');
            users.rows.forEach(u => console.log(`   - ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`));
            process.exit(1);
        }
        console.log(`✅ Menggunakan user_id: ${DEFAULT_USER_ID} (${userCheck.rows[0].email})`);
        console.log('');

        // Baca file Excel
        const filePath = process.argv[2] || 'C:\\Users\\user\\OneDrive\\Dokumen\\CAPSTONE\\P\\backend\\khs_si.xlsx';
        const rows = readExcelFile(filePath);

        // Group data per mahasiswa per semester
        const groupedData = new Map();

        for (const row of rows) {
            const [nim, ta, sem, kodeMK, namaMK, sifat, sks, bobot, nilai] = row;
            
            if (!nim || nim === '' || !kodeMK || kodeMK === '') {
                skippedEmpty++;
                continue;
            }

            const key = `${String(nim).trim()}-${ta}-${sem}`;
            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    nim: String(nim).trim(),
                    nama: `Mahasiswa ${String(nim).trim()}`,
                    ta: parseInt(ta) || 0,
                    sem: parseInt(sem) || 1,
                    details: []
                });
            }

            let bobotFinal = null;
            if (bobot !== null && bobot !== undefined && bobot !== '' && bobot !== '-') {
                bobotFinal = parseFloat(bobot);
                if (isNaN(bobotFinal)) {
                    if (nilai) {
                        bobotFinal = getBobotFromHuruf(nilai);
                    }
                }
            } else if (nilai) {
                bobotFinal = getBobotFromHuruf(nilai);
            }

            groupedData.get(key).details.push({
                sks: parseInt(sks) || 0,
                bobot: bobotFinal,
                kode_mk: String(kodeMK).trim(),
                nama_mk: String(namaMK || kodeMK).trim(),
                nilai_huruf: nilai ? String(nilai).trim() : null
            });

            totalRows++;
        }

        console.log(`📊 Data dikelompokkan menjadi ${groupedData.size} record KHS`);
        console.log(`⏭️  ${skippedEmpty} baris dilewati (data kosong)`);
        console.log('');

        // Proses setiap kelompok
        let processed = 0;
        for (const [key, group] of groupedData) {
            try {
                const { nim, ta, sem, details } = group;

                // Get or create mahasiswa
                const mahasiswaId = await getOrCreateMahasiswa(nim, sem);

                // Get or create mata kuliah
                const detailsWithId = [];
                for (const detail of details) {
                    const mkId = await getOrCreateMataKuliah(
                        detail.kode_mk,
                        detail.nama_mk,
                        detail.sks
                    );
                    detailsWithId.push({
                        ...detail,
                        mata_kuliah_id: mkId
                    });
                }

                // Format tahun akademik
                const tahunAkademikStr = formatTahunAkademik(ta, sem);

                // Cek apakah KHS sudah ada
                const khsResult = await client.query(
                    'SELECT id, details FROM khs WHERE nim = $1 AND semester = $2 AND tahun_akademik = $3',
                    [nim, sem, tahunAkademikStr]
                );

                if (khsResult.rows.length > 0) {
                    // Merge details
                    let existingDetails = khsResult.rows[0].details || [];
                    for (const newDetail of detailsWithId) {
                        const existingIndex = existingDetails.findIndex(
                            d => d.kode_mk === newDetail.kode_mk
                        );
                        if (existingIndex >= 0) {
                            existingDetails[existingIndex] = newDetail;
                        } else {
                            existingDetails.push(newDetail);
                        }
                    }
                    await client.query(
                        'UPDATE khs SET details = $1, updated_at = NOW() WHERE id = $2',
                        [JSON.stringify(existingDetails), khsResult.rows[0].id]
                    );
                    updatedKhs++;
                } else {
                    await client.query(
                        `INSERT INTO khs (nim, semester, tahun_akademik, details, status_verifikasi) 
                         VALUES ($1, $2, $3, $4, $5)`,
                        [nim, sem, tahunAkademikStr, JSON.stringify(detailsWithId), 'Terverifikasi']
                    );
                    insertedKhs++;
                }

                processed++;
                if (processed % 100 === 0) {
                    console.log(`📝 Proses ${processed}/${groupedData.size} record...`);
                }

            } catch (rowError) {
                errorCount++;
                console.error(`❌ Error pada ${key}:`, rowError.message);
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('');
        console.log('='.repeat(60));
        console.log('📊 RINGKASAN IMPORT DATA');
        console.log('='.repeat(60));
        console.log(`📄 Total baris data      : ${totalRows}`);
        console.log(`📦 Total record KHS     : ${groupedData.size}`);
        console.log(`✅ Insert baru          : ${insertedKhs}`);
        console.log(`🔄 Update existing      : ${updatedKhs}`);
        console.log(`👤 Total mahasiswa      : ${mahasiswaCache.size}`);
        console.log(`📚 Total mata kuliah    : ${mataKuliahCache.size}`);
        console.log(`⏭️  Data kosong/skip     : ${skippedEmpty}`);
        console.log(`❌ Error                : ${errorCount}`);
        console.log(`⏱️  Waktu eksekusi      : ${duration} detik`);
        console.log('='.repeat(60));
        console.log('✅ Import selesai!');

    } catch (error) {
        console.error('❌ Error fatal:', error.message);
        console.error(error.stack);
    } finally {
        await client.end();
        console.log('🔌 Koneksi database ditutup');
    }
}

// Jalankan
importData();