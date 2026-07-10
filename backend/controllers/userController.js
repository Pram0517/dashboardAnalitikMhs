// BACKEND/controllers/userController.js
const userService = require('../services/userService');
const { formatResponse, formatPaginationResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ GET ALL USERS ============
const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await userService.getAllUsers(limit, offset);

        res.status(HTTP_STATUS.OK).json(
            formatPaginationResponse(
                'Success',
                'Data users berhasil diambil',
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

// ============ GET USER BY ID ============
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil diambil', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE USER ============
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.updateUser(id, req.body);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil diupdate', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ DELETE USER ============
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data user berhasil dihapus')
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE ROLE ============
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Role wajib diisi')
            );
        }

        const user = await userService.updateUserRole(id, role);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Role user berhasil diupdate', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE STATUS ============
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await userService.updateUserStatus(id, isActive);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Status user berhasil diupdate', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

module.exports = {
    getAll,
    getById,
    update,
    delete: deleteUser,
    updateRole,
    updateStatus
};