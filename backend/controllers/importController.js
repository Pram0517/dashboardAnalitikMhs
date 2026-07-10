// controllers/importController.js
const importService = require('../services/importService');
const path = require('path');
const fs = require('fs');

// Export sebagai object dengan method
module.exports = {
    /**
     * Import data KHS dari file via file path
     * POST /api/import/khs
     */
    importKHS: async (req, res) => {
        try {
            const { filePath } = req.body;
            const userId = req.user?.id;

            if (!filePath) {
                return res.status(400).json({
                    success: false,
                    message: 'File path is required'
                });
            }

            const fullPath = path.resolve(filePath);
            
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found',
                    filePath: fullPath
                });
            }

            const result = await importService.importKHS(fullPath, userId);

            res.json({
                success: true,
                message: 'Import completed successfully',
                data: result
            });

        } catch (error) {
            console.error('Import error:', error);
            res.status(500).json({
                success: false,
                message: 'Import failed',
                error: error.message
            });
        }
    },

    /**
     * Upload file dan import
     * POST /api/import/upload
     */
    uploadAndImport: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const filePath = req.file.path;
            const userId = req.user?.id;

            const result = await importService.importKHS(filePath, userId);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.json({
                success: true,
                message: 'Upload and import completed successfully',
                data: result,
                file: {
                    originalName: req.file.originalname,
                    size: req.file.size
                }
            });

        } catch (error) {
            console.error('Upload import error:', error);
            
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Upload import failed',
                error: error.message
            });
        }
    },

    /**
     * Get import status
     * GET /api/import/status/:nim
     */
    getImportStatus: async (req, res) => {
        try {
            const { nim } = req.params;
            const pool = require('../config/database');

            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_semester,
                    COALESCE(SUM(jsonb_array_length(details)), 0) as total_mk,
                    status_verifikasi,
                    MIN(created_at) as first_import,
                    MAX(updated_at) as last_update
                FROM khs
                WHERE nim = $1
                GROUP BY status_verifikasi
            `, [nim]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No data found for this NIM'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get import status',
                error: error.message
            });
        }
    },

    /**
     * Get all import history
     * GET /api/import/history
     */
    getImportHistory: async (req, res) => {
        try {
            const pool = require('../config/database');

            const result = await pool.query(`
                SELECT 
                    nim,
                    COUNT(*) as total_semester,
                    SUM(jsonb_array_length(details)) as total_mk,
                    MIN(created_at) as first_import,
                    MAX(updated_at) as last_update,
                    status_verifikasi
                FROM khs
                GROUP BY nim, status_verifikasi
                ORDER BY last_update DESC
                LIMIT 50
            `);

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            console.error('History error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get import history',
                error: error.message
            });
        }
    },

    /**
     * Get import progress
     * GET /api/import/progress
     */
    getImportProgress: async (req, res) => {
        try {
            const pool = require('../config/database');

            const khsResult = await pool.query(`
                SELECT COUNT(*) as total FROM khs
            `);

            const mhsResult = await pool.query(`
                SELECT COUNT(*) as total FROM mahasiswa
            `);

            const mkResult = await pool.query(`
                SELECT COUNT(*) as total FROM mata_kuliah
            `);

            res.json({
                success: true,
                data: {
                    khsRecords: parseInt(khsResult.rows[0]?.total) || 0,
                    mahasiswa: parseInt(mhsResult.rows[0]?.total) || 0,
                    mataKuliah: parseInt(mkResult.rows[0]?.total) || 0,
                    status: 'idle'
                }
            });

        } catch (error) {
            console.error('Progress error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get import progress',
                error: error.message
            });
        }
    }
};