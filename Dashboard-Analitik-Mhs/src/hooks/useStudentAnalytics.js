// FRONTEND/src/hooks/useStudentAnalytics.js
import { useState, useEffect } from 'react';
import { mahasiswaDetailService } from '../services/mahasiswaDetailService';
import { evaluasiService } from '../services/evaluasiService';
import { apiService } from '../services/apiService';

const GRADE_WEIGHTS = {
    'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.00, 'B-': 2.75, 'C+': 2.50, 'C': 2.00, 'C-': 1.75, 'D+': 1.50, 'D': 1.00, 'E': 0.00
};

// ============ NORMALISASI STATUS MAHASISWA ============
const STATUS_MAP = {
    'aktif': 'Aktif',
    'cuti': 'Cuti',
    'non-aktif': 'Non-Aktif',
    'nonaktif': 'Non-Aktif',
    'lulus': 'Lulus'
};

const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'Aktif';
    const key = rawStatus.toString().trim().toLowerCase();
    return STATUS_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1));
};

export const useStudentAnalytics = (nim) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                setNotFound(false);

                let targetNim = nim;
                if (!targetNim) {
                    const user = JSON.parse(localStorage.getItem('uad_user') || '{}');
                    targetNim = user.nim;
                }

                if (!targetNim) {
                    throw new Error('NIM tidak ditemukan. Silakan login ulang.');
                }

                // ============ STEP 1: Cek Data Mahasiswa di API ============
                let mahasiswaData = null;
                let mockAkhir = null;
                let data = null;

                try {
                    // Coba ambil dari API backend terlebih dahulu
                    data = await mahasiswaDetailService.getAllData(targetNim);
                    mahasiswaData = data.mahasiswa;
                } catch (err) {
                    console.log('⚠️ Mahasiswa not found in backend:', err.message);
                    // Jika error karena data tidak ditemukan, coba cek di mock data
                }

                // ============ STEP 2: Cek di Mock Data (Skripsi/Capstone) ============
                if (!mahasiswaData || !mahasiswaData.nama) {
                    try {
                        mockAkhir = await apiService.getMahasiswaByNIM(targetNim);
                        if (mockAkhir) {
                            console.log('✅ Found in mock data:', mockAkhir);
                        }
                    } catch (e) {
                        console.log('⚠️ Not found in mock data:', e.message);
                    }
                }

                // ============ STEP 3: Jika Data Tidak Ditemukan ============
                if (!mahasiswaData && !mockAkhir) {
                    console.log('❌ Student not found for NIM:', targetNim);
                    setNotFound(true);
                    setError('Mahasiswa tidak ditemukan');
                    setAnalytics(null);
                    setLoading(false);
                    return;
                }

                // ============ STEP 4: Proses Data ============
                // Build student object dari data yang ada
                const student = mahasiswaData || {};
                const khsList = data?.khs || [];

                // Override capstone / skripsi if mockAkhir exists
                let capstone = data?.capstone || { judul: '-', status: 'Belum Mulai' };
                let skripsi = data?.skripsi || { judul: '-', status: 'Belum Mulai', dosenPembimbing: '-' };

                if (mockAkhir) {
                    if (mockAkhir.tipeTugasAkhir === 'Skripsi') {
                        skripsi = { ...mockAkhir };
                    } else {
                        capstone = { ...mockAkhir };
                    }
                }

                // ============ STEP 5: Ambil Data Kurikulum ============
                let kurikulumRes;
                try {
                    kurikulumRes = await evaluasiService.getKurikulumWithNilai(targetNim);
                } catch (e) {
                    console.log('⚠️ Kurikulum data not found, using empty data');
                    kurikulumRes = { data: [] };
                }
                const kurikulumData = kurikulumRes.data || [];

                // ============ RIWAYAT UPLOAD KHS ============
                let riwayatKhs = [];
                khsList.forEach((khs) => {
                    riwayatKhs.push({
                        id: khs.id,
                        semester: khs.semester,
                        tahunAkademik: khs.tahun_akademik || 'Semester ' + khs.semester,
                        tanggalUpload: khs.created_at || new Date().toISOString(),
                        namaFile: khs.file_path ? khs.file_path.split('/').pop() : 'khs.pdf',
                        status: khs.status_verifikasi || 'Menunggu Verifikasi'
                    });
                });

                // ============ RIWAYAT NILAI BERBASIS KURIKULUM ============
                let totalSks = 0;
                let totalBobot = 0;
                let totalSksKurikulum = 0;
                let riwayatNilai = [];
                let sksTidakLulusList = [];
                let totalSksTidakLulus = 0;
                let belumDiambil = [];

                kurikulumData.forEach((mk) => {
                    totalSksKurikulum += mk.sks || 0;
                    const wp = mk.sifat === 'Pilihan' ? 'P' : 'W';

                    if (mk.status === 'Belum Diambil') {
                        belumDiambil.push({ kode: mk.kode_mk, nama: mk.nama_mata_kuliah, sks: mk.sks, semester: mk.semester });
                        return;
                    }

                    const nilaiItem = {
                        kode: mk.kode_mk,
                        nama: mk.nama_mata_kuliah,
                        sks: mk.sks,
                        nilai: mk.nilai,
                        bobot: mk.bobot,
                        semester: mk.semester,
                        kelas: '-',
                        wp
                    };
                    riwayatNilai.push(nilaiItem);
                    totalSks += mk.sks || 0;
                    totalBobot += (mk.bobot || 0) * (mk.sks || 0);

                    if (mk.status === 'Tidak Lulus') {
                        sksTidakLulusList.push(nilaiItem);
                        totalSksTidakLulus += mk.sks || 0;
                    }
                });

                const ipk = totalSks > 0 ? totalBobot / totalSks : 0;
                const currentSemester = student.semester || 1;

                // Estimasi kelulusan
                const sisaSks = totalSksKurikulum > totalSks ? totalSksKurikulum - totalSks : 0;
                const sisaSemester = Math.ceil(sisaSks / 24);
                const tahunSekarang = new Date().getFullYear();
                const tahunKelulusan = tahunSekarang + Math.ceil((currentSemester + sisaSemester) / 2);
                const semesterKelulusan = (currentSemester + sisaSemester) % 2 === 0 ? 'Genap' : 'Ganjil';
                const estimasiKelulusan = semesterKelulusan + ' ' + tahunKelulusan + '/' + (tahunKelulusan + 1);

                // Prediksi risiko
                let prediksiRisiko = 'Tepat Waktu';
                if (ipk < 2.0 || totalSksTidakLulus > 15) {
                    prediksiRisiko = 'Terlambat';
                } else if (ipk < 2.5 || totalSksTidakLulus > 6 || sisaSks > 60) {
                    prediksiRisiko = 'Berisiko Terlambat';
                }

                // ============ AIK DATA ============
                const aikData = student.aikData || [
                    { nama: 'Tahsinul Quran', jenis: 'Wajib', status: 'Lulus' },
                    { nama: 'Tahfidzul Quran', jenis: 'Wajib', status: 'Lulus' },
                    { nama: 'AIK 1', jenis: 'Teori', status: 'Lulus' },
                    { nama: 'AIK 2', jenis: 'Teori', status: 'Lulus' }
                ];

                const wajibSelesaiCount = aikData.filter(a => a.jenis === 'Wajib' && a.status === 'Lulus').length;
                const pilihanSelesaiCount = aikData.filter(a => a.jenis === 'Pilihan' && a.status === 'Lulus').length;

                const aikStatus = {
                    totalSelesai: wajibSelesaiCount + pilihanSelesaiCount,
                    wajibSelesai: wajibSelesaiCount >= 2,
                    pilihanSelesai: pilihanSelesaiCount,
                    isComplete: mockAkhir?.syarat ? mockAkhir.syarat.sertifikatAIK : (wajibSelesaiCount >= 2 && pilihanSelesaiCount >= 2),
                    detail: aikData
                };

                // ============ SET ANALYTICS ============
                setAnalytics({
                    student: {
                        nim: student.npm || student.nim || targetNim,
                        nama: student.nama_lengkap || student.nama || mockAkhir?.nama || 'Mahasiswa',
                        angkatan: student.angkatan || mockAkhir?.angkatan || 2022,
                        status: normalizeStatus(student.status || mockAkhir?.status || 'aktif'),
                        semester: student.semester || 8,
                        evaluasiStatus: student.evaluasi_status || 'Belum Evaluasi',
                        evaluasiPemicu: student.evaluasi_pemicu || 'Studi berjalan normal',
                        tanggalUpdateStatus: student.updated_at || new Date().toISOString(),
                        sksDenganNilaiMinC: totalSks - totalSksTidakLulus,
                        statusHerregistrasi: mockAkhir?.syarat ? mockAkhir.syarat.herregistrasi : true,
                        statusKKN: mockAkhir?.syarat ? (mockAkhir.syarat.lulusKKN ? 'Selesai' : 'Belum') : 'Belum',
                        sertifikatAlQuran: mockAkhir?.syarat ? mockAkhir.syarat.sertifikatBTAQ : false,
                        aikData: aikData,
                        lunasBiaya: mockAkhir?.syarat ? mockAkhir.syarat.lunasBiaya : true,
                        lulusTeoriPPL: mockAkhir?.syarat ? mockAkhir.syarat.lulusTeoriPPL : true,
                        skripsiDisetujui: mockAkhir?.syarat ? mockAkhir.syarat.skripsiDisetujui : false,
                    },
                    currentSemester: currentSemester,
                    ipk: ipk || 3.5,
                    totalSks: totalSks || 120,
                    totalSksKurikulum: totalSksKurikulum || 144,
                    riwayatNilai: riwayatNilai,
                    sksTidakLulusList: sksTidakLulusList,
                    totalSksTidakLulus: totalSksTidakLulus,
                    belumDiambil: belumDiambil,
                    estimasiKelulusan: estimasiKelulusan,
                    prediksiRisiko: prediksiRisiko,
                    aikStatus: aikStatus,
                    riwayatKhs: riwayatKhs,
                    capstone: capstone,
                    skripsi: skripsi
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching student data:', err);
                
                // Cek apakah error karena data tidak ditemukan
                if (err.message?.includes('tidak ditemukan') || 
                    err.message?.includes('not found') ||
                    err.message?.includes('404')) {
                    setNotFound(true);
                    setError('Mahasiswa tidak ditemukan');
                    setAnalytics(null);
                } else {
                    setError(err.message || 'Gagal memuat data mahasiswa');
                }
                setLoading(false);
            }
        };

        fetchData();
    }, [nim]);

    return { analytics, loading, error, notFound };
};
