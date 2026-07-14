// src/pages/EvaluasiStudi.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Filter, ChevronLeft, ChevronRight, 
  Users, TrendingUp, AlertTriangle, GraduationCap, 
  ArrowUpRight, Eye, Loader, BookOpen, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { evaluasiService } from '../services/evaluasiService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

/* ── Inject global styles once ── */
const STYLE_ID = 'evaluasi-studi-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

    .es-root {
      font-family: 'Poppins', sans-serif;
      --col-navy: #06446B;
      --col-blue: #5790AB;
      --col-teal: #9CCDDB;
      --col-white: #FFFFFF;
      --col-surface: rgba(255,255,255,0.72);
      --col-glass: rgba(255,255,255,0.48);
      --col-border: rgba(87,144,171,0.18);
      --col-border-strong: rgba(87,144,171,0.32);
      --shadow-card: 0 4px 24px rgba(6,68,107,0.08), 0 1px 4px rgba(6,68,107,0.06);
      --shadow-elevated: 0 12px 48px rgba(6,68,107,0.14), 0 4px 16px rgba(6,68,107,0.08);
      --shadow-glow: 0 0 32px rgba(156,205,219,0.28);
      min-height: 100%;
    }

    /* ... semua style lainnya tetap sama ... */
  `;
  document.head.appendChild(style);
}

const EvaluasiStudi = () => {
  const { user } = useAuth();
  
  // ====== STATE UNTUK FILTER DAN SEARCH ======
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterAngkatan, setFilterAngkatan] = useState('Semua Angkatan');
  
  // ====== STATE UNTUK DATA ======
  const [evaluasiList, setEvaluasiList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // ====== STATE UNTUK MATA KULIAH ======
  const [showMataKuliahModal, setShowMataKuliahModal] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [mataKuliahListOriginal, setMataKuliahListOriginal] = useState([]);
  const [mkLoading, setMkLoading] = useState(false);
  const [mkFilterSemester, setMkFilterSemester] = useState('all');
  const [mkSummary, setMkSummary] = useState({
    total: 0,
    totalSks: 0,
    lulus: 0,
    tidakLulus: 0
  });

  // ====== STATE UNTUK DATA DASHBOARD ======
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // ====== DEBOUNCE EFFECT ======
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchTerm]);

  // ====== FETCH DATA ======
  useEffect(() => {
    fetchEvaluasi();
    fetchDashboardStats();
  }, [pagination.page, filterStatus, filterAngkatan]);

  // ====== HELPER FUNCTION UNTUK FORMAT IPK ======
  const formatIpk = (ipk) => {
    if (ipk === null || ipk === undefined || ipk === '') return '-';
    const value = parseFloat(ipk);
    if (isNaN(value) || value === 0) return '-';
    return value.toFixed(2);
  };

  // ====== HELPER FUNCTION UNTUK IPK CLASS ======
  const getIpkClass = (ipk) => {
    const value = parseFloat(ipk);
    if (isNaN(value) || value === 0) return 'es-ipk es-ipk-mid';
    if (value >= 3.5) return 'es-ipk es-ipk-high';
    if (value >= 2.5) return 'es-ipk es-ipk-mid';
    return 'es-ipk es-ipk-low';
  };

  // ====== FUNGSI UNTUK MENENTUKAN STATUS MAHASISWA ======
  const getStatusMahasiswa = (status, semester, ipk, sksMinC) => {
    if (status === 'non-aktif' || status === 'Non-Aktif') {
      return { 
        status: 'NON-AKTIF', 
        badgeClass: 'es-badge-nonaktif',
        esStatus: null
      };
    }

    if (semester >= 4) {
      if (ipk >= 2.0 && sksMinC >= 30) {
        return { 
          status: 'AKTIF', 
          badgeClass: 'es-badge-aktif',
          esStatus: 'Lolos ES-1'
        };
      } else if (semester < 8) {
        return { 
          status: 'ES-1', 
          badgeClass: 'es-badge-es1',
          esStatus: 'Tidak Lolos ES-1'
        };
      }

      if (semester >= 8 && semester < 12) {
        if (ipk >= 2.0 && sksMinC >= 80) {
          return { 
            status: 'AKTIF', 
            badgeClass: 'es-badge-aktif',
            esStatus: 'Lolos ES-2'
          };
        } else {
          return { 
            status: 'ES-2', 
            badgeClass: 'es-badge-es2',
            esStatus: 'Tidak Lolos ES-2'
          };
        }
      }

      if (semester >= 12) {
        if (ipk >= 2.0 && sksMinC >= 140) {
          return { 
            status: 'AKTIF', 
            badgeClass: 'es-badge-aktif',
            esStatus: 'Lolos ES-3'
          };
        } else if (semester >= 14) {
          return { 
            status: 'GUGUR STUDI', 
            badgeClass: 'es-badge-gugur',
            esStatus: 'Putus Studi (ES-3)'
          };
        } else {
          return { 
            status: 'ES-3', 
            badgeClass: 'es-badge-es3',
            esStatus: 'Tidak Lolos ES-3'
          };
        }
      }
    }

    return { 
      status: 'AKTIF', 
      badgeClass: 'es-badge-aktif',
      esStatus: null
    };
  };

  // ====== BADGE RENDERER ======
  const getEvaluasiBadge = (status, esStatus) => {
    let badgeClass = 'es-badge-belum';
    let label = status || 'Belum Evaluasi';

    if (status === 'AKTIF') {
      badgeClass = 'es-badge-aktif';
    } else if (status === 'NON-AKTIF') {
      badgeClass = 'es-badge-nonaktif';
    } else if (status === 'ES-1') {
      badgeClass = 'es-badge-es1';
    } else if (status === 'ES-2') {
      badgeClass = 'es-badge-es2';
    } else if (status === 'ES-3') {
      badgeClass = 'es-badge-es3';
    } else if (status === 'GUGUR STUDI') {
      badgeClass = 'es-badge-gugur';
    }

    return (
      <div className="status-badge-container">
        <span className={`es-badge ${badgeClass}`}>
          <span className="es-badge-dot" />
          {label}
        </span>
        {esStatus && (
          <span className="es-badge es-badge-belum" style={{ fontSize: '10px', padding: '2px 8px' }}>
            {esStatus}
          </span>
        )}
      </div>
    );
  };

  // ====== FETCH DATA EVALUASI ======
  const fetchEvaluasi = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (user?.role === 'mahasiswa' && user?.nim) {
        response = await evaluasiService.getByNimWithDetails(user.nim);
        setEvaluasiList(response.data ? [response.data] : []);
        setPagination({
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        });
      } else {
        response = await evaluasiService.getAllWithDetails(
          pagination.page,
          pagination.limit,
          debouncedSearchTerm,
          filterStatus
        );
        setEvaluasiList(response.data || []);
        setPagination({
          page: pagination.page,
          limit: pagination.limit,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 0
        });
      }

      if (user?.role === 'admin' || user?.role === 'kaprodi') {
        try {
          const summaryRes = await evaluasiService.getSummary();
          setSummary(summaryRes.data);
        } catch (summaryErr) {
          console.warn('Summary not available:', summaryErr);
        }
      }
    } catch (err) {
      console.error('Error fetching evaluasi:', err);
      setError(err.message || 'Gagal mengambil data evaluasi');
    } finally {
      setLoading(false);
    }
  };

  // ====== FUNGSI UNTUK MENGAMBIL DATA DASHBOARD ======
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      
      const result = await evaluasiService.getSummary();
      
      if (result && result.data) {
        setDashboardStats(result.data);
        console.log('✅ Dashboard stats loaded:', result.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (evaluasiList.length > 0) {
        const stats = calculateStatsFromList(evaluasiList);
        setDashboardStats(stats);
      }
    } finally {
      setLoadingStats(false);
    }
  };

  // ====== HELPER: HITUNG STATS DARI LIST ======
  const calculateStatsFromList = (list) => {
    let totalMahasiswa = list.length;
    let totalAktif = 0;
    let berisiko = 0;
    let evaluasiCount = 0;
    let lulus = 0;

    list.forEach(m => {
      const status = m.status?.toLowerCase() || '';
      if (status === 'aktif' || status === 'active') totalAktif++;
      if (status === 'berisiko' || status === 'risk') berisiko++;
      if (status === 'evaluasi' || status === 'evaluation') evaluasiCount++;
      if (status === 'lulus' || status === 'graduated') lulus++;
    });

    return {
      totalMahasiswa,
      totalAktif,
      berisiko,
      evaluasi: evaluasiCount,
      lulus
    };
  };

  // ====== FUNGSI UNTUK MENGAMBIL MATA KULIAH ======
  const fetchMataKuliah = async (nim, mahasiswaName, semester = null) => {
    if (!nim || nim === 'undefined' || nim === 'null') {
      toast.error('NIM tidak valid');
      console.error('❌ Invalid NIM:', nim);
      return;
    }

    try {
      setMkLoading(true);
      setSelectedMahasiswa({ nim, name: mahasiswaName });
      
      console.log('📤 Fetching mata kuliah for NIM:', nim);
      
      const response = await evaluasiService.getMataKuliahMahasiswa(nim, semester);
      console.log('📚 Mata kuliah response:', response);
      
      const data = response.data || [];
      setMataKuliahList(data);
      setMataKuliahListOriginal(data);

      let totalSks = 0, lulus = 0, tidakLulus = 0;
      data.forEach(mk => {
        totalSks += mk.sks || 0;
        if (mk.status === 'Lulus') lulus++;
        else if (mk.status === 'Tidak Lulus') tidakLulus++;
      });
      
      setMkSummary({ total: data.length, totalSks, lulus, tidakLulus });
      setShowMataKuliahModal(true);
    } catch (err) {
      console.error('❌ Error fetching mata kuliah:', err);
      toast.error(err.message || 'Gagal mengambil data mata kuliah');
    } finally {
      setMkLoading(false);
    }
  };

  // ====== FILTER MATA KULIAH PER SEMESTER ======
  const filteredMataKuliah = mkFilterSemester === 'all'
    ? mataKuliahList
    : mataKuliahList.filter(mk => mk.semester === parseInt(mkFilterSemester));

  // ====== HANDLE EXPORT ======
  const handleExport = async (format) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('format', format.toLowerCase());
      
      if (filterStatus && filterStatus !== 'Semua') {
        params.append('status', filterStatus);
      }
      if (filterAngkatan && filterAngkatan !== 'Semua Angkatan') {
        params.append('angkatan', filterAngkatan);
      }

      const response = await fetch(`https://dashboardanalitikmhs-production.up.railway.app/api/export/mahasiswa?${params.toString()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal mengexport data');
      }

      const data = await response.json();
      
      const downloadResponse = await fetch(`https://dashboardanalitikmhs-production.up.railway.app/api/export/download/${data.data.filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (downloadResponse.ok) {
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Data berhasil diexport ke ${format.toUpperCase()}`);
      } else {
        const error = await downloadResponse.json();
        toast.error(error.message || 'Gagal mendownload file');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Gagal mengexport data');
    } finally {
      setLoading(false);
    }
  };

  // ====== DATA YANG DITAMPILKAN ======
  const filteredData = evaluasiList.filter((item) => {
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    const matchAngkatan = filterAngkatan === 'Semua Angkatan' || item.angkatan?.toString() === filterAngkatan;

    const keyword = debouncedSearchTerm.trim().toLowerCase();
    const nama = (item.nama_lengkap || item.nama || '').toLowerCase();
    const nim = (item.npm || item.nim || '').toString().toLowerCase();
    const matchSearch = keyword === '' || nama.includes(keyword) || nim.includes(keyword);

    return matchStatus && matchAngkatan && matchSearch;
  });

  // ====== STAT CARDS ======
  const totalMahasiswa = dashboardStats?.totalMahasiswa || evaluasiList.length || 0;
  const totalAktif = dashboardStats?.totalAktif || 0;

  let berisiko = 0;
  let evaluasiCount = 0;
  let lulus = 0;

  for (let i = 0; i < evaluasiList.length; i++) {
    const m = evaluasiList[i];
    if (m.status === 'Berisiko' || m.status === 'berisiko') berisiko++;
    if (m.status === 'Evaluasi' || m.status === 'evaluasi') evaluasiCount++;
    if (m.status === 'Lulus' || m.status === 'lulus') lulus++;
  }

  const stats = [
    {
      icon: <Users size={20} />,
      bg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
      color: '#0369a1',
      val: totalMahasiswa,
      label: 'Total Mahasiswa',
      trend: null,
    },
    {
      icon: <TrendingUp size={20} />,
      bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
      color: '#15803d',
      val: totalAktif,
      label: 'Mahasiswa Aktif',
      trend: totalMahasiswa > 0 ? `${Math.round((totalAktif/totalMahasiswa)*100)}% dari total` : null,
    },
    {
      icon: <AlertTriangle size={20} />,
      bg: 'linear-gradient(135deg,#fee2e2,#fecaca)',
      color: '#b91c1c',
      val: berisiko + evaluasiCount,
      label: 'Perlu Evaluasi',
      trend: `${berisiko} Berisiko · ${evaluasiCount} Evaluasi`,
    },
    {
      icon: <GraduationCap size={20} />,
      bg: 'linear-gradient(135deg,#e0f2fe,#cffafe)',
      color: '#0e7490',
      val: lulus,
      label: 'Lulus',
      trend: totalMahasiswa > 0 ? `${Math.round((lulus/totalMahasiswa)*100)}% tingkat kelulusan` : null,
    },
  ];

  // ====== GET UNIQUE VALUES FOR FILTERS ======
  const statusOptions = ['Semua', ...new Set(evaluasiList.map(m => m.status).filter(Boolean))];
  
  const angkatanOptions = ['Semua Angkatan', ...new Set(evaluasiList.map(m => m.angkatan).filter(Boolean))].sort((a, b) => {
    if (a === 'Semua Angkatan') return -1;
    if (b === 'Semua Angkatan') return 1;
    return parseInt(a) - parseInt(b);
  });

  // ====== LOADING STATE ======
  if (loading) {
    return (
      <div className="es-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader size={40} className="animate-spin" style={{ color: '#06446B' }} />
      </div>
    );
  }

  // ====== ERROR STATE ======
  if (error) {
    return (
      <div className="es-root">
        <div className="es-main-card" style={{ padding: '40px', textAlign: 'center' }}>
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-600">Gagal Memuat Data</h3>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={fetchEvaluasi}
            className="mt-4 px-6 py-2 bg-accent2 text-white rounded-lg hover:bg-accent1"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ====== MAIN RENDER ======
  return (
    <div className="es-root" style={{ display:'flex', flexDirection:'column', gap:'22px', paddingBottom:'8px' }}>

      {/* Page header */}
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-end', gap:'16px' }}>
        <div>
          <div className="es-title-pill">Akademik</div>
          <h1 className="es-page-title">Evaluasi Studi Mahasiswa</h1>
          <p className="es-page-sub">Pantau dan analisis status akademik seluruh mahasiswa program studi Sistem Informasi</p>
          <div className="es-header-line" />
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => handleExport('Excel')} className="es-btn-export">
            <Download size={14} /> Excel
          </button>
          <button onClick={() => handleExport('PDF')} className="es-btn-export">
            <Download size={14} /> PDF
          </button>
          <button onClick={() => handleExport('CSV')} className="es-btn-export">
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="es-stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'14px' }}>
        {stats.map((s, i) => (
          <div key={i} className="es-stat-card">
            <div className="es-stat-icon" style={{ background: s.bg }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div style={{ minWidth:0 }}>
              <div className="es-stat-val">{s.val}</div>
              <div className="es-stat-label">{s.label}</div>
              {s.trend && (
                <div className="es-stat-trend">
                  <ArrowUpRight size={11} />
                  <span style={{ color: s.color === '#b91c1c' ? '#b91c1c' : undefined }}>{s.trend}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main table card */}
      <div className="es-main-card">

        {/* Toolbar - ✅ DIPERBAIKI: Filter dipisah per kolom */}
        <div className="es-toolbar">
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', flex:1, alignItems:'center' }}>
            
            {/* Search box */}
            <div className="es-search-wrap">
              <Search size={15} className="es-search-icon" />
              <input
                type="text"
                className="es-input"
                placeholder="Cari NIM atau nama mahasiswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* ✅ FILTER STATUS - label terpisah */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#06446B' }}>Status:</span>
              <select
                className="es-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ minWidth: '130px' }}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* ✅ FILTER ANGKATAN - label terpisah */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#06446B' }}>Angkatan:</span>
              <select
                className="es-select"
                value={filterAngkatan}
                onChange={(e) => setFilterAngkatan(e.target.value)}
                style={{ minWidth: '130px' }}
              >
                {angkatanOptions.map(angkatan => (
                  <option key={angkatan} value={angkatan}>{angkatan}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <span style={{ fontSize:'12px', color:'var(--col-blue)', fontWeight:500, whiteSpace:'nowrap' }}>
            {isSearching ? 'Mencari...' : `${filteredData.length} hasil ditemukan`}
          </span>
        </div>

        {/* Table - ✅ DIPERBAIKI: Lebar kolom disesuaikan */}
        <div className="es-table-wrap">
          <table className="es-table" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '15%', minWidth: '120px' }}>NIM</th>
                <th style={{ width: '25%', minWidth: '180px' }}>Nama Mahasiswa</th>
                <th style={{ width: '10%', minWidth: '80px', textAlign: 'center' }}>Angkatan</th>
                <th style={{ width: '10%', minWidth: '70px', textAlign: 'center' }}>IPK</th>
                <th style={{ width: '10%', minWidth: '60px', textAlign: 'center' }}>SKS</th>
                <th style={{ width: '18%', minWidth: '130px' }}>Status</th>
                <th style={{ width: '12%', minWidth: '120px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((mhs, index) => {
                  const ipk = parseFloat(mhs.ipk) || 0;
                  const semester = parseInt(mhs.semester) || 1;
                  const totalSks = parseInt(mhs.total_sks) || 0;
                  
                  let sksMinC = 0;
                  if (mhs.nilai && Array.isArray(mhs.nilai)) {
                    sksMinC = mhs.nilai
                      .filter(n => n.bobot >= 2.00)
                      .reduce((sum, n) => sum + (n.sks || 0), 0);
                  }
                  
                  if (sksMinC === 0 && totalSks > 0) {
                    sksMinC = Math.round(totalSks * 0.7);
                  }
                  
                  const statusData = getStatusMahasiswa(mhs.status, semester, ipk, sksMinC);
                  
                  return (
                    <tr key={mhs.id || index}>
                      <td style={{ wordBreak: 'break-word' }}>
                        <span className="es-nim">{mhs.npm || mhs.nim || '-'}</span>
                      </td>
                      <td style={{ wordBreak: 'break-word' }}>
                        <span className="es-name">{mhs.nama_lengkap || mhs.nama || '-'}</span>
                      </td>
                      <td className="es-center" style={{ fontSize:'13px', fontWeight:600 }}>
                        {mhs.angkatan || '-'}
                      </td>
                      <td className="es-center">
                        <span className={getIpkClass(mhs.ipk)}>
                          {formatIpk(mhs.ipk)}
                        </span>
                      </td>
                      <td className="es-center" style={{ fontWeight:500 }}>
                        {mhs.total_sks || '-'}
                      </td>
                      <td>
                        {getEvaluasiBadge(statusData.status, statusData.esStatus)}
                      </td>
                      <td className="es-center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '100%' }}>
                          <button
                            onClick={() => {
                              const nim = mhs.npm || mhs.nim;
                              const nama = mhs.nama_lengkap || mhs.nama;
                              if (nim) {
                                fetchMataKuliah(nim, nama);
                              } else {
                                toast.error('NIM tidak ditemukan');
                              }
                            }}
                            className="es-btn-view-mk"
                            title="Lihat Mata Kuliah"
                          >
                            <BookOpen size={13} />
                            MK
                          </button>
                          <Link to={`/mahasiswa/${mhs.npm || mhs.nim}`} className="es-detail-link">
                            <Eye size={13} />
                            Detail
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="es-empty">
                      <div className="es-empty-icon">
                        <Search size={28} />
                      </div>
                      <p style={{ fontSize:'15px', fontWeight:600, color:'var(--col-navy)', margin:0 }}>
                        Tidak ada data ditemukan
                      </p>
                      <p style={{ fontSize:'13px', margin:0, opacity:0.7 }}>
                        {debouncedSearchTerm ? 'Tidak ada mahasiswa yang sesuai dengan pencarian.' : 'Coba ubah filter status atau angkatan.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="es-pagination">
          <span className="es-page-info">
            Menampilkan <strong>{filteredData.length}</strong> dari <strong>{pagination.total || evaluasiList.length}</strong> mahasiswa
          </span>
          <div className="es-page-btns">
            <button 
              className="es-page-btn" 
              disabled={pagination.page <= 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              <ChevronLeft size={14} />
            </button>
            <button className="es-page-btn active">{pagination.page}</button>
            <button 
              className="es-page-btn" 
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL MATA KULIAH ── */}
      {showMataKuliahModal && (
        <div className="es-modal-overlay" onClick={() => setShowMataKuliahModal(false)}>
          <div className="es-modal" onClick={(e) => e.stopPropagation()}>
            <div className="es-modal-header">
              <div>
                <h2>📚 Mata Kuliah</h2>
                <div className="sub">
                  {selectedMahasiswa?.name} — NIM: {selectedMahasiswa?.nim}
                </div>
              </div>
              <button className="es-modal-close" onClick={() => setShowMataKuliahModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="es-modal-body">
              {mkLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader size={32} className="animate-spin" style={{ color: '#06446B' }} />
                </div>
              ) : (
                <>
                  <div className="es-modal-summary">
                    <div className="es-modal-summary-item">
                      <div className="label">Total MK</div>
                      <div className="value">{mkSummary.total}</div>
                    </div>
                    <div className="es-modal-summary-item">
                      <div className="label">Total SKS</div>
                      <div className="value">{mkSummary.totalSks}</div>
                    </div>
                    <div className="es-modal-summary-item">
                      <div className="label">Lulus</div>
                      <div className="value" style={{ color: '#15803d' }}>{mkSummary.lulus}</div>
                    </div>
                    <div className="es-modal-summary-item">
                      <div className="label">Tidak Lulus</div>
                      <div className="value" style={{ color: '#b91c1c' }}>{mkSummary.tidakLulus}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4 flex-wrap" style={{ padding: '0 4px' }}>
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-accent1" />
                      <span className="text-sm font-semibold" style={{ color: '#06446B' }}>Filter Semester:</span>
                    </div>
                    <div className="relative">
                      <select
                        value={mkFilterSemester}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMkFilterSemester(val);
                          if (val === 'all') {
                            setMataKuliahList(mataKuliahListOriginal || []);
                          } else {
                            const filtered = (mataKuliahListOriginal || []).filter(mk => mk.semester === parseInt(val));
                            setMataKuliahList(filtered);
                          }
                        }}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-transparent cursor-pointer hover:border-accent1 transition-colors"
                        style={{ color: '#06446B', minWidth: '150px' }}
                      >
                        <option value="all">Semua Semester</option>
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                        <option value="7">Semester 7</option>
                        <option value="8">Semester 8</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                  </div>

                  {filteredMataKuliah.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                      <p>Belum ada data mata kuliah</p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Kode</th>
                          <th>Nama Mata Kuliah</th>
                          <th style={{ textAlign: 'center' }}>SKS</th>
                          <th style={{ textAlign: 'center' }}>Semester</th>
                          <th style={{ textAlign: 'center' }}>Nilai</th>
                          <th style={{ textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMataKuliah.map((mk, idx) => (
                          <tr key={idx}>
                            <td className="mk-kode">{mk.kode_mk}</td>
                            <td>{mk.nama_mata_kuliah}</td>
                            <td className="mk-sks">{mk.sks}</td>
                            <td className="mk-semester">{mk.semester}</td>
                            <td className={`mk-nilai ${
                              mk.nilai === 'A' || mk.nilai === 'B' || mk.nilai === 'C' 
                                ? 'es-nilai-lulus' 
                                : mk.nilai === 'D' || mk.nilai === 'E' 
                                ? 'es-nilai-tidak' 
                                : 'es-nilai-belum'
                            }`}>
                              {mk.nilai || '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`es-badge ${
                                mk.status === 'Lulus' 
                                  ? 'es-badge-aktif' 
                                  : mk.status === 'Tidak Lulus' 
                                  ? 'es-badge-es3' 
                                  : 'es-badge-belum'
                              }`}>
                                <span className="es-badge-dot" />
                                {mk.status || 'Belum Dinilai'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluasiStudi;