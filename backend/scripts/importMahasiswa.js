const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const DEFAULT_PASSWORD = 'password123';
const SALT_ROUNDS = 10;
const EMAIL_DOMAIN = '@webmail.uad.ac.id';

async function importMahasiswaUAD() {
    console.log('🔄 Memulai import data mahasiswa...');
    console.log(`📧 Domain email: ${EMAIL_DOMAIN}`);
    console.log('='.repeat(60));
    
    try {
        // Baca file Excel
        const workbook = xlsx.readFile('./mahasiswa_si.xlsx');
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`📊 Ditemukan ${data.length} data mahasiswa di file Excel`);
        console.log('='.repeat(60));
        
        // Ambil data existing untuk validasi
        const existingNims = new Set();
        const existingEmails = new Set();
        
        const usersResult = await pool.query(
            'SELECT nim, email FROM users WHERE role = $1',
            ['mahasiswa']
        );
        usersResult.rows.forEach(row => {
            if (row.nim) existingNims.add(row.nim);
            if (row.email) existingEmails.add(row.email);
        });
        
        console.log(`📋 NIM existing: ${existingNims.size}`);
        console.log(`📋 Email existing: ${existingEmails.size}`);
        console.log('='.repeat(60));
        
        let stats = {
            success: 0,
            failed: 0,
            skipped: 0,
            duplicateNim: 0,
            duplicateEmail: 0
        };
        
        const errors = [];
        const processedNims = new Set(existingNims);
        const processedEmails = new Set(existingEmails);
        
        // Proses setiap baris
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const nim = row.NIM?.toString().trim() || '';
            const nama = row.Nama?.toString().trim() || '';
            
            // Progress
            const progress = Math.round(((i + 1) / data.length) * 100);
            process.stdout.write(`\r⏳ Progress: ${progress}% [${'#'.repeat(Math.floor(progress/5))}${'.'.repeat(20 - Math.floor(progress/5))}]`);
            
            if (!nim || !nama) {
                stats.skipped++;
                continue;
            }
            
            // Cek NIM duplikat
            if (processedNims.has(nim)) {
                stats.duplicateNim++;
                stats.skipped++;
                console.log(`\n⏭️ Skip: NIM ${nim} sudah terdaftar`);
                continue;
            }
            
            // Generate email dengan domain @webmail.uad.ac.id
            let email = generateEmailUAD(nama, nim, processedEmails);
            
            // Cek apakah email sudah digunakan
            if (processedEmails.has(email)) {
                // Coba dengan NIM
                email = `${nim}${EMAIL_DOMAIN}`;
                let counter = 1;
                while (processedEmails.has(email)) {
                    email = `${nim}${counter}${EMAIL_DOMAIN}`;
                    counter++;
                }
            }
            
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                // Hash password
                const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
                
                // 1. Buat user
                const userResult = await client.query(
                    `INSERT INTO users (name, email, password, role, nim, is_active, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                     RETURNING id`,
                    [nama, email, hashedPassword, 'mahasiswa', nim, true]
                );
                
                const userId = userResult.rows[0].id;
                
                // 2. Buat mahasiswa
                await client.query(
                    `INSERT INTO mahasiswa (
                        user_id, npm, nama_lengkap, email, 
                        semester, status, gpa, ipk,
                        created_at, updated_at
                     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
                    [userId, nim, nama, email, 1, 'aktif', 0.00, 0.00]
                );
                
                await client.query('COMMIT');
                
                // Track
                processedNims.add(nim);
                processedEmails.add(email);
                stats.success++;
                
                console.log(`\n✅ [${stats.success}] ${nim} - ${nama} (${email})`);
                
            } catch (rowError) {
                await client.query('ROLLBACK');
                
                if (rowError.code === '23505') {
                    const constraint = rowError.constraint;
                    if (constraint === 'users_nim_key') {
                        console.log(`\n⚠️ NIM ${nim} sudah terdaftar di users`);
                        processedNims.add(nim);
                        stats.duplicateNim++;
                        stats.skipped++;
                    } else if (constraint === 'users_email_key') {
                        stats.duplicateEmail++;
                        // Coba dengan email alternatif (NIM + timestamp)
                        try {
                            const altEmail = `${nim}_${Date.now()}${EMAIL_DOMAIN}`;
                            const retryClient = await pool.connect();
                            try {
                                await retryClient.query('BEGIN');
                                
                                const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
                                
                                const userResult = await retryClient.query(
                                    `INSERT INTO users (name, email, password, role, nim, is_active, created_at, updated_at)
                                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                                     RETURNING id`,
                                    [nama, altEmail, hashedPassword, 'mahasiswa', nim, true]
                                );
                                
                                await retryClient.query(
                                    `INSERT INTO mahasiswa (
                                        user_id, npm, nama_lengkap, email, 
                                        semester, status, gpa, ipk,
                                        created_at, updated_at
                                     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
                                    [userResult.rows[0].id, nim, nama, altEmail, 1, 'aktif', 0.00, 0.00]
                                );
                                
                                await retryClient.query('COMMIT');
                                
                                processedNims.add(nim);
                                processedEmails.add(altEmail);
                                stats.success++;
                                
                                console.log(`\n✅ [${stats.success}] ${nim} - ${nama} (${altEmail}) [FIXED]`);
                                
                            } catch (retryError) {
                                await retryClient.query('ROLLBACK');
                                throw retryError;
                            } finally {
                                retryClient.release();
                            }
                        } catch (altError) {
                            stats.failed++;
                            errors.push({ nim, nama, error: `Email error: ${altError.message}` });
                            console.log(`\n❌ [${stats.failed}] ${nim} - ${nama}: Email error`);
                        }
                    } else {
                        stats.failed++;
                        errors.push({ nim, nama, error: rowError.message });
                        console.log(`\n❌ [${stats.failed}] ${nim} - ${nama}: ${rowError.message}`);
                    }
                } else {
                    stats.failed++;
                    errors.push({ nim, nama, error: rowError.message });
                    console.log(`\n❌ [${stats.failed}] ${nim} - ${nama}: ${rowError.message}`);
                }
            } finally {
                client.release();
            }
        }
        
        console.log('\n');
        
        // Tampilkan ringkasan
        console.log('='.repeat(60));
        console.log('📊 RINGKASAN IMPORT');
        console.log('='.repeat(60));
        console.log(`✅ Berhasil: ${stats.success} mahasiswa`);
        console.log(`❌ Gagal: ${stats.failed} mahasiswa`);
        console.log(`⏭️ Skip (NIM duplikat): ${stats.duplicateNim}`);
        console.log(`⏭️ Skip (Email duplikat): ${stats.duplicateEmail}`);
        console.log(`📊 Total: ${data.length} mahasiswa`);
        
        if (errors.length > 0) {
            console.log('\n📝 10 ERROR PERTAMA:');
            errors.slice(0, 10).forEach((err, index) => {
                console.log(`  ${index + 1}. NIM: ${err.nim} - ${err.nama}`);
                console.log(`     Error: ${err.error}`);
            });
            if (errors.length > 10) {
                console.log(`  ... dan ${errors.length - 10} error lainnya`);
            }
        }
        
        // Verifikasi
        console.log('\n' + '='.repeat(60));
        console.log('🔍 VERIFIKASI');
        console.log('='.repeat(60));
        
        const verifyResult = await pool.query(
            'SELECT COUNT(*) as total FROM mahasiswa'
        );
        console.log(`📊 Total mahasiswa di database: ${verifyResult.rows[0].total}`);
        
        const verifyUsers = await pool.query(
            'SELECT COUNT(*) as total FROM users WHERE role = $1',
            ['mahasiswa']
        );
        console.log(`📊 Total users (mahasiswa): ${verifyUsers.rows[0].total}`);
        
        // Sample data
        if (verifyResult.rows[0].total > 0) {
            const sampleResult = await pool.query(
                `SELECT m.npm, m.nama_lengkap, m.email, u.email as user_email
                 FROM mahasiswa m
                 JOIN users u ON m.user_id = u.id
                 ORDER BY m.id DESC
                 LIMIT 5`
            );
            console.log('\n📋 5 Data terakhir:');
            sampleResult.rows.forEach((row, index) => {
                console.log(`  ${index + 1}. ${row.npm} - ${row.nama_lengkap}`);
                console.log(`     Email: ${row.email}`);
            });
        }
        
        console.log('\n🔑 INFORMASI LOGIN');
        console.log('='.repeat(60));
        console.log(`📧 Domain email: ${EMAIL_DOMAIN}`);
        console.log(`🔑 Password default: ${DEFAULT_PASSWORD}`);
        console.log('💡 Email format: [nama]@webmail.uad.ac.id atau [NIM]@webmail.uad.ac.id');
        console.log('⚠️  Harap ganti password setelah login pertama');
        
    } catch (error) {
        console.error('❌ Error fatal:', error.message);
        throw error;
    }
}

// Generate email dengan domain @webmail.uad.ac.id
function generateEmailUAD(nama, nim, processedEmails) {
    // Bersihkan nama
    let cleanName = nama
        .toLowerCase()
        .replace(/[^a-z\s]/g, '') // Hapus karakter khusus
        .replace(/\s+/g, '.')     // Ganti spasi dengan titik
        .trim();
    
    let email = '';
    
    // Coba dengan nama (format: nama@webmail.uad.ac.id)
    if (cleanName.length >= 3) {
        const parts = cleanName.split('.');
        let baseEmail = parts.slice(0, Math.min(parts.length, 3)).join('.');
        baseEmail = baseEmail.substring(0, 30).replace(/\.$/, '');
        
        email = `${baseEmail}${EMAIL_DOMAIN}`;
        
        // Jika email sudah digunakan, tambahkan angka
        let counter = 1;
        while (processedEmails.has(email)) {
            email = `${baseEmail}${counter}${EMAIL_DOMAIN}`;
            counter++;
            if (counter > 100) break;
        }
    }
    
    // Jika masih belum dapat email atau email sudah digunakan
    if (!email || processedEmails.has(email)) {
        // Gunakan NIM sebagai email
        email = `${nim}${EMAIL_DOMAIN}`;
        let counter = 1;
        while (processedEmails.has(email)) {
            email = `${nim}${counter}${EMAIL_DOMAIN}`;
            counter++;
            if (counter > 100) break;
        }
    }
    
    return email;
}

// Jalankan script
if (require.main === module) {
    importMahasiswaUAD()
        .then(() => {
            console.log('\n✅ Import selesai!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Import gagal:', error.message);
            process.exit(1);
        });
}

module.exports = importMahasiswaUAD;