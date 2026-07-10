// FRONTEND/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Users, GraduationCap, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GpaTrendChart from '../components/charts/GpaTrendChart';
import GradStatusChart from '../components/charts/GradStatusChart';
import ProblematicCoursesChart from '../components/charts/ProblematicCoursesChart';

// Design Tokens
const T = {
  navy:   '#06446B',
  mid:    '#5790AB',
  sky:    '#9CCDDB',
  skylt:  '#D8EFF5',
  white:  '#FFFFFF',
  ink:    '#0D1F2D',
  muted:  '#5E7B8A',
  border: 'rgba(87,144,171,0.15)',
  glass:  'rgba(255,255,255,0.72)',
  glassDark: 'rgba(6,68,107,0.06)',
};

const heroGradient  = `linear-gradient(135deg, ${T.navy} 0%, ${T.mid} 55%, ${T.sky} 100%)`;
const meshBg = `radial-gradient(ellipse at 20% 20%, rgba(156,205,219,0.22) 0%, transparent 55%),
               radial-gradient(ellipse at 80% 80%, rgba(87,144,171,0.14) 0%, transparent 55%),
               radial-gradient(ellipse at 60% 10%, rgba(6,68,107,0.06) 0%, transparent 45%),
               #F4F8FB`;

// ============ STATS CARD ============
const StatsCard = ({ title, value, icon: Icon, trend, trendLabel, accent, delay = 0, loading = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const isPositive = trend > 0;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        background: T.glass,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${T.border}`,
        borderRadius: '20px',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(6,68,107,0.08), 0 1px 2px rgba(6,68,107,0.06)',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        minHeight: '120px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(6,68,107,0.14), 0 2px 4px rgba(6,68,107,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(6,68,107,0.08), 0 1px 2px rgba(6,68,107,0.06)';
      }}
    >
      <div style={{
        position: 'absolute', top: '-24px', right: '-24px',
        width: '96px', height: '96px', borderRadius: '50%',
        background: accent.blob,
        filter: 'blur(28px)',
        opacity: 0.55, pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{
          fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: T.muted, margin: 0,
          flex: 1,
        }}>{title}</p>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: accent.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          marginLeft: '8px',
        }}>
          <Icon size={16} color={accent.iconColor} strokeWidth={2} />
        </div>
      </div>

      <div>
        {loading ? (
          <div style={{
            width: '60px',
            height: '32px',
            background: 'rgba(0,0,0,0.06)',
            borderRadius: '6px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ) : (
          <h3 style={{
            fontSize: '1.75rem', fontWeight: 800, color: T.ink,
            margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em',
            fontFamily: '"Poppins", "DM Sans", system-ui, sans-serif',
          }}>{value}</h3>
        )}
      </div>

      {trend !== undefined && trend !== null && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
            background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: isPositive ? '#059669' : '#DC2626',
          }}>
            {isPositive
              ? <ArrowUpRight size={11} strokeWidth={2.5} />
              : <ArrowDownRight size={11} strokeWidth={2.5} />}
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span style={{ fontSize: '12px', color: T.muted }}>{trendLabel}</span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

// ============ CHART CARD ============
const ChartCard = ({ title, subtitle, children, fullWidth = false, delay = 0, loading = false }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
        gridColumn: fullWidth ? '1 / -1' : undefined,
        background: T.glass,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${T.border}`,
        borderRadius: '20px',
        padding: '1.75rem',
        boxShadow: '0 4px 24px rgba(6,68,107,0.07), 0 1px 2px rgba(6,68,107,0.05)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        position: 'relative', overflow: 'hidden',
        minHeight: '300px',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: `linear-gradient(90deg, transparent, ${T.sky}, transparent)`,
        opacity: 0.6, pointerEvents: 'none',
      }} />

      <div>
        <h3 style={{
          fontSize: '15px', fontWeight: 700, color: T.ink, margin: 0,
          fontFamily: '"Poppins", "DM Sans", system-ui, sans-serif',
          letterSpacing: '-0.01em',
        }}>{title}</h3>
        <p style={{ fontSize: '12px', color: T.muted, margin: '4px 0 0' }}>{subtitle}</p>
      </div>
      
      {loading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.02)',
          borderRadius: '12px',
          minHeight: '200px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${T.border}`,
            borderTopColor: T.navy,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// ============ PAGE HEADER ============
const PageHeader = ({ filterAngkatan, setFilterAngkatan, angkatanCounts, availableAngkatan, loadingAngkatan, onRefresh }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

  const sortedAngkatan = [...availableAngkatan].sort((a, b) => {
    if (a.tahun === 'Semua') return -1;
    if (b.tahun === 'Semua') return 1;
    return parseInt(a.tahun) - parseInt(b.tahun);
  });

  return (
    <div style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      borderRadius: '24px',
      background: heroGradient,
      padding: '2rem 2.25rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(6,68,107,0.22)',
      marginBottom: '0',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage:
          'radial-gradient(circle at 85% 30%, rgba(255,255,255,0.12) 0%, transparent 50%),' +
          'radial-gradient(circle at 15% 80%, rgba(156,205,219,0.18) 0%, transparent 45%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
              Dashboard Analitik · UAD
            </span>
          </div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0,
            lineHeight: 1.15, letterSpacing: '-0.03em',
            fontFamily: '"Poppins", "DM Sans", system-ui, sans-serif',
            textShadow: '0 1px 12px rgba(6,68,107,0.3)',
          }}>Dashboard Analitik</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', fontWeight: 400 }}>
            Ringkasan performa akademik mahasiswa
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <Calendar size={16} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginRight: '2px' }}>
              Angkatan:
            </span>
            {loadingAngkatan ? (
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', padding: '4px 8px' }}>Memuat...</span>
            ) : (
              <select
                value={filterAngkatan}
                onChange={(e) => setFilterAngkatan(e.target.value)}
                style={{
                  padding: '6px 32px 6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  minWidth: '130px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
              >
                {sortedAngkatan.map(a => (
                  <option 
                    key={a.tahun} 
                    value={a.tahun}
                    style={{ 
                      background: '#06446B', 
                      color: '#fff',
                      padding: '6px 10px',
                    }}
                  >
                    {a.label} {a.tahun !== 'Semua' && angkatanCounts?.[a.tahun] ? `(${angkatanCounts[a.tahun]})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ SECTION DIVIDER ============
const SectionLabel = ({ label, delay }) => {
  const [v, setV] = useState(false);
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      opacity: v ? 1 : 0, transition: `opacity 0.5s ease ${delay}ms`,
    }}>
      <span style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: T.mid,
      }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
    </div>
  );
};

// ============ MAIN DASHBOARD ============
const Dashboard = () => {
  const { user } = useAuth();
  const [filterAngkatan, setFilterAngkatan] = useState('Semua');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({
    gpaTrend: [],
    gradStatus: [],
    problematicCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingAngkatan, setLoadingAngkatan] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [error, setError] = useState(null);
  const [angkatanCounts, setAngkatanCounts] = useState({});
  const [availableAngkatan, setAvailableAngkatan] = useState([{ tahun: 'Semua', label: 'Semua Angkatan' }]);

  // Fetch available angkatan from database
  const fetchAvailableAngkatan = async () => {
    try {
      setLoadingAngkatan(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://dashboardanalitikmhs-production.up.railway.app/api/dashboard/available-angkatan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.status === 'Success') {
        const angkatanList = data.data.map(item => ({
          tahun: item.angkatan.toString(),
          label: item.angkatan.toString()
        }));
        
        setAvailableAngkatan([
          { tahun: 'Semua', label: 'Semua Angkatan' },
          ...angkatanList.sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun))
        ]);
        
        console.log('✅ Available angkatan:', angkatanList);
      }
    } catch (err) {
      console.error('Error fetching available angkatan:', err);
    } finally {
      setLoadingAngkatan(false);
    }
  };

  // Fetch angkatan counts for filter badges
  const fetchAngkatanCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dashboardanalitikmhs-production.up.railway.app/api/dashboard/angkatan-counts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'Success') {
        const counts = {};
        data.data.forEach(item => {
          counts[item.angkatan] = parseInt(item.jumlah);
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        counts['Semua'] = total;
        setAngkatanCounts(counts);
        console.log('✅ Angkatan counts:', counts);
      }
    } catch (err) {
      console.error('Error fetching angkatan counts:', err);
    }
  };

  // Fetch stats data
  const fetchStats = async (angkatan = 'Semua') => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      const params = angkatan !== 'Semua' ? `?angkatan=${angkatan}` : '';

      const response = await fetch(`https://dashboardanalitikmhs-production.up.railway.app/api/dashboard/stats${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.status === 'Success') {
        setStats(data.data);
        console.log('✅ Stats data:', data.data);
      } else {
        console.warn('⚠️ Stats API error:', data);
      }
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch chart data
  const fetchChartData = async (angkatan = 'Semua') => {
  try {
    setLoadingCharts(true);
    const token = localStorage.getItem('token');
    const params = angkatan !== 'Semua' ? `?angkatan=${angkatan}` : '';

    console.log('📊 Fetching chart data with params:', params);

    // 1. GPA Trend
    const gpaResponse = await fetch(`https://dashboardanalitikmhs-production.up.railway.app/api/dashboard/gpa-trend${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const gpaData = await gpaResponse.json();
    if (gpaData.status === 'Success') {
      setChartData(prev => ({ ...prev, gpaTrend: gpaData.data }));
      console.log('✅ GPA data:', gpaData.data);
    }

    // 2. Graduation Status
    const gradResponse = await fetch(`https://dashboardanalitikmhs-production.up.railway.app/api/dashboard/grad-status${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const gradData = await gradResponse.json();
    if (gradData.status === 'Success') {
      setChartData(prev => ({ ...prev, gradStatus: gradData.data }));
      console.log('✅ Grad status data:', gradData.data);
    }

    // 3. Problematic Courses - PERBAIKI
    console.log('📊 Fetching problematic courses...');
    
    const coursesResponse = await fetch(`https://dashboardanalitikmhs-production.up.railway.app/api/dashboard/problematic-courses${params}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', coursesResponse.status);
    
    const coursesData = await coursesResponse.json();
    console.log('📊 Full response:', JSON.stringify(coursesData, null, 2));
    
    if (coursesData.status === 'Success') {
      const courses = coursesData.data || [];
      console.log('✅ Problematic courses count:', courses.length);
      console.log('✅ Problematic courses data:', courses);
      
      setChartData(prev => ({ 
        ...prev, 
        problematicCourses: courses 
      }));
    } else {
      console.error('❌ Problematic courses API error:', coursesData.message);
      setChartData(prev => ({ ...prev, problematicCourses: [] }));
    }

  } catch (err) {
    console.error('❌ Error fetching chart data:', err);
    setChartData(prev => ({ ...prev, problematicCourses: [] }));
  } finally {
    setLoadingCharts(false);
  }
};

  // Fetch all dashboard data
  const fetchDashboardData = async (angkatan = 'Semua') => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchStats(angkatan),
        fetchChartData(angkatan)
      ]);
      
    } catch (err) {
      console.error('❌ Error fetching dashboard:', err);
      setError('Gagal mengambil data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchAvailableAngkatan(),
        fetchAngkatanCounts(),
      ]);
      await fetchDashboardData('Semua');
    };
    fetchAll();
  }, []);

  // Fetch when filter changes
  useEffect(() => {
    if (filterAngkatan) {
      fetchDashboardData(filterAngkatan);
    }
  }, [filterAngkatan]);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(filterAngkatan);
  };

  // Stats card data
  const statsData = [
    {
      title: 'Mahasiswa Aktif',
      value: stats?.totalMahasiswa?.toLocaleString() || '0',
      icon: Users,
      trend: stats?.totalMahasiswa > 0 ? 2.4 : 0,
      trendLabel: 'dari total',
      accent: {
        blob: 'rgba(87,144,171,0.8)',
        iconBg: 'rgba(87,144,171,0.12)',
        iconColor: T.mid,
      },
    },
    {
      title: 'Dosen Aktif',
      value: stats?.totalDosen?.toLocaleString() || '0',
      icon: TrendingUp,
      trend: stats?.totalDosen > 0 ? 0.5 : 0,
      trendLabel: 'dari total',
      accent: {
        blob: 'rgba(6,68,107,0.7)',
        iconBg: 'rgba(6,68,107,0.09)',
        iconColor: T.navy,
      },
    },
    {
      title: 'Skripsi',
      value: stats?.totalSkripsi?.toLocaleString() || '0',
      icon: GraduationCap,
      trend: stats?.totalSkripsi > 0 ? 8.5 : 0,
      trendLabel: 'semester 6+',
      accent: {
        blob: 'rgba(156,205,219,0.9)',
        iconBg: 'rgba(156,205,219,0.22)',
        iconColor: '#2A7A9B',
      },
    },
    {
      title: 'Berisiko',
      value: stats?.mahasiswaBerisiko?.toLocaleString() || '0',
      icon: AlertTriangle,
      trend: stats?.mahasiswaBerisiko > 0 ? -5.0 : 0,
      trendLabel: 'IPK < 2.5',
      accent: {
        blob: 'rgba(239,68,68,0.55)',
        iconBg: 'rgba(239,68,68,0.09)',
        iconColor: '#DC2626',
      },
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div style={{
        fontFamily: '"Poppins", "DM Sans", system-ui, sans-serif',
        minHeight: '100vh',
        background: meshBg,
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${T.border}`,
            borderTopColor: T.navy,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: T.muted }}>Memuat data dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontFamily: '"Poppins", "DM Sans", system-ui, sans-serif',
        minHeight: '100vh',
        background: meshBg,
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <p style={{ color: '#DC2626', fontWeight: 600 }}>❌ {error}</p>
          <button
            onClick={handleRefresh}
            style={{
              marginTop: '1rem',
              padding: '8px 20px',
              background: T.navy,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '"Poppins", "DM Sans", system-ui, sans-serif',
      minHeight: '100vh',
      background: meshBg,
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* HEADER */}
        <PageHeader 
          filterAngkatan={filterAngkatan} 
          setFilterAngkatan={setFilterAngkatan}
          angkatanCounts={angkatanCounts}
          availableAngkatan={availableAngkatan}
          loadingAngkatan={loadingAngkatan}
          onRefresh={handleRefresh}
        />

        {/* STATS - Indikator Utama */}
        <div>
          <SectionLabel label="Indikator Utama" delay={150} />
          <div style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
          }}>
            {statsData.map((s, i) => (
              <StatsCard 
                key={s.title} 
                {...s} 
                delay={200 + i * 80} 
                loading={loadingStats}
              />
            ))}
          </div>
        </div>

        {/* CHARTS - Visualisasi Analitik */}
        <div>
          <SectionLabel label="Visualisasi Analitik" delay={550} />
          <div style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '1.25rem',
          }}>
            <ChartCard
  title="Tren IPK Rata-rata"
  subtitle={filterAngkatan !== 'Semua' ? `Angkatan ${filterAngkatan}` : "Berdasarkan tahun angkatan masuk"}
  delay={600}
  loading={loadingCharts}
>
  <GpaTrendChart 
    data={chartData?.gpaTrend || []} 
    loading={loadingCharts}
  />
</ChartCard>

            <ChartCard
  title="Distribusi Status Kelulusan"
  subtitle={filterAngkatan !== 'Semua' ? `Angkatan ${filterAngkatan}` : "Persentase ketepatan waktu kelulusan"}
  delay={680}
  loading={loadingCharts}
>
  <GradStatusChart 
    data={chartData?.gradStatus || []} 
    loading={loadingCharts}
  />
</ChartCard>  

           <ChartCard
      title="Mata Kuliah Kritis"
      subtitle={filterAngkatan !== 'Semua' ? `Angkatan ${filterAngkatan}` : "Mata kuliah dengan jumlah perolehan nilai D/E terbanyak"}
      fullWidth
      delay={760}
      loading={loadingCharts}
    >
      <ProblematicCoursesChart 
        data={chartData?.problematicCourses || []} 
        loading={loadingCharts}
        angkatan={filterAngkatan}
      />
    </ChartCard>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: T.muted,
          paddingTop: '1rem',
          borderTop: `1px solid ${T.border}`,
        }}>
          <p>Dashboard Analitik Mahasiswa UAD &copy; {new Date().getFullYear()} - Data diperbarui secara real-time</p>
          {filterAngkatan !== 'Semua' && (
            <p style={{ marginTop: '4px', fontSize: '11px', color: T.mid }}>
              Menampilkan data untuk Angkatan {filterAngkatan}
            </p>
          )}
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
};

export default Dashboard;