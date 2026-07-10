// FRONTEND/src/pages/DosenSkripsi.jsx
import { useState, useEffect } from 'react';
import { Users, UserCheck, PieChart, AlertTriangle, Loader, X, FileText, UserPlus, Edit2, UserCircle, RefreshCw, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const DosenSkripsi = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dosenList, setDosenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBidang, setFilterBidang] = useState('Semua Bidang');
  
  // States for View Modal
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // States for Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ tipe: 'Skripsi', nim: '', nama: '', judul: '', dosenId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for Add Dosen Modal
  const [isAddDosenModalOpen, setIsAddDosenModalOpen] = useState(false);
  const [addDosenForm, setAddDosenForm] = useState({ nama: '', nip: '', email: '', bidang_keahlian: '', kuota: 10 });
  const [isSubmittingDosen, setIsSubmittingDosen] = useState(false);

  // States for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newDosenId, setNewDosenId] = useState('');

  const fetchDosen = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDosenData();
      setDosenList(data || []);
      
      if (selectedDosen) {
        const updatedSelected = data.find(d => d.id === selectedDosen.id);
        if (updatedSelected) setSelectedDosen(updatedSelected);
      }
    } catch (err) {
      console.error('Error fetching dosen:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDosen();
    toast.success('Data dosen berhasil diperbarui');
  };

  const getBidangOptions = () => {
    const bidangSet = new Set();
    dosenList.forEach(d => {
      if (d.bidang_keahlian) {
        bidangSet.add(d.bidang_keahlian);
      }
    });
    return ['Semua Bidang', ...Array.from(bidangSet).sort()];
  };

  const filteredDosen = dosenList.filter((dosen) => {
    const matchSearch = 
      (dosen.nama_lengkap?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (dosen.nip?.includes(searchTerm) || false);
    const matchBidang = filterBidang === 'Semua Bidang' || dosen.bidang_keahlian === filterBidang;
    return matchSearch && matchBidang;
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.nim || !addForm.nama || !addForm.judul || !addForm.dosenId) {
      toast.error("Semua field wajib diisi.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiService.addMahasiswa(addForm);
      toast.success("Berhasil menambahkan mahasiswa bimbingan baru.");
      setIsAddModalOpen(false);
      setAddForm({ tipe: 'Skripsi', nim: '', nama: '', judul: '', dosenId: '' });
      await fetchDosen();
    } catch (err) {
      toast.error(err.message || "Gagal menambahkan mahasiswa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDosenSubmit = async (e) => {
    e.preventDefault();
    if (!addDosenForm.nama || !addDosenForm.nip || !addDosenForm.email) {
      toast.error("Nama, NIP, dan Email wajib diisi.");
      return;
    }
    
    if (addDosenForm.kuota > 10) {
      toast.error("Kapasitas maksimal tidak boleh melebihi 10.");
      return;
    }

    setIsSubmittingDosen(true);
    try {
      await apiService.addDosen(addDosenForm);
      toast.success("Berhasil menambahkan dosen baru.");
      setIsAddDosenModalOpen(false);
      setAddDosenForm({ nama: '', nip: '', email: '', bidang_keahlian: '', kuota: 10 });
      await fetchDosen();
    } catch (err) {
      toast.error(err.message || "Gagal menambahkan dosen.");
    } finally {
      setIsSubmittingDosen(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!newDosenId) {
      toast.error("Silakan pilih dosen pembimbing baru.");
      return;
    }
    if (newDosenId === selectedStudent?.dosenId) {
      toast.error("Mahasiswa sudah dibimbing oleh dosen ini.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.updatePembimbing(selectedStudent.nim, newDosenId);
      toast.success("Berhasil memindahkan mahasiswa ke dosen baru.");
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      setNewDosenId('');
      await fetchDosen();
    } catch (err) {
      toast.error(err.message || "Gagal mengedit pembimbing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDosenDetail = (dosen) => {
    setSelectedDosen(dosen);
    setIsViewModalOpen(true);
  };

  const openEditModal = (e, student, currentDosenId) => {
    e.stopPropagation();
    setSelectedStudent({ ...student, dosenId: currentDosenId });
    setNewDosenId(currentDosenId);
    setIsEditModalOpen(true);
  };

  const totalDosen = dosenList.length;
  const avgLoad = totalDosen > 0 
    ? Math.round(
        dosenList.reduce((acc, d) => {
          const beban = d.bebanBimbingan || 0;
          const kuota = d.kuota || 10;
          return acc + (beban / kuota) * 100;
        }, 0) / totalDosen
      )
    : 0;
  
  const overloaded = dosenList.filter((d) => (d.bebanBimbingan || 0) >= (d.kuota || 10)).length;

  if (loading && dosenList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size={40} className="animate-spin text-[#06446B]" />
      </div>
    );
  }

  if (error && dosenList.length === 0) {
    return (
      <div className="bg-white border border-[#d4eaf3] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-red-600 p-5">
          <AlertTriangle size={24} />
          <span className="font-semibold">{error}</span>
        </div>
        <button onClick={fetchDosen} className="mt-4 px-6 py-2 bg-[#06446B] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#06446B]/20">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-poppins pb-10 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-[#06446B]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06446B] to-[#5790AB] text-white flex items-center justify-center shadow-lg">
              <Users size={24} />
            </div>
            Kelola Dosen Pembimbing
          </h1>
          <p className="text-sm mt-2 text-[#6b8fa8] font-medium">
            Daftar dosen pembimbing skripsi & capstone beserta kapasitas beban bimbingannya
            <span className="ml-2 text-xs bg-[#f1f8fb] px-2 py-0.5 rounded-full border border-[#d4eaf3]">
              {totalDosen} dosen
            </span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#d4eaf3] text-[#06446B] rounded-xl text-sm font-bold shadow-sm hover:border-[#5790AB] transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Memuat...' : 'Refresh'}
          </button>
          {(user?.role === 'admin' || user?.role === 'kaprodi') && (
            <>
              <button 
                onClick={() => setIsAddDosenModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#06446B] text-[#06446B] rounded-xl text-sm font-bold shadow-lg shadow-[#06446B]/5 hover:bg-[#f8fbfd] transition-all hover:-translate-y-0.5"
              >
                <UserCircle size={18} />
                Tambah Dosen
              </button>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#06446B] text-white rounded-xl text-sm font-bold shadow-xl shadow-[#06446B]/20 hover:bg-[#042e4a] transition-all hover:-translate-y-0.5"
              >
                <UserPlus size={18} />
                Tambah Mahasiswa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Total Dosen', val: totalDosen, sub: 'Aktif semester ini', Icon: UserCheck, accent: '#06446B' },
          { label: 'Rata-rata Beban', val: totalDosen > 0 ? `${avgLoad}%` : '0%', sub: 'Dari total kapasitas', Icon: PieChart, accent: '#5790AB' },
          { label: 'Kapasitas Penuh', val: overloaded, sub: 'Dosen mencapai batas (10)', Icon: AlertTriangle, accent: '#dc2626', danger: true },
        ].map(({ label, val, sub, Icon, accent, danger }) => (
          <div key={label} className="bg-white border border-[#d4eaf3] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center shadow-sm">
            <div className={`absolute top-0 left-0 w-1.5 h-full`} style={{ background: `linear-gradient(180deg, ${accent}, ${danger ? '#fca5a5' : '#9CCDDB'})` }} />
            <div className="text-xs text-[#6b8fa8] font-bold uppercase tracking-wider mb-2">{label}</div>
            <div className={`text-4xl font-extrabold leading-none ${danger ? 'text-red-600' : 'text-[#06446B]'}`}>{val}</div>
            <div className="text-xs font-semibold text-[#6b8fa8] mt-2 bg-[#f8fbfd] w-max px-3 py-1 rounded-lg border border-[#e8f6fa]">{sub}</div>
            <Icon size={48} className={`absolute right-6 top-1/2 -translate-y-1/2 ${danger ? 'text-red-500/10' : 'text-[#9CCDDB]/20'}`} />
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ccddb]" />
          <input 
            type="text" 
            placeholder="Cari Nama Dosen atau NIP..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] font-semibold transition-all placeholder:text-[#9ccddb]" 
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#9ccddb]" />
          <select 
            value={filterBidang} 
            onChange={(e) => setFilterBidang(e.target.value)} 
            className="px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] font-semibold min-w-[180px] cursor-pointer transition-all"
          >
            {getBidangOptions().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dosen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDosen.length > 0 ? (
          filteredDosen.map((dosen) => {
            const beban = dosen.bebanBimbingan || 0;
            const kuota = dosen.kuota || 10;
            const isOver = beban >= kuota;
            const isHigh = beban >= 8 && !isOver;

            const statusLabel = isOver ? 'Penuh' : isHigh ? 'Hampir Penuh' : 'Tersedia';
            const badgeClass = isOver ? 'bg-red-50 text-red-700 border-red-200' : isHigh ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
            const fillGrad = isOver ? 'from-red-500 to-red-600' : isHigh ? 'from-orange-400 to-orange-500' : 'from-emerald-400 to-emerald-500';
            const avatarGrad = isOver ? 'from-red-600 to-red-400' : isHigh ? 'from-orange-500 to-orange-400' : 'from-[#06446B] to-[#5790AB]';

            return (
              <div
                key={dosen.id}
                onClick={() => openDosenDetail(dosen)}
                className="group bg-white border border-[#d4eaf3] rounded-3xl p-6 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#06446B]/10 flex flex-col"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#06446B] via-[#5790AB] to-[#9CCDDB] opacity-80" />
                
                <div className="flex gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg shadow-black/10`}>
                    {dosen.nama_lengkap?.charAt(0) || '?'}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-2 pt-1">
                    <div className="text-[15px] font-extrabold text-[#0f2740] line-clamp-2 leading-tight mb-1" title={dosen.nama_lengkap}>
                      {dosen.nama_lengkap || 'Nama Dosen'}
                    </div>
                    <div className="text-[11px] font-semibold text-[#6b8fa8] bg-[#f8fbfd] px-2.5 py-1 rounded-md border border-[#e8f6fa] w-max max-w-full truncate">
                      NIDN: {dosen.nip || '-'}
                    </div>
                    <div className="text-[10px] font-semibold text-[#5790AB] bg-[#e8f6fa] px-2.5 py-1 rounded-md border border-[#d4eaf3] w-max max-w-full truncate mt-1">
                      {dosen.bidang_keahlian || '-'}
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2.5">
                    <div>
                      <div className="text-[10px] font-extrabold text-[#6b8fa8] uppercase tracking-wider mb-1">Kapasitas Bimbingan</div>
                      <div className="text-base font-extrabold text-[#0f2740]">{beban} <span className="text-xs text-[#6b8fa8] font-semibold">/ {kuota} Mahasiswa</span></div>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-bold tracking-wide border shadow-sm ${badgeClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                  
                  <div className="h-2.5 w-full bg-[#f1f8fb] rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full rounded-full bg-gradient-to-r ${fillGrad} transition-all duration-1000`} style={{ width: `${Math.min((beban / kuota) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 bg-white border border-[#d4eaf3] rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-[#f1f8fb] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[#9CCDDB]" />
            </div>
            <p className="text-[#0f2740] font-bold text-lg">
              {searchTerm || filterBidang !== 'Semua Bidang' ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Data Dosen'}
            </p>
            <p className="text-sm text-[#6b8fa8] font-medium mt-1">
              {searchTerm || filterBidang !== 'Semua Bidang'
                ? 'Coba gunakan kata kunci atau filter lain.'
                : 'Data dosen akan muncul setelah ditambahkan oleh admin.'}
            </p>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {isViewModalOpen && selectedDosen && (
        <div className="fixed inset-0 bg-[#0f2740]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-poppins">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/20">
            
            <div className="bg-gradient-to-br from-[#06446B] to-[#5790AB] p-6 flex justify-between items-center shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-md text-xl shadow-inner border border-white/30">
                  {selectedDosen.nama_lengkap?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-xl leading-tight">{selectedDosen.nama_lengkap}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-white/80 text-xs font-medium bg-black/10 px-2.5 py-0.5 rounded-md">NIDN: {selectedDosen.nip || '-'}</p>
                    <p className="text-white/80 text-xs font-medium bg-black/10 px-2.5 py-0.5 rounded-md">{selectedDosen.bidang_keahlian || '-'}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-[#f8fbfd]">
              <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-[#d4eaf3] shadow-sm">
                <h4 className="text-sm font-extrabold text-[#06446B] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f1f8fb] flex items-center justify-center text-[#5790AB]">
                    <Users size={16} />
                  </div>
                  Daftar Mahasiswa Bimbingan
                </h4>
                <div className="text-xs font-bold px-4 py-2 bg-[#f1f8fb] border border-[#d4eaf3] rounded-xl text-[#06446B] shadow-inner">
                  Total: {selectedDosen.bebanBimbingan || 0} / {selectedDosen.kuota || 10}
                </div>
              </div>

              {selectedDosen.mahasiswaBimbingan && selectedDosen.mahasiswaBimbingan.length > 0 ? (
                <div className="space-y-4">
                  {selectedDosen.mahasiswaBimbingan.map((mhs) => {
                    const isSkripsi = mhs.tipe === 'Skripsi' || mhs.id?.startsWith('S');
                    const badgeClass = isSkripsi ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
                    return (
                      <div key={mhs.nim} className="bg-white border border-[#d4eaf3] rounded-2xl p-5 hover:border-[#5790AB] transition-all hover:shadow-lg flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-sm font-extrabold text-[#0f2740]">{mhs.nama || mhs.nama_lengkap}</span>
                            <span className="text-xs px-2.5 py-1 bg-[#f8fbfd] border border-[#e8f6fa] rounded-lg text-[#6b8fa8] font-bold">{mhs.nim}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shadow-sm ${badgeClass}`}>
                              {isSkripsi ? 'Skripsi' : 'Capstone'}
                            </span>
                          </div>
                          <div className="text-xs text-[#6b8fa8] leading-relaxed line-clamp-2 mt-1">
                            <span className="font-bold text-[#06446B]">Judul:</span> {mhs.judul || '-'}
                          </div>
                          <div className="text-xs mt-3 flex items-center gap-2 font-bold">
                            <span className="text-[#6b8fa8]">Status Akhir:</span>
                            <span className="bg-[#f1f8fb] px-3 py-1 rounded-lg border border-[#e8f6fa] text-[#06446B]">{mhs.status || 'Belum Mulai'}</span>
                          </div>
                        </div>
                        
                        <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                          {(user?.role === 'admin' || user?.role === 'kaprodi') && (
                            <button 
                              onClick={(e) => openEditModal(e, mhs, selectedDosen.id)}
                              className="px-4 py-2.5 bg-white border border-[#d4eaf3] hover:border-orange-300 hover:bg-orange-50 text-orange-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
                            >
                              <Edit2 size={14} />
                              Edit Pembimbing
                            </button>
                          )}
                          <button 
                            onClick={() => navigate(`/mahasiswa/${mhs.nim}`)}
                            className="px-4 py-2.5 bg-[#06446B] hover:bg-[#042e4a] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#06446B]/20 flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <FileText size={14} />
                            Detail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-[#d4eaf3] rounded-3xl shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-[#f1f8fb] flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="text-[#9CCDDB]" />
                  </div>
                  <p className="text-[#0f2740] font-bold text-lg">Belum Ada Mahasiswa</p>
                  <p className="text-sm text-[#6b8fa8] font-medium mt-1">Dosen ini belum memiliki mahasiswa bimbingan.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* ADD MODAL - Mahasiswa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#0f2740]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-poppins">
          <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#f8fbfd] border-b border-[#d4eaf3] p-6 flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-[#06446B] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-[#d4eaf3] flex items-center justify-center text-[#5790AB] shadow-sm">
                  <UserPlus size={18} />
                </div>
                Tambah Mahasiswa
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-[#e8f6fa] flex items-center justify-center text-[#6b8fa8] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Tipe Tugas Akhir</label>
                  <select 
                    value={addForm.tipe} 
                    onChange={e => setAddForm({...addForm, tipe: e.target.value})}
                    className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all cursor-pointer"
                  >
                    <option value="Skripsi">Skripsi</option>
                    <option value="Capstone">Capstone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">NIM</label>
                  <input 
                    type="text" 
                    value={addForm.nim} 
                    onChange={e => setAddForm({...addForm, nim: e.target.value})}
                    placeholder="Contoh: 2100016001"
                    className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all placeholder:font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={addForm.nama} 
                  onChange={e => setAddForm({...addForm, nama: e.target.value})}
                  placeholder="Masukkan nama lengkap mahasiswa"
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all placeholder:font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Judul Penelitian</label>
                <textarea 
                  value={addForm.judul} 
                  onChange={e => setAddForm({...addForm, judul: e.target.value})}
                  placeholder="Masukkan judul penelitian/proyek"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all resize-none placeholder:font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Dosen Pembimbing</label>
                <select 
                  value={addForm.dosenId} 
                  onChange={e => setAddForm({...addForm, dosenId: e.target.value})}
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Dosen Pembimbing --</option>
                  {dosenList.map(d => {
                    const beban = d.bebanBimbingan || 0;
                    const kuota = d.kuota || 10;
                    const isFull = beban >= kuota;
                    return (
                      <option key={d.id} value={d.id} disabled={isFull}>
                        {d.nama_lengkap} ({beban}/{kuota}) {isFull ? '- Penuh' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e8f6fa]">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-[#d4eaf3] text-[#6b8fa8] rounded-xl text-sm font-bold hover:bg-[#f8fbfd] transition-all"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#06446B] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#06446B]/20 hover:bg-[#042e4a] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader size={16} className="animate-spin" /> : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-[#0f2740]/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in font-poppins">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#fff9f2] border-b border-orange-100 p-6 flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-orange-600 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-orange-200 flex items-center justify-center shadow-sm">
                  <Edit2 size={18} />
                </div>
                Pindah Pembimbing
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-orange-100 flex items-center justify-center text-orange-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="bg-[#f8fbfd] p-4 rounded-2xl border border-[#d4eaf3]">
                <p className="text-xs text-[#6b8fa8] font-bold uppercase tracking-wider mb-1">Mahasiswa</p>
                <p className="font-extrabold text-[#0f2740]">{selectedStudent.nama} <span className="font-medium text-[#6b8fa8]">({selectedStudent.nim})</span></p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Pilih Dosen Baru</label>
                <select 
                  value={newDosenId} 
                  onChange={e => setNewDosenId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100 text-[#0f2740] transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Dosen Pengganti --</option>
                  {dosenList.map(d => {
                    const beban = d.bebanBimbingan || 0;
                    const kuota = d.kuota || 10;
                    const isFull = beban >= kuota;
                    const isCurrent = d.id === selectedStudent.dosenId;
                    
                    return (
                      <option key={d.id} value={d.id} disabled={isFull || isCurrent}>
                        {d.nama_lengkap} ({beban}/{kuota}) {isCurrent ? '- (Saat ini)' : isFull ? '- Penuh' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e8f6fa]">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-[#d4eaf3] text-[#6b8fa8] rounded-xl text-sm font-bold hover:bg-[#f8fbfd] transition-all"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader size={16} className="animate-spin" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DOSEN MODAL */}
      {isAddDosenModalOpen && (
        <div className="fixed inset-0 bg-[#0f2740]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-poppins">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#f8fbfd] border-b border-[#d4eaf3] p-6 flex justify-between items-center">
              <h3 className="font-extrabold text-xl text-[#06446B] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-[#d4eaf3] flex items-center justify-center text-[#5790AB] shadow-sm">
                  <UserCircle size={18} />
                </div>
                Tambah Dosen
              </h3>
              <button onClick={() => setIsAddDosenModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-[#e8f6fa] flex items-center justify-center text-[#6b8fa8] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDosenSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Nama Dosen (Lengkap dengan Gelar)</label>
                <input 
                  type="text" 
                  value={addDosenForm.nama} 
                  onChange={e => setAddDosenForm({...addDosenForm, nama: e.target.value})}
                  placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom."
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all placeholder:font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">NIP / NIDN</label>
                <input 
                  type="text" 
                  value={addDosenForm.nip} 
                  onChange={e => setAddDosenForm({...addDosenForm, nip: e.target.value})}
                  placeholder="Contoh: 197501012000121001"
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all placeholder:font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Email</label>
                <input 
                  type="email" 
                  value={addDosenForm.email} 
                  onChange={e => setAddDosenForm({...addDosenForm, email: e.target.value})}
                  placeholder="Contoh: dosen@uad.ac.id"
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all placeholder:font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Bidang Keahlian</label>
                <input 
                  type="text" 
                  value={addDosenForm.bidang_keahlian} 
                  onChange={e => setAddDosenForm({...addDosenForm, bidang_keahlian: e.target.value})}
                  placeholder="Contoh: Sistem Informasi, Kecerdasan Buatan"
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all placeholder:font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#06446B] mb-2 uppercase tracking-wide">Kapasitas Maksimal Bimbingan</label>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  value={addDosenForm.kuota} 
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (val > 10) return;
                    setAddDosenForm({...addDosenForm, kuota: val || ''})
                  }}
                  placeholder="Maksimal 10"
                  className="w-full px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] transition-all placeholder:font-medium"
                  required
                />
                <p className="text-[10px] text-[#6b8fa8] mt-1.5 font-semibold">*Aturan sistem: Maksimal kapasitas bimbingan per dosen adalah 10 mahasiswa.</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e8f6fa]">
                <button 
                  type="button" 
                  onClick={() => setIsAddDosenModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-[#d4eaf3] text-[#6b8fa8] rounded-xl text-sm font-bold hover:bg-[#f8fbfd] transition-all"
                  disabled={isSubmittingDosen}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#06446B] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#06446B]/20 hover:bg-[#042e4a] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  disabled={isSubmittingDosen}
                >
                  {isSubmittingDosen ? <Loader size={16} className="animate-spin" /> : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DosenSkripsi;