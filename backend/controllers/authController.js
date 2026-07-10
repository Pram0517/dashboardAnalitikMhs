// BACKEND/controllers/authController.js
const authService = require('../services/authService');
const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');
const { validateEmail, validatePassword } = require('../utils/validators');
const { sendResetPasswordEmail } = require('../services/emailService');
const crypto = require('crypto');
const pool = require('../config/database');

// ============ REGISTER ============
const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role, nim } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Semua field harus diisi')
            );
        }

        if (!validateEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Format email tidak valid')
            );
        }

        if (!validatePassword(password)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Password minimal 6 karakter')
            );
        }

        if (password !== confirmPassword) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Password dan konfirmasi tidak sesuai')
            );
        }

        if (role === 'mahasiswa' && !nim) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'NIM wajib diisi untuk mahasiswa')
            );
        }

        const user = await authService.registerUser(name, email, password, role || 'mahasiswa', nim || null);

        res.status(HTTP_STATUS.CREATED).json(
            formatResponse('Success', 'Registrasi berhasil', user)
        );
    } catch (error) {
        if (error.code === '23505') {
            return res.status(HTTP_STATUS.CONFLICT).json(
                formatResponse('Error', 'Email atau NIM sudah terdaftar')
            );
        }

        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ LOGIN ============
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('📥 Login attempt:', { username });

        if (!username || !password) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Username/NIM dan password harus diisi')
            );
        }

        const result = await authService.loginUser(username, password);
        
        console.log('✅ Login successful for:', username);

        // ✅ KEMBALIKAN LANGSUNG result TANPA wrapper formatResponse
        // Karena frontend mengharapkan { token, user }
        res.status(HTTP_STATUS.OK).json(result);
        
    } catch (error) {
        console.error('❌ Login error:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
            formatResponse('Error', error.message || 'Username atau password salah')
        );
    }
};


// ============ GET PROFILE ============
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await authService.getUserById(userId);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Profile berhasil diambil', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ UPDATE PROFILE ============
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Nama dan email wajib diisi')
            );
        }

        if (!validateEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Format email tidak valid')
            );
        }

        const user = await authService.updateUser(userId, { name, email });

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Profil berhasil diperbarui', user)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ LOGOUT ============
const logout = async (req, res) => {
    try {
        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Logout berhasil')
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ CHANGE PASSWORD ============
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Password lama dan baru wajib diisi')
            );
        }

        if (!validatePassword(newPassword)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Password minimal 6 karakter')
            );
        }

        const result = await authService.changePassword(userId, oldPassword, newPassword);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Password berhasil diubah', result)
        );
    } catch (error) {
        if (error.message === 'Password lama salah') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json(
                formatResponse('Error', error.message)
            );
        }
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ REQUEST RESET PASSWORD ============
const requestResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validateEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Email tidak valid')
            );
        }

        // Cek apakah user ada - menggunakan 'name' bukan 'nama_lengkap'
        const userResult = await pool.query(
            'SELECT id, name as name, email FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(HTTP_STATUS.OK).json(
                formatResponse('Success', 'Jika email terdaftar, link reset akan dikirim')
            );
        }

        const user = userResult.rows[0];

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Simpan token ke database
        await pool.query(
            `INSERT INTO password_resets (email, token, expires_at)
             VALUES ($1, $2, $3)`,
            [email, token, expiresAt]
        );

        // Kirim email
        await sendResetPasswordEmail(email, token, user.name);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Link reset password telah dikirim ke email Anda')
        );
    } catch (error) {
        console.error('Request reset password error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ VERIFY RESET TOKEN ============
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Token tidak ditemukan')
            );
        }

        const result = await pool.query(
            `SELECT * FROM password_resets 
             WHERE token = $1 AND expires_at > NOW() AND used = FALSE`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Token tidak valid atau sudah kadaluarsa')
            );
        }

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Token valid', { email: result.rows[0].email })
        );
    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ RESET PASSWORD ============
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Token dan password baru wajib diisi')
            );
        }

        if (!validatePassword(newPassword)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Password minimal 6 karakter')
            );
        }

        // Verifikasi token
        const tokenResult = await pool.query(
            `SELECT * FROM password_resets 
             WHERE token = $1 AND expires_at > NOW() AND used = FALSE`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Token tidak valid atau sudah kadaluarsa')
            );
        }

        const { email } = tokenResult.rows[0];

        // Hash password baru
        const hashedPassword = await authService.hashPassword(newPassword);
        
        await pool.query(
            'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
            [hashedPassword, email]
        );

        // Tandai token sebagai sudah digunakan
        await pool.query(
            'UPDATE password_resets SET used = TRUE WHERE token = $1',
            [token]
        );

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Password berhasil direset. Silakan login.')
        );
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
    changePassword,
    requestResetPassword,
    verifyResetToken,
    resetPassword,
};