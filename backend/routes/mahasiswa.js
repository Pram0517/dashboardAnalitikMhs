const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controllers/mahasiswaController');
const {
    authMiddleware,
    adminMiddleware,
    kaprodiOrAdminMiddleware
} = require('../middleware/auth');

// ============ ROUTE SPESIFIK HARUS DI ATAS ROUTE DENGAN PARAMETER ============

// 1. GET ALL MAHASISWA WITH DETAILS (harus di atas /:nim)
router.get('/with-details',
    authMiddleware,
    mahasiswaController.getAllWithDetails
);

// 2. GET MAHASISWA BY NIM WITH DETAILS (harus di atas /:nim)
router.get('/:nim/with-details',
    authMiddleware,
    mahasiswaController.getByNimWithDetails
);

// 3. SELF ROUTES (harus di atas /:nim)
router.get('/self', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');

        if (req.user.role !== 'mahasiswa') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya untuk mahasiswa.'
            });
        }

        const nim = req.user.nim;
        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM tidak ditemukan di token'
            });
        }

        const result = await pool.query(`
            SELECT m.*, u.name, u.email 
            FROM mahasiswa m
            JOIN users u ON m.user_id = u.id
            WHERE m.npm = $1
        `, [nim]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching self:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

router.get('/self/khs', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');

        if (req.user.role !== 'mahasiswa') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya untuk mahasiswa.'
            });
        }

        const nim = req.user.nim;
        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM tidak ditemukan di token'
            });
        }

        const result = await pool.query(`
            SELECT * FROM khs WHERE nim = $1 ORDER BY semester ASC
        `, [nim]);

        res.json({
            status: 'Success',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching self khs:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

router.get('/self/capstone', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');

        if (req.user.role !== 'mahasiswa') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya untuk mahasiswa.'
            });
        }

        const nim = req.user.nim;
        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM tidak ditemukan di token'
            });
        }

        const result = await pool.query(`
            SELECT * FROM capstone WHERE nim = $1
        `, [nim]);

        res.json({
            status: 'Success',
            data: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error fetching self capstone:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

router.get('/self/skripsi', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');

        if (req.user.role !== 'mahasiswa') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya untuk mahasiswa.'
            });
        }

        const nim = req.user.nim;
        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM tidak ditemukan di token'
            });
        }

        const mahasiswaResult = await pool.query(
            'SELECT id FROM mahasiswa WHERE npm = $1', [nim]
        );

        if (mahasiswaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        const mahasiswaId = mahasiswaResult.rows[0].id;

        const result = await pool.query(`
            SELECT 
                s.*,
                d1.nama_lengkap as dosen_pembimbing_1,
                d2.nama_lengkap as dosen_pembimbing_2
            FROM skripsi s
            LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
            LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
            WHERE s.mahasiswa_id = $1
        `, [mahasiswaId]);

        let skripsiData = null;
        if (result.rows.length > 0) {
            const row = result.rows[0];
            skripsiData = {
                id: row.id,
                nim: nim,
                judul: row.judul || '-',
                status: row.status || 'Belum Mulai',
                dosenPembimbing: row.dosen_pembimbing_1 || row.dosen_pembimbing_2 || '-',
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        }

        res.json({
            status: 'Success',
            data: skripsiData
        });
    } catch (error) {
        console.error('Error fetching self skripsi:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

router.get('/self/mata-kuliah', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');

        if (req.user.role !== 'mahasiswa') {
            return res.status(403).json({
                status: 'Error',
                message: 'Akses ditolak. Hanya untuk mahasiswa.'
            });
        }

        const nim = req.user.nim;
        if (!nim) {
            return res.status(400).json({
                status: 'Error',
                message: 'NIM tidak ditemukan di token'
            });
        }

        const { semester } = req.query;

        const mahasiswaResult = await pool.query(
            'SELECT id FROM mahasiswa WHERE npm = $1', [nim]
        );

        if (mahasiswaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        const mahasiswaId = mahasiswaResult.rows[0].id;

        let query = `
            SELECT 
                mk.id,
                mk.kode_mk,
                mk.nama_mata_kuliah,
                mk.sks,
                mk.semester,
                krs.nilai,
                krs.status,
                krs.tahun_akademik
            FROM krs
            JOIN mata_kuliah mk ON mk.id = krs.mata_kuliah_id
            WHERE krs.mahasiswa_id = $1
        `;
        const params = [mahasiswaId];

        if (semester && semester !== 'all' && semester !== 'undefined') {
            query += ` AND mk.semester = $2`;
            params.push(parseInt(semester));
        }

        query += ` ORDER BY mk.semester ASC, mk.kode_mk ASC`;

        const result = await pool.query(query, params);

        res.json({
            status: 'Success',
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching self mata kuliah:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ MAHASISWA CRUD (dengan NIM) - HARUS DI BAWAH ROUTE SPESIFIK ============
router.get('/', authMiddleware, kaprodiOrAdminMiddleware, mahasiswaController.getAll);
router.get('/:nim', authMiddleware, mahasiswaController.getById);
router.post('/', authMiddleware, adminMiddleware, mahasiswaController.create);
router.put('/:nim', authMiddleware, mahasiswaController.update);
router.delete('/:nim', authMiddleware, adminMiddleware, mahasiswaController.delete);

// ============ KHS, CAPSTONE, SKRIPSI (by NIM) ============
router.get('/:nim/khs', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;

        const result = await pool.query(`
            SELECT * FROM khs WHERE nim = $1 ORDER BY semester ASC
        `, [nim]);

        res.json({
            status: 'Success',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching KHS:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

router.get('/:nim/capstone', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;

        const result = await pool.query(`
            SELECT * FROM capstone WHERE nim = $1
        `, [nim]);

        res.json({
            status: 'Success',
            data: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error fetching capstone:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

router.get('/:nim/skripsi', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;

        const mahasiswaResult = await pool.query(
            'SELECT id FROM mahasiswa WHERE npm = $1', [nim]
        );

        if (mahasiswaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        const mahasiswaId = mahasiswaResult.rows[0].id;

        const result = await pool.query(`
            SELECT 
                s.*,
                d1.nama_lengkap as dosen_pembimbing_1,
                d2.nama_lengkap as dosen_pembimbing_2
            FROM skripsi s
            LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
            LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
            WHERE s.mahasiswa_id = $1
        `, [mahasiswaId]);

        let skripsiData = null;
        if (result.rows.length > 0) {
            const row = result.rows[0];
            skripsiData = {
                id: row.id,
                nim: nim,
                judul: row.judul || '-',
                status: row.status || 'Belum Mulai',
                dosenPembimbing: row.dosen_pembimbing_1 || row.dosen_pembimbing_2 || '-',
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        }

        res.json({
            status: 'Success',
            data: skripsiData
        });
    } catch (error) {
        console.error('Error fetching skripsi:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET MATA KULIAH MAHASISWA (by NIM) ============
router.get('/:nim/mata-kuliah', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;
        const { semester } = req.query;

        // Cari mahasiswa_id dari NIM
        const mahasiswaResult = await pool.query(
            'SELECT id FROM mahasiswa WHERE npm = $1', [nim]
        );

        if (mahasiswaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        const mahasiswaId = mahasiswaResult.rows[0].id;

        // Query menggunakan tabel nilai_mahasiswa (bukan krs)
        let query = `
            SELECT 
                id,
                semester,
                kode_mata_kuliah as kode_mk,
                nama_mata_kuliah,
                sks,
                nilai_huruf as nilai,
                nilai_angka as bobot,
                CASE 
                    WHEN nilai_angka >= 2.00 THEN 'Lulus'
                    WHEN nilai_angka > 0 AND nilai_angka < 2.00 THEN 'Tidak Lulus'
                    ELSE 'Belum Dinilai'
                END as status
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
        `;
        const params = [mahasiswaId];

        if (semester && semester !== 'all' && semester !== 'undefined') {
            query += ` AND semester = $2`;
            params.push(parseInt(semester));
        }

        query += ` ORDER BY semester ASC, kode_mata_kuliah ASC`;

        const result = await pool.query(query, params);

        res.json({
            status: 'Success',
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching mata kuliah mahasiswa:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET RIWAYAT NILAI MAHASISWA ============
router.get('/:nim/riwayat-nilai', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;

        // Cari mahasiswa_id dari NIM
        const mahasiswaResult = await pool.query(
            'SELECT id FROM mahasiswa WHERE npm = $1', [nim]
        );

        if (mahasiswaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        const mahasiswaId = mahasiswaResult.rows[0].id;

        // Query menggunakan tabel nilai_mahasiswa
        const result = await pool.query(`
            SELECT 
                id,
                semester,
                kode_mata_kuliah as kode_mk,
                nama_mata_kuliah,
                sks,
                nilai_huruf as nilai,
                nilai_angka as bobot,
                CASE 
                    WHEN nilai_angka >= 2.00 THEN 'Lulus'
                    WHEN nilai_angka > 0 AND nilai_angka < 2.00 THEN 'Tidak Lulus'
                    ELSE 'Belum Dinilai'
                END as status,
                created_at as tanggal
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
            ORDER BY semester ASC, kode_mata_kuliah ASC
        `, [mahasiswaId]);

        // Hitung IPK
        const ipkResult = await pool.query(`
            SELECT 
                COALESCE(SUM(sks * nilai_angka), 0) as total_bobot,
                COALESCE(SUM(sks), 0) as total_sks
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
        `, [mahasiswaId]);

        const totalBobot = parseFloat(ipkResult.rows[0].total_bobot) || 0;
        const totalSKS = parseFloat(ipkResult.rows[0].total_sks) || 0;
        const ipk = totalSKS > 0 ? parseFloat((totalBobot / totalSKS).toFixed(2)) : 0;

        res.json({
            status: 'Success',
            data: {
                riwayat: result.rows,
                ipk: ipk,
                total_sks: totalSKS
            }
        });
    } catch (error) {
        console.error('Error fetching riwayat nilai:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

// ============ GET NILAI MAHASISWA (ALIAS) ============
router.get('/nilai/:nim', authMiddleware, async(req, res) => {
    try {
        const pool = require('../config/database');
        const { nim } = req.params;

        // Cari mahasiswa
        const mahasiswaResult = await pool.query(
            'SELECT id FROM mahasiswa WHERE npm = $1', [nim]
        );

        if (mahasiswaResult.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Mahasiswa tidak ditemukan'
            });
        }

        const mahasiswaId = mahasiswaResult.rows[0].id;

        // Ambil nilai dari tabel nilai_mahasiswa
        const result = await pool.query(`
            SELECT 
                id,
                semester,
                kode_mata_kuliah as kode_mk,
                nama_mata_kuliah,
                sks,
                nilai_huruf as nilai,
                nilai_angka as bobot
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
            ORDER BY semester ASC, kode_mata_kuliah ASC
        `, [mahasiswaId]);

        // Hitung IPK
        const ipkResult = await pool.query(`
            SELECT 
                COALESCE(SUM(sks * nilai_angka), 0) as total_bobot,
                COALESCE(SUM(sks), 0) as total_sks
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
        `, [mahasiswaId]);

        const totalBobot = parseFloat(ipkResult.rows[0].total_bobot) || 0;
        const totalSks = parseFloat(ipkResult.rows[0].total_sks) || 0;
        const ipk = totalSks > 0 ? parseFloat((totalBobot / totalSks).toFixed(2)) : 0;

        // Hitung IPS per semester
        const ipsResult = await pool.query(`
            SELECT 
                semester,
                SUM(sks * nilai_angka) as total_bobot,
                SUM(sks) as total_sks
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
            GROUP BY semester
            ORDER BY semester ASC
        `, [mahasiswaId]);

        const ipsPerSemester = ipsResult.rows.map(row => ({
            semester: row.semester,
            ips: row.total_sks > 0 ? parseFloat((row.total_bobot / row.total_sks).toFixed(2)) : 0,
            total_sks: parseFloat(row.total_sks),
            total_bobot: parseFloat(row.total_bobot)
        }));

        res.json({
            status: 'Success',
            data: {
                mahasiswa: {
                    nim: nim,
                    semester: 1
                },
                ipk: ipk,
                ips_per_semester: ipsPerSemester,
                nilai: result.rows
            }
        });
    } catch (error) {
        console.error('Error fetching nilai mahasiswa:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
});

module.exports = router;