// FRONTEND/src/components/charts/ProblematicCoursesChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { AlertTriangle, BarChart3, Info, TrendingDown } from 'lucide-react';

// ============ DESIGN TOKENS ============
const COLORS = {
  navy: '#06446B',
  mid: '#5790AB',
  sky: '#9CCDDB',
  white: '#FFFFFF',
  ink: '#0D1F2D',
  muted: '#5E7B8A',
  border: 'rgba(87,144,171,0.15)',
  red: '#DC2626',
  orange: '#F59E0B',
  green: '#10B981',
  gray: '#94A3B8',
  grayLight: '#F8FAFB',
};

const RADIUS = { sm: '6px', md: '8px', lg: '10px', pill: '999px' };
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const SEVERITY_SCALE = [
  { threshold: 0.7, color: COLORS.red, label: 'Sangat Kritis (>70%)' },
  { threshold: 0.4, color: COLORS.orange, label: 'Cukup Kritis (40–70%)' },
  { threshold: 0.2, color: COLORS.mid, label: 'Normal (20–40%)' },
  { threshold: 0, color: COLORS.sky, label: 'Rendah (<20%)' },
];

// ============ HELPERS ============
const truncateText = (text, maxLength = 22) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}…` : text;
};

const getBarColor = (value, max) => {
  const ratio = max > 0 ? value / max : 0;
  const match = SEVERITY_SCALE.find((s) => ratio > s.threshold);
  return (match || SEVERITY_SCALE[SEVERITY_SCALE.length - 1]).color;
};

// ============ SUB-COMPONENTS ============
const StateMessage = ({ icon, iconColor, iconBg, title, subtitle, height = '300px' }) => (
  <div
    style={{
      height,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontFamily: FONT,
    }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: iconBg,
        border: `1.5px dashed ${iconColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
      }}
    >
      {icon}
    </div>
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: COLORS.ink, fontSize: '14px', fontWeight: 600, margin: 0 }}>{title}</p>
      {subtitle && (
        <p style={{ color: COLORS.gray, fontSize: '12px', margin: '4px 0 0', lineHeight: 1.5 }}>{subtitle}</p>
      )}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: COLORS.white,
        padding: '12px 16px',
        borderRadius: RADIUS.lg,
        boxShadow: '0 10px 28px rgba(13,31,45,0.14), 0 2px 6px rgba(13,31,45,0.06)',
        border: `1px solid ${COLORS.border}`,
        minWidth: '180px',
        maxWidth: '260px',
        fontFamily: FONT,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: COLORS.navy,
          background: 'rgba(6,68,107,0.08)',
          padding: '2px 8px',
          borderRadius: RADIUS.sm,
          marginBottom: '6px',
        }}
      >
        {d.kode}
      </span>
      <p style={{ fontWeight: 600, color: COLORS.ink, margin: '0 0 6px', fontSize: '13px', lineHeight: 1.4 }}>
        {d.fullName}
      </p>
      <p style={{ margin: 0, fontSize: '12px', color: COLORS.muted }}>
        <span style={{ fontWeight: 700, fontSize: '17px', color: COLORS.navy }}>{d.failCount}</span>
        {' '}mahasiswa mendapat nilai D/E
      </p>
    </div>
  );
};

const StatBadge = ({ icon, iconColor, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    {icon}
    <span style={{ fontSize: '12px', color: COLORS.ink }}>{children}</span>
  </div>
);

// ============ MAIN COMPONENT ============
const ProblematicCoursesChart = ({ data = [], loading = false, angkatan = 'Semua' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // ---- Loading state ----
  if (loading) {
    return (
      <div
        style={{
          height: '320px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: `3px solid ${COLORS.border}`,
              borderTopColor: COLORS.navy,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 10px',
            }}
          />
          <p style={{ color: COLORS.gray, fontSize: '13px', margin: 0 }}>Memuat data mata kuliah kritis…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ---- Empty state (no data at all) ----
  if (!data || data.length === 0) {
    return (
      <StateMessage
        icon={<BarChart3 size={24} color={COLORS.gray} />}
        iconColor="rgba(148,163,184,0.4)"
        iconBg="rgba(148,163,184,0.08)"
        title="Belum Ada Data Mata Kuliah Kritis"
        subtitle={
          angkatan !== 'Semua'
            ? `Belum ada nilai D/E untuk Angkatan ${angkatan}`
            : 'Data akan muncul setelah ada mahasiswa dengan nilai D atau E'
        }
      />
    );
  }

  // ---- Normalize & filter data ----
  const chartData = data
    .map((item) => {
      const name = item.name || item.matakuliah || item.course || item.nama_mata_kuliah || 'Mata Kuliah';
      return {
        fullName: name,
        course: truncateText(name),
        kode: item.kode || item.kode_mata_kuliah || '-',
        failCount: parseInt(item.failCount || item.gradeD_E || item.jumlah || item.jumlah_d_e || 0, 10),
        totalMahasiswa: parseInt(item.totalMahasiswa || 0, 10),
      };
    })
    .filter((item) => item.failCount > 0)
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, 10);

  // ---- Empty state (data present, but nothing critical) ----
  if (chartData.length === 0) {
    return (
      <StateMessage
        icon={<Info size={24} color={COLORS.green} />}
        iconColor="rgba(16,185,129,0.35)"
        iconBg="rgba(16,185,129,0.08)"
        title="Tidak Ada Mata Kuliah Kritis"
        subtitle="Semua mata kuliah memiliki tingkat kelulusan yang baik"
      />
    );
  }

  const totalFail = chartData.reduce((sum, d) => sum + d.failCount, 0);
  const maxValue = Math.max(...chartData.map((d) => d.failCount));

  return (
    <div style={{ width: '100%', fontFamily: FONT, opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
      {/* ─── SUMMARY STATS ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          padding: '10px 14px',
          background: COLORS.grayLight,
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADIUS.md,
          marginBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        <StatBadge icon={<AlertTriangle size={14} color={COLORS.red} />}>
          <strong>{totalFail}</strong> total D/E
        </StatBadge>
        <StatBadge icon={<BarChart3 size={14} color={COLORS.mid} />}>
          <strong>{chartData.length}</strong> mata kuliah kritis
        </StatBadge>
        {angkatan !== 'Semua' && (
          <StatBadge icon={<TrendingDown size={14} color={COLORS.orange} />}>
            Angkatan <strong>{angkatan}</strong>
          </StatBadge>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '11px', color: COLORS.muted, whiteSpace: 'nowrap' }}>
          Top {chartData.length} dari {data.length} data
        </div>
      </div>

      {/* ─── CHART ─── */}
      <div style={{ height: '260px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 32, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8ECF0" />

            <XAxis
              type="number"
              axisLine={{ stroke: '#E8ECF0', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: COLORS.muted, fontSize: 10, fontWeight: 500, fontFamily: FONT }}
              domain={[0, 'auto']}
              allowDecimals={false}
            />

            <YAxis
              dataKey="course"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: COLORS.ink, fontSize: 11, fontWeight: 500, fontFamily: FONT }}
              width={110}
              interval={0}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(87,144,171,0.06)' }} />

            <Bar
              dataKey="failCount"
              radius={[0, 4, 4, 0]}
              barSize={14}
              animationDuration={500}
              animationEasing="ease-out"
              label={{
                position: 'right',
                fill: COLORS.muted,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: FONT,
                formatter: (value) => (value > 0 ? value : ''),
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.kode + index} fill={getBarColor(entry.failCount, maxValue)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ─── LEGEND ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          paddingTop: '10px',
          marginTop: '6px',
          borderTop: `1px solid ${COLORS.border}`,
          flexWrap: 'wrap',
        }}
      >
        {SEVERITY_SCALE.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '2px',
                background: item.color,
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '10.5px', color: COLORS.muted }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblematicCoursesChart;