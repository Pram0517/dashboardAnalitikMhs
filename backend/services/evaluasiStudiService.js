// backend/services/evaluasiStudiService.js
const pool = require('../config/database');

// Konfigurasi ES
const ES_CONFIG = {
    ES1: {
        semester: 4,
        ipk_min: 2.0,
        sks_min: 30,
        sks_dispensasi: 20,
        evaluasi_ulang_semester: 5
    },
    ES2: {
        semester: 8,
        ipk_min: 2.0,
        sks_min: 80,
        sks_dispensasi: 70,
        evaluasi_ulang_semester: 9
    },
    ES3: {
        semester: 12,
        ipk_min: 2.0,
        sks_min: 140,
        sks_dispensasi: 120,
        batas_akhir_semester: 14
    }
};

// Hitung total SKS dengan nilai minimal C
const hitungSKSMinimalC = async(mahasiswaId) => {
    const query = `
        SELECT COALESCE(SUM(sks), 0) as total_sks
        FROM nilai_mahasiswa
        WHERE mahasiswa_id = $1
          AND nilai_angka >= 2.00
    `;
    const result = await pool.query(query, [mahasiswaId]);
    return parseFloat(result.rows[0].total_sks) || 0;
};

// Hitung total SKS semua mata kuliah
const hitungTotalSKS = async(mahasiswaId) => {
    const query = `
        SELECT COALESCE(SUM(sks), 0) as total_sks
        FROM nilai_mahasiswa
        WHERE mahasiswa_id = $1
    `;
    const result = await pool.query(query, [mahasiswaId]);
    return parseFloat(result.rows[0].total_sks) || 0;
};

// Dapatkan IPK mahasiswa
const getIPKMahasiswa = async(mahasiswaId) => {
    const query = `
        SELECT gpa as ipk
        FROM mahasiswa
        WHERE id = $1
    `;
    const result = await pool.query(query, [mahasiswaId]);
    return result.rows[0] ? parseFloat(result.rows[0].ipk) || 0 : 0;
};

// Dapatkan semester aktif mahasiswa
const getSemesterAktif = async(mahasiswaId) => {
    const query = `
        SELECT semester
        FROM mahasiswa
        WHERE id = $1
    `;
    const result = await pool.query(query, [mahasiswaId]);
    return result.rows[0] ? parseInt(result.rows[0].semester) || 1 : 1;
};

// Evaluasi ES-1
const evaluasiES1 = async(mahasiswaId) => {
    const ipk = await getIPKMahasiswa(mahasiswaId);
    const totalSks = await hitungTotalSKS(mahasiswaId);
    const sksMinC = await hitungSKSMinimalC(mahasiswaId);
    const semester = await getSemesterAktif(mahasiswaId);

    let status = '';
    let keterangan = '';
    let rekomendasi = '';

    if (ipk >= ES_CONFIG.ES1.ipk_min && sksMinC >= ES_CONFIG.ES1.sks_min) {
        status = 'Lolos ES-1';
        keterangan = 'Mahasiswa dinyatakan lolos ES-1 dan diperkenankan melanjutkan studi';
        rekomendasi = 'Lanjutkan studi ke semester berikutnya';
    } else if (ipk >= ES_CONFIG.ES1.ipk_min && sksMinC >= ES_CONFIG.ES1.sks_dispensasi) {
        status = 'Dispensasi ES-1';
        keterangan = 'Mahasiswa diberi kesempatan mengikuti semester 5 (lima)';
        rekomendasi = 'Ikuti semester 5, evaluasi ulang di akhir semester 5';
    } else if (ipk < ES_CONFIG.ES1.ipk_min || sksMinC < ES_CONFIG.ES1.sks_dispensasi) {
        status = 'Tidak Lolos ES-1';
        keterangan = 'IPK kurang dari 2.00 dan/atau SKS lulus minimal C kurang dari 20';
        rekomendasi = 'Dikenai Putus Studi (Drop Out)';
    }

    // Evaluasi ulang di akhir semester 5
    if (semester >= 5 && status === 'Dispensasi ES-1') {
        const sksMinCBaru = await hitungSKSMinimalC(mahasiswaId);
        if (sksMinCBaru >= ES_CONFIG.ES1.sks_min) {
            status = 'Lolos ES-1 (Setelah Evaluasi Ulang)';
            keterangan = 'Mahasiswa lolos ES-1 setelah evaluasi ulang di akhir semester 5';
            rekomendasi = 'Lanjutkan studi ke semester berikutnya';
        } else {
            status = 'Tidak Lolos ES-1 (Setelah Evaluasi Ulang)';
            keterangan = 'Mahasiswa tidak lolos ES-1 setelah evaluasi ulang di akhir semester 5';
            rekomendasi = 'Dikenai Putus Studi (Drop Out)';
        }
    }

    return {
        jenis: 'ES-1',
        semester_evaluasi: 4,
        ipk: ipk,
        total_sks: totalSks,
        sks_min_c: sksMinC,
        status: status,
        keterangan: keterangan,
        rekomendasi: rekomendasi,
        detail: {
            ipk_min_required: ES_CONFIG.ES1.ipk_min,
            sks_min_required: ES_CONFIG.ES1.sks_min,
            sks_dispensasi: ES_CONFIG.ES1.sks_dispensasi
        }
    };
};

// Evaluasi ES-2
const evaluasiES2 = async(mahasiswaId) => {
    const ipk = await getIPKMahasiswa(mahasiswaId);
    const totalSks = await hitungTotalSKS(mahasiswaId);
    const sksMinC = await hitungSKSMinimalC(mahasiswaId);
    const semester = await getSemesterAktif(mahasiswaId);

    let status = '';
    let keterangan = '';
    let rekomendasi = '';

    if (ipk >= ES_CONFIG.ES2.ipk_min && sksMinC >= ES_CONFIG.ES2.sks_min) {
        status = 'Lolos ES-2';
        keterangan = 'Mahasiswa dinyatakan lolos ES-2 dan diperkenankan melanjutkan studi';
        rekomendasi = 'Lanjutkan studi ke semester berikutnya';
    } else if (ipk >= ES_CONFIG.ES2.ipk_min && sksMinC >= ES_CONFIG.ES2.sks_dispensasi) {
        status = 'Dispensasi ES-2';
        keterangan = 'Mahasiswa diberi kesempatan mengikuti semester 9 (sembilan)';
        rekomendasi = 'Ikuti semester 9, evaluasi ulang di akhir semester 9';
    } else if (ipk < ES_CONFIG.ES2.ipk_min || sksMinC < ES_CONFIG.ES2.sks_dispensasi) {
        status = 'Tidak Lolos ES-2';
        keterangan = 'IPK kurang dari 2.00 dan/atau SKS lulus minimal C kurang dari 70';
        rekomendasi = 'Dikenai Putus Studi (Drop Out)';
    }

    // Evaluasi ulang di akhir semester 9
    if (semester >= 9 && status === 'Dispensasi ES-2') {
        const sksMinCBaru = await hitungSKSMinimalC(mahasiswaId);
        if (sksMinCBaru >= ES_CONFIG.ES2.sks_min) {
            status = 'Lolos ES-2 (Setelah Evaluasi Ulang)';
            keterangan = 'Mahasiswa lolos ES-2 setelah evaluasi ulang di akhir semester 9';
            rekomendasi = 'Lanjutkan studi ke semester berikutnya';
        } else {
            status = 'Tidak Lolos ES-2 (Setelah Evaluasi Ulang)';
            keterangan = 'Mahasiswa tidak lolos ES-2 setelah evaluasi ulang di akhir semester 9';
            rekomendasi = 'Dikenai Putus Studi (Drop Out)';
        }
    }

    return {
        jenis: 'ES-2',
        semester_evaluasi: 8,
        ipk: ipk,
        total_sks: totalSks,
        sks_min_c: sksMinC,
        status: status,
        keterangan: keterangan,
        rekomendasi: rekomendasi,
        detail: {
            ipk_min_required: ES_CONFIG.ES2.ipk_min,
            sks_min_required: ES_CONFIG.ES2.sks_min,
            sks_dispensasi: ES_CONFIG.ES2.sks_dispensasi
        }
    };
};

// Evaluasi ES-3
const evaluasiES3 = async(mahasiswaId) => {
    const ipk = await getIPKMahasiswa(mahasiswaId);
    const totalSks = await hitungTotalSKS(mahasiswaId);
    const sksMinC = await hitungSKSMinimalC(mahasiswaId);
    const semester = await getSemesterAktif(mahasiswaId);

    let status = '';
    let keterangan = '';
    let rekomendasi = '';

    if (ipk >= ES_CONFIG.ES3.ipk_min && sksMinC >= ES_CONFIG.ES3.sks_min) {
        status = 'Lolos ES-3';
        keterangan = 'Mahasiswa dinyatakan lolos ES-3 dan diperkenankan melanjutkan studi';
        rekomendasi = 'Lanjutkan studi ke semester berikutnya';
    } else if (ipk < ES_CONFIG.ES3.ipk_min || sksMinC < ES_CONFIG.ES3.sks_dispensasi) {
        status = 'Tidak Lolos ES-3';
        keterangan = 'IPK kurang dari 2.00 dan/atau SKS lulus minimal C kurang dari 120';
        rekomendasi = 'Diminta untuk mengundurkan diri';
    }

    // Batas akhir semester 14
    if (semester >= 14 && status !== 'Lolos ES-3') {
        status = 'Putus Studi (Gugur Studi)';
        keterangan = 'Pada akhir semester 14, mahasiswa yang belum lulus dinyatakan Putus Studi';
        rekomendasi = 'Dinyatakan Putus Studi';
    }

    return {
        jenis: 'ES-3',
        semester_evaluasi: 12,
        ipk: ipk,
        total_sks: totalSks,
        sks_min_c: sksMinC,
        status: status,
        keterangan: keterangan,
        rekomendasi: rekomendasi,
        detail: {
            ipk_min_required: ES_CONFIG.ES3.ipk_min,
            sks_min_required: ES_CONFIG.ES3.sks_min,
            sks_dispensasi: ES_CONFIG.ES3.sks_dispensasi,
            batas_akhir_semester: ES_CONFIG.ES3.batas_akhir_semester
        }
    };
};

// Evaluasi lengkap semua ES
const evaluasiLengkap = async(mahasiswaId) => {
    const semester = await getSemesterAktif(mahasiswaId);

    const hasil = {
        mahasiswa_id: mahasiswaId,
        semester_aktif: semester,
        evaluasi: []
    };

    // ES-1: dilakukan setelah semester 4
    if (semester >= 4) {
        const es1 = await evaluasiES1(mahasiswaId);
        hasil.evaluasi.push(es1);
    }

    // ES-2: dilakukan setelah semester 8
    if (semester >= 8) {
        const es2 = await evaluasiES2(mahasiswaId);
        hasil.evaluasi.push(es2);
    }

    // ES-3: dilakukan setelah semester 12
    if (semester >= 12) {
        const es3 = await evaluasiES3(mahasiswaId);
        hasil.evaluasi.push(es3);
    }

    // Status keseluruhan
    let statusKeseluruhan = 'Aktif';
    let catatanKeseluruhan = 'Studi berjalan normal';

    for (var i = 0; i < hasil.evaluasi.length; i++) {
        var evalItem = hasil.evaluasi[i];
        if (evalItem.status.indexOf('Tidak Lolos') !== -1 || evalItem.status.indexOf('Putus Studi') !== -1) {
            statusKeseluruhan = 'Evaluasi';
            catatanKeseluruhan = evalItem.keterangan;
            break;
        }
        if (evalItem.status.indexOf('Dispensasi') !== -1) {
            statusKeseluruhan = 'Dispensasi';
            catatanKeseluruhan = evalItem.keterangan;
        }
    }

    hasil.status_keseluruhan = statusKeseluruhan;
    hasil.catatan_keseluruhan = catatanKeseluruhan;

    return hasil;
};

module.exports = {
    evaluasiES1: evaluasiES1,
    evaluasiES2: evaluasiES2,
    evaluasiES3: evaluasiES3,
    evaluasiLengkap: evaluasiLengkap,
    hitungSKSMinimalC: hitungSKSMinimalC,
    hitungTotalSKS: hitungTotalSKS,
    getIPKMahasiswa: getIPKMahasiswa,
    getSemesterAktif: getSemesterAktif
};