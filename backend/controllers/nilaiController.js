const Nilai = require('../models/Nilai');
const Mahasiswa = require('../models/Mahasiswa');
const { formatResponse } = require('../utils/formatters');
const { HTTP_STATUS } = require('../utils/constants');

// ============ GET IPS PER SEMESTER ============
const getIPS = async(req, res) => {
    try {
        const { nim, semester } = req.params;

        // Cek mahasiswa
        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        const ips = await Nilai.hitungIPS(mahasiswa.id, parseInt(semester));
        const maxSks = Nilai.getMaxSKSByIPS(ips);

        // Dapatkan detail nilai semester
        const semuaNilai = await Nilai.getNilaiByMahasiswa(mahasiswa.id);
        const nilaiSemester = semuaNilai.filter(n => n.semester === parseInt(semester));

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'IPS berhasil dihitung', {
                nim: mahasiswa.npm,
                nama: mahasiswa.nama_lengkap,
                semester: parseInt(semester),
                ips: ips,
                max_sks_semester_berikutnya: maxSks,
                detail_nilai: nilaiSemester,
                total_sks: nilaiSemester.reduce((sum, n) => sum + n.sks, 0),
                total_bobot: nilaiSemester.reduce((sum, n) => sum + (n.sks * n.nilai_angka), 0)
            })
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET IPK ============
const getIPK = async(req, res) => {
    try {
        const { nim } = req.params;

        // Cek mahasiswa
        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        const ipk = await Nilai.hitungIPK(mahasiswa.id);
        const semuaNilai = await Nilai.getNilaiByMahasiswa(mahasiswa.id);
        const totalSks = semuaNilai.reduce((sum, n) => sum + n.sks, 0);
        const totalBobot = semuaNilai.reduce((sum, n) => sum + (n.sks * n.nilai_angka), 0);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'IPK berhasil dihitung', {
                nim: mahasiswa.npm,
                nama: mahasiswa.nama_lengkap,
                ipk: ipk,
                total_sks: totalSks,
                total_bobot: totalBobot,
                jumlah_mata_kuliah: semuaNilai.length
            })
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET SEMUA NILAI MAHASISWA ============
const getNilaiMahasiswa = async(req, res) => {
    try {
        const { nim } = req.params;

        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        const nilai = await Nilai.getNilaiByMahasiswa(mahasiswa.id);
        const ipk = await Nilai.hitungIPK(mahasiswa.id);
        const ipsPerSemester = await Nilai.getIPSAllSemester(mahasiswa.id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data nilai berhasil diambil', {
                mahasiswa: {
                    nim: mahasiswa.npm,
                    nama: mahasiswa.nama_lengkap,
                    semester: mahasiswa.semester
                },
                ipk: ipk,
                ips_per_semester: ipsPerSemester,
                nilai: nilai
            })
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET IPS SEMUA SEMESTER ============
const getIPSAllSemester = async(req, res) => {
    try {
        const { nim } = req.params;

        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        const ipsData = await Nilai.getIPSAllSemester(mahasiswa.id);
        const ipk = await Nilai.hitungIPK(mahasiswa.id);

        // Tambahkan max SKS untuk setiap semester
        const result = ipsData.map(item => ({
            ...item,
            max_sks_berikutnya: Nilai.getMaxSKSByIPS(item.ips)
        }));

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data IPS per semester berhasil diambil', {
                nim: mahasiswa.npm,
                nama: mahasiswa.nama_lengkap,
                ipk: ipk,
                data: result
            })
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ TAMBAH/UPDATE NILAI ============
const upsertNilai = async(req, res) => {
    try {
        const { nim } = req.params;
        const data = req.body;

        // Cek mahasiswa
        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        // Validasi data
        if (!data.semester || !data.kode_mata_kuliah || !data.nama_mata_kuliah ||
            !data.sks || !data.nilai_huruf || !data.nilai_angka === undefined) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(
                formatResponse('Error', 'Data tidak lengkap')
            );
        }

        const nilai = await Nilai.upsertNilai({
            mahasiswa_id: mahasiswa.id,
            semester: data.semester,
            kode_mata_kuliah: data.kode_mata_kuliah,
            nama_mata_kuliah: data.nama_mata_kuliah,
            sks: data.sks,
            nilai_huruf: data.nilai_huruf,
            nilai_angka: data.nilai_angka
        });

        // Hitung ulang IPK
        const ipk = await Nilai.hitungIPK(mahasiswa.id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Nilai berhasil disimpan', {
                nilai: nilai,
                ipk_terbaru: ipk
            })
        );
    } catch (error) {
        if (error.code === '23505') {
            return res.status(HTTP_STATUS.CONFLICT).json(
                formatResponse('Error', 'Data nilai sudah ada')
            );
        }
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ HAPUS NILAI ============
const deleteNilai = async(req, res) => {
    try {
        const { nim, id } = req.params;

        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        const deleted = await Nilai.deleteNilai(parseInt(id), mahasiswa.id);
        if (!deleted) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Data nilai tidak ditemukan')
            );
        }

        const ipk = await Nilai.hitungIPK(mahasiswa.id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Nilai berhasil dihapus', {
                ipk_terbaru: ipk
            })
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET STATISTIK NILAI ============
const getStatistikNilai = async(req, res) => {
    try {
        const { nim } = req.params;

        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        const statistik = await Nilai.getStatistikNilai(mahasiswa.id);
        const ipk = await Nilai.hitungIPK(mahasiswa.id);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Statistik nilai berhasil diambil', {
                nim: mahasiswa.npm,
                nama: mahasiswa.nama_lengkap,
                ipk: ipk,
                statistik_per_semester: statistik
            })
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET KONVERSI NILAI ============
const getKonversiNilai = async(req, res) => {
    try {
        const konversi = await Nilai.getKonversiNilai();
        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data konversi nilai berhasil diambil', konversi)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

// ============ GET KURIKULUM DENGAN NILAI ============
const getKurikulumWithNilai = async(req, res) => {
    try {
        const { nim } = req.params;
        const { semester } = req.query;

        const mahasiswa = await Mahasiswa.findByNpm(nim);
        if (!mahasiswa) {
            return res.status(HTTP_STATUS.NOT_FOUND).json(
                formatResponse('Error', 'Mahasiswa tidak ditemukan')
            );
        }

        const data = await Nilai.getKurikulumWithNilai(mahasiswa.id, semester);

        res.status(HTTP_STATUS.OK).json(
            formatResponse('Success', 'Data kurikulum dan nilai berhasil diambil', data)
        );
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_ERROR).json(
            formatResponse('Error', error.message)
        );
    }
};

module.exports = {
    getIPS,
    getIPK,
    getNilaiMahasiswa,
    getIPSAllSemester,
    upsertNilai,
    deleteNilai,
    getStatistikNilai,
    getKonversiNilai,
    getKurikulumWithNilai
};