// backend/controllers/kurikulumController.js
const MataKuliah = require('../models/MataKuliah');
const pool = require('../config/database');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ GET ALL MATA KULIAH (DENGAN FILTER) ============
const getAllMataKuliah = async (req, res) => {
    try {
        const { semester, sifat, search, page = 1, limit = 100 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `
            SELECT 
                m.*,
                k.nama_kurikulum,
                k.tahun_berlaku
            FROM mata_kuliah m
            LEFT JOIN kurikulum k ON m.kurikulum_id = k.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (semester && semester !== 'all' && semester !== 'undefined') {
            query += ` AND m.semester = $${paramIndex}`;
            params.push(parseInt(semester));
            paramIndex++;
        }

        if (sifat && sifat !== 'all' && sifat !== 'undefined') {
            query += ` AND m.sifat = $${paramIndex}`;
            params.push(sifat);
            paramIndex++;
        }

        if (search) {
            query += ` AND (m.kode_mk ILIKE $${paramIndex} OR m.nama_mata_kuliah ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Filter kurikulum aktif
        query += ` AND k.is_active = true`;

        query += ` ORDER BY m.semester ASC, m.kode_mk ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);

        // Count total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM mata_kuliah m
            LEFT JOIN kurikulum k ON m.kurikulum_id = k.id
            WHERE k.is_active = true
        `;
        const countParams = [];
        let countIndex = 1;

        if (semester && semester !== 'all' && semester !== 'undefined') {
            countQuery += ` AND m.semester = $${countIndex}`;
            countParams.push(parseInt(semester));
            countIndex++;
        }

        if (sifat && sifat !== 'all' && sifat !== 'undefined') {
            countQuery += ` AND m.sifat = $${countIndex}`;
            countParams.push(sifat);
            countIndex++;
        }

        if (search) {
            countQuery += ` AND (m.kode_mk ILIKE $${countIndex} OR m.nama_mata_kuliah ILIKE $${countIndex})`;
            countParams.push(`%${search}%`);
            countIndex++;
        }

        const countResult = await pool.query(countQuery, countParams);

        res.status(HTTP_STATUS.OK).json(
            formatPaginationResponse(
                'Success',
                'Data mata kuliah berhasil diambil',
                result.rows,
                parseInt(page),
                parseInt(limit),
                parseInt(countResult.rows[0].total)
            )
        );
    } catch (error) {
        console.error('Error getting mata kuliah:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET SUMMARY PER SEMESTER ============
const getSummary = async (req, res) => {
    try {
        // 1. Cari kurikulum aktif
        const kurikulumResult = await pool.query(`
            SELECT id, nama_kurikulum, tahun_berlaku, deskripsi
            FROM kurikulum
            WHERE is_active = true
            LIMIT 1
        `);

        if (kurikulumResult.rows.length === 0) {
            return res.status(HTTP_STATUS.OK).json(
                formatResponse('Success', 'Tidak ada kurikulum aktif', {
                    per_semester: [],
                    total: { total_mk: 0, total_sks: 0, total_sks_wajib: 0, total_sks_pilihan: 0 },
                    kurikulum: null
                })
            );
        }

        const kurikulum = kurikulumResult.rows[0];
        const kurikulumId = kurikulum.id;

        // 2. Summary per semester
        const query = `
            SELECT 
                semester,
                COUNT(*) as jumlah_mk,
                SUM(CASE WHEN sifat = 'Wajib' THEN sks ELSE 0 END) as total_sks_wajib,
                SUM(CASE WHEN sifat = 'Pilihan' THEN sks ELSE 0 END) as total_sks_pilihan,
                SUM(sks) as total_sks
            FROM mata_kuliah
            WHERE kurikulum_id = $1
            GROUP BY semester
            ORDER BY semester ASC
        `;
        const result = await pool.query(query, [kurikulumId]);

        // 3. Total keseluruhan
        const totalQuery = `
            SELECT 
                COUNT(*) as total_mk,
                SUM(CASE WHEN sifat = 'Wajib' THEN sks ELSE 0 END) as total_sks_wajib,
                SUM(CASE WHEN sifat = 'Pilihan' THEN sks ELSE 0 END) as total_sks_pilihan,
                SUM(sks) as total_sks
            FROM mata_kuliah
            WHERE kurikulum_id = $1
        `;
        const totalResult = await pool.query(totalQuery, [kurikulumId]);

        // 4. Total kurikulum
        const totalKurikulum = await pool.query('SELECT COUNT(*) as total FROM kurikulum');
        const totalActive = await pool.query("SELECT COUNT(*) as total FROM kurikulum WHERE is_active = true");

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data summary berhasil diambil', {
                per_semester: result.rows,
                total: {
                    total_mk: parseInt(totalResult.rows[0]?.total_mk || 0),
                    total_sks: parseInt(totalResult.rows[0]?.total_sks || 0),
                    total_sks_wajib: parseInt(totalResult.rows[0]?.total_sks_wajib || 0),
                    total_sks_pilihan: parseInt(totalResult.rows[0]?.total_sks_pilihan || 0)
                },
                kurikulum: kurikulum,
                total_kurikulum: parseInt(totalKurikulum.rows[0]?.total || 0),
                total_active: parseInt(totalActive.rows[0]?.total || 0)
            })
        );

    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET MATA KULIAH BY ID ============
const getMataKuliahById = async (req, res) => {
    try {
        const { id } = req.params;
        const mataKuliah = await MataKuliah.findById(id);

        if (!mataKuliah) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mata kuliah tidak ditemukan')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data mata kuliah berhasil diambil', mataKuliah)
        );
    } catch (error) {
        console.error('Error getting mata kuliah by id:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ CREATE MATA KULIAH ============
const createMataKuliah = async (req, res) => {
    try {
        const { kurikulum_id, nama_mata_kuliah, kode_mk, sks, semester, deskripsi, sifat, praktikum, praktik_lapangan } = req.body;

        // Validasi
        if (!kurikulum_id || !nama_mata_kuliah || !kode_mk || sks === undefined) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Kurikulum ID, Nama MK, Kode MK, dan SKS wajib diisi')
            );
        }

        // Cek duplikat kode
        const existing = await MataKuliah.findByKode(kode_mk);
        if (existing) {
            return res.status(HTTP_STATUS.CONFLICT).json(
                formatResponse('Error', 'Kode mata kuliah sudah terdaftar')
            );
        }

        const mataKuliah = await MataKuliah.create({
            kurikulum_id: parseInt(kurikulum_id),
            nama_mata_kuliah,
            kode_mk,
            sks: parseInt(sks),
            semester: parseInt(semester) || 1,
            deskripsi: deskripsi || '',
            sifat: sifat || 'Wajib',
            praktikum: praktikum || 0,
            praktik_lapangan: praktik_lapangan || 0
        });

        res.status(HTTP_STATUS.CREATED).json(
            formatResponse('Success', 'Mata kuliah berhasil ditambahkan', mataKuliah)
        );
    } catch (error) {
        console.error('Error creating mata kuliah:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE MATA KULIAH ============
const updateMataKuliah = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const mataKuliah = await MataKuliah.update(id, data);
        if (!mataKuliah) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mata kuliah tidak ditemukan')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Mata kuliah berhasil diupdate', mataKuliah)
        );
    } catch (error) {
        console.error('Error updating mata kuliah:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ DELETE MATA KULIAH ============
const deleteMataKuliah = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await MataKuliah.delete(id);

        if (!deleted) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mata kuliah tidak ditemukan')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Mata kuliah berhasil dihapus')
        );
    } catch (error) {
        console.error('Error deleting mata kuliah:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET ALL KURIKULUM ============
const getAllKurikulum = async (req, res) => {
    try {
        const pool = require('../config/database');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await pool.query(`
            SELECT 
                id,
                nama_kurikulum as nama,
                tahun_berlaku as tahun,
                deskripsi,
                is_active,
                created_at,
                updated_at
            FROM kurikulum
            ORDER BY tahun_berlaku DESC, created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const countResult = await pool.query('SELECT COUNT(*) FROM kurikulum');

        res.json({
            status: 'Success',
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page: page,
                limit: limit,
                pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching kurikulum:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// ============ GET KURIKULUM BY ID ============
const getKurikulumById = async (req, res) => {
    try {
        const pool = require('../config/database');
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                id,
                nama_kurikulum as nama,
                tahun_berlaku as tahun,
                deskripsi,
                is_active,
                created_at,
                updated_at
            FROM kurikulum
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Kurikulum tidak ditemukan'
            });
        }

        // Ambil mata kuliah yang terkait
        const mataKuliah = await pool.query(`
            SELECT 
                id,
                nama_mata_kuliah as nama,
                kode_mk as kode,
                sks,
                semester,
                deskripsi,
                sifat,
                praktikum,
                praktik_lapangan
            FROM mata_kuliah
            WHERE kurikulum_id = $1
            ORDER BY semester ASC, kode_mk ASC
        `, [id]);

        res.json({
            status: 'Success',
            data: {
                ...result.rows[0],
                mata_kuliah: mataKuliah.rows
            }
        });
    } catch (error) {
        console.error('Error fetching kurikulum by id:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// ============ CREATE KURIKULUM ============
const createKurikulum = async (req, res) => {
    try {
        const pool = require('../config/database');
        const { nama_kurikulum, tahun_berlaku, deskripsi, is_active } = req.body;

        if (!nama_kurikulum) {
            return res.status(400).json({
                status: 'Error',
                message: 'Nama kurikulum wajib diisi'
            });
        }

        const result = await pool.query(`
            INSERT INTO kurikulum (nama_kurikulum, tahun_berlaku, deskripsi, is_active)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [nama_kurikulum, tahun_berlaku, deskripsi, is_active !== undefined ? is_active : true]);

        res.status(201).json({
            status: 'Success',
            message: 'Kurikulum berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating kurikulum:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// ============ UPDATE KURIKULUM ============
const updateKurikulum = async (req, res) => {
    try {
        const pool = require('../config/database');
        const { id } = req.params;
        const { nama_kurikulum, tahun_berlaku, deskripsi, is_active } = req.body;

        const existing = await pool.query('SELECT * FROM kurikulum WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Kurikulum tidak ditemukan'
            });
        }

        const result = await pool.query(`
            UPDATE kurikulum 
            SET 
                nama_kurikulum = COALESCE($1, nama_kurikulum),
                tahun_berlaku = COALESCE($2, tahun_berlaku),
                deskripsi = COALESCE($3, deskripsi),
                is_active = COALESCE($4, is_active),
                updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `, [nama_kurikulum, tahun_berlaku, deskripsi, is_active, id]);

        res.json({
            status: 'Success',
            message: 'Kurikulum berhasil diupdate',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating kurikulum:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// ============ DELETE KURIKULUM ============
const deleteKurikulum = async (req, res) => {
    try {
        const pool = require('../config/database');
        const { id } = req.params;

        const checkMk = await pool.query('SELECT COUNT(*) FROM mata_kuliah WHERE kurikulum_id = $1', [id]);
        if (parseInt(checkMk.rows[0].count) > 0) {
            return res.status(409).json({
                status: 'Error',
                message: 'Kurikulum tidak dapat dihapus karena masih memiliki mata kuliah terkait'
            });
        }

        const result = await pool.query('DELETE FROM kurikulum WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'Error',
                message: 'Kurikulum tidak ditemukan'
            });
        }

        res.json({
            status: 'Success',
            message: 'Kurikulum berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting kurikulum:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

// ============ GET MATA KULIAH BY KURIKULUM ============
const getMataKuliahByKurikulum = async (req, res) => {
    try {
        const pool = require('../config/database');
        const { kurikulum_id } = req.params;

        const result = await pool.query(`
            SELECT 
                id,
                nama_mata_kuliah as nama,
                kode_mk as kode,
                sks,
                semester,
                deskripsi,
                sifat,
                praktikum,
                praktik_lapangan
            FROM mata_kuliah
            WHERE kurikulum_id = $1
            ORDER BY semester ASC, kode_mk ASC
        `, [kurikulum_id]);

        res.json({
            status: 'Success',
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching mata kuliah:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message
        });
    }
};

module.exports = {
    // Mata Kuliah
    getAllMataKuliah,
    getMataKuliahById,
    createMataKuliah,
    updateMataKuliah,
    deleteMataKuliah,
    getMataKuliahByKurikulum,
    getSummary,
    
    // Kurikulum
    getAllKurikulum,
    getKurikulumById,
    createKurikulum,
    updateKurikulum,
    deleteKurikulum
};