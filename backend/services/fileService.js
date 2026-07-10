const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const UPLOAD_DIRS = {
    documents: path.join(__dirname, '../uploads/documents'),
    profiles: path.join(__dirname, '../uploads/profiles'),
    reports: path.join(__dirname, '../uploads/reports'),
};

// ============ ENSURE DIRECTORY EXISTS ============
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// ============ SAVE KHS FILE ============
const saveKhsFile = async (nim, semester, tahunAkademik, file) => {
    ensureDirectoryExists(UPLOAD_DIRS.documents);

    const filePath = `/uploads/documents/${file.filename}`;

    const result = await pool.query(
        `INSERT INTO khs (nim, semester, tahun_akademik, file_path, status_verifikasi)
         VALUES ($1, $2, $3, $4, 'Menunggu Verifikasi')
         RETURNING *`,
        [nim, semester, tahunAkademik, filePath]
    );

    return {
        id: result.rows[0].id,
        filePath: filePath,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
    };
};

// ============ SAVE PROFILE FILE ============
const saveProfileFile = async (userId, file) => {
    ensureDirectoryExists(UPLOAD_DIRS.profiles);

    const filePath = `/uploads/profiles/${file.filename}`;

    // Update user profile photo
    await pool.query(
        'UPDATE users SET profile_photo = $1 WHERE id = $2',
        [filePath, userId]
    );

    return {
        filePath: filePath,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
    };
};

// ============ SAVE SKRIPSI FILE ============
const saveSkripsiFile = async (skripsiId, file) => {
    ensureDirectoryExists(UPLOAD_DIRS.documents);

    const filePath = `/uploads/documents/${file.filename}`;

    await pool.query(
        'UPDATE skripsi SET file_path = $1 WHERE id = $2',
        [filePath, skripsiId]
    );

    return {
        filePath: filePath,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
    };
};

// ============ SAVE REPORT FILE ============
const saveReportFile = async (reportType, file) => {
    ensureDirectoryExists(UPLOAD_DIRS.reports);

    const filePath = `/uploads/reports/${file.filename}`;

    // You can save report metadata to database if needed
    return {
        filePath: filePath,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        type: reportType,
    };
};

// ============ GET FILE PATH ============
const getFilePath = async (filename, type = 'documents') => {
    const dir = UPLOAD_DIRS[type] || UPLOAD_DIRS.documents;
    const filePath = path.join(dir, filename);

    if (!fs.existsSync(filePath)) {
        throw new Error('File tidak ditemukan');
    }

    return filePath;
};

// ============ DELETE FILE ============
const deleteFile = async (filename, type = 'documents') => {
    const dir = UPLOAD_DIRS[type] || UPLOAD_DIRS.documents;
    const filePath = path.join(dir, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }

    throw new Error('File tidak ditemukan');
};

// ============ GET FILE INFO ============
const getFileInfo = async (filename, type = 'documents') => {
    const dir = UPLOAD_DIRS[type] || UPLOAD_DIRS.documents;
    const filePath = path.join(dir, filename);

    if (!fs.existsSync(filePath)) {
        throw new Error('File tidak ditemukan');
    }

    const stats = fs.statSync(filePath);
    return {
        filename: filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        path: filePath,
    };
};

module.exports = {
    saveKhsFile,
    saveProfileFile,
    saveSkripsiFile,
    saveReportFile,
    getFilePath,
    deleteFile,
    getFileInfo,
};