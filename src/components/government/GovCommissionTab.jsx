import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, TrendingUp, Store, Globe, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TIERS = [
  { min: 1, max: 3999, rate: 0.10 },
  { min: 4000, max: 7999, rate: 0.06 },
  { min: 8000, max: 11999, rate: 0.03 },
  { min: 12000, max: Infinity, rate: 0.02 },
];

function getTierRate(value) {
  return (TIERS.find(t => value >= t.min && value <= t.max) || TIERS[0]).rate;
}

function calcCommission(value) {
  return value * getTierRate(value);
}

const COLORS = ['#ff0064', '#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

function KpiCard({ icon: Icon, label, value, color = 'text-foreground' }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function GovCommissionTab({ verifications, retailers }) {
  const approved = verifications.filter(v => v.status === 'approved');

  const metrics = useMemo(() => {
    // Total government revenue from commissions
    const totalRevenue = approved.reduce((s, v) => s + calcCommission(v.total_value || 0), 0);
    const totalExportValue = approved.reduce((s, v) => s + (v.total_value || 0), 0);

    // Simulate paid vs outstanding (60% paid for demo)
    const totalPaid = totalRevenue * 0.6;
    const outstanding = totalRevenue - totalPaid;

    // Per retailer
    const retailerMap = {};
    approved.forEach(v => {
      const r = retailers.find(r => r.id === v.retailer_id);
      const name = r ? (r.brand_name || r.store_name) : (v.store_name || 'Unknown');
      if (!retailerMap[name]) retailerMap[name] = { name, shipments: 0, exportValue: 0, commission: 0 };
      retailerMap[name].shipments++;
      retailerMap[name].exportValue += v.total_value || 0;
      retailerMap[name].commission += calcCommission(v.total_value || 0);
    });
    const byRetailer = Object.values(retailerMap).sort((a, b) => b.commission - a.commission);
    const topRetailers = byRetailer.slice(0, 6).map(r => ({ name: r.name.slice(0, 18), commission: Math.round(r.commission) }));

    // Per country
    const countryMap = {};
    approved.forEach(v => {
      const c = v.destination_country || 'Unknown';
      if (!countryMap[c]) countryMap[c] = { country: c, commission: 0, shipments: 0 };
      countryMap[c].commission += calcCommission(v.total_value || 0);
      countryMap[c].shipments++;
    });
    const byCountry = Object.values(countryMap).sort((a, b) => b.commission - a.commission).slice(0, 8)
      .map(c => ({ country: c.country.slice(0, 14), commission: Math.round(c.commission) }));

    // Monthly (last 12 months)
    const now = new Date();
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthStr = d.toISOString().slice(0, 7);
      const monthVers = approved.filter(v => v.approved_at?.startsWith(monthStr));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        commission: Math.round(monthVers.reduce((s, v) => s + calcCommission(v.total_value || 0), 0)),
        collected: Math.round(monthVers.reduce((s, v) => s + calcCommission(v.total_value || 0), 0) * 0.6),
      };
    });

    // Annual
    const annualCommission = approved
      .filter(v => v.approved_at?.startsWith(String(now.getFullYear())))
      .reduce((s, v) => s + calcCommission(v.total_value || 0), 0);

    // Collection efficiency
    const collectionRate = totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0;

    // Retailers with outstanding
    const retailersWithOutstanding = byRetailer.filter((_, i) => i % 3 !== 0).slice(0, 5);

    // Tier distribution
    const tierDist = [
      { tier: 'Tier 1 (10%)', count: approved.filter(v => (v.total_value || 0) < 4000).length },
      { tier: 'Tier 2 (6%)', count: approved.filter(v => (v.total_value || 0) >= 4000 && (v.total_value || 0) < 8000).length },
      { tier: 'Tier 3 (3%)', count: approved.filter(v => (v.total_value || 0) >= 8000 && (v.total_value || 0) < 12000).length },
      { tier: 'Tier 4 (2%)', count: approved.filter(v => (v.total_value || 0) >= 12000).length },
    ].filter(d => d.count > 0);

    return {
      totalRevenue, totalExportValue, totalPaid, outstanding, collectionRate,
      byRetailer, topRetailers, byCountry, monthly, annualCommission,
      retailersWithOutstanding, tierDist
    };
  }, [verifications, retailers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-foreground">Government Revenue & Commission Dashboard</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time commission collection analytics across all participating retailers</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={DollarSign} label="Total Govt. Revenue" value={`$${metrics.totalRevenue.toLocaleString('en', { maximumFractionDigits: 0 })}`} color="text-accent" />
        <KpiCard icon={CheckCircle2} label="Commission Collected" value={`$${metrics.totalPaid.toLocaleString('en', { maximumFractionDigits: 0 })}`} color="text-green-600" />
        <KpiCard icon={AlertTriangle} label="Outstanding" value={`$${metrics.outstanding.toLocaleString('en', { maximumFractionDigits: 0 })}`} color="text-destructive" />
        <KpiCard icon={TrendingUp} label="Annual (YTD)" value={`$${metrics.annualCommission.toLocaleString('en', { maximumFractionDigits: 0 })}`} />
        <KpiCard icon={Store} label="Active Retailers" value={metrics.byRetailer.length} />
        <KpiCard icon={Globe} label="Collection Rate" value={`${metrics.collectionRate}%`} color={metrics.collectionRate >= 80 ? 'text-green-600' : 'text-amber-600'} />
      </div>

      {/* Monthly Collections */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Monthly Commission Revenue vs Collections (12 Months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={metrics.monthly}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => `$${v.toLocaleString()}`} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="commission" fill="#1e293b" radius={[4, 4, 0, 0]} name="Revenue Due" />
            <Bar dataKey="collected" fill="#ff0064" radius={[4, 4, 0, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Retailers */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Top Contributing Retailers</h3>
          {metrics.topRetailers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.topRetailers} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                <Bar dataKey="commission" fill="#ff0064" radius={[0, 4, 4, 0]} name="Commission" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Country */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Commission by Destination Country</h3>
          {metrics.byCountry.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.byCountry} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                <Bar dataKey="commission" fill="#1e293b" radius={[0, 4, 4, 0]} name="Commission" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tier Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Commission Tier Distribution</h3>
          {metrics.tierDist.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={metrics.tierDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" nameKey="tier">
                  {metrics.tierDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Collection Efficiency */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Collection Efficiency</h3>
          <div className="flex items-center justify-center h-36">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--accent))" strokeWidth="3"
                  strokeDasharray={`${metrics.collectionRate} ${100 - metrics.collectionRate}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-foreground">{metrics.collectionRate}%</p>
                <p className="text-[10px] text-muted-foreground">Collected</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="text-center bg-green-50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-sm font-black text-green-700">${metrics.totalPaid.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-center bg-red-50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-sm font-black text-red-700">${metrics.outstanding.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Retailer Contribution Table */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Retailer Commission Contribution Rankings</h3>
        {metrics.byRetailer.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No retailer data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {['#', 'Retailer', 'Shipments', 'Export Value', 'Commission Due', 'Status'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.byRetailer.slice(0, 15).map((r, i) => (
                  <tr key={r.name} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-2.5 px-2 font-semibold text-foreground">{r.name}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{r.shipments}</td>
                    <td className="py-2.5 px-2">${r.exportValue.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-2 font-bold text-accent">${r.commission.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${i % 3 === 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {i % 3 === 0 ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Retailers with Outstanding */}
      {metrics.retailersWithOutstanding.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-destructive mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Retailers with Outstanding Balances
          </h3>
          <div className="space-y-2">
            {metrics.retailersWithOutstanding.map(r => (
              <div key={r.name} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-2.5">
                <span className="text-xs font-semibold text-foreground">{r.name}</span>
                <span className="text-xs font-bold text-destructive">${(r.commission * 0.4).toLocaleString('en', { maximumFractionDigits: 0 })} outstanding</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}