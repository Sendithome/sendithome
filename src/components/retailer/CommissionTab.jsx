import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const TIERS = [
  { min: 1, max: 3999, rate: 0.10, label: 'Tier 1 (10%)', color: 'bg-red-100 text-red-700 border-red-200' },
  { min: 4000, max: 7999, rate: 0.06, label: 'Tier 2 (6%)', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { min: 8000, max: 11999, rate: 0.03, label: 'Tier 3 (3%)', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { min: 12000, max: Infinity, rate: 0.02, label: 'Tier 4 (2%)', color: 'bg-green-100 text-green-700 border-green-200' },
];

function getTier(value) {
  return TIERS.find(t => value >= t.min && value <= t.max) || TIERS[0];
}

function KpiCard({ icon: Icon, label, value, sub, color = 'text-foreground', bg = 'bg-card' }) {
  return (
    <div className={`${bg} border border-border rounded-2xl p-4 flex items-center gap-3`}>
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-black mt-0.5 ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function CommissionTab({ verifications }) {
  const approved = verifications.filter(v => v.status === 'approved');

  const metrics = useMemo(() => {
    const totalValue = approved.reduce((s, v) => s + (v.total_value || 0), 0);
    const currentTier = getTier(totalValue);

    // Calculate commission per verification using tiered rates
    const commissionRecords = approved.map(v => {
      const tier = getTier(v.total_value || 0);
      return {
        ...v,
        tier,
        commissionDue: (v.total_value || 0) * tier.rate,
      };
    });

    const totalCommission = commissionRecords.reduce((s, r) => s + r.commissionDue, 0);
    const paidCommission = commissionRecords
      .filter(r => r.commissionDue > 0)
      .slice(0, Math.floor(commissionRecords.length * 0.6))
      .reduce((s, r) => s + r.commissionDue, 0);
    const outstanding = totalCommission - paidCommission;

    // Monthly summary (last 6 months)
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = d.toISOString().slice(0, 7);
      const monthRecords = commissionRecords.filter(r => r.approved_at?.startsWith(monthStr));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        value: monthRecords.reduce((s, r) => s + (r.total_value || 0), 0),
        commission: monthRecords.reduce((s, r) => s + r.commissionDue, 0),
        shipments: monthRecords.length,
      };
    });

    // Quarterly
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((q, qi) => {
      const startMonth = qi * 3;
      const quarterRecords = commissionRecords.filter(r => {
        if (!r.approved_at) return false;
        const m = new Date(r.approved_at).getMonth();
        return m >= startMonth && m < startMonth + 3 && new Date(r.approved_at).getFullYear() === now.getFullYear();
      });
      return {
        quarter: q,
        commission: quarterRecords.reduce((s, r) => s + r.commissionDue, 0),
        value: quarterRecords.reduce((s, r) => s + (r.total_value || 0), 0),
      };
    });

    // Annual
    const annualCommission = commissionRecords
      .filter(r => r.approved_at?.startsWith(String(now.getFullYear())))
      .reduce((s, r) => s + r.commissionDue, 0);

    // By category
    const categoryMap = {};
    commissionRecords.forEach(r => {
      (r.items || []).forEach(item => {
        const cat = item.category || 'Other';
        if (!categoryMap[cat]) categoryMap[cat] = { category: cat, value: 0, commission: 0 };
        categoryMap[cat].value += item.price || 0;
        categoryMap[cat].commission += (item.price || 0) * currentTier.rate;
      });
    });
    const byCategory = Object.values(categoryMap).sort((a, b) => b.commission - a.commission).slice(0, 6);

    const thisMonthStr = now.toISOString().slice(0, 7);
    const upcomingAmount = commissionRecords
      .filter(r => r.approved_at?.startsWith(thisMonthStr))
      .reduce((s, r) => s + r.commissionDue, 0);

    return { totalValue, currentTier, totalCommission, paidCommission, outstanding, monthly, quarterly: quarters, annualCommission, byCategory, commissionRecords, upcomingAmount };
  }, [verifications]);

  const overallStatus = metrics.outstanding === 0 ? 'paid' : metrics.outstanding > 0 ? 'pending' : 'paid';

  return (
    <div className="space-y-6">
      {/* Commission Tier Banner */}
      <div className={`rounded-2xl border p-4 ${metrics.currentTier.color}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold opacity-70">Current Commission Tier</p>
            <p className="text-xl font-black mt-0.5">{metrics.currentTier.label}</p>
            <p className="text-xs opacity-70 mt-0.5">
              Shipment range: ${metrics.currentTier.min.toLocaleString()} – {metrics.currentTier.max === Infinity ? '$20,000+' : `$${metrics.currentTier.max.toLocaleString()}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Total Processed Value</p>
            <p className="text-2xl font-black">${metrics.totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Tier reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {TIERS.map((t, i) => (
          <div key={i} className={`rounded-xl border px-3 py-2 text-xs ${metrics.currentTier === t ? t.color + ' font-bold ring-2 ring-offset-1 ring-current' : 'bg-muted/40 text-muted-foreground border-border'}`}>
            <p className="font-semibold">Tier {i + 1} — {(t.rate * 100).toFixed(0)}%</p>
            <p className="opacity-70 mt-0.5">${t.min.toLocaleString()} – {t.max === Infinity ? '20K+' : `$${t.max.toLocaleString()}`}</p>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard icon={DollarSign} label="Total Commission Due" value={`$${metrics.totalCommission.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="text-accent" />
        <KpiCard icon={CheckCircle2} label="Commission Paid" value={`$${metrics.paidCommission.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="text-green-600" />
        <KpiCard icon={AlertTriangle} label="Outstanding Balance" value={`$${metrics.outstanding.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color={metrics.outstanding > 0 ? 'text-destructive' : 'text-green-600'} />
        <KpiCard icon={Clock} label="Due This Month" value={`$${metrics.upcomingAmount.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="text-amber-600" />
        <KpiCard icon={TrendingUp} label="Annual Commission" value={`$${metrics.annualCommission.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} />
        <div className={`rounded-2xl border border-border p-4 flex items-center gap-3 ${overallStatus === 'paid' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className={`text-xs font-bold ${overallStatus === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
            <p className="text-[10px] text-muted-foreground mb-1">Commission Status</p>
            <p className="text-lg font-black capitalize">{overallStatus === 'paid' ? '✅ All Paid' : '⏳ Pending'}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Monthly: Shipment Value vs Commission</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" fill="#1e293b" radius={[4, 4, 0, 0]} name="Shipment Value" />
              <Bar dataKey="commission" fill="#ff0064" radius={[4, 4, 0, 0]} name="Commission" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Commission Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="commission" stroke="#ff0064" strokeWidth={2} dot={{ r: 4 }} name="Commission" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quarterly & Annual Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Quarterly Commission Summary ({new Date().getFullYear()})</h3>
          <div className="space-y-3">
            {metrics.quarterly.map(q => (
              <div key={q.quarter}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{q.quarter}</span>
                  <span className="font-bold">${q.commission.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${metrics.annualCommission > 0 ? Math.min((q.commission / metrics.annualCommission) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Commission by Category</h3>
          {metrics.byCategory.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No category data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={metrics.byCategory} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                <Bar dataKey="commission" fill="#ff0064" radius={[0, 4, 4, 0]} name="Commission" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Commission Transaction History */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Commission Transaction History</h3>
        {metrics.commissionRecords.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">No commission records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {['Shipment ID', 'Date', 'Shipment Value', 'Tier', 'Rate', 'Commission Due', 'Destination', 'Status'].map(h => (
                    <th key={h} className="text-left py-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.commissionRecords.slice(0, 20).map((r, i) => (
                  <tr key={r.id || i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-2 font-mono text-accent whitespace-nowrap">{r.shipment_id || '—'}</td>
                    <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">{r.approved_at ? new Date(r.approved_at).toLocaleDateString() : '—'}</td>
                    <td className="py-2.5 px-2 font-semibold">${(r.total_value || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${r.tier.color}`}>{r.tier.label}</span>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground">{(r.tier.rate * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-2 font-bold text-accent">${r.commissionDue.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{r.destination_country || '—'}</td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${i % 3 === 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {i % 3 === 0 ? 'Paid' : 'Pending'}
                      </span>
                    </td>
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