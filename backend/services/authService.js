    // BACKEND/services/authService.js
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const pool = require('../config/database');

    class AuthService {
        // ============ REGISTER USER ============
        async registerUser(name, email, password, role = 'mahasiswa', nim = null) {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Insert ke users - menggunakan 'name' bukan 'nama_lengkap'
                const userResult = await client.query(
                    `INSERT INTO users (email, password, role, name)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id, email, role, name`,
                    [email, hashedPassword, role, name]
                );

                const user = userResult.rows[0];

                // Jika role mahasiswa dan ada NIM, buat entry di mahasiswa
                if (role === 'mahasiswa' && nim) {
                    await client.query(
                        `INSERT INTO mahasiswa (user_id, npm, nama_lengkap, email, status)
                        VALUES ($1, $2, $3, $4, $5)`,
                        [user.id, nim, name, email, 'aktif']
                    );
                }

                await client.query('COMMIT');

                // Hapus password dari response
                delete user.password;
                return user;

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }

        // ============ LOGIN USER ============
        async loginUser(username, password) {
        console.log('🔐 LoginService: Attempt for', username);
        
        // Cari user dengan JOIN ke mahasiswa
        const result = await pool.query(
            `SELECT 
                u.id,
                u.name as name,
                u.email,
                u.password,
                u.role,
                u.is_active,
                m.id as mahasiswa_id,
                m.npm,
                m.nama_lengkap,
                m.semester,
                m.gpa,
                m.status as mahasiswa_status,
                SUBSTRING(m.npm, 1, 4) as angkatan
            FROM users u
            LEFT JOIN mahasiswa m ON u.id = m.user_id
            WHERE u.email = $1 OR m.npm = $1`,
            [username]
        );

        console.log('📊 Query result:', result.rows.length > 0 ? 'User found' : 'User not found');
        
        if (result.rows.length === 0) {
            console.log('❌ User not found for:', username);
            throw new Error('Username atau password salah');
        }

        const user = result.rows[0];
        console.log('👤 User found:', { 
            id: user.id, 
            email: user.email,
            role: user.role,
            is_active: user.is_active
        });

        // Cek apakah user aktif
        if (!user.is_active) {
            console.log('❌ User not active');
            throw new Error('Akun Anda telah dinonaktifkan. Hubungi administrator.');
        }

        // Verifikasi password
        console.log('🔑 Verifying password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('✅ Password match:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', username);
            throw new Error('Username atau password salah');
        }

        // Generate JWT token
        const tokenPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            nim: user.npm || null,
            mahasiswa_id: user.mahasiswa_id || null,
            npm: user.npm || null,
            angkatan: user.angkatan || null
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        console.log('✅ Token generated for user:', user.id);

        // Update last login
        await pool.query(
            'UPDATE users SET updated_at = NOW() WHERE id = $1',
            [user.id]
        );

        // Hapus password dari response
        delete user.password;

        // Format response untuk frontend
        const response = {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                nim: user.npm || null,
                mahasiswa_id: user.mahasiswa_id || null,
                nama_lengkap: user.nama_lengkap || user.name || null,
                semester: user.semester || 1,
                gpa: user.gpa || null,
                mahasiswa_status: user.mahasiswa_status || 'aktif',
                angkatan: user.angkatan || null,
                npm: user.npm || null
            }
        };

        console.log('✅ Login response prepared for user:', user.id);
        return response;
    }


        // ============ GET USER BY ID ============
        async getUserById(userId) {
            const result = await pool.query(
                `SELECT 
                    u.id,
                    u.name as name,
                    u.email,
                    u.role,
                    u.is_active,
                    m.id as mahasiswa_id,
                    m.npm,
                    m.nama_lengkap,
                    m.semester,
                    m.gpa,
                    m.status as mahasiswa_status,
                    SUBSTRING(m.npm, 1, 4) as angkatan,
                    m.no_hp,
                    m.alamat,
                    m.tanggal_lahir,
                    m.jenis_kelamin
                FROM users u
                LEFT JOIN mahasiswa m ON u.id = m.user_id
                WHERE u.id = $1`,
                [userId]
            );

            if (result.rows.length === 0) {
                throw new Error('User tidak ditemukan');
            }

            const user = result.rows[0];
            delete user.password;
            return user;
        }

        // ============ UPDATE USER ============
        async updateUser(userId, data) {
            const { name, email } = data;
            
            const result = await pool.query(
                `UPDATE users 
                SET name = COALESCE($1, name),
                    email = COALESCE($2, email),
                    updated_at = NOW()
                WHERE id = $3
                RETURNING id, name as name, email, role`,
                [name, email, userId]
            );

            if (result.rows.length === 0) {
                throw new Error('User tidak ditemukan');
            }

            // Update juga di mahasiswa jika ada
            await pool.query(
                `UPDATE mahasiswa 
                SET nama_lengkap = COALESCE($1, nama_lengkap),
                    email = COALESCE($2, email)
                WHERE user_id = $3`,
                [name, email, userId]
            );

            return result.rows[0];
        }

        // ============ CHANGE PASSWORD ============
        async changePassword(userId, oldPassword, newPassword) {
            // Cek user
            const userResult = await pool.query(
                'SELECT password FROM users WHERE id = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new Error('User tidak ditemukan');
            }

            const user = userResult.rows[0];

            // Verifikasi password lama
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                throw new Error('Password lama salah');
            }

            // Hash password baru
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await pool.query(
                'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
                [hashedPassword, userId]
            );

            return { message: 'Password berhasil diubah' };
        }

        // ============ HASH PASSWORD (untuk reset password) ============
        async hashPassword(password) {
            return await bcrypt.hash(password, 10);
        }
    }

    module.exports = new AuthService();