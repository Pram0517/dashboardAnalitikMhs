// backend/controllers/exportController.js
const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const { exportToExcel, exportToPDF, exportToCSV } = require('../services/exportService');
const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ EXPORT MAHASISWA ============
const exportMahasiswa = async(req, res) => {
    try {
        const { format = 'excel', angkatan, status, search } = req.query;
        const userRole = req.user.role;
        const userProdi = req.user.prodi;

        // Build query dengan filter
        let query = `
            SELECT 
                m.npm as nim,
                m.nama_lengkap as nama,
                m.email,
                m.semester,
                m.gpa as ipk,
                m.status,
                m.angkatan,
                m.created_at as tanggal_daftar,
                COALESCE(SUM(n.sks), 0) as total_sks,
                COUNT(n.id) as total_mk
            FROM mahasiswa m
            LEFT JOIN nilai_mahasiswa n ON m.id = n.mahasiswa_id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filter angkatan
        if (angkatan && angkatan !== 'Semua Angkatan' && angkatan !== 'undefined') {
            query += ` AND m.angkatan = $${paramIndex}`;
            params.push(parseInt(angkatan));
            paramIndex++;
        }

        // Filter status
        if (status && status !== 'Semua' && status !== 'undefined') {
            query += ` AND m.status = $${paramIndex}`;
            params.push(status.toLowerCase());
            paramIndex++;
        }

        // Filter search
        if (search) {
            query += ` AND (m.npm ILIKE $${paramIndex} OR m.nama_lengkap ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Filter prodi untuk kaprodi
        if (userRole === 'kaprodi' && userProdi) {
            query += ` AND m.prodi = $${paramIndex}`;
            params.push(userProdi);
            paramIndex++;
        }

        query += ` GROUP BY m.id, m.npm, m.nama_lengkap, m.email, m.semester, m.gpa, m.status, m.angkatan, m.created_at ORDER BY m.created_at DESC`;

        const result = await pool.query(query, params);
        const data = result.rows;

        // Kolom untuk export
        const columns = [
            { header: 'NIM', key: 'nim' },
            { header: 'Nama', key: 'nama' },
            { header: 'Email', key: 'email' },
            { header: 'Angkatan', key: 'angkatan' },
            { header: 'Semester', key: 'semester' },
            { header: 'IPK', key: 'ipk' },
            { header: 'Status', key: 'status' },
            { header: 'Total SKS', key: 'total_sks' },
            { header: 'Total MK', key: 'total_mk' },
            { header: 'Tanggal Daftar', key: 'tanggal_daftar' }
        ];

        const filename = `mahasiswa_${new Date().toISOString().split('T')[0]}`;

        let fileResult;
        if (format === 'pdf') {
            fileResult = await exportToPDF(data, columns, 'Data Mahasiswa', filename);
        } else if (format === 'csv') {
            fileResult = await exportToCSV(data, columns, filename);
        } else {
            fileResult = await exportToExcel(data, columns, filename, 'Mahasiswa');
        }

        res.json({
            status: 'Success',
            message: `Data mahasiswa berhasil diexport ke ${format.toUpperCase()}`,
            data: {
                filePath: fileResult.filePath,
                filename: fileResult.filename,
                total: data.length
            }
        });
    } catch (error) {
        console.error('Export mahasiswa error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ EXPORT SKRIPSI ============
const exportSkripsi = async(req, res) => {
    try {
        const { format = 'excel' } = req.query;

        const result = await pool.query(`
            SELECT 
                s.judul,
                m.nama_lengkap as mahasiswa,
                m.npm as nim,
                s.status,
                s.created_at as tanggal_diajukan,
                d1.nama_lengkap as pembimbing_1,
                d2.nama_lengkap as pembimbing_2
            FROM skripsi s
            JOIN mahasiswa m ON s.mahasiswa_id = m.id
            LEFT JOIN dosen d1 ON s.pembimbing_1_id = d1.id
            LEFT JOIN dosen d2 ON s.pembimbing_2_id = d2.id
            ORDER BY s.created_at DESC
        `);

        const columns = [
            { header: 'Judul', key: 'judul' },
            { header: 'Mahasiswa', key: 'mahasiswa' },
            { header: 'NIM', key: 'nim' },
            { header: 'Status', key: 'status' },
            { header: 'Tanggal Diajukan', key: 'tanggal_diajukan' },
            { header: 'Pembimbing 1', key: 'pembimbing_1' },
            { header: 'Pembimbing 2', key: 'pembimbing_2' }
        ];

        const filename = `skripsi_${new Date().toISOString().split('T')[0]}`;

        let fileResult;
        if (format === 'pdf') {
            fileResult = await exportToPDF(result.rows, columns, 'Data Skripsi', filename);
        } else if (format === 'csv') {
            fileResult = await exportToCSV(result.rows, columns, filename);
        } else {
            fileResult = await exportToExcel(result.rows, columns, filename, 'Skripsi');
        }

        res.json({
            status: 'Success',
            message: `Data skripsi berhasil diexport ke ${format.toUpperCase()}`,
            data: {
                filePath: fileResult.filePath,
                filename: fileResult.filename,
                total: result.rows.length
            }
        });
    } catch (error) {
        console.error('Export skripsi error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ EXPORT CAPSTONE ============
const exportCapstone = async(req, res) => {
    try {
        const { format = 'excel' } = req.query;

        const result = await pool.query(`
            SELECT 
                c.judul,
                c.nim,
                c.status,
                c.deskripsi,
                c.created_at as tanggal_dibuat,
                d.nama_lengkap as dosen_pembimbing
            FROM capstone c
            LEFT JOIN dosen d ON c.dosen_pembimbing_id = d.id
            ORDER BY c.created_at DESC
        `);

        const columns = [
            { header: 'Judul', key: 'judul' },
            { header: 'NIM', key: 'nim' },
            { header: 'Status', key: 'status' },
            { header: 'Deskripsi', key: 'deskripsi' },
            { header: 'Tanggal Dibuat', key: 'tanggal_dibuat' },
            { header: 'Dosen Pembimbing', key: 'dosen_pembimbing' }
        ];

        const filename = `capstone_${new Date().toISOString().split('T')[0]}`;

        let fileResult;
        if (format === 'pdf') {
            fileResult = await exportToPDF(result.rows, columns, 'Data Capstone', filename);
        } else if (format === 'csv') {
            fileResult = await exportToCSV(result.rows, columns, filename);
        } else {
            fileResult = await exportToExcel(result.rows, columns, filename, 'Capstone');
        }

        res.json({
            status: 'Success',
            message: `Data capstone berhasil diexport ke ${format.toUpperCase()}`,
            data: {
                filePath: fileResult.filePath,
                filename: fileResult.filename,
                total: result.rows.length
            }
        });
    } catch (error) {
        console.error('Export capstone error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ DOWNLOAD FILE ============
const downloadFile = async(req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/reports', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                status: 'Error',
                message: 'File tidak ditemukan'
            });
        }

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({
                    status: 'Error',
                    message: 'Gagal mendownload file'
                });
            }
        });
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

module.exports = {
    exportMahasiswa,
    exportSkripsi,
    exportCapstone,
    downloadFile
};