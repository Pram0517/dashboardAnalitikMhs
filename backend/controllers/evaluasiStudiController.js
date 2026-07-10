// backend/controllers/evaluasiStudiController.js
const evaluasiStudiService = require('../services/evaluasiStudiService');
const Mahasiswa = require('../models/Mahasiswa');
const pool = require('../config/database');

const formatResponse = (status, message, data) => {
    return {
        status: status,
        message: message,
        data: data
    };
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500
};

// Evaluasi lengkap untuk satu mahasiswa
const evaluasiMahasiswa = async(req, res) => {
    try {
        const { nim } = req.params;

        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan', null)
            );
        }

        const hasil = await evaluasiStudiService.evaluasiLengkap(mahasiswa.id);

        // Tambahkan data mahasiswa
        hasil.mahasiswa = {
            nim: mahasiswa.npm,
            nama: mahasiswa.nama_lengkap,
            semester: mahasiswa.semester,
            ipk: mahasiswa.gpa
        };

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data evaluasi studi berhasil diambil', hasil)
        );
    } catch (error) {
        console.error('Error evaluasiMahasiswa:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message, null)
        );
    }
};

// Evaluasi semua mahasiswa (untuk admin/kaprodi)
const evaluasiSemuaMahasiswa = async(req, res) => {
    try {
        const { angkatan, status } = req.query;

        let query = `
            SELECT id, npm, nama_lengkap, gpa as ipk, semester, status
            FROM mahasiswa
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (angkatan && angkatan !== 'Semua Angkatan') {
            query += ` AND angkatan = $${paramIndex}`;
            params.push(parseInt(angkatan));
            paramIndex++;
        }

        if (status && status !== 'Semua') {
            query += ` AND status = $${paramIndex}`;
            params.push(status.toLowerCase());
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);

        // Proses evaluasi untuk setiap mahasiswa
        const hasilEvaluasi = [];
        for (var i = 0; i < result.rows.length; i++) {
            var mhs = result.rows[i];
            var evaluasi = await evaluasiStudiService.evaluasiLengkap(mhs.id);
            hasilEvaluasi.push({
                mahasiswa: {
                    nim: mhs.npm,
                    nama: mhs.nama_lengkap,
                    semester: mhs.semester,
                    ipk: mhs.ipk,
                    status: mhs.status
                },
                evaluasi: evaluasi.evaluasi,
                status_keseluruhan: evaluasi.status_keseluruhan,
                catatan_keseluruhan: evaluasi.catatan_keseluruhan
            });
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data evaluasi semua mahasiswa berhasil diambil', {
                total: hasilEvaluasi.length,
                data: hasilEvaluasi
            })
        );
    } catch (error) {
        console.error('Error evaluasiSemuaMahasiswa:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message, null)
        );
    }
};

// Get summary evaluasi
const getSummaryEvaluasi = async(req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_mahasiswa,
                COUNT(CASE WHEN semester >= 4 THEN 1 END) as sudah_es1,
                COUNT(CASE WHEN semester >= 8 THEN 1 END) as sudah_es2,
                COUNT(CASE WHEN semester >= 12 THEN 1 END) as sudah_es3,
                COUNT(CASE WHEN gpa >= 2.0 AND semester >= 4 THEN 1 END) as lolos_es1,
                COUNT(CASE WHEN gpa >= 2.0 AND semester >= 8 THEN 1 END) as lolos_es2,
                COUNT(CASE WHEN gpa >= 2.0 AND semester >= 12 THEN 1 END) as lolos_es3
            FROM mahasiswa
            WHERE status = 'aktif'
        `;
        const result = await pool.query(query);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Summary evaluasi berhasil diambil', result.rows[0])
        );
    } catch (error) {
        console.error('Error getSummaryEvaluasi:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message, null)
        );
    }
};

module.exports = {
    evaluasiMahasiswa: evaluasiMahasiswa,
    evaluasiSemuaMahasiswa: evaluasiSemuaMahasiswa,
    getSummaryEvaluasi: getSummaryEvaluasi
};