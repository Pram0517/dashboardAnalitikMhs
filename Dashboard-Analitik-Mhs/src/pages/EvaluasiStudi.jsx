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

      .es-root {
        animation: esPageReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      @keyframes esPageReveal {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .es-root .es-stagger > * {
        animation: esSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .es-root .es-stagger > *:nth-child(1) { animation-delay: 0.05s; }
      .es-root .es-stagger > *:nth-child(2) { animation-delay: 0.12s; }
      .es-root .es-stagger > *:nth-child(3) { animation-delay: 0.19s; }
      .es-root .es-stagger > *:nth-child(4) { animation-delay: 0.26s; }
      @keyframes esSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .es-stat-card {
        background: var(--col-surface);
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid var(--col-border);
        border-radius: 20px;
        box-shadow: var(--shadow-card);
        padding: 20px 22px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        transition: box-shadow 0.28s ease, transform 0.28s ease;
        cursor: default;
      }
      .es-stat-card:hover {
        box-shadow: var(--shadow-elevated);
        transform: translateY(-3px);
      }
      .es-stat-icon {
        width: 44px; height: 44px;
        border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .es-stat-val {
        font-family: 'Poppins', sans-serif;
        font-size: 26px;
        font-weight: 700;
        line-height: 1;
        color: var(--col-navy);
        letter-spacing: -0.5px;
      }
      .es-stat-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--col-blue);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-top: 3px;
      }
      .es-stat-trend {
        margin-top: 6px;
        font-size: 11.5px;
        font-weight: 500;
        color: #16a34a;
        display: flex;
        align-items: center;
        gap: 3px;
      }

      .es-main-card {
        background: var(--col-surface);
        backdrop-filter: blur(20px) saturate(200%);
        -webkit-backdrop-filter: blur(20px) saturate(200%);
        border: 1px solid var(--col-border);
        border-radius: 24px;
        box-shadow: var(--shadow-card);
        overflow: hidden;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .es-toolbar {
        padding: 18px 24px;
        border-bottom: 1px solid var(--col-border);
        background: rgba(255,255,255,0.6);
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
      }
      .es-search-wrap {
        position: relative;
        max-width: 300px;
        width: 100%;
      }
      .es-search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--col-blue);
        pointer-events: none;
      }
      .es-input {
        width: 100%;
        background: rgba(156,205,219,0.12);
        border: 1.5px solid var(--col-border-strong);
        border-radius: 12px;
        padding: 9px 12px 9px 38px;
        font-family: 'Poppins', sans-serif;
        font-size: 13.5px;
        color: var(--col-navy);
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      }
      .es-input::placeholder { color: var(--col-blue); opacity: 0.7; }
      .es-input:focus {
        border-color: var(--col-blue);
        background: rgba(255,255,255,0.9);
        box-shadow: 0 0 0 3px rgba(87,144,171,0.14);
      }
      .es-select {
        background: rgba(156,205,219,0.12);
        border: 1.5px solid var(--col-border-strong);
        border-radius: 12px;
        padding: 9px 36px 9px 12px;
        font-family: 'Poppins', sans-serif;
        font-size: 13.5px;
        color: var(--col-navy);
        outline: none;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235790AB' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
      }
      .es-select:focus {
        border-color: var(--col-blue);
        box-shadow: 0 0 0 3px rgba(87,144,171,0.14);
        background-color: rgba(255,255,255,0.9);
      }

      .es-btn-export {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 16px;
        border-radius: 11px;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: 1.5px solid var(--col-border-strong);
        background: rgba(255,255,255,0.7);
        color: var(--col-navy);
        transition: all 0.22s ease;
        letter-spacing: 0.1px;
      }
      .es-btn-export:hover {
        background: var(--col-navy);
        border-color: var(--col-navy);
        color: #fff;
        box-shadow: 0 4px 16px rgba(6,68,107,0.22);
        transform: translateY(-1px);
      }
      .es-btn-export:active { transform: scale(0.97); }

      .es-btn-view-mk {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        border: 1.5px solid var(--col-border-strong);
        background: rgba(156,205,219,0.15);
        color: var(--col-navy);
        transition: all 0.2s ease;
      }
      .es-btn-view-mk:hover {
        background: var(--col-navy);
        border-color: var(--col-navy);
        color: #fff;
      }

      .es-table-wrap {
        overflow-x: auto;
        flex: 1;
      }
      .es-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13.5px;
      }
      .es-table thead tr {
        background: linear-gradient(90deg, rgba(6,68,107,0.04) 0%, rgba(156,205,219,0.08) 100%);
      }
      .es-table thead th {
        padding: 14px 20px;
        font-family: 'Poppins', sans-serif;
        font-size: 13.5px;
        font-weight: 600;
        text-align: left;
        color: var(--col-blue);
        white-space: nowrap;
        border-bottom: 1px solid var(--col-border);
      }
      .es-table tbody tr {
        border-bottom: 1px solid rgba(87,144,171,0.09);
        transition: background 0.18s ease;
      }
      .es-table tbody tr:hover {
        background: rgba(156,205,219,0.12);
      }
      .es-table tbody tr:last-child { border-bottom: none; }
      .es-table td {
        padding: 14px 20px;
        color: var(--col-navy);
        vertical-align: middle;
      }
      .es-nim {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 12.5px;
        letter-spacing: 0.3px;
        color: var(--col-navy);
      }
      .es-name {
        font-weight: 500;
        color: #1e3a4f;
      }
      .es-center { text-align: center !important; }
      .es-right { text-align: right !important; }
      .es-ipk {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 14px;
      }

      .es-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.2px;
        white-space: nowrap;
      }
      .es-badge-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .es-badge-aktif { background: #dcfce7; color: #15803d; border: 1px solid rgba(22,163,74,0.2); }
      .es-badge-aktif .es-badge-dot { background: #16a34a; }
      .es-badge-nonaktif { background: #fee2e2; color: #b91c1c; border: 1px solid rgba(220,38,38,0.2); }
      .es-badge-nonaktif .es-badge-dot { background: #dc2626; }
      .es-badge-es1 { background: #fef9c3; color: #a16207; border: 1px solid rgba(234,179,8,0.2); }
      .es-badge-es1 .es-badge-dot { background: #eab308; }
      .es-badge-es2 { background: #fef9c3; color: #a16207; border: 1px solid rgba(234,179,8,0.2); }
      .es-badge-es2 .es-badge-dot { background: #eab308; }
      .es-badge-es3 { background: #fee2e2; color: #b91c1c; border: 1px solid rgba(220,38,38,0.2); }
      .es-badge-es3 .es-badge-dot { background: #dc2626; }
      .es-badge-gugur { background: #fef2f2; color: #991b1b; border: 1px solid rgba(220,38,38,0.3); }
      .es-badge-gugur .es-badge-dot { background: #991b1b; }
      .es-badge-belum { background: #f3f4f6; color: #4b5563; border: 1px solid rgba(156,163,175,0.2); }
      .es-badge-belum .es-badge-dot { background: #9ca3af; }
      .es-badge-berisiko { background: #fef9c3; color: #a16207; border: 1px solid rgba(234,179,8,0.2); }
      .es-badge-berisiko .es-badge-dot { background: #eab308; }
      .es-badge-evaluasi { background: #fee2e2; color: #b91c1c; border: 1px solid rgba(220,38,38,0.2); }
      .es-badge-evaluasi .es-badge-dot { background: #dc2626; }
      .es-badge-lulus { background: #dcfce7; color: #15803d; border: 1px solid rgba(22,163,74,0.2); }
      .es-badge-lulus .es-badge-dot { background: #16a34a; }

      .es-detail-link {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 12px;
        border-radius: 9px;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--col-blue);
        background: rgba(87,144,171,0.08);
        border: 1px solid var(--col-border-strong);
        text-decoration: none;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .es-detail-link:hover {
        background: var(--col-navy);
        color: #fff;
        border-color: var(--col-navy);
        box-shadow: 0 4px 12px rgba(6,68,107,0.18);
        transform: translateY(-1px);
      }
      .es-detail-link svg { transition: transform 0.2s; }
      .es-detail-link:hover svg { transform: translate(2px, -2px); }

      .es-empty {
        padding: 64px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: var(--col-blue);
      }
      .es-empty-icon {
        width: 72px; height: 72px;
        border-radius: 50%;
        background: rgba(156,205,219,0.15);
        border: 2px dashed rgba(87,144,171,0.3);
        display: flex; align-items: center; justify-content: center;
        color: rgba(87,144,171,0.6);
        margin-bottom: 4px;
      }

      .es-pagination {
        padding: 14px 24px;
        border-top: 1px solid var(--col-border);
        background: rgba(255,255,255,0.5);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }
      .es-page-info {
        font-size: 12.5px;
        color: var(--col-blue);
        font-weight: 500;
      }
      .es-page-info strong {
        color: var(--col-navy);
        font-weight: 700;
      }
      .es-page-btns {
        display: flex;
        gap: 5px;
        align-items: center;
      }
      .es-page-btn {
        width: 32px; height: 32px;
        border-radius: 9px;
        border: 1.5px solid var(--col-border-strong);
        background: rgba(255,255,255,0.7);
        color: var(--col-navy);
        font-size: 12px;
        font-weight: 600;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: all 0.18s;
        font-family: 'Poppins', sans-serif;
      }
      .es-page-btn:hover:not(:disabled) {
        background: var(--col-blue);
        border-color: var(--col-blue);
        color: #fff;
      }
      .es-page-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .es-page-btn.active {
        background: var(--col-navy);
        border-color: var(--col-navy);
        color: #fff;
        box-shadow: 0 2px 10px rgba(6,68,107,0.25);
      }

      .es-page-title {
        font-family: 'Poppins', sans-serif;
        font-size: 26px;
        font-weight: 800;
        color: var(--col-navy);
        letter-spacing: -0.5px;
        line-height: 1.1;
      }
      .es-page-sub {
        font-size: 13.5px;
        color: var(--col-blue);
        margin-top: 4px;
        font-weight: 400;
      }
      .es-title-pill {
        display: inline-block;
        background: linear-gradient(135deg, rgba(156,205,219,0.3) 0%, rgba(87,144,171,0.15) 100%);
        border: 1px solid rgba(87,144,171,0.25);
        border-radius: 6px;
        padding: 2px 10px;
        font-family: 'Poppins', sans-serif;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: var(--col-blue);
        margin-bottom: 6px;
      }

      .es-table tbody tr {
        animation: esRowIn 0.35s ease both;
      }
      @keyframes esRowIn {
        from { opacity: 0; transform: translateX(-6px); }
        to   { opacity: 1; transform: translateX(0); }
      }

      .es-header-line {
        width: 40px;
        height: 3px;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--col-blue), var(--col-teal));
        margin-top: 8px;
      }

      .es-ipk-high { color: #15803d; }
      .es-ipk-mid  { color: var(--col-navy); }
      .es-ipk-low  { color: #b91c1c; }

      .es-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: esFadeIn 0.25s ease;
      }
      @keyframes esFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .es-modal {
        background: white;
        border-radius: 24px;
        max-width: 900px;
        width: 100%;
        max-height: 85vh;
        overflow: hidden;
        box-shadow: 0 24px 64px rgba(0,0,0,0.2);
        animation: esModalSlide 0.3s ease;
      }
      @keyframes esModalSlide {
        from { transform: scale(0.95) translateY(20px); opacity: 0; }
        to { transform: scale(1) translateY(0); opacity: 1; }
      }
      .es-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid var(--col-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--col-surface);
      }
      .es-modal-header h2 {
        font-family: 'Poppins', sans-serif;
        font-size: 18px;
        font-weight: 700;
        color: var(--col-navy);
      }
      .es-modal-header .sub {
        font-size: 13px;
        color: var(--col-blue);
        font-weight: 500;
      }
      .es-modal-close {
        width: 36px; height: 36px;
        border-radius: 50%;
        border: none;
        background: rgba(87,144,171,0.1);
        color: var(--col-navy);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s;
      }
      .es-modal-close:hover {
        background: var(--col-navy);
        color: white;
      }
      .es-modal-body {
        padding: 24px;
        overflow-y: auto;
        max-height: calc(85vh - 140px);
      }
      .es-modal-body table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .es-modal-body thead th {
        padding: 10px 14px;
        text-align: left;
        font-weight: 600;
        color: var(--col-blue);
        border-bottom: 2px solid var(--col-border);
        background: rgba(156,205,219,0.06);
      }
      .es-modal-body tbody td {
        padding: 10px 14px;
        border-bottom: 1px solid rgba(87,144,171,0.08);
        color: var(--col-navy);
      }
      .es-modal-body tbody tr:hover {
        background: rgba(156,205,219,0.08);
      }
      .es-modal-body .mk-kode {
        font-weight: 600;
        color: var(--col-navy);
      }
      .es-modal-body .mk-sks {
        text-align: center;
        font-weight: 600;
      }
      .es-modal-body .mk-semester {
        text-align: center;
      }
      .es-modal-body .mk-nilai {
        text-align: center;
        font-weight: 700;
      }
      .es-nilai-lulus { color: #15803d; }
      .es-nilai-tidak { color: #b91c1c; }
      .es-nilai-belum { color: #9ca3af; }

      .es-modal-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
        padding: 16px;
        background: rgba(156,205,219,0.08);
        border-radius: 12px;
      }
      .es-modal-summary-item {
        text-align: center;
      }
      .es-modal-summary-item .label {
        font-size: 11px;
        font-weight: 600;
        color: var(--col-blue);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .es-modal-summary-item .value {
        font-size: 20px;
        font-weight: 700;
        color: var(--col-navy);
      }

      .es-filter-semester {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .es-filter-semester button {
        padding: 4px 14px;
        border-radius: 20px;
        border: 1.5px solid var(--col-border-strong);
        background: transparent;
        color: var(--col-navy);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Poppins', sans-serif;
      }
      .es-filter-semester button:hover {
        background: rgba(156,205,219,0.15);
      }
      .es-filter-semester button.active {
        background: var(--col-navy);
        border-color: var(--col-navy);
        color: white;
      }

      .status-badge-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
      }
      .status-badge-container .es-badge {
        font-size: 11px;
        padding: 3px 10px;
      }
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
        // Fallback: hitung dari data yang ada
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
  try {
    setMkLoading(true);
    setSelectedMahasiswa({ nim, name: mahasiswaName });
    
    // ✅ PAKAI getMataKuliahMahasiswa (BUKAN getKhsByNim)
    const response = await evaluasiService.getMataKuliahMahasiswa(nim, semester);
    console.log('📚 Mata kuliah response:', response);
    
    // Ambil data dari response
    const data = response.data || [];
    setMataKuliahList(data);
    setMataKuliahListOriginal(data);

    // Hitung summary
    let totalSks = 0, lulus = 0, tidakLulus = 0, belum = 0;
    data.forEach(mk => {
      totalSks += mk.sks || 0;
      if (mk.status === 'Lulus' || mk.nilai === 'A' || mk.nilai === 'B' || mk.nilai === 'C') {
        lulus++;
      } else if (mk.status === 'Tidak Lulus' || mk.nilai === 'D' || mk.nilai === 'E') {
        tidakLulus++;
      } else {
        belum++;
      }
    });
    
    setMkSummary({ 
      total: data.length, 
      totalSks, 
      lulus, 
      tidakLulus,
      belum 
    });
    
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
      const nama = (item.nama || item.nama_lengkap || '').toLowerCase();
      const nim = (item.nim || '').toString().toLowerCase();
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

          {/* Toolbar */}
          <div className="es-toolbar">
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', flex:1, alignItems:'center' }}>
              
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

              {/* Filter controls */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Filter size={15} style={{ color:'var(--col-blue)', flexShrink:0 }} />
                <select
                  className="es-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  className="es-select"
                  value={filterAngkatan}
                  onChange={(e) => setFilterAngkatan(e.target.value)}
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

          {/* Table */}
          <div className="es-table-wrap">
            <table className="es-table">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama Mahasiswa</th>
                  <th className="es-center">Angkatan</th>
                  <th className="es-center">IPK</th>
                  <th className="es-center">SKS</th>
                  <th>Status</th>
                  <th className="es-center">Aksi</th>
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
                        <td><span className="es-nim">{mhs.nim}</span></td>
                        <td><span className="es-name">{mhs.nama || mhs.nama_lengkap}</span></td>
                        <td className="es-center" style={{ fontSize:'13px', fontWeight:600 }}>{mhs.angkatan || '-'}</td>
                        <td className="es-center">
                          <span className={getIpkClass(mhs.ipk)}>
                            {formatIpk(mhs.ipk)}
                          </span>
                        </td>
                        <td className="es-center" style={{ fontWeight:500 }}>{mhs.total_sks || '-'}</td>
                        <td>
                          {getEvaluasiBadge(statusData.status, statusData.esStatus)}
                        </td>
                        <td className="es-center">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '100%' }}>
                            <button
                              onClick={() => fetchMataKuliah(mhs.nim, mhs.nama || mhs.nama_lengkap)}
                              className="es-btn-view-mk"
                              title="Lihat Mata Kuliah"
                            >
                              <BookOpen size={13} />
                              MK
                            </button>
                            <Link to={`/mahasiswa/${mhs.nim}`} className="es-detail-link">
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
                                    ? 'es-badge-lolos' 
                                    : mk.status === 'Tidak Lulus' 
                                    ? 'es-badge-do' 
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