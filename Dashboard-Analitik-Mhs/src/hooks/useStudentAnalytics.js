import { useState, useEffect } from 'react';
import { mahasiswaDetailService } from '../services/mahasiswaDetailService';
import { evaluasiService } from '../services/evaluasiService';
import { apiService } from '../services/apiService'; // NEW: Import our apiService

const GRADE_WEIGHTS = {
    'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.00, 'B-': 2.75, 'C+': 2.50, 'C': 2.00, 'C-': 1.75, 'D+': 1.50, 'D': 1.00, 'E': 0.00
};

export const useStudentAnalytics = (nim) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async() => {
            try {
                setLoading(true);
                setError(null);

                let targetNim = nim;
                if (!targetNim) {
                    const user = JSON.parse(localStorage.getItem('uad_user') || '{}');
                    targetNim = user.nim;
                }

                if (!targetNim) {
                    throw new Error('NIM tidak ditemukan. Silakan login ulang.');
                }

                // Coba ambil data dari API MOCK (skripsiData / capstoneData)
                let mockAkhir = null;
                try {
                  mockAkhir = await apiService.getMahasiswaByNIM(targetNim);
                } catch (e) {
                  console.log("Not found in skripsi/capstone mock data, fallback to old mock");
                }

                // Data profil, capstone, skripsi, riwayat upload KHS
                let data;
                try {
                  data = await mahasiswaDetailService.getAllData(targetNim);
                } catch(e) {
                  // Fallback dummy for missing backend
                  data = { mahasiswa: { nim: targetNim, nama: mockAkhir?.nama || 'Mahasiswa Dummy' }, khs: [], capstone: null, skripsi: null };
                }

                // Data nilai berbasis kurikulum (sudah termasuk MK yang belum diambil)
                let kurikulumRes;
                try {
                  kurikulumRes = await evaluasiService.getKurikulumWithNilai(targetNim);
                } catch (e) {
                  kurikulumRes = { data: [] };
                }
                const kurikulumData = kurikulumRes.data || [];

                const student = data.mahasiswa;
                const khsList = data.khs || [];
                
                // Override capstone / skripsi if mockAkhir exists
                let capstone = data.capstone || { judul: '-', status: 'Belum Mulai' };
                let skripsi = data.skripsi || { judul: '-', status: 'Belum Mulai', dosenPembimbing: '-' };

                if (mockAkhir) {
                  if (mockAkhir.tipeTugasAkhir === 'Skripsi') {
                    skripsi = { ...mockAkhir };
                  } else {
                    capstone = { ...mockAkhir };
                  }
                }

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

                    const nilaiItem = { kode: mk.kode_mk, nama: mk.nama_mata_kuliah, sks: mk.sks, nilai: mk.nilai, bobot: mk.bobot, semester: mk.semester, kelas: '-', wp };
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

                setAnalytics({
                    student: {
                        nim: student.npm || student.nim || targetNim,
                        nama: student.nama_lengkap || student.nama || mockAkhir?.nama || 'Mahasiswa',
                        angkatan: student.angkatan || mockAkhir?.angkatan || 2022,
                        status: student.status 
    ? student.status.charAt(0).toUpperCase() + student.status.slice(1).toLowerCase()
    : 'Aktif',
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
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [nim]);

    return { analytics, loading, error };
};