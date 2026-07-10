import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GpaTrendChart = ({ data, loading = false }) => {
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
        <p className="text-text-muted text-sm">Belum ada data IPK</p>
      </div>
    );
  }

  // Filter data dengan IPK > 0
  const validData = data.filter(item => {
    const ipk = parseFloat(item.ipk || item.rata_rata || 0);
    return ipk > 0;
  });

  if (validData.length === 0) {
    return (
      <div className="h-72 w-full mt-4 flex items-center justify-center">
        <p className="text-text-muted text-sm">Belum ada data IPK yang valid</p>
      </div>
    );
  }

  // Format data untuk chart - support berbagai format dari backend
  const chartData = validData.map(item => ({
    angkatan: item.label || item.angkatan || item.tahun || item.periode || 'N/A',
    ipk: parseFloat(item.ipk || item.rata_rata || 0)
  }));

  // Sort by angkatan (ascending)
  chartData.sort((a, b) => {
    const aNum = parseInt(a.angkatan);
    const bNum = parseInt(b.angkatan);
    if (isNaN(aNum)) return 1;
    if (isNaN(bNum)) return -1;
    return aNum - bNum;
  });

  // Cari nilai min dan max untuk domain Y axis
  const values = chartData.map(d => d.ipk);
  const minValue = Math.max(2.0, Math.min(...values) - 0.3);
  const maxValue = Math.min(4.0, Math.max(...values) + 0.3);

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="angkatan" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            domain={[minValue, maxValue]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            dx={-10}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: 'white'
            }}
            formatter={(value) => [`${value.toFixed(2)}`, 'Rata-rata IPK']}
            labelFormatter={(label) => `Angkatan ${label}`}
            cursor={{ stroke: '#9CCDDB', strokeWidth: 2, strokeDasharray: '3 3' }}
          />
          <Line 
            type="monotone" 
            dataKey="ipk" 
            stroke="#06446B" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#06446B', strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 6, fill: '#5790AB', strokeWidth: 0 }}
            name="Rata-rata IPK"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GpaTrendChart;