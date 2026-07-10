const fileService = require('../services/fileService');
const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ UPLOAD KHS ============
const uploadKhs = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'File tidak ditemukan')
            );
        }

        const { semester, tahunAkademik } = req.body;
        const nim = req.user.nim;

        if (!nim) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'NIM tidak ditemukan')
            );
        }

        const result = await fileService.saveKhsFile(nim, semester, tahunAkademik, req.file);

        res.status(HTTP_STATUS.CREATED).json(
            formatResponse('Success', 'KHS berhasil diupload', result)
        );
    } catch (error) {
        console.error('Upload KHS error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPLOAD PROFILE ============
const uploadProfile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'File tidak ditemukan')
            );
        }

        const userId = req.user.id;
        const result = await fileService.saveProfileFile(userId, req.file);

        res.status(HTTP_STATUS.CREATED).json(
            formatResponse('Success', 'Foto profil berhasil diupload', result)
        );
    } catch (error) {
        console.error('Upload profile error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPLOAD SKRIPSI ============
const uploadSkripsi = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'File tidak ditemukan')
            );
        }

        const { skripsiId } = req.body;
        const result = await fileService.saveSkripsiFile(skripsiId, req.file);

        res.status(HTTP_STATUS.CREATED).json(
            formatResponse('Success', 'File skripsi berhasil diupload', result)
        );
    } catch (error) {
        console.error('Upload skripsi error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPLOAD REPORT ============
const uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'File tidak ditemukan')
            );
        }

        const { reportType } = req.body;
        const result = await fileService.saveReportFile(reportType, req.file);

        res.status(HTTP_STATUS.CREATED).json(
            formatResponse('Success', 'Report berhasil diupload', result)
        );
    } catch (error) {
        console.error('Upload report error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET FILE ============
const getFile = async (req, res) => {
    try {
        const { filename, type } = req.params;
        const filePath = await fileService.getFilePath(filename, type);
        res.sendFile(filePath);
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ DELETE FILE ============
const deleteFile = async (req, res) => {
    try {
        const { filename, type } = req.params;
        await fileService.deleteFile(filename, type);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'File berhasil dihapus')
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

module.exports = {
    uploadKhs,
    uploadProfile,
    uploadSkripsi,
    uploadReport,
    getFile,
    deleteFile
};