import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, X, Loader, AlertTriangle, Eye, Filter, ChevronDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { kurikulumService } from '../services/kurikulumService';
import toast from 'react-hot-toast';

const Kurikulum = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [selectedKurikulum, setSelectedKurikulum] = useState(null);
  const [mataKuliah, setMataKuliah] = useState([]);
  const [form, setForm] = useState({ 
    nama_kurikulum: '', 
    tahun_berlaku: new Date().getFullYear(),
    deskripsi: '',
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState(null);
  const [kurikulumList, setKurikulumList] = useState([]);

  // Fetch data kurikulum
  useEffect(() => {
    fetchKurikulum();
    fetchSummary();
  }, []);

  const fetchKurikulum = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kurikulumService.getAll();
      setData(response.data || []);
      setKurikulumList(response.data || []);
    } catch (err) {
      console.error('Error fetching kurikulum:', err);
      setError(err.message || 'Gagal mengambil data kurikulum');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await kurikulumService.getSummary();
      console.log('📊 Summary response:', response);
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  // Filter data berdasarkan pencarian
  const filteredData = data.filter(d => {
    const matchSearch = d.nama?.toLowerCase().includes(search.toLowerCase()) || 
                        d.tahun?.toString().includes(search);
    return matchSearch;
  });

  // Handle modal
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      setForm({ 
        nama_kurikulum: item.nama || '', 
        tahun_berlaku: item.tahun || new Date().getFullYear(),
        deskripsi: item.deskripsi || '',
        is_active: item.is_active !== undefined ? item.is_active : true
      });
    } else {
      setEditId(null);
      setForm({ 
        nama_kurikulum: '', 
        tahun_berlaku: new Date().getFullYear(),
        deskripsi: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleViewDetail = async (item) => {
    try {
      setLoading(true);
      const response = await kurikulumService.getById(item.id);
      if (response.status === 'Success') {
        setSelectedKurikulum(response.data);
        let filteredMk = response.data.mata_kuliah || [];
        if (selectedSemester !== 'all') {
          filteredMk = filteredMk.filter(mk => mk.semester === parseInt(selectedSemester));
        }
        setMataKuliah(filteredMk);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching detail:', err);
      toast.error('Gagal mengambil detail kurikulum');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!form.nama_kurikulum?.trim()) {
        toast.error('Nama kurikulum wajib diisi');
        return;
      }

      const payload = {
        nama_kurikulum: form.nama_kurikulum,
        tahun_berlaku: parseInt(form.tahun_berlaku),
        deskripsi: form.deskripsi || '',
        is_active: form.is_active
      };

      if (editId) {
        await kurikulumService.update(editId, payload);
        toast.success('Kurikulum berhasil diupdate');
      } else {
        await kurikulumService.create(payload);
        toast.success('Kurikulum berhasil ditambahkan');
      }
      
      setIsModalOpen(false);
      fetchKurikulum();
      fetchSummary();
    } catch (err) {
      console.error('Error saving:', err);
      toast.error(err.message || 'Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete - Buka modal konfirmasi
  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
    setIsDeleteModalOpen(true);
  };

  // Handle delete - Konfirmasi
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    try {
      await kurikulumService.delete(deleteTarget.id);
      toast.success('Kurikulum berhasil dihapus');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchKurikulum();
      fetchSummary();
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error(err.message || 'Gagal menghapus kurikulum');
    }
  };

  // Handle delete - Batal
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // Handle filter semester di modal detail
  const handleSemesterFilter = (e) => {
    const semester = e.target.value;
    setSelectedSemester(semester);
    if (selectedKurikulum) {
      let filteredMk = selectedKurikulum.mata_kuliah || [];
      if (semester !== 'all') {
        filteredMk = filteredMk.filter(mk => mk.semester === parseInt(semester));
      }
      setMataKuliah(filteredMk);
    }
  };

  // Get unique semesters from mata kuliah
  const getUniqueSemesters = () => {
    if (!selectedKurikulum || !selectedKurikulum.mata_kuliah) return [];
    const semesters = [...new Set(selectedKurikulum.mata_kuliah.map(mk => mk.semester))];
    return semesters.sort((a, b) => a - b);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h1 className="text-2xl font-extrabold text-accent2 flex items-center gap-2">
            <BookOpen size={24} className="text-accent1" />
            Manajemen Kurikulum
          </h1>
          <p className="text-sm text-text-muted mt-1">Kelola data kurikulum dan mata kuliah</p>
        </div>
        <div className="card p-6">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <Loader size={32} className="animate-spin" style={{ color: '#06446B' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h1 className="text-2xl font-extrabold text-accent2 flex items-center gap-2">
            <BookOpen size={24} className="text-accent1" />
            Manajemen Kurikulum
          </h1>
          <p className="text-sm text-text-muted mt-1">Kelola data kurikulum dan mata kuliah</p>
        </div>
        <div className="card p-6">
          <div style={{ padding: '20px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <span>⚠ {error}</span>
          </div>
          <button 
            onClick={fetchKurikulum}
            className="mt-4 btn-primary"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-accent2 flex items-center gap-2">
            <BookOpen size={24} className="text-accent1" />
            Manajemen Kurikulum
          </h1>
          <p className="text-sm text-text-muted mt-1">Kelola data kurikulum dan mata kuliah</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'kaprodi') && (
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Tambah Kurikulum
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="card grid grid-cols-4 gap-4 p-4">
        <div className="text-center p-3 bg-secondary/10 rounded-lg">
          <p className="text-xs font-semibold text-text-muted">Total Kurikulum</p>
          <p className="text-2xl font-bold text-accent2">{summary?.total_kurikulum || data.length || 0}</p>
        </div>
        <div className="text-center p-3 bg-secondary/10 rounded-lg">
          <p className="text-xs font-semibold text-text-muted">Kurikulum Aktif</p>
          <p className="text-2xl font-bold text-accent1">{summary?.total_active || data.filter(d => d.is_active).length || 0}</p>
        </div>
        <div className="text-center p-3 bg-secondary/10 rounded-lg">
          <p className="text-xs font-semibold text-text-muted">Total Mata Kuliah</p>
          <p className="text-2xl font-bold text-accent2">{summary?.total?.total_mk || summary?.total_matakuliah || 0}</p>
        </div>
        <div className="text-center p-3 bg-secondary/10 rounded-lg">
          <p className="text-xs font-semibold text-text-muted">Total SKS</p>
          <p className="text-2xl font-bold text-accent1">{summary?.total?.total_sks || summary?.total_sks || 0}</p>
        </div>
      </div>

      <div className="card flex flex-col p-6">
        {/* Filters */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Cari nama / tahun..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="input-field pl-9 py-1.5 text-sm" 
            />
          </div>
          <div className="text-sm text-text-muted">
            Menampilkan {filteredData.length} dari {data.length} kurikulum
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/10 text-accent2 text-sm">
                <th className="p-3 font-semibold rounded-tl-lg">#</th>
                <th className="p-3 font-semibold">Nama Kurikulum</th>
                <th className="p-3 font-semibold text-center">Tahun</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Deskripsi</th>
                {(user?.role === 'admin' || user?.role === 'kaprodi') && (
                  <th className="p-3 font-semibold text-right rounded-tr-lg">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id} className="border-b border-secondary/10 hover:bg-secondary/5 transition-colors text-sm">
                  <td className="p-3 text-text-muted">{index + 1}</td>
                  <td className="p-3 font-medium text-accent2">{item.nama}</td>
                  <td className="p-3 text-center">{item.tahun}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      item.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td className="p-3 text-text-muted max-w-xs truncate">
                    {item.deskripsi || '-'}
                  </td>
                  {(user?.role === 'admin' || user?.role === 'kaprodi') && (
                    <td className="p-3 flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(item)} 
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(item)} 
                        className="p-1.5 text-accent1 hover:bg-accent1/10 rounded-md"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteClick(item)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-text-muted">
                    {search 
                      ? 'Data tidak ditemukan sesuai filter.' 
                      : 'Belum ada data kurikulum. Silakan tambahkan kurikulum baru.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Kurikulum */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in-up">
            <div className="flex justify-between items-center p-4 border-b border-secondary/20 bg-primary">
              <h3 className="font-bold text-accent2">{editId ? 'Edit Kurikulum' : 'Tambah Kurikulum'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-accent2">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Nama Kurikulum *</label>
                <input 
                  type="text" 
                  value={form.nama_kurikulum} 
                  onChange={e => setForm({...form, nama_kurikulum: e.target.value})} 
                  className="input-field" 
                  placeholder="Kurikulum Sistem Informasi 2024" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Tahun Berlaku *</label>
                <input 
                  type="number" 
                  value={form.tahun_berlaku} 
                  onChange={e => setForm({...form, tahun_berlaku: parseInt(e.target.value) || new Date().getFullYear()})} 
                  className="input-field" 
                  placeholder="2024"
                  min="2000"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Deskripsi</label>
                <textarea 
                  value={form.deskripsi} 
                  onChange={e => setForm({...form, deskripsi: e.target.value})} 
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Deskripsi kurikulum..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={form.is_active} 
                    onChange={e => setForm({...form, is_active: e.target.checked})} 
                    className="w-4 h-4 text-accent1 rounded border-gray-300 focus:ring-accent1"
                  />
                  <span className="font-semibold text-text-muted">Aktif</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-secondary/20 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="btn-outline text-sm">Batal</button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Kurikulum */}
      {isDetailModalOpen && selectedKurikulum && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-slide-in-up">
            <div className="flex justify-between items-center p-4 border-b border-secondary/20 bg-primary">
              <div>
                <h3 className="font-bold text-accent2">{selectedKurikulum.nama}</h3>
                <p className="text-sm text-text-muted">Tahun {selectedKurikulum.tahun}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-text-muted hover:text-accent2">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh]">
              <div className="mb-4">
                <p className="text-sm text-text-muted">{selectedKurikulum.deskripsi || 'Tidak ada deskripsi'}</p>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    selectedKurikulum.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedKurikulum.is_active ? 'Aktif' : 'Non-Aktif'}
                  </span>
                  <span className="text-xs text-text-muted">
                    Total Mata Kuliah: {selectedKurikulum.mata_kuliah?.length || 0}
                  </span>
                </div>
              </div>

              {/* Filter Semester Dropdown */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-accent1" />
                  <span className="text-sm font-semibold text-accent2">Filter Semester:</span>
                </div>
                <div className="relative">
                  <select
                    value={selectedSemester}
                    onChange={handleSemesterFilter}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-accent2 focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-transparent cursor-pointer hover:border-accent1 transition-colors"
                  >
                    <option value="all">Semua Semester</option>
                    {getUniqueSemesters().map(sem => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>

              <h4 className="font-semibold text-accent2 mb-3">Daftar Mata Kuliah</h4>
              {mataKuliah.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">
                  {selectedSemester !== 'all' 
                    ? `Tidak ada mata kuliah untuk Semester ${selectedSemester}`
                    : 'Belum ada mata kuliah dalam kurikulum ini'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/10">
                        <th className="p-3 font-semibold">No</th>
                        <th className="p-3 font-semibold">Kode</th>
                        <th className="p-3 font-semibold">Nama Mata Kuliah</th>
                        <th className="p-3 font-semibold text-center">SKS</th>
                        <th className="p-3 font-semibold text-center">Semester</th>
                        <th className="p-3 font-semibold text-center">Sifat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mataKuliah.map((mk, index) => (
                        <tr key={mk.id} className="border-b border-secondary/10 hover:bg-secondary/5">
                          <td className="p-3 text-text-muted">{index + 1}</td>
                          <td className="p-3 font-medium text-accent2">{mk.kode}</td>
                          <td className="p-3">{mk.nama}</td>
                          <td className="p-3 text-center font-semibold">{mk.sks}</td>
                          <td className="p-3 text-center">Semester {mk.semester}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              mk.sifat === 'Wajib' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {mk.sifat || 'Wajib'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-secondary/5">
                      <tr>
                        <td colSpan="3" className="p-3 font-semibold text-accent2">Total</td>
                        <td className="p-3 text-center font-semibold text-accent2">
                          {mataKuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0)}
                        </td>
                        <td colSpan="2" className="p-3 text-center text-text-muted text-xs">
                          {mataKuliah.length} mata kuliah
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-secondary/20 bg-gray-50 flex justify-end">
              <button onClick={() => setIsDetailModalOpen(false)} className="btn-outline text-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-red-100 bg-red-50/50">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-sm text-gray-500">Anda yakin ingin menghapus data ini?</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Nama Kurikulum</span>
                  <span className="text-sm font-semibold text-gray-900">{deleteTarget.nama}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Tahun</span>
                  <span className="text-sm font-semibold text-gray-900">{deleteTarget.tahun}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-xs text-red-600">
                      Tindakan ini tidak dapat dibatalkan!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kurikulum;