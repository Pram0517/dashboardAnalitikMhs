const skripsiService = require('../services/skripsiService');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ GET ALL SKRIPSI ============
const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const userRole = req.user.role;
        const userNim = req.user.nim;

        let result;

        if (userRole === 'admin') {
            result = await skripsiService.getAllSkripsi(limit, offset);
        } else if (userRole === 'kaprodi') {
            result = await skripsiService.getSkripsiByProdi(req.user.prodi, limit, offset);
        } else if (userRole === 'mahasiswa') {
            result = await skripsiService.getSkripsiByNim(userNim, limit, offset);
        } else {
            return res.status(HTTP_STATUS.FORBIDDEN).json(
                formatResponse('Error', 'Akses ditolak')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatPaginationResponse(
                'Success',
                'Data skripsi berhasil diambil',
                result.data,
                page,
                limit,
                result.total
            )
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET SKRIPSI BY ID ============
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const skripsi = await skripsiService.getSkripsiById(id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data skripsi berhasil diambil', skripsi)
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET SKRIPSI BY NIM ============
const getByNim = async (req, res) => {
    try {
        const { nim } = req.params;
        const skripsi = await skripsiService.getSkripsiByNim(nim);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data skripsi berhasil diambil', skripsi)
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ CREATE SKRIPSI ============
const create = async (req, res) => {
    try {
        const skripsi = await skripsiService.createSkripsi(req.body);

        res.status(HTTP_STATUS.CREATED).json(
            formatResponse('Success', 'Data skripsi berhasil dibuat', skripsi)
        );
    } catch (error) {
        if (error.code === '23505') {
            return res.status(HTTP_STATUS.CONFLICT).json(
                formatResponse('Error', 'Skripsi sudah terdaftar')
            );
        }
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE SKRIPSI ============
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const skripsi = await skripsiService.updateSkripsi(id, req.body);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data skripsi berhasil diupdate', skripsi)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ DELETE SKRIPSI ============
const deleteSkripsi = async (req, res) => {
    try {
        const { id } = req.params;
        await skripsiService.deleteSkripsi(id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data skripsi berhasil dihapus')
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

module.exports = {
    getAll,
    getById,
    getByNim,
    create,
    update,
    delete: deleteSkripsi
};