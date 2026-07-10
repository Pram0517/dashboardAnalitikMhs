import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStudentAnalytics } from '../hooks/useStudentAnalytics';
import { User, BookOpen, GraduationCap, ArrowLeft, CheckCircle, Clock, AlertTriangle, Upload as UploadIcon, FileText } from 'lucide-react';

// ============ [PAGE: MAHASISWA DETAIL] ============
// [KOMPONEN] MahasiswaDetail - Pusat informasi akademik mahasiswa komprehensif

const MahasiswaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');
  const [selectedSemester, setSelectedSemester] = useState('1');
  
  // Jika id === 'self', ambil NIM dari localStorage
  let actualId = id;
  if (id === 'self') {
    const userData = JSON.parse(localStorage.getItem('uad_user') || '{}');
    actualId = userData.nim;
  }
  
  const { analytics, loading, error } = useStudentAnalytics(actualId);

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in font-sans">
        <div className="w-12 h-12 border-4 border-accent1 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-text-muted">Memuat data mahasiswa...</p>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in font-sans">
        <AlertTriangle size={48} className="text-secondary mb-4" />
        <h2 className="text-xl font-bold text-accent2">Gagal Memuat Data</h2>
        <p className="text-text-muted mt-2">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 btn-outline">Kembali</button>
      </div>
    );
  }

  // ============ DATA TIDAK DITEMUKAN ============
  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-fade-in font-sans">
        <AlertTriangle size={48} className="text-secondary mb-4" />
        <h2 className="text-xl font-bold text-accent2">Data Mahasiswa Tidak Ditemukan</h2>
        <button onClick={() => navigate(-1)} className="mt-4 btn-outline">Kembali</button>
      </div>
    );
  }

  const { student, currentSemester, ipk, totalSks, totalSksKurikulum, riwayatNilai, sksTidakLulusList, totalSksTidakLulus, belumDiambil, estimasiKelulusan, prediksiRisiko, aikStatus, riwayatKhs, capstone, skripsi } = analytics;

  const isOwner = user?.role === 'mahasiswa' && user?.nim === actualId;

  const getIpkColor = (val) => {
    if (val >= 3.5) return 'text-green-600';
    if (val >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRisikoBadge = (risiko) => {
    if (risiko === 'Tepat Waktu') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{risiko}</span>;
    if (risiko === 'Berisiko Terlambat') return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">{risiko}</span>;
    return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">{risiko}</span>;
  };

  const getStatusMahasiswaBadge = (status) => {
    if (status === 'Aktif') return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Aktif</span>;
    if (status === 'Cuti') return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Cuti</span>;
    return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Non-Aktif</span>;
  };

  const sksPercentage = Math.min(100, Math.round((totalSks / totalSksKurikulum) * 100));

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      {/* ... sisanya sama seperti sebelumnya ... */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-accent2 transition-colors font-semibold text-sm">
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Profil Header */}
      <div className="card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent1/20 to-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-accent2 to-accent1 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-3xl">
          {student.nama?.charAt(0) || '?'}
        </div>
        <div className="flex-1 z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-extrabold text-accent2">{student.nama || 'Mahasiswa'}</h1>
            {getStatusMahasiswaBadge(student.status)}
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-text-muted">
            <span className="flex items-center gap-1.5"><User size={16} className="text-accent1"/> NIM: {student.nim || '-'}</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-accent1"/> Angkatan {student.angkatan || '-'}</span>
            <span className="flex items-center gap-1.5"><Clock size={16} className="text-accent1"/> Semester {currentSemester}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-secondary/30 overflow-x-auto no-scrollbar">
        {['profil', 'riwayat nilai', 'status akhir'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === tab ? 'border-accent2 text-accent2 bg-secondary/5' : 'border-transparent text-text-muted hover:text-accent1'}`}
          >
            {tab.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Tab Content - Sama seperti sebelumnya */}
      <div className="pt-2">
        {/* TAB: PROFIL */}
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-5 bg-gradient-to-br from-white to-gray-50 border-secondary/20">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">IPK Saat Ini</p>
                  <p className={`text-4xl font-extrabold ${getIpkColor(ipk)}`}>{ipk ? ipk.toFixed(2) : '0.00'}</p>
                </div>
                <div className="card p-5 bg-gradient-to-br from-white to-gray-50 border-secondary/20">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total SKS</p>
                  <p className="text-4xl font-extrabold text-accent2">{totalSks || 0} <span className="text-sm text-text-muted font-medium">/ {totalSksKurikulum}</span></p>
                </div>
                <div className="card p-5 bg-gradient-to-br from-white to-gray-50 border-secondary/20">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Mata Kuliah Lulus</p>
                  <p className="text-4xl font-extrabold text-accent1">{riwayatNilai?.length || 0}</p>
                </div>
                <div className="card p-5 bg-gradient-to-br from-white to-gray-50 border-secondary/20">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Estimasi Lulus</p>
                  <p className="text-lg font-extrabold text-accent2 mt-1">{estimasiKelulusan || '-'}</p>
                </div>
              </div>

              {/* Evaluasi Akademik Section */}
              <div className="card p-6 border-l-4 border-l-accent1">
                <h3 className="text-lg font-bold text-accent2 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-accent1" /> Evaluasi Akademik
                </h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-muted">Tahap Evaluasi</span>
                    <span className="font-bold text-accent2 bg-secondary/10 px-3 py-1 rounded-full text-xs">{student.evaluasiStatus || 'Belum Evaluasi'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-muted">Prediksi Risiko Studi</span>
                    {getRisikoBadge(prediksiRisiko)}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-accent2 mb-1">
                      <span>Progres Akademik Keseluruhan</span>
                      <span>{sksPercentage}%</span>
                    </div>
                    <div className="w-full bg-secondary/20 rounded-full h-2.5">
                      <div className="bg-accent1 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${sksPercentage}%` }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-yellow-800">Pemicu Status Evaluasi:</p>
                      <span className="text-[10px] text-yellow-700 bg-yellow-200/50 px-2 py-0.5 rounded">Update: {student.tanggalUpdateStatus || '-'}</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {student.evaluasiPemicu || 'Studi berjalan normal sesuai dengan parameter angkatan saat ini.'}
                    </p>
                    <p className="text-xs text-yellow-800 mt-2 font-semibold">Total SKS (≥ C): {student.sksDenganNilaiMinC || 0} SKS</p>
                  </div>
                  {!aikStatus?.isComplete && currentSemester >= 6 && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1"><AlertTriangle size={14}/> Perhatian Khusus:</p>
                      <p className="text-sm text-red-700">Sertifikasi AIK belum lengkap — wajib diselesaikan sebelum pengajuan skripsi.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="card p-6 bg-accent2 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                <h3 className="text-lg font-bold mb-4 relative z-10">Info Tambahan</h3>
                <ul className="space-y-4 relative z-10 text-sm">
                  <li className="flex flex-col gap-1 border-b border-white/10 pb-3">
                    <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Status Dosen Wali</span>
                    <span className="font-bold">Telah disetujui KRS</span>
                  </li>
                  <li className="flex flex-col gap-1 border-b border-white/10 pb-3">
                    <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Poin Keaktifan</span>
                    <span className="font-bold">120 Poin (Cukup)</span>
                  </li>
                  <li className="flex flex-col gap-1">
                    <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Status Keuangan</span>
                    <span className="font-bold text-green-300">Lunas Semester Ini</span>
                  </li>
                </ul>

                {/* Status Sertifikasi AIK */}
                <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
                    Status Sertifikasi AIK
                    <span className={`px-2 py-0.5 rounded text-[10px] ${aikStatus?.isComplete ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                      {aikStatus?.isComplete ? 'AIK Lengkap' : 'AIK Belum Lengkap'}
                    </span>
                  </h4>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs font-bold text-white/80 mb-1">
                      <span>Progres Sertifikasi</span>
                      <span>{aikStatus?.totalSelesai || 0} dari 4 selesai</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-1000 ${aikStatus?.isComplete ? 'bg-green-400' : 'bg-accent1'}`} style={{ width: `${(Math.min(4, aikStatus?.totalSelesai || 0) / 4) * 100}%` }}></div>
                    </div>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {aikStatus?.detail?.map((aik, idx) => (
                      <li key={idx} className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span className="text-white/80">{aik.nama} <span className="opacity-50">({aik.jenis})</span></span>
                        {aik.status === 'Lulus' ? <CheckCircle size={14} className="text-green-400" /> : <span className="text-red-400">{aik.status}</span>}
                      </li>
                    ))}
                    {(!aikStatus?.detail || aikStatus.detail.length === 0) && (
                      <li className="text-white/60 italic">Belum ada data sertifikasi AIK</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RIWAYAT NILAI */}
        {activeTab === 'riwayat nilai' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-accent2">Riwayat Nilai Mahasiswa</h3>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-text-muted">Pilih Semester:</label>
                  <select 
                    value={selectedSemester} 
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="border border-secondary/30 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent1"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s.toString()}>Semester {s}</option>
                    ))}
                    <option value="Semua">Semua Semester</option>
                  </select>
                </div>
              </div>
              
              {(() => {
                const filteredRiwayat = selectedSemester === 'Semua' 
                  ? riwayatNilai || [] 
                  : (riwayatNilai || []).filter(r => r.semester === parseInt(selectedSemester));
                
                const semSks = filteredRiwayat.reduce((a,c)=>a+c.sks, 0);
                const semIp = semSks > 0 ? (filteredRiwayat.reduce((acc, curr) => acc + (curr.bobot * curr.sks), 0) / semSks).toFixed(2) : '0.00';

                return (
                  <>
                    <div className="flex gap-4 mb-4">
                      <div className="bg-secondary/5 px-4 py-2 rounded-lg border border-secondary/20">
                        <span className="text-xs text-text-muted font-bold uppercase">Total MK</span>
                        <p className="text-lg font-extrabold text-accent2">{filteredRiwayat.length}</p>
                      </div>
                      <div className="bg-secondary/5 px-4 py-2 rounded-lg border border-secondary/20">
                        <span className="text-xs text-text-muted font-bold uppercase">SKS Semester</span>
                        <p className="text-lg font-extrabold text-accent2">{semSks}</p>
                      </div>
                      <div className="bg-secondary/5 px-4 py-2 rounded-lg border border-secondary/20">
                        <span className="text-xs text-text-muted font-bold uppercase">IP Semester</span>
                        <p className="text-lg font-extrabold text-accent2">{semIp}</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-secondary/20">
                      <table className="w-full text-left border-collapse text-[13px]">
                        <thead>
                          <tr style={{ background: 'rgba(156,205,219,0.06)' }}>
                            <th className="py-2.5 px-3.5 font-semibold text-[#5790AB] border-b-2 border-secondary/20 text-left">Kode</th>
                            <th className="py-2.5 px-3.5 font-semibold text-[#5790AB] border-b-2 border-secondary/20 text-left">Nama Mata Kuliah</th>
                            <th className="py-2.5 px-3.5 font-semibold text-[#5790AB] border-b-2 border-secondary/20 text-center">SKS</th>
                            <th className="py-2.5 px-3.5 font-semibold text-[#5790AB] border-b-2 border-secondary/20 text-center">Semester</th>
                            <th className="py-2.5 px-3.5 font-semibold text-[#5790AB] border-b-2 border-secondary/20 text-center">Nilai</th>
                            <th className="py-2.5 px-3.5 font-semibold text-[#5790AB] border-b-2 border-secondary/20 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRiwayat.map((item, idx) => {
                            const isLulus = item.nilai === 'A' || item.nilai === 'A-' || item.nilai === 'B+' || item.nilai === 'B' || item.nilai === 'B-' || item.nilai === 'C+' || item.nilai === 'C';
                            const isBelum = !item.nilai || item.nilai === '-';
                            const statusLabel = isBelum ? 'Belum Dinilai' : (isLulus ? 'Lulus' : 'Tidak Lulus');
                            const nilaiColor = isBelum ? 'text-gray-400' : (isLulus ? 'text-green-700' : 'text-red-700');
                            const badgeBg = isBelum ? 'bg-gray-100 border-gray-200 text-gray-600' : (isLulus ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700');
                            const badgeDot = isBelum ? 'bg-gray-400' : (isLulus ? 'bg-green-600' : 'bg-red-600');
                            
                            return (
                              <tr key={idx} className="border-b border-secondary/10 hover:bg-[#9ccddb]/10 transition-colors text-text-main">
                                <td className="py-2.5 px-3.5 font-semibold text-[#06446B]">{item.kode}</td>
                                <td className="py-2.5 px-3.5 font-medium">{item.nama}</td>
                                <td className="py-2.5 px-3.5 text-center font-semibold">{item.sks}</td>
                                <td className="py-2.5 px-3.5 text-center">{item.semester}</td>
                                <td className={`py-2.5 px-3.5 text-center font-bold ${nilaiColor}`}>{item.nilai || '-'}</td>
                                <td className="py-2.5 px-3.5 text-center">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeBg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />
                                    {statusLabel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredRiwayat.length === 0 && (
                            <tr>
                              <td colSpan="6" className="p-10 text-center text-text-muted">
                                <BookOpen size={32} className="mx-auto mb-3 opacity-30 text-accent1" />
                                <p>Belum ada data mata kuliah</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>

            {sksTidakLulusList && sksTidakLulusList.length > 0 && (
              <div className="card p-6 border-l-4 border-l-red-500">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-red-600">SKS Tidak Lulus</h3>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Total: {totalSksTidakLulus || 0} SKS</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-red-50 text-red-700 text-sm border-b border-red-100">
                        <th className="p-3 font-semibold">Kode MK</th>
                        <th className="p-3 font-semibold">Nama Mata Kuliah</th>
                        <th className="p-3 font-semibold text-center">Semester</th>
                        <th className="p-3 font-semibold text-center">SKS</th>
                        <th className="p-3 font-semibold text-center">Nilai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sksTidakLulusList.map((item, idx) => (
                        <tr key={idx} className="border-b border-red-50 hover:bg-red-50/50 text-sm">
                          <td className="p-3 font-medium text-red-800">{item.kode}</td>
                          <td className="p-3 font-semibold text-red-900">{item.nama}</td>
                          <td className="p-3 text-center text-red-700">{item.semester}</td>
                          <td className="p-3 text-center text-red-700">{item.sks}</td>
                          <td className="p-3 text-center font-bold text-red-600">{item.nilai}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="card p-6">
              <h3 className="text-lg font-bold text-accent2 mb-4">Mata Kuliah Wajib Belum Diambil</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/10 text-accent2 text-sm border-b border-secondary/20">
                      <th className="p-3 font-semibold rounded-tl-lg">Kode MK</th>
                      <th className="p-3 font-semibold">Nama Mata Kuliah</th>
                      <th className="p-3 font-semibold text-center">SKS</th>
                      <th className="p-3 font-semibold text-center rounded-tr-lg">Semester Ideal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {belumDiambil && belumDiambil.slice(0, 5).map((item, idx) => (
                      <tr key={idx} className="border-b border-secondary/10 hover:bg-secondary/5 text-sm opacity-70">
                        <td className="p-3 font-medium text-accent2">{item.kode}</td>
                        <td className="p-3 text-text-main">{item.nama}</td>
                        <td className="p-3 text-center">{item.sks}</td>
                        <td className="p-3 text-center font-semibold text-accent1">{item.semester}</td>
                      </tr>
                    ))}
                    {belumDiambil && belumDiambil.length > 5 && (
                      <tr>
                        <td colSpan="4" className="p-3 text-center text-xs font-semibold text-text-muted">Dan {belumDiambil.length - 5} mata kuliah wajib lainnya...</td>
                      </tr>
                    )}
                    {(!belumDiambil || belumDiambil.length === 0) && (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-text-muted">Semua mata kuliah wajib telah diambil.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STATUS AKHIR */}
        {activeTab === 'status akhir' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-accent2 mb-6 flex items-center gap-2 border-b border-secondary/20 pb-4">
                  <BookOpen size={20} className="text-accent1" /> Status Capstone
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Judul Capstone</p>
                    <p className="font-semibold text-accent2">{capstone?.judul || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Status Saat Ini</p>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200 inline-block">{capstone?.status || 'Belum Mulai'}</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold text-accent2 mb-6 flex items-center gap-2 border-b border-secondary/20 pb-4">
                  <FileText size={20} className="text-accent1" /> Status Skripsi
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Judul Skripsi</p>
                    <p className="font-semibold text-accent2">{skripsi?.judul || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Dosen Pembimbing</p>
                    <p className="font-semibold text-text-main">{skripsi?.dosenPembimbing || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Status Saat Ini</p>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-200 inline-block">{skripsi?.status || 'Belum Mulai'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6 h-fit border-t-4 border-t-accent2">
              <h3 className="text-lg font-bold text-accent2 mb-6 flex items-center gap-2 border-b border-secondary/20 pb-4">
                <CheckCircle size={20} className="text-accent1" /> Kelengkapan Syarat Skripsi
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Telah melakukan Herregistrasi', status: student?.statusHerregistrasi },
                  { label: 'Lunas biaya pembimbingan & ujian', status: student?.lunasBiaya ?? true },
                  { label: 'Lulus seluruh teori & PPL', status: student?.lulusTeoriPPL ?? (belumDiambil?.length === 0) },
                  { label: 'Telah mengikuti KKN', status: student?.statusKKN === 'Selesai' },
                  { label: 'Sertifikasi AIK Lengkap', status: aikStatus?.isComplete },
                  { label: 'Sertifikat Tes Baca Al-Qur\'an', status: student?.sertifikatAlQuran },
                  { label: 'Skripsi Disetujui Pembimbing', status: student?.skripsiDisetujui ?? (skripsi?.status !== 'Belum Mulai') }
                ].map((syarat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                    <div className="mt-0.5">
                      {syarat.status ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <AlertTriangle size={18} className="text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${syarat.status ? 'text-accent2' : 'text-text-main'}`}>
                        {syarat.label}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {syarat.status ? 'Memenuhi Syarat' : 'Belum Terverifikasi / Belum Memenuhi'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default MahasiswaDetail;