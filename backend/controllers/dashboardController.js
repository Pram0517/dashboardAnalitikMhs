// BACKEND/controllers/dashboardController.js
const pool = require('../config/database');
const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ GET DASHBOARD STATS ============
const getStats = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;
        const { angkatan } = req.query;

        let params = [];
        let filter = '';
        let filterParams = [];
        
        // Filter untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            filter = 'AND prodi = $1';
            filterParams.push(userProdi);
        }

        // Filter angkatan
        if (angkatan && angkatan !== 'Semua' && angkatan !== 'undefined' && angkatan !== 'null') {
            const paramIndex = filterParams.length + 1;
            filter += ` AND angkatan = $${paramIndex}`;
            filterParams.push(parseInt(angkatan));
        }

        const queryParams = filterParams.length > 0 ? filterParams : [];

        // 1. Total Mahasiswa Aktif (langsung dari tabel mahasiswa)
        const mahasiswaQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE m.status = 'aktif'
            ${filter}
        `;

        // 2. Total Dosen (dari users)
        const dosenQuery = `
            SELECT COUNT(*) as total
            FROM users
            WHERE role = 'dosen' AND is_active = true
        `;

        // 3. Total Skripsi (mahasiswa semester >= 6)
        const skripsiQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE m.status = 'aktif'
            AND m.semester >= 6
            ${filter}
        `;

        // 4. Total Capstone (mahasiswa yang punya capstone)
        const capstoneQuery = `
            SELECT COUNT(DISTINCT m.id) as total
            FROM mahasiswa m
            LEFT JOIN capstone c ON m.npm = c.nim
            WHERE m.status = 'aktif'
            AND c.id IS NOT NULL
            ${filter}
        `;

        // 5. Mahasiswa Berisiko (IPK < 2.5) — FIX: pakai kolom ipk, bukan gpa
        const berisikoQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE m.status = 'aktif'
            AND m.ipk < 2.5
            AND m.ipk IS NOT NULL
            ${filter}
        `;

        // Eksekusi semua query
        const results = await Promise.all([
            pool.query(mahasiswaQuery, queryParams),
            pool.query(dosenQuery),
            pool.query(skripsiQuery, queryParams),
            pool.query(capstoneQuery, queryParams),
            pool.query(berisikoQuery, queryParams)
        ]);

        const data = {
            totalMahasiswa: parseInt(results[0].rows[0]?.total || 0),
            totalDosen: parseInt(results[1].rows[0]?.total || 0),
            totalSkripsi: parseInt(results[2].rows[0]?.total || 0),
            totalCapstone: parseInt(results[3].rows[0]?.total || 0),
            mahasiswaBerisiko: parseInt(results[4].rows[0]?.total || 0)
        };

        console.log('Dashboard stats result:', data);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data dashboard berhasil diambil', data)
        );

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET GPA TREND ============
const getGpaTrend = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;
        const { angkatan } = req.query;

        let filter = '';
        let filterParams = [];

        // Filter untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            filter = 'AND prodi = $1';
            filterParams.push(userProdi);
        }

        // Filter angkatan
        if (angkatan && angkatan !== 'Semua' && angkatan !== 'undefined' && angkatan !== 'null') {
            const paramIndex = filterParams.length + 1;
            filter += ` AND angkatan = $${paramIndex}`;
            filterParams.push(parseInt(angkatan));
        }

        let query;
        let queryParams = filterParams;

        // Jika filter angkatan spesifik, tampilkan IPK per semester untuk angkatan tersebut
        // FIX: pakai kolom m.ipk, bukan m.gpa
        if (angkatan && angkatan !== 'Semua' && angkatan !== 'undefined' && angkatan !== 'null') {
            query = `
                SELECT 
                    semester as label,
                    ROUND(AVG(m.ipk)::numeric, 2) as ipk,
                    COUNT(*) as jumlah_mahasiswa,
                    'Semester ' || semester as periode
                FROM mahasiswa m
                WHERE m.ipk IS NOT NULL
                AND m.ipk > 0
                AND m.status = 'aktif'
                ${filter}
                GROUP BY semester
                ORDER BY semester ASC
            `;
        } else {
            // Tampilkan IPK per angkatan (hanya yang memiliki IPK > 0)
            query = `
                SELECT 
                    angkatan as label,
                    ROUND(AVG(m.ipk)::numeric, 2) as ipk,
                    COUNT(*) as jumlah_mahasiswa,
                    'Angkatan ' || angkatan as periode
                FROM mahasiswa m
                WHERE m.ipk IS NOT NULL
                AND m.ipk > 0
                AND m.status = 'aktif'
                AND angkatan IS NOT NULL
                ${filter}
                GROUP BY angkatan
                HAVING AVG(m.ipk) > 0
                ORDER BY angkatan ASC
            `;
        }
        
        console.log('📊 GPA Trend Query:', query);
        console.log('📊 GPA Trend Params:', queryParams);
        
        const result = await pool.query(query, queryParams);
        
        // Format data untuk chart
        const chartData = result.rows.map(row => ({
            label: row.label ? parseInt(row.label) : 0,
            ipk: parseFloat(row.ipk) || 0,
            jumlah_mahasiswa: parseInt(row.jumlah_mahasiswa) || 0,
            periode: row.periode || `Periode ${row.label}`
        }));

        console.log('✅ GPA trend result:', chartData);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data GPA trend berhasil diambil', chartData)
        );

    } catch (error) {
        console.error('Get GPA trend error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET GRADUATION STATUS ============
const getGraduationStatus = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;
        const { angkatan } = req.query;

        let filter = '';
        let filterParams = [];

        // Filter untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            filter = 'AND prodi = $1';
            filterParams.push(userProdi);
        }

        // Filter angkatan
        if (angkatan && angkatan !== 'Semua' && angkatan !== 'undefined' && angkatan !== 'null') {
            const paramIndex = filterParams.length + 1;
            filter += ` AND angkatan = $${paramIndex}`;
            filterParams.push(parseInt(angkatan));
        }

        // Total mahasiswa aktif
        const totalQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE m.status = 'aktif'
            ${filter}
        `;
        const totalResult = await pool.query(totalQuery, filterParams);
        const total = parseInt(totalResult.rows[0]?.total || 0);

        // Jika tidak ada mahasiswa, kembalikan data kosong
        if (total === 0) {
            return res.status(HTTP_STATUS.OK).json(
                formatResponse('Success', 'Tidak ada data mahasiswa aktif', [])
            );
        }

        // 1. Mahasiswa semester >= 8 (Tepat Waktu)
        const tepatWaktuQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE m.status = 'aktif'
            AND m.semester >= 8
            ${filter}
        `;
        const tepatWaktuResult = await pool.query(tepatWaktuQuery, filterParams);
        const tepatWaktu = parseInt(tepatWaktuResult.rows[0]?.total || 0);

        // 2. Mahasiswa semester 6-7 (Terlambat)
        const terlambatQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE m.status = 'aktif'
            AND m.semester >= 6 AND m.semester < 8
            ${filter}
        `;
        const terlambatResult = await pool.query(terlambatQuery, filterParams);
        const terlambat = parseInt(terlambatResult.rows[0]?.total || 0);

        // 3. Mahasiswa dengan IPK < 2.5 (Berisiko) — FIX: pakai kolom ipk, bukan gpa
        const berisikoQuery = `
            SELECT COUNT(*) as total
            FROM mahasiswa m
            WHERE m.status = 'aktif'
            AND m.ipk < 2.5
            AND m.ipk IS NOT NULL
            ${filter}
        `;
        const berisikoResult = await pool.query(berisikoQuery, filterParams);
        const berisiko = parseInt(berisikoResult.rows[0]?.total || 0);

        // 4. Mahasiswa Normal (tidak termasuk 3 kategori di atas)
        const normal = Math.max(total - (tepatWaktu + terlambat + berisiko), 0);

        // Data untuk chart (hanya yang > 0)
        const data = [];
        
        if (tepatWaktu > 0) {
            data.push({ 
                name: 'Tepat Waktu', 
                value: Math.round((tepatWaktu / total) * 100),
                count: tepatWaktu
            });
        }
        if (terlambat > 0) {
            data.push({ 
                name: 'Terlambat', 
                value: Math.round((terlambat / total) * 100),
                count: terlambat
            });
        }
        if (berisiko > 0) {
            data.push({ 
                name: 'Berisiko', 
                value: Math.round((berisiko / total) * 100),
                count: berisiko
            });
        }
        if (normal > 0) {
            data.push({ 
                name: 'Normal', 
                value: Math.round((normal / total) * 100),
                count: normal
            });
        }

        console.log('✅ Graduation status result:', {
            total,
            tepatWaktu,
            terlambat,
            berisiko,
            normal,
            data
        });

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data status kelulusan berhasil diambil', data)
        );

    } catch (error) {
        console.error('Get graduation status error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET PROBLEMATIC COURSES ============
const getProblematicCourses = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;
        const { angkatan } = req.query;

        console.log('📊 Fetching problematic courses with filters:', { userRole, userProdi, angkatan });

        // ============ QUERY SEDERHANA ============
        let query = `
            SELECT 
                nm.kode_mata_kuliah,
                nm.nama_mata_kuliah,
                COUNT(*) as jumlah
            FROM nilai_mahasiswa nm
            JOIN mahasiswa m ON m.id = nm.mahasiswa_id
            WHERE nm.nilai_angka < 2.00
            AND nm.nilai_angka > 0
            AND m.status = 'aktif'
        `;

        let params = [];
        let idx = 1;

        // Filter angkatan
        if (angkatan && angkatan !== 'Semua' && angkatan !== 'undefined' && angkatan !== 'null') {
            query += ` AND m.angkatan = $${idx}`;
            params.push(parseInt(angkatan));
            idx++;
        }

        // Filter prodi untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            query += ` AND m.prodi = $${idx}`;
            params.push(userProdi);
            idx++;
        }

        query += `
            GROUP BY nm.kode_mata_kuliah, nm.nama_mata_kuliah
            ORDER BY jumlah DESC
            LIMIT 10
        `;

        console.log('📊 Query:', query);
        console.log('📊 Params:', params);

        const result = await pool.query(query, params);
        
        console.log('📊 Raw result rows:', result.rows);

        // Format data untuk frontend - PASTIKAN jumlah terbaca
        const chartData = result.rows.map(row => ({
            name: row.nama_mata_kuliah || 'Mata Kuliah',
            kode: row.kode_mata_kuliah || '',
            failCount: parseInt(row.jumlah) || 0,
            gradeD_E: parseInt(row.jumlah) || 0,
            totalMahasiswa: parseInt(row.jumlah) || 0,
            course: row.nama_mata_kuliah || 'Mata Kuliah',
            matakuliah: row.nama_mata_kuliah || 'Mata Kuliah',
            jumlah: parseInt(row.jumlah) || 0,
            jumlah_d_e: parseInt(row.jumlah) || 0
        }));

        console.log('✅ Formatted data:', JSON.stringify(chartData, null, 2));

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data mata kuliah kritis berhasil diambil', chartData)
        );

    } catch (error) {
        console.error('❌ Get problematic courses error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message || 'Gagal mengambil data mata kuliah kritis')
        );
    }
};

// ============ GET MAHASISWA SUMMARY ============
const getMahasiswaSummary = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;
        const { angkatan } = req.query;

        let params = [];
        let filter = '';
        let filterParams = [];

        // Filter untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            filter = 'AND m.prodi = $1';
            filterParams.push(userProdi);
        }

        // Filter angkatan
        if (angkatan && angkatan !== 'Semua' && angkatan !== 'undefined' && angkatan !== 'null') {
            const paramIndex = filterParams.length + 1;
            filter += ` AND SUBSTRING(m.npm, 1, 4) = $${paramIndex}`;
            filterParams.push(angkatan);
        }

        // FIX: pakai kolom m.ipk, bukan m.gpa
        const query = `
            SELECT 
                COUNT(CASE WHEN m.status = 'aktif' THEN 1 END) as aktif,
                COUNT(CASE WHEN m.status = 'lulus' THEN 1 END) as lulus,
                COUNT(CASE WHEN m.ipk < 2.5 AND m.ipk IS NOT NULL THEN 1 END) as berisiko
            FROM mahasiswa m
            WHERE 1=1
            ${filter}
        `;

        const result = await pool.query(query, filterParams);
        const row = result.rows[0] || { aktif: 0, lulus: 0, berisiko: 0 };

        const data = {
            aktif: parseInt(row.aktif || 0),
            lulus: parseInt(row.lulus || 0),
            berisiko: parseInt(row.berisiko || 0)
        };

        console.log('Mahasiswa summary result:', data);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data ringkasan mahasiswa berhasil diambil', data)
        );

    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET CHART DATA ============
const getCharts = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;

        let filter = '';
        let params = [];

        if (userRole === 'kaprodi' && userProdi) {
            filter = 'WHERE prodi = $1';
            params.push(userProdi);
        }

        // Data pendaftaran per tahun
        const pendaftaranQuery = `
            SELECT 
                EXTRACT(YEAR FROM created_at) as tahun,
                COUNT(*) as jumlah
            FROM mahasiswa
            ${filter}
            GROUP BY EXTRACT(YEAR FROM created_at)
            ORDER BY tahun DESC
            LIMIT 5
        `;

        // Data kelulusan per tahun
        const kelulusanQuery = `
            SELECT 
                EXTRACT(YEAR FROM updated_at) as tahun,
                COUNT(*) as jumlah
            FROM mahasiswa
            WHERE status = 'lulus'
            ${filter}
            GROUP BY EXTRACT(YEAR FROM updated_at)
            ORDER BY tahun DESC
            LIMIT 5
        `;

        const [pendaftaran, kelulusan] = await Promise.all([
            pool.query(pendaftaranQuery, params).catch(() => ({ rows: [] })),
            pool.query(kelulusanQuery, params).catch(() => ({ rows: [] }))
        ]);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data chart berhasil diambil', {
                pendaftaran: pendaftaran.rows,
                kelulusan: kelulusan.rows
            })
        );

    } catch (error) {
        console.error('Get charts error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET AVAILABLE ANGKATAN ============
const getAvailableAngkatan = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;

        let filter = '';
        let params = [];

        // Filter untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            filter = 'WHERE prodi = $1';
            params.push(userProdi);
        }

        const query = `
            SELECT DISTINCT angkatan
            FROM mahasiswa
            ${filter}
            WHERE angkatan IS NOT NULL
            ORDER BY angkatan ASC
        `;
        
        const result = await pool.query(query, params);
        
        const data = result.rows.map(row => ({
            angkatan: row.angkatan,
            label: row.angkatan.toString()
        }));
        
        console.log('✅ Available angkatan:', data);
        
        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data angkatan berhasil diambil', data)
        );
    } catch (error) {
        console.error('Error getAvailableAngkatan:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET ANGKATAN COUNTS ============
const getAngkatanCounts = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userProdi = req.user.prodi;

        let filter = '';
        let params = [];

        // Filter untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            filter = 'WHERE prodi = $1';
            params.push(userProdi);
        }

        const query = `
            SELECT 
                angkatan,
                COUNT(*) as jumlah
            FROM mahasiswa
            ${filter}
            WHERE angkatan IS NOT NULL
            GROUP BY angkatan
            ORDER BY angkatan ASC
        `;
        
        const result = await pool.query(query, params);
        
        console.log('✅ Angkatan counts:', result.rows);
        
        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data angkatan counts berhasil diambil', result.rows)
        );
    } catch (error) {
        console.error('Error getAngkatanCounts:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

module.exports = {
    getStats,
    getCharts,
    getMahasiswaSummary,
    getGpaTrend,
    getGraduationStatus,
    getProblematicCourses,
    getAvailableAngkatan,
    getAngkatanCounts
};