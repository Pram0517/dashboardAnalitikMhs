const pool = require('../config/database');

// ============ GET ALL MAHASISWA ============
const getAllMahasiswa = async (limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM mahasiswa m 
     LEFT JOIN users u ON m.user_id = u.id 
     ORDER BY m.created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await pool.query('SELECT COUNT(*) FROM mahasiswa');

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

// ============ GET MAHASISWA BY PRODI (UNTUK KAPRODI) ============
const getMahasiswaByProdi = async (prodi, limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM mahasiswa m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.prodi = $1
     ORDER BY m.created_at DESC 
     LIMIT $2 OFFSET $3`,
    [prodi, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM mahasiswa WHERE prodi = $1',
    [prodi]
  );

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

// ============ GET MAHASISWA BY ID (INTERNAL) ============
const getMahasiswaById = async (id) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM mahasiswa m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Mahasiswa tidak ditemukan');
  }

  return result.rows[0];
};

// ============ GET MAHASISWA BY NPM/NIM ============
const getMahasiswaByNPM = async (npm) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM mahasiswa m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.npm = $1`,
    [npm]
  );

  if (result.rows.length === 0) {
    throw new Error('Mahasiswa dengan NPM ini tidak ditemukan');
  }

  return result.rows[0];
};

// ============ GET MAHASISWA BY NPM (ALIAS) ============
const getMahasiswaByNim = async (nim) => {
  return getMahasiswaByNPM(nim);
};

// ============ GET MAHASISWA WITH USER DETAIL ============
const getMahasiswaWithUser = async (npm) => {
  const result = await pool.query(
    `SELECT 
       m.*, 
       u.id as user_id, 
       u.name, 
       u.email, 
       u.role,
       u.is_active
     FROM mahasiswa m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.npm = $1`,
    [npm]
  );

  if (result.rows.length === 0) {
    throw new Error('Mahasiswa tidak ditemukan');
  }

  return result.rows[0];
};

// ============ CREATE MAHASISWA ============
const createMahasiswa = async (mahasiswaData) => {
  const {
    user_id,
    npm,
    nama_lengkap,
    email,
    no_hp,
    alamat,
    tanggal_lahir,
    jenis_kelamin,
    semester,
    prodi,
    angkatan,
    status = 'aktif'
  } = mahasiswaData;

  const result = await pool.query(
    `INSERT INTO mahasiswa (
       user_id, npm, nama_lengkap, email, no_hp, alamat, 
       tanggal_lahir, jenis_kelamin, semester, prodi, angkatan, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
     RETURNING *`,
    [user_id, npm, nama_lengkap, email, no_hp, alamat, tanggal_lahir, jenis_kelamin, semester, prodi, angkatan, status]
  );

  return result.rows[0];
};

// ============ UPDATE MAHASISWA BY ID ============
const updateMahasiswa = async (id, mahasiswaData) => {
  const fields = Object.keys(mahasiswaData);
  const values = Object.values(mahasiswaData);

  if (fields.length === 0) {
    throw new Error('Tidak ada data untuk diupdate');
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const query = `UPDATE mahasiswa SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`;

  const result = await pool.query(query, [...values, id]);

  if (result.rows.length === 0) {
    throw new Error('Mahasiswa tidak ditemukan');
  }

  return result.rows[0];
};

// ============ UPDATE MAHASISWA BY NPM/NIM ============
const updateMahasiswaByNpm = async (npm, mahasiswaData) => {
  const fields = Object.keys(mahasiswaData);
  const values = Object.values(mahasiswaData);

  if (fields.length === 0) {
    throw new Error('Tidak ada data untuk diupdate');
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const query = `UPDATE mahasiswa SET ${setClause}, updated_at = NOW() WHERE npm = $${fields.length + 1} RETURNING *`;

  const result = await pool.query(query, [...values, npm]);

  if (result.rows.length === 0) {
    throw new Error('Mahasiswa dengan NPM tersebut tidak ditemukan');
  }

  return result.rows[0];
};

// ============ DELETE MAHASISWA BY ID ============
const deleteMahasiswa = async (id) => {
  const result = await pool.query(
    'DELETE FROM mahasiswa WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Mahasiswa tidak ditemukan');
  }

  return result.rows[0];
};

// ============ DELETE MAHASISWA BY NPM/NIM ============
const deleteMahasiswaByNpm = async (npm) => {
  const result = await pool.query(
    'DELETE FROM mahasiswa WHERE npm = $1 RETURNING *',
    [npm]
  );

  if (result.rows.length === 0) {
    throw new Error('Mahasiswa dengan NPM tersebut tidak ditemukan');
  }

  return result.rows[0];
};

// ============ SEARCH MAHASISWA ============
const searchMahasiswa = async (keyword, limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM mahasiswa m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.npm ILIKE $1 
        OR m.nama_lengkap ILIKE $1 
        OR m.email ILIKE $1
     ORDER BY m.created_at DESC 
     LIMIT $2 OFFSET $3`,
    [`%${keyword}%`, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM mahasiswa 
     WHERE npm ILIKE $1 
        OR nama_lengkap ILIKE $1 
        OR email ILIKE $1`,
    [`%${keyword}%`]
  );

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

// ============ GET MAHASISWA BY SEMESTER ============
const getMahasiswaBySemester = async (semester, limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT m.*, u.name, u.email 
     FROM mahasiswa m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.semester = $1
     ORDER BY m.created_at DESC 
     LIMIT $2 OFFSET $3`,
    [semester, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM mahasiswa WHERE semester = $1',
    [semester]
  );

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

// ============ GET ALL MAHASISWA WITH SKS AND ANGKATAN (FIXED) ============
const getAllMahasiswaWithDetails = async (limit = 10, offset = 0, search = '', filterStatus = '', filterAngkatan = '') => {
  let whereClause = '1=1';
  const params = [];
  let paramIndex = 1;

  console.log('🔍 Backend filters:', { search, filterStatus, filterAngkatan });

  if (search) {
    whereClause += ` AND (m.npm ILIKE $${paramIndex} OR m.nama_lengkap ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (filterStatus && filterStatus !== 'Semua') {
    whereClause += ` AND m.status = $${paramIndex}`;
    params.push(filterStatus.toLowerCase());
    paramIndex++;
  }

  // ✅ TAMBAHKAN FILTER ANGKATAN
  if (filterAngkatan && filterAngkatan !== 'Semua Angkatan') {
    whereClause += ` AND m.angkatan = $${paramIndex}::integer`;
    params.push(parseInt(filterAngkatan));
    paramIndex++;
  }

  console.log('📝 Where clause:', whereClause);
  console.log('📝 Params:', params);

  const query = `
    SELECT 
      m.id,
      m.npm,
      m.npm as nim,
      m.nama_lengkap,
      m.nama_lengkap as nama,
      m.angkatan,
      m.ipk,
      m.gpa,
      m.semester,
      m.status,
      COALESCE(
        (SELECT SUM(n.sks) FROM nilai_mahasiswa n WHERE n.mahasiswa_id = m.id),
        0
      ) as total_sks,
      (SELECT COUNT(n.id) FROM nilai_mahasiswa n WHERE n.mahasiswa_id = m.id) as total_mk,
      u.email,
      u.name as user_name
    FROM mahasiswa m
    LEFT JOIN users u ON m.user_id = u.id
    WHERE ${whereClause}
    ORDER BY m.npm
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const result = await pool.query(query, params);
  console.log('📊 Query result count:', result.rows.length);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM mahasiswa m
    WHERE ${whereClause}
  `;
  const countParams = params.slice(0, -2);
  const countResult = await pool.query(countQuery, countParams);

  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
};


// ============ GET MAHASISWA BY NIM WITH DETAILS (FIXED) ============
const getMahasiswaByNimWithDetails = async (nim) => {
  const query = `
    SELECT 
      m.id,
      m.npm,
      m.npm as nim,
      m.nama_lengkap,
      m.nama_lengkap as nama,
      m.angkatan,
      m.ipk,
      m.gpa,
      m.semester,
      m.status,
      COALESCE(
        (SELECT SUM(n.sks) FROM nilai_mahasiswa n WHERE n.mahasiswa_id = m.id),
        0
      ) as total_sks,
      (SELECT COUNT(n.id) FROM nilai_mahasiswa n WHERE n.mahasiswa_id = m.id) as total_mk,
      COALESCE(
        json_agg(
          json_build_object(
            'id', n.id,
            'semester', n.semester,
            'kode_mk', n.kode_mata_kuliah,
            'nama_mk', n.nama_mata_kuliah,
            'sks', n.sks,
            'nilai', n.nilai_huruf,
            'bobot', n.nilai_angka
          )
          ORDER BY n.semester ASC, n.kode_mata_kuliah ASC
        ) FILTER (WHERE n.id IS NOT NULL), 
        '[]'::json
      ) as nilai
    FROM mahasiswa m
    LEFT JOIN nilai_mahasiswa n ON m.id = n.mahasiswa_id
    WHERE m.npm = $1
    GROUP BY m.id, m.npm, m.nama_lengkap, m.angkatan, m.ipk, m.gpa, m.semester, m.status
  `;
  const result = await pool.query(query, [nim]);
  return result.rows[0];
};

// ============ GET ALL MAHASISWA FROM SUPABASE KHS ============
const getAllFromKHS = async (limit = 10, offset = 0, search = '', filterStatus = '') => {
  try {
    // Note: supabaseKhs needs to be defined/imported
    const supabaseKhs = require('../config/supabase');
    let query = supabaseKhs
      .from('mhs_khs')
      .select('*', { count: 'exact' });

    if (filterStatus && filterStatus !== 'Semua') {
      query = query.eq('status', filterStatus);
    }

    if (search) {
      query = query.or(`nim.ilike.%${search}%,nama.ilike.%${search}%`);
    }

    const from = offset;
    const to = offset + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    const transformedData = (data || []).map(item => ({
      id: item.id,
      nim: item.nim,
      nama: item.nama,
      nama_lengkap: item.nama,
      angkatan: item.angkatan,
      ipk: item.ipk || 0,
      semester: item.semester || 1,
      status: item.status || 'Aktif',
      total_sks: item.total_sks || 0,
      nilai: []
    }));

    return {
      data: transformedData,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching from Supabase KHS:', error);
    throw error;
  }
};

// ============ GET MAHASISWA BY NIM FROM KHS ============
const getMahasiswaFromKHSByNim = async (nim) => {
  try {
    const supabaseKhs = require('../config/supabase');
    const { data, error } = await supabaseKhs
      .from('mhs_khs')
      .select('*')
      .eq('nim', nim)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      nim: data.nim,
      nama: data.nama,
      nama_lengkap: data.nama,
      angkatan: data.angkatan,
      ipk: data.ipk || 0,
      semester: data.semester || 1,
      status: data.status || 'Aktif',
      total_sks: data.total_sks || 0
    };
  } catch (error) {
    console.error('Error fetching mahasiswa from KHS by NIM:', error);
    throw error;
  }
};

module.exports = {
  getAllMahasiswa,
  getMahasiswaByProdi,
  getMahasiswaById,
  getMahasiswaByNPM,
  getMahasiswaByNim,
  getMahasiswaWithUser,
  createMahasiswa,
  updateMahasiswa,
  updateMahasiswaByNpm,
  deleteMahasiswa,
  deleteMahasiswaByNpm,
  searchMahasiswa,
  getMahasiswaBySemester,
  getAllMahasiswaWithDetails,
  getMahasiswaByNimWithDetails,
  getAllFromKHS,
  getMahasiswaFromKHSByNim
};