const pool = require('../config/database');

class Nilai {
    // Hitung IPS untuk semester tertentu
    static async hitungIPS(mahasiswaId, semester) {
        const query = `
            SELECT 
                SUM(nm.sks * nm.nilai_angka) as total_bobot,
                SUM(nm.sks) as total_sks
            FROM nilai_mahasiswa nm
            WHERE nm.mahasiswa_id = $1 AND nm.semester = $2
        `;

        const result = await pool.query(query, [mahasiswaId, semester]);

        if (result.rows[0].total_sks === 0 || result.rows[0].total_sks === null) {
            return 0;
        }

        const ips = result.rows[0].total_bobot / result.rows[0].total_sks;
        return parseFloat(ips.toFixed(2));
    }

    // Hitung IPK (akumulasi semua semester)
    static async hitungIPK(mahasiswaId) {
        const query = `
            SELECT 
                SUM(nm.sks * nm.nilai_angka) as total_bobot,
                SUM(nm.sks) as total_sks
            FROM nilai_mahasiswa nm
            WHERE nm.mahasiswa_id = $1
        `;

        const result = await pool.query(query, [mahasiswaId]);

        if (result.rows[0].total_sks === 0 || result.rows[0].total_sks === null) {
            return 0;
        }

        const ipk = result.rows[0].total_bobot / result.rows[0].total_sks;
        return parseFloat(ipk.toFixed(2));
    }

    // Dapatkan semua nilai mahasiswa per semester
    static async getNilaiByMahasiswa(mahasiswaId) {
        const query = `
            SELECT 
                id,
                semester,
                kode_mata_kuliah,
                nama_mata_kuliah,
                sks,
                nilai_huruf,
                nilai_angka,
                created_at,
                updated_at
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
            ORDER BY semester ASC, kode_mata_kuliah ASC
        `;

        const result = await pool.query(query, [mahasiswaId]);
        return result.rows;
    }

    // Dapatkan IPS per semester
    static async getIPSAllSemester(mahasiswaId) {
        const query = `
            SELECT 
                semester,
                SUM(sks * nilai_angka) as total_bobot,
                SUM(sks) as total_sks,
                COUNT(*) as jumlah_mk
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
            GROUP BY semester
            ORDER BY semester ASC
        `;

        const result = await pool.query(query, [mahasiswaId]);

        return result.rows.map(row => ({
            semester: row.semester,
            ips: row.total_sks > 0 ? parseFloat((row.total_bobot / row.total_sks).toFixed(2)) : 0,
            total_sks: parseFloat(row.total_sks),
            total_bobot: parseFloat(row.total_bobot),
            jumlah_mk: parseInt(row.jumlah_mk)
        }));
    }

    // Tentukan maksimal SKS berdasarkan IPS
    static getMaxSKSByIPS(ips) {
        if (ips >= 3.00) return 24;
        if (ips >= 2.50) return 20;
        if (ips >= 2.00) return 16;
        if (ips >= 1.50) return 12;
        return 9;
    }

    // Update IPK di tabel mahasiswa
    static async updateIPKMahasiswa(mahasiswaId) {
        const ipk = await this.hitungIPK(mahasiswaId);
        const query = 'UPDATE mahasiswa SET gpa = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
        const result = await pool.query(query, [ipk, mahasiswaId]);
        return result.rows[0];
    }

    // Tambah/update nilai mahasiswa
    static async upsertNilai(data) {
        const { mahasiswa_id, semester, kode_mata_kuliah, nama_mata_kuliah, sks, nilai_huruf, nilai_angka } = data;

        const query = `
            INSERT INTO nilai_mahasiswa 
            (mahasiswa_id, semester, kode_mata_kuliah, nama_mata_kuliah, sks, nilai_huruf, nilai_angka)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (mahasiswa_id, semester, kode_mata_kuliah) 
            DO UPDATE SET 
                nama_mata_kuliah = EXCLUDED.nama_mata_kuliah,
                sks = EXCLUDED.sks,
                nilai_huruf = EXCLUDED.nilai_huruf,
                nilai_angka = EXCLUDED.nilai_angka,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const result = await pool.query(query, [
            mahasiswa_id, semester, kode_mata_kuliah,
            nama_mata_kuliah, sks, nilai_huruf, nilai_angka
        ]);

        // Update IPK setelah menambah nilai
        await this.updateIPKMahasiswa(mahasiswa_id);

        return result.rows[0];
    }

    // Hapus nilai
    static async deleteNilai(id, mahasiswaId) {
        const query = 'DELETE FROM nilai_mahasiswa WHERE id = $1 AND mahasiswa_id = $2 RETURNING *';
        const result = await pool.query(query, [id, mahasiswaId]);

        if (result.rows.length > 0) {
            // Update IPK setelah hapus nilai
            await this.updateIPKMahasiswa(mahasiswaId);
        }

        return result.rows[0];
    }

    // ============ GET KURIKULUM + NILAI (untuk modal MK) ============
    static async getKurikulumWithNilai(mahasiswaId, semester = null) {
        let query = `
            SELECT 
                mk.id AS mk_id,
                mk.kode_mk,
                mk.nama_mata_kuliah,
                mk.sks,
                mk.semester,
                mk.sifat,
                nm.id AS nilai_id,
                nm.nilai_huruf,
                nm.nilai_angka
            FROM mata_kuliah mk
            LEFT JOIN kurikulum k ON mk.kurikulum_id = k.id
            LEFT JOIN nilai_mahasiswa nm 
                ON nm.kode_mata_kuliah = mk.kode_mk 
                AND nm.mahasiswa_id = $1
            WHERE k.is_active = true
        `;
        const params = [mahasiswaId];

        if (semester && semester !== 'all') {
            query += ` AND mk.semester = $2`;
            params.push(parseInt(semester));
        }

        query += ` ORDER BY mk.semester ASC, mk.kode_mk ASC`;

        const result = await pool.query(query, params);

        return result.rows.map(row => {
            const sudahDinilai = row.nilai_angka !== null && row.nilai_angka !== undefined;
            let status = 'Belum Diambil';
            if (sudahDinilai) {
                status = parseFloat(row.nilai_angka) >= 2.00 ? 'Lulus' : 'Tidak Lulus';
            }
            return {
                id: row.mk_id,
                kode_mk: row.kode_mk,
                nama_mata_kuliah: row.nama_mata_kuliah,
                sks: row.sks,
                semester: row.semester,
                sifat: row.sifat,
                nilai: row.nilai_huruf || null,
                bobot: row.nilai_angka !== null ? parseFloat(row.nilai_angka) : 0,
                status
            };
        });
    }

    // Dapatkan konversi nilai
    static async getKonversiNilai() {
        const query = 'SELECT * FROM konversi_nilai ORDER BY nilai_angka DESC';
        const result = await pool.query(query);
        return result.rows;
    }

    // Hitung statistik nilai per semester
    static async getStatistikNilai(mahasiswaId) {
        const query = `
            SELECT 
                semester,
                COUNT(*) as total_mk,
                SUM(CASE WHEN nilai_angka >= 2.00 THEN 1 ELSE 0 END) as mk_lulus,
                SUM(CASE WHEN nilai_angka < 2.00 THEN 1 ELSE 0 END) as mk_tidak_lulus,
                SUM(sks) as total_sks,
                SUM(CASE WHEN nilai_angka >= 2.00 THEN sks ELSE 0 END) as sks_lulus,
                AVG(nilai_angka) as rata_rata_nilai
            FROM nilai_mahasiswa
            WHERE mahasiswa_id = $1
            GROUP BY semester
            ORDER BY semester ASC
        `;

        const result = await pool.query(query, [mahasiswaId]);
        return result.rows.map(row => ({
            semester: row.semester,
            total_mk: parseInt(row.total_mk),
            mk_lulus: parseInt(row.mk_lulus),
            mk_tidak_lulus: parseInt(row.mk_tidak_lulus),
            total_sks: parseFloat(row.total_sks),
            sks_lulus: parseFloat(row.sks_lulus),
            rata_rata_nilai: parseFloat(row.rata_rata_nilai).toFixed(2)
        }));
    }
}

module.exports = Nilai;