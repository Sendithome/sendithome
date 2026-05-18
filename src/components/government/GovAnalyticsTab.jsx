import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';

const COLORS = ['#8B5CF6', '#D4A855', '#FF007F', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GovAnalyticsTab({ verifications, hotels, retailers }) {
  const [dateRange, setDateRange] = useState('all');

  const filtered = useMemo(() => {
    if (dateRange === 'all') return verifications;
    const months = dateRange === '3m' ? 3 : dateRange === '6m' ? 6 : 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    return verifications.filter(v => new Date(v.created_date) >= cutoff);
  }, [verifications, dateRange]);

  // Monthly revenue
  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach(v => {
      const d = new Date(v.created_date);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      map[key] = (map[key] || 0) + (v.total_value || 0);
    });
    return Object.entries(map).map(([month, value]) => ({ month, value })).slice(-12);
  }, [filtered]);

  // By destination
  const byDestination = useMemo(() => {
    const map = {};
    filtered.forEach(v => {
      if (v.destination_country) map[v.destination_country] = (map[v.destination_country] || 0) + (v.total_value || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // By nationality
  const byNationality = useMemo(() => {
    const map = {};
    filtered.forEach(v => {
      if (v.tourist_passport_country) map[v.tourist_passport_country] = (map[v.tourist_passport_country] || 0) + (v.total_value || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const totalRevenue = filtered.reduce((s, v) => s + (v.total_value || 0), 0);
  const approvedCount = filtered.filter(v => v.status === 'approved').length;
  const totalCount = filtered.length;

  // GDP projections
  const monthlyAvg = totalRevenue / Math.max(monthlyData.length, 1);
  const annualProjection = monthlyAvg * 12;
  const projections = [
    { pct: '10%', revenue: annualProjection * 0.5, multiplier: annualProjection * 0.5 * 1.5 },
    { pct: '20%', revenue: annualProjection, multiplier: annualProjection * 1.5 },
    { pct: '30%', revenue: annualProjection * 2, multiplier: annualProjection * 2 * 1.5 },
  ];

  const downloadCSV = () => {
    const rows = [
      ['Shipment ID', 'Tourist', 'Country', 'Destination', 'Value', 'Status', 'Date'],
      ...filtered.map(v => [v.shipment_id, v.tourist_name, v.tourist_passport_country, v.destination_country, v.total_value, v.status, v.created_date])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sih-export-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Economic Impact Dashboard</h3>
          <p className="text-xs text-slate-400 mt-0.5">Measuring the tourism retail export contribution to GDP</p>
        </div>
        <div className="flex items-center gap-2">
          {['3m', '6m', '12m', 'all'].map(r => (
            <button key={r} onClick={() => setDateRange(r)} className={`px-3 h-8 rounded-lg text-xs font-semibold transition-colors ${dateRange === r ? 'bg-[#8B5CF6] text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {r === 'all' ? 'All Time' : r.toUpperCase()}
            </button>
          ))}
          <button onClick={downloadCSV} className="px-3 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Monthly Revenue */}
      <ChartCard title="Tourism Export Revenue by Month">
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: '#0D1526', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </ChartCard>

      {/* By Destination & Nationality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard title="Revenue by Destination Country">
          {byDestination.length > 0 ? (
            <div className="space-y-2 mt-2">
              {byDestination.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-24 truncate">{d.name}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(d.value / byDestination[0].value) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="text-[10px] text-[#D4A855] font-semibold w-16 text-right">${(d.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Revenue by Tourist Nationality">
          {byNationality.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byNationality} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {byNationality.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Value']} contentStyle={{ background: '#0D1526', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* GDP Projection */}
      <ChartCard title="GDP Impact Projection">
        <p className="text-[10px] text-slate-400 mb-4">Based on current data — projected annual economic impact</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {projections.map(p => (
            <div key={p.pct} className="bg-[#060D1F] rounded-xl p-3 text-center">
              <p className="text-xs font-black text-[#8B5CF6]">{p.pct} Participation</p>
              <p className="text-[10px] text-slate-400 mt-2">Revenue</p>
              <p className="text-sm font-bold text-[#D4A855]">${(p.revenue / 1e9).toFixed(2)}B</p>
              <p className="text-[10px] text-slate-400 mt-1">Multiplier (1.5×)</p>
              <p className="text-xs font-semibold text-green-400">${(p.multiplier / 1e9).toFixed(2)}B</p>
            </div>
          ))}
        </div>
        <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#8B5CF6] shrink-0" />
          <p className="text-xs text-slate-300">
            At current participation: Revenue <span className="text-[#D4A855] font-bold">${(annualProjection / 1e6).toFixed(1)}M/yr</span> · Multiplier Effect: <span className="text-green-400 font-bold">${(annualProjection * 1.5 / 1e6).toFixed(1)}M</span> · Net Ecosystem Retention: <span className="text-[#8B5CF6] font-bold">${(annualProjection * 0.3 / 1e6).toFixed(1)}M</span>
          </p>
        </div>
      </ChartCard>

      {/* Compliance Report */}
      <ChartCard title="Compliance Report">
        <div className="grid grid-cols-3 gap-3 mt-2">
          <Metric label="Total Submissions" value={totalCount} color="text-[#8B5CF6]" />
          <Metric label="Approved" value={approvedCount} color="text-green-400" />
          <Metric label="Rejection Rate" value={`${totalCount > 0 ? (((totalCount - approvedCount) / totalCount) * 100).toFixed(1) : 0}%`} color="text-[#FF007F]" />
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-[#060D1F] border border-slate-800 rounded-xl p-4">
      <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3">{title}</p>
      {children}
    </div>
  );
}

function EmptyChart() {
  return <p className="text-xs text-slate-600 text-center py-8">No data available</p>;
}

function Metric({ label, value, color }) {
  return (
    <div className="bg-[#0D1526] rounded-xl p-3 text-center">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}