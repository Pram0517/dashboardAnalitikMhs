// FRONTEND/src/pages/Capstone.jsx
import { useState, useEffect } from 'react';
import { Search, FolderOpen, Loader, AlertTriangle, Download, ChevronRight, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  'Belum Mulai': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  'Proposal Diajukan': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Seminar Proposal': { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Penelitian': { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Seminar Hasil': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Sidang Capstone': { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Selesai': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  'Revisi': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const Capstone = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterAngkatan, setFilterAngkatan] = useState('Semua Angkatan');
  const [capstoneList, setCapstoneList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCapstone();
  }, []);

  const fetchCapstone = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getCapstoneData();
      
      if (user?.role === 'mahasiswa' && user?.nim) {
        setCapstoneList(data.filter(c => c.nim === user.nim));
      } else {
        setCapstoneList(data);
      }
      
      console.log('✅ Capstone data loaded:', data.length);
    } catch (err) {
      console.error('Error fetching capstone:', err);
      setError(err.message || 'Gagal mengambil data capstone');
      toast.error('Gagal mengambil data capstone');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCapstone();
    toast.success('Data capstone berhasil diperbarui');
  };

  const handleExport = (format) => {
    toast.success(`Data capstone diexport ke ${format}`);
  };

  const getAvailableAngkatan = () => {
    const angkatanSet = new Set();
    capstoneList.forEach(item => {
      if (item.angkatan) {
        angkatanSet.add(item.angkatan.toString());
      }
    });
    return ['Semua Angkatan', ...Array.from(angkatanSet).sort()];
  };

  const filteredData = capstoneList.filter((item) => {
    const matchSearch = 
      (item.nama?.toLowerCase() || item.nama_lengkap?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (item.nim?.includes(searchTerm) || false);
    const matchStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
    const matchAngkatan = filterAngkatan === 'Semua Angkatan' || item.angkatan?.toString() === filterAngkatan;
    return matchSearch && matchStatus && matchAngkatan;
  });

  if (loading && !isRefreshing) {
    return (
      <div className="space-y-6 animate-fade-in font-poppins">
        <div className="bg-white border border-[#d4eaf3] rounded-2xl p-6 shadow-sm">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Loader size={40} className="animate-spin text-[#06446B]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && capstoneList.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in font-poppins">
        <div className="bg-white border border-[#d4eaf3] rounded-2xl p-6 shadow-sm">
          <div className="text-red-600 flex items-center gap-2 p-5">
            <AlertTriangle size={24} />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={fetchCapstone} className="mt-4 px-6 py-2.5 bg-[#06446B] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#06446B]/20 hover:-translate-y-0.5 transition-all">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-poppins pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#06446B] flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06446B] to-[#5790AB] text-white flex items-center justify-center shadow-lg">
              <FolderOpen size={24} />
            </div>
            Monitoring Capstone
          </h1>
          <p className="text-[#6b8fa8] mt-2 font-medium">
            Pemantauan progres penyelesaian proyek capstone mahasiswa
            <span className="ml-2 text-xs bg-[#f1f8fb] px-2 py-0.5 rounded-full border border-[#d4eaf3]">
              {capstoneList.length} data
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-[#d4eaf3] text-[#06446B] rounded-xl text-sm font-bold shadow-sm hover:border-[#5790AB] hover:text-[#5790AB] transition-all flex items-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Memuat...' : 'Refresh'}
          </button>
          {(user?.role === 'admin' || user?.role === 'kaprodi') && (
            <>
              {['Excel', 'PDF'].map(format => (
                <button 
                  key={format}
                  onClick={() => handleExport(format)} 
                  className="px-4 py-2 bg-white border border-[#d4eaf3] text-[#06446B] rounded-xl text-sm font-bold shadow-sm hover:border-[#5790AB] hover:text-[#5790AB] transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <Download size={16} /> {format}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Card Utama */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#06446B]/5 border border-[#e8f6fa] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#5790AB]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ccddb]" />
            <input 
              type="text" 
              placeholder="Cari NIM atau Nama..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] font-semibold transition-all placeholder:text-[#9ccddb]" 
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] font-semibold min-w-[180px] cursor-pointer transition-all"
          >
            <option value="Semua Status">Semua Status</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={filterAngkatan} 
            onChange={(e) => setFilterAngkatan(e.target.value)} 
            className="px-4 py-3 bg-[#f8fbfd] border border-[#d4eaf3] rounded-xl text-sm focus:outline-none focus:border-[#5790AB] focus:ring-4 focus:ring-[#5790AB]/10 text-[#0f2740] font-semibold min-w-[160px] cursor-pointer transition-all"
          >
            {getAvailableAngkatan().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#d4eaf3] bg-white relative z-10 shadow-sm">
          <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
            <thead>
              <tr className="bg-gradient-to-r from-[#f1f8fb] to-[#f8fbfd] border-b border-[#d4eaf3]">
                <th className="p-4 text-[#06446B] text-[11px] font-extrabold uppercase tracking-wider">No</th>
                <th className="p-4 text-[#06446B] text-[11px] font-extrabold uppercase tracking-wider">NIM</th>
                <th className="p-4 text-[#06446B] text-[11px] font-extrabold uppercase tracking-wider">Mahasiswa</th>
                <th className="p-4 text-[#06446B] text-[11px] font-extrabold uppercase tracking-wider">Judul Capstone</th>
                <th className="p-4 text-[#06446B] text-[11px] font-extrabold uppercase tracking-wider">Dosen Pembimbing</th>
                <th className="p-4 text-[#06446B] text-[11px] font-extrabold uppercase tracking-wider">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr 
                    key={item.nim || index} 
                    className="border-b border-[#f1f8fb] hover:bg-[#f8fbfd] transition-colors cursor-pointer group" 
                    onClick={() => navigate(`/mahasiswa/${item.nim}`)}
                  >
                    <td className="p-4 text-[#6b8fa8] text-sm font-bold">{index + 1}</td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 bg-white border border-[#d4eaf3] rounded-lg font-bold text-[#06446B] text-xs shadow-sm group-hover:border-[#5790AB] transition-colors">
                        {item.nim}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#0f2740] text-sm">{item.nama || item.nama_lengkap || '-'}</div>
                      <div className="text-[11px] text-[#6b8fa8] font-semibold mt-0.5">
                        Angkatan {item.angkatan || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-[#6b8fa8] text-xs font-medium max-w-[280px] line-clamp-2 leading-relaxed" title={item.judul}>
                        {item.judul || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      {item.dosen_pembimbing ? (
                        <div className="inline-flex items-center gap-2 bg-[#f1f8fb] px-3 py-1.5 rounded-lg border border-[#e8f6fa]">
                          <div className="w-5 h-5 rounded-full bg-[#5790AB] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {item.dosen_pembimbing.charAt(0)}
                          </div>
                          <span className="text-[#0f2740] text-xs font-bold truncate max-w-[150px]">
                            {item.dosen_pembimbing}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#9ccddb] text-xs font-medium">Belum ditentukan</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 w-max border ${STATUS_CONFIG[item.status]?.bg || 'bg-gray-100'} ${STATUS_CONFIG[item.status]?.text || 'text-gray-600'} border-black/5 shadow-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[item.status]?.dot || 'bg-gray-400'} shadow-sm`}></span>
                        {item.status || 'Belum Mulai'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#d4eaf3] flex items-center justify-center text-[#9ccddb] group-hover:bg-[#06446B] group-hover:text-white group-hover:border-[#06446B] transition-all ml-auto shadow-sm">
                        <ChevronRight size={16} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f1f8fb] flex items-center justify-center mx-auto mb-4">
                      <FolderOpen size={24} className="text-[#9ccddb]" />
                    </div>
                    <p className="text-[#0f2740] font-bold text-lg">
                      {searchTerm || filterStatus !== 'Semua Status' || filterAngkatan !== 'Semua Angkatan' 
                        ? 'Pencarian Tidak Ditemukan' 
                        : 'Belum Ada Data Capstone'}
                    </p>
                    <p className="text-[#6b8fa8] font-medium mt-1">
                      {searchTerm || filterStatus !== 'Semua Status' || filterAngkatan !== 'Semua Angkatan'
                        ? 'Coba gunakan kata kunci atau filter lain.'
                        : 'Data capstone akan muncul setelah mahasiswa mendaftar.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs font-bold text-[#6b8fa8] bg-[#f8fbfd] px-4 py-2 rounded-xl border border-[#e8f6fa]">
            Menampilkan <span className="text-[#06446B]">{filteredData.length}</span> dari <span className="text-[#06446B]">{capstoneList.length}</span> data
          </div>
        </div>
      </div>
    </div>
  );
};

export default Capstone;