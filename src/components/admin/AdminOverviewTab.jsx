import { useMemo } from 'react';
import { ShoppingBag, Package, Store, Hotel, CheckCircle2, Clock, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getCommissionAmount } from '@/utils/commissionTiers';

export default function AdminOverviewTab({ data }) {
  const { orders, verifications, retailers, hotels } = data;

  const stats = useMemo(() => {
    const approved = verifications.filter(v => v.status === 'approved');
    const pending = verifications.filter(v => v.status === 'pending');
    const totalExportValue = approved.reduce((s, v) => s + (v.total_value || 0), 0);
    const totalCommission = approved.reduce((s, v) => s + getCommissionAmount(v.total_value || 0, v.tourist_passport_country), 0);
    const activeRetailers = retailers.filter(r => r.status === 'approved').length;
    const pendingRetailers = retailers.filter(r => r.status === 'pending').length;

    return { approved, pending, totalExportValue, totalCommission, activeRetailers, pendingRetailers };
  }, [verifications, retailers]);

  // Monthly volume from verifications
  const monthlyData = useMemo(() => {
    const map = {};
    verifications.forEach(v => {
      const month = (v.created_date || '').slice(0, 7);
      if (!month) return;
      if (!map[month]) map[month] = { month, shipments: 0, value: 0 };
      map[month].shipments++;
      if (v.status === 'approved') map[month].value += v.total_value || 0;
    });
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map(m => ({ ...m, label: new Date(m.month + '-01').toLocaleDateString('en', { month: 'short' }) }));
  }, [verifications]);

  // Order status breakdown
  const orderStatuses = useMemo(() => {
    const map = {};
    orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [orders]);

  const tooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 11 };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Total Shipments" value={orders.length} color="text-primary" bg="bg-primary/10" />
        <StatCard icon={<Package className="w-5 h-5" />} label="Verifications" value={verifications.length} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Approved Shipments" value={stats.approved.length} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Approvals" value={stats.pending.length} color="text-yellow-600" bg="bg-yellow-50" pulse={stats.pending.length > 0} />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Total Export Value (USD)" value={`US$${stats.totalExportValue.toLocaleString('en', { maximumFractionDigits: 0 })}`} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Govt. Commission (Tiered)" value={`US$${stats.totalCommission.toLocaleString('en', { maximumFractionDigits: 0 })}`} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={<Store className="w-5 h-5" />} label="Active Retailers" value={stats.activeRetailers} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Pending Retailers" value={stats.pendingRetailers} color="text-red-600" bg="bg-red-50" pulse={stats.pendingRetailers > 0} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Approve Retailers', href: '/admin-retailers', color: 'bg-accent text-accent-foreground' },
          { label: 'Hotel Dashboard', href: '/hotel-dashboard', color: 'bg-primary text-primary-foreground' },
          { label: 'Government Portal', href: '/government-dashboard', color: 'bg-emerald-600 text-white' },
          { label: 'Brand Directory', href: '/brand-directory', color: 'bg-purple-600 text-white' },
        ].map(link => (
          <a key={link.href} href={link.href} className={`${link.color} rounded-xl px-4 py-3 text-xs font-bold text-center hover:opacity-90 transition-opacity shadow-sm`}>
            {link.label} →
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Shipments Chart */}
        <ChartCard title="Monthly Shipments">
          {monthlyData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="shipments" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Export Value Trend */}
        <ChartCard title="Export Value Trend (US$)">
          {monthlyData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v.toFixed(0)}`, 'Value']} />
                <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Recent Verifications */}
      <ChartCard title="Recent Verifications">
        {verifications.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No verifications yet.</p>
        ) : (
          <div className="space-y-2">
            {verifications.slice(0, 8).map(v => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-xs font-bold font-mono text-foreground">{v.shipment_id}</p>
                  <p className="text-[10px] text-muted-foreground">{v.store_name} · {v.tourist_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-foreground">US${(v.total_value || 0).toFixed(2)}</span>
                  <StatusPill status={v.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg, pulse }) {
  return (
    <div className={`rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm bg-card ${pulse ? 'animate-pulse' : ''}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <p className="text-sm font-bold text-foreground mb-3">{title}</p>
      {children}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    queried: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-slate-100 text-slate-500',
    overdue: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}