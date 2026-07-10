import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Warna untuk setiap status
const COLORS = {
  'Tepat Waktu': '#059669',  // Hijau
  'Normal': '#5790AB',        // Biru
  'Terlambat': '#F59E0B',    // Kuning
  'Berisiko': '#DC2626',     // Merah
  'Unknown': '#9CCDDB'       // Abu-abu
};

const GradStatusChart = ({ data, loading = false }) => {
  // Loading state
  if (loading) {
    return (
      <div className="h-72 w-full mt-4 flex items-center justify-center">
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#5790AB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Jika data kosong, tampilkan pesan
  if (!data || data.length === 0) {
    return (
      <div className="h-72 w-full mt-4 flex items-center justify-center">
        <p className="text-text-muted text-sm">Belum ada data status kelulusan</p>
      </div>
    );
  }

  // Format data dengan warna
  const chartData = data.map(item => ({
    name: item.name || item.status || 'Unknown',
    value: parseFloat(item.value || item.jumlah || 0),
    fill: COLORS[item.name] || COLORS['Unknown']
  }));

  // Filter data dengan value > 0
  const filteredData = chartData.filter(item => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="h-72 w-full mt-4 flex items-center justify-center">
        <p className="text-text-muted text-sm">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #E2E8F0'
        }}>
          <p style={{ fontWeight: 600, color: '#1E293B', margin: 0 }}>{data.name}</p>
          <p style={{ color: '#64748B', margin: 0 }}>
            {data.value}% mahasiswa
          </p>
        </div>
      );
    }
    return null;
  };

  // Sort data agar tampilan rapi (dari terbesar ke terkecil)
  const sortedData = [...filteredData].sort((a, b) => b.value - a.value);

  return (
    <div className="h-72 w-full mt-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
            labelLine={true}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill} 
                className="transition-all duration-200 hover:opacity-80 outline-none" 
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: 12, color: '#64748B' }}
            formatter={(value) => {
              const item = sortedData.find(d => d.name === value);
              return `${value} (${item?.value || 0}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GradStatusChart;