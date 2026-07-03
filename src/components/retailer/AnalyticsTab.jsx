import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';

const COLORS = ['#ff0064', '#D4A855', '#6366F1', '#0EA5E9', '#22C55E', '#F97316'];

const QUICK_FILTERS = [
  { id: 'all', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'ytd', label: 'Year to Date' },
];

export default function AnalyticsTab({ verifications }) {
  const [quickFilter, setQuickFilter] = useState('all');

  const approved = useMemo(() => {
    const all = verifications.filter(v => v.status === 'approved');
    if (quickFilter === 'all') return all;
    const now = new Date();
    return all.filter(v => {
      const d = v.approved_at ? new Date(v.approved_at) : new Date(v.created_date || 0);
      if (quickFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (quickFilter === '30d') return d >= new Date(now.getTime() - 30 * 86400000);
      if (quickFilter === 'ytd') return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [verifications, quickFilter]);

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

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    color: 'hsl(var(--popover-foreground))',
    fontSize: 12,
  };

  return (
    <div className="space-y-5">
      {/* Quick date filters */}
      <div className="flex rounded-xl border border-border overflow-hidden bg-card w-fit">
        {QUICK_FILTERS.map(f => (
          <button key={f.id} onClick={() => setQuickFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${quickFilter === f.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Monthly Export Volume */}
      <ChartCard title="Monthly Export Volume" description="Number of approved shipments per month over the last 12 months.">
        {monthly.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="shipments" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Categories */}
        <ChartCard title="Top Exported Categories" description="Breakdown of shipped items by product category.">
          {categories.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700 }}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Average Basket Size */}
        <ChartCard title="Average Basket Size (US$)" description="Average shipment value per month — tracks tourist spending trends.">
          {basketTrend.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={basketTrend}>
                <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Destination Countries */}
      <ChartCard title="Destination Countries" description="Top countries where your shipments are being delivered.">
        {destinations.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={destinations.length * 36 + 20}>
            <BarChart data={destinations} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={75} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Commission Statement */}
      <ChartCard title="Commission Statement (Tiered)" description="Monthly breakdown of shipment value and commission owed to the government.">
        <div className="space-y-2">
          {monthly.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">No data yet.</p>
          ) : (
            monthly.map(m => (
              <div key={m.month} className="flex items-center justify-between py-2 border-b border-border text-xs">
                <span className="text-foreground font-semibold w-16">{m.label}</span>
                <span className="text-muted-foreground">{m.shipments} shipments</span>
                <span className="text-muted-foreground">US${m.value.toFixed(2)} shipped</span>
                <span className="text-amber-600 font-bold">US${(m.commission || 0).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
        <button onClick={downloadStatement} className="mt-4 flex items-center gap-2 text-xs font-semibold text-foreground border border-border rounded-lg px-3 h-8 hover:bg-muted transition-colors">
          <Download className="w-3.5 h-3.5" /> Download Commission Statement (CSV)
        </button>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <p className="text-sm font-bold text-foreground mb-1">{title}</p>
      {description && <p className="text-[10px] text-muted-foreground mb-4">{description}</p>}
      {children}
    </div>
  );
}

function EmptyChart() {
  return <p className="text-center text-muted-foreground text-xs py-8">No data available yet.</p>;
}