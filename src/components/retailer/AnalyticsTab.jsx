import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';

const COLORS = ['#22C55E', '#D4A855', '#FF007F', '#6366F1', '#0EA5E9', '#F97316'];

export default function AnalyticsTab({ verifications }) {
  const approved = useMemo(() => verifications.filter(v => v.status === 'approved'), [verifications]);

  // Monthly volume
  const monthly = useMemo(() => {
    const map = {};
    approved.forEach(v => {
      const month = v.approved_at ? v.approved_at.slice(0, 7) : 'Unknown';
      if (!map[month]) map[month] = { month, shipments: 0, value: 0, commission: 0 };
      map[month].shipments++;
      map[month].value += v.total_value || 0;
      map[month].commission += v.commission_amount || 0;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-12).map(m => ({
      ...m, label: new Date(m.month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' })
    }));
  }, [approved]);

  // Category breakdown
  const categories = useMemo(() => {
    const map = {};
    approved.forEach(v => v.items?.forEach(item => {
      const cat = item.category || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    }));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [approved]);

  // Destination countries
  const destinations = useMemo(() => {
    const map = {};
    approved.forEach(v => { const c = v.destination_country || 'Unknown'; map[c] = (map[c] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [approved]);

  // Average basket size trend
  const basketTrend = useMemo(() => monthly.map(m => ({
    label: m.label,
    avg: m.shipments > 0 ? Math.round(m.value / m.shipments) : 0
  })), [monthly]);

  const downloadStatement = () => {
    const lines = ['Send It Home — Commission Statement', '', 'Month,Shipments,Total Value,Commission'];
    monthly.forEach(m => lines.push(`${m.label},${m.shipments},$${m.value.toFixed(2)},$${m.commission.toFixed(2)}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'commission-statement.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const tooltipStyle = { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 12 };

  return (
    <div className="space-y-6">
      {/* Monthly Export Volume */}
      <ChartCard title="Monthly Export Volume">
        {monthly.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="shipments" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Categories */}
        <ChartCard title="Top Exported Categories">
          {categories.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={10}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Average Basket Size */}
        <ChartCard title="Average Basket Size ($)">
          {basketTrend.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={basketTrend}>
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="avg" stroke="#D4A855" strokeWidth={2} dot={{ fill: '#D4A855', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Destination Countries */}
      <ChartCard title="Destination Countries">
        {destinations.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={destinations.length * 36 + 20}>
            <BarChart data={destinations} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={75} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#FF007F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Commission Statement */}
      <ChartCard title="Commission Statement (Govt. 10%*)">
        <p className="text-[10px] text-slate-500 italic mb-3">* 10% applies only on declared items shipped internationally through the platform. VAT excluded. Rate shown as demo/reference — subject to approval by economic &amp; government authorities.</p>
        <div className="space-y-2">
          {monthly.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4">No data yet.</p>
          ) : (
            monthly.map(m => (
              <div key={m.month} className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
                <span className="text-white font-semibold w-16">{m.label}</span>
                <span className="text-slate-400">{m.shipments} shipments</span>
                <span className="text-slate-300">${m.value.toFixed(2)} shipped value</span>
                <span className="text-[#D4A855] font-bold">${(m.value * 0.10).toFixed(2)} (10%*)</span>
              </div>
            ))
          )}
        </div>
        <button onClick={downloadStatement} className="mt-4 flex items-center gap-2 text-xs text-green-400 border border-green-500/40 rounded-lg px-3 h-8 hover:bg-green-500/10 transition-colors">
          <Download className="w-3.5 h-3.5" /> Download Commission Statement (PDF)
        </button>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4">
      <p className="text-sm font-bold text-[#D4A855] mb-4">{title}</p>
      {children}
    </div>
  );
}

function EmptyChart() {
  return <p className="text-center text-slate-600 text-xs py-8">No data available yet.</p>;
}