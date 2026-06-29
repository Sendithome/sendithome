import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Store, CheckCircle2, Clock, TrendingUp, DollarSign } from 'lucide-react';

const COLORS = ['#ff0064', '#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function KpiCard({ icon: Icon, label, value, color = 'text-foreground' }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminRetailerAnalyticsTab({ data }) {
  const { retailers, verifications } = data;

  const metrics = useMemo(() => {
    const approved = retailers.filter(r => r.status === 'approved');
    const pending = retailers.filter(r => r.status === 'pending');
    const rejected = retailers.filter(r => r.status === 'rejected');
    const approvalRate = retailers.length > 0 ? Math.round(((approved.length + rejected.length) > 0 ? approved.length / (approved.length + rejected.length) * 100 : 0)) : 0;

    // Commission revenue per retailer
    const commMap = {};
    verifications.filter(v => v.status === 'approved').forEach(v => {
      const r = retailers.find(r => r.id === v.retailer_id);
      const name = r ? (r.brand_name || r.store_name) : (v.store_name || 'Unknown');
      if (!commMap[name]) commMap[name] = { name, commission: 0, verifications: 0 };
      commMap[name].commission += (v.commission_amount || 0);
      commMap[name].verifications++;
    });
    const topByCommission = Object.values(commMap).sort((a, b) => b.commission - a.commission).slice(0, 8);

    // Average approval time
    const approvalTimes = verifications
      .filter(v => v.status === 'approved' && v.approved_at && v.created_date)
      .map(v => (new Date(v.approved_at) - new Date(v.created_date)) / (1000 * 60 * 60));
    const avgApprovalHours = approvalTimes.length ? Math.round(approvalTimes.reduce((s, t) => s + t, 0) / approvalTimes.length) : 0;

    // Status distribution
    const statusDist = [
      { name: 'Approved', value: approved.length, fill: '#10b981' },
      { name: 'Pending', value: pending.length, fill: '#f59e0b' },
      { name: 'Rejected', value: rejected.length, fill: '#ef4444' },
      { name: 'Suspended', value: retailers.filter(r => r.status === 'suspended').length, fill: '#6b7280' },
    ].filter(d => d.value > 0);

    // By category
    const catMap = {};
    retailers.forEach(r => { if (r.store_category) catMap[r.store_category] = (catMap[r.store_category] || 0) + 1; });
    const byCategory = Object.entries(catMap).map(([c, n]) => ({ category: c, count: n })).sort((a, b) => b.count - a.count);

    // Full performance table
    const performanceTable = retailers.filter(r => r.status === 'approved').map(r => {
      const rvs = verifications.filter(v => v.retailer_id === r.id);
      const approvedRvs = rvs.filter(v => v.status === 'approved');
      return {
        name: r.brand_name || r.store_name,
        category: r.store_category || '—',
        total: rvs.length,
        approved: approvedRvs.length,
        rate: rvs.length > 0 ? Math.round((approvedRvs.length / rvs.length) * 100) : 0,
        commission: approvedRvs.reduce((s, v) => s + (v.commission_amount || 0), 0),
      };
    }).sort((a, b) => b.commission - a.commission);

    return { approved, pending, approvalRate, topByCommission, avgApprovalHours, statusDist, byCategory, performanceTable };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Store} label="Total Retailers" value={retailers.length} />
        <KpiCard icon={CheckCircle2} label="Active Retailers" value={metrics.approved.length} color="text-green-600" />
        <KpiCard icon={Clock} label="Pending Approval" value={metrics.pending.length} color="text-yellow-600" />
        <KpiCard icon={TrendingUp} label="Approval Rate" value={`${metrics.approvalRate}%`} color="text-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Commission Generated per Retailer</h3>
          {metrics.topByCommission.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No approved verifications yet</p> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={metrics.topByCommission} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `US$${v}`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} />
                <Tooltip formatter={v => [`US$${v.toFixed(2)}`, 'Commission']} />
                <Bar dataKey="commission" fill="#ff0064" radius={[0, 4, 4, 0]} name="Commission" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-1">Retailer Status Distribution</h3>
          <p className="text-xs text-muted-foreground mb-3">Avg approval time: <span className="font-bold text-foreground">{metrics.avgApprovalHours}h</span></p>
          {metrics.statusDist.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data yet</p> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={metrics.statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" nameKey="name">
                  {metrics.statusDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {metrics.statusDist.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                <span className="text-xs text-muted-foreground">{s.name}: <strong className="text-foreground">{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Retailer Performance Rankings</h3>
        {metrics.performanceTable.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No approved retailer data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['#', 'Retailer', 'Category', 'Verifications', 'Approved', 'Approval Rate', 'Commission'].map(h => (
                    <th key={h} className={`text-xs text-muted-foreground font-semibold pb-2 ${['#', 'Retailer', 'Category'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.performanceTable.map((r, i) => (
                  <tr key={r.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="py-2.5 font-medium text-foreground text-xs">{r.name}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{r.category}</td>
                    <td className="py-2.5 text-right text-xs">{r.total}</td>
                    <td className="py-2.5 text-right text-xs text-green-600 font-semibold">{r.approved}</td>
                    <td className="py-2.5 text-right text-xs">
                      <span className={`font-bold ${r.rate >= 80 ? 'text-green-600' : r.rate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{r.rate}%</span>
                    </td>
                    <td className="py-2.5 text-right text-xs font-bold text-accent">${r.commission.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}