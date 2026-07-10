const pool = require('../config/database');

// ============ GET ALL DOSEN ============
const getAllDosen = async(limit = 10, offset = 0) => {
    const result = await pool.query(`
    SELECT 
      d.id,
      d.user_id,
      d.nip,
      d.nama_lengkap as nama,
      d.email,
      d.no_hp,
      d.bidang_keahlian,
      d.gelar,
      d.kuota,
      d.created_at,
      d.updated_at,
      COALESCE(
        (SELECT COUNT(*) FROM skripsi WHERE pembimbing_1_id = d.id OR pembimbing_2_id = d.id),
        0
      ) as bebanBimbingan
    FROM dosen d
    ORDER BY d.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM dosen');

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count)
    };
};

// ============ GET DOSEN BY ID ============
const getDosenById = async(id) => {
    const result = await pool.query(`
    SELECT 
      d.id,
      d.user_id,
      d.nip,
      d.nama_lengkap as nama,
      d.email,
      d.no_hp,
      d.bidang_keahlian,
      d.gelar,
      d.kuota,
      d.created_at,
      d.updated_at,
      COALESCE(
        (SELECT COUNT(*) FROM skripsi WHERE pembimbing_1_id = d.id OR pembimbing_2_id = d.id),
        0
      ) as bebanBimbingan
    FROM dosen d
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.id = $1
  `, [id]);

    if (result.rows.length === 0) {
        throw new Error('Dosen tidak ditemukan');
    }

    return result.rows[0];
};

// ============ GET DOSEN BY PRODI ============
const getDosenByProdi = async(prodi, limit = 10, offset = 0) => {
    const result = await pool.query(`
    SELECT 
      d.id,
      d.user_id,
      d.nip,
      d.nama_lengkap as nama,
      d.email,
      d.no_hp,
      d.bidang_keahlian,
      d.gelar,
      d.kuota,
      d.created_at,
      d.updated_at,
      COALESCE(
        (SELECT COUNT(*) FROM skripsi WHERE pembimbing_1_id = d.id OR pembimbing_2_id = d.id),
        0
      ) as bebanBimbingan
    FROM dosen d
    WHERE d.prodi = $1
    ORDER BY d.created_at DESC
    LIMIT $2 OFFSET $3
  `, [prodi, limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM dosen WHERE prodi = $1', [prodi]);

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count)
    };
};

// ============ CREATE DOSEN ============
const createDosen = async(dosenData) => {
    console.log('📥 Data ke service:', dosenData);

    const {
        nama_lengkap,
        nip,
        email,
        no_hp,
        bidang_keahlian,
        gelar,
        kuota,
        user_id
    } = dosenData;

    if (!nama_lengkap) {
        throw new Error('Nama lengkap wajib diisi');
    }

    // Cari user_id berdasarkan email jika tidak dikirim
    let finalUserId = user_id;

    if (!finalUserId && email) {
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length > 0) {
            finalUserId = userResult.rows[0].id;
        }
    }

    // Jika masih tidak ada user_id, buat user baru untuk dosen
    if (!finalUserId) {
        try {
            const newUser = await pool.query(`
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'dosen')
        RETURNING id
      `, [
                nama_lengkap,
                email || `${nip}@dosen.uad.ac.id`,
                '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
            ]);
            finalUserId = newUser.rows[0].id;
        } catch (userError) {
            console.log('⚠️ Gagal membuat user baru:', userError.message);
            finalUserId = null;
        }
    }

    const result = await pool.query(`
    INSERT INTO dosen (user_id, nip, nama_lengkap, email, no_hp, bidang_keahlian, gelar, kuota)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [finalUserId, nip, nama_lengkap, email, no_hp, bidang_keahlian, gelar, kuota || 10]);

    return result.rows[0];
};

// ============ UPDATE DOSEN ============
const updateDosen = async(id, dosenData) => {
    const {
        nama_lengkap,
        nip,
        email,
        no_hp,
        bidang_keahlian,
        gelar,
        kuota,
        user_id
    } = dosenData;

    const existing = await pool.query('SELECT * FROM dosen WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
        throw new Error('Dosen tidak ditemukan');
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (nip !== undefined) {
        updateFields.push(`nip = $${paramIndex++}`);
        updateValues.push(nip);
    }
    if (nama_lengkap !== undefined) {
        updateFields.push(`nama_lengkap = $${paramIndex++}`);
        updateValues.push(nama_lengkap);
    }
    if (email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        updateValues.push(email);
    }
    if (no_hp !== undefined) {
        updateFields.push(`no_hp = $${paramIndex++}`);
        updateValues.push(no_hp);
    }
    if (bidang_keahlian !== undefined) {
        updateFields.push(`bidang_keahlian = $${paramIndex++}`);
        updateValues.push(bidang_keahlian);
    }
    if (gelar !== undefined) {
        updateFields.push(`gelar = $${paramIndex++}`);
        updateValues.push(gelar);
    }
    if (kuota !== undefined) {
        updateFields.push(`kuota = $${paramIndex++}`);
        updateValues.push(kuota);
    }
    if (user_id !== undefined) {
        updateFields.push(`user_id = $${paramIndex++}`);
        updateValues.push(user_id);
    }

    if (updateFields.length === 0) {
        throw new Error('Tidak ada data untuk diupdate');
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const query = `
    UPDATE dosen 
    SET ${updateFields.join(', ')}
    WHERE id = $${updateValues.length}
    RETURNING *
  `;

    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
        throw new Error('Dosen tidak ditemukan');
    }

    return result.rows[0];
};

// ============ UPDATE KUOTA DOSEN ============
const updateKuotaDosen = async(id, kuota) => {
    if (!kuota || kuota < 1) {
        throw new Error('Kuota minimal 1');
    }

    const result = await pool.query(`
    UPDATE dosen 
    SET kuota = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [kuota, id]);

    if (result.rows.length === 0) {
        throw new Error('Dosen tidak ditemukan');
    }

    return result.rows[0];
};

// ============ DELETE DOSEN ============
const deleteDosen = async(id) => {
    const result = await pool.query(
        'DELETE FROM dosen WHERE id = $1 RETURNING *', [id]
    );

    if (result.rows.length === 0) {
        throw new Error('Dosen tidak ditemukan');
    }

    return result.rows[0];
};

module.exports = {
    getAllDosen,
    getDosenById,
    getDosenByProdi,
    createDosen,
    updateDosen,
    updateKuotaDosen,
    deleteDosen
};