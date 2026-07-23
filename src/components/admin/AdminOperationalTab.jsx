import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Clock, AlertTriangle, CheckCircle2, Zap, Download, MousePointerClick } from 'lucide-react';
import OperationalDrillDown from './OperationalDrillDown';

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

function StatusRow({ label, value, total, color, onClick }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <button type="button" disabled={value === 0} onClick={onClick}
      className={`flex items-center gap-3 w-full text-left rounded-lg ${value > 0 ? 'hover:bg-accent/5' : 'cursor-default'} px-1 py-0.5 transition-colors`}>
      <div className="w-36 shrink-0">
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-20 text-right shrink-0 flex items-center justify-end gap-1">
        <span className="text-xs font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground"> ({pct}%)</span>
        {value > 0 && <MousePointerClick className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />}
      </div>
    </button>
  );
}

export default function AdminOperationalTab({ data }) {
  const { orders, verifications, retailers } = data;
  const [drillDown, setDrillDown] = useState(null);

  const metrics = useMemo(() => {
    // Avg processing time: order created → paid (hours)
    const processingTimes = orders
      .filter(o => o.payment_status === 'paid' && o.created_date && o.updated_date)
      .map(o => (new Date(o.updated_date) - new Date(o.created_date)) / (1000 * 60 * 60));
    const avgProcessingHours = processingTimes.length ? Math.round(processingTimes.reduce((s, t) => s + t, 0) / processingTimes.length) : 0;

    // Avg verification approval time (hours)
    const approvalTimes = verifications
      .filter(v => v.status === 'approved' && v.approved_at && v.created_date)
      .map(v => (new Date(v.approved_at) - new Date(v.created_date)) / (1000 * 60 * 60));
    const avgApprovalHours = approvalTimes.length ? Math.round(approvalTimes.reduce((s, t) => s + t, 0) / approvalTimes.length) : 0;

    // Overdue verifications (past deadline)
    const now = new Date();
    const overdueVerifications = verifications.filter(v => v.status === 'pending' && v.deadline_at && new Date(v.deadline_at) < now);

    // Failed / problem orders
    const failedOrders = orders.filter(o => o.status === 'cancelled');

    // Daily activity (last 14 days)
    const dailyActivity = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - i));
      const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      const dayOrders = orders.filter(o => {
        const cd = new Date(o.created_date);
        return cd.toDateString() === d.toDateString();
      }).length;
      const dayVerif = verifications.filter(v => {
        const cd = new Date(v.created_date);
        return cd.toDateString() === d.toDateString();
      }).length;
      return { day, orders: dayOrders, verifications: dayVerif };
    });

    // Compliance: verifications with government submission
    const submitted = verifications.filter(v => v.customs_ref);
    const complianceRate = verifications.length > 0 ? Math.round((submitted.length / verifications.length) * 100) : 0;

    // Bottleneck analysis
    const bottlenecks = [
      { stage: 'Awaiting Payment', type: 'order', items: orders.filter(o => o.status === 'payment_pending'), subtitle: 'Shipments awaiting online payment' },
      { stage: 'Pending Verification', type: 'verification', items: verifications.filter(v => v.status === 'pending'), subtitle: 'Retailer verifications awaiting action' },
      { stage: 'Queried by Retailer', type: 'verification', items: verifications.filter(v => v.status === 'queried'), subtitle: 'Verifications queried by retailers' },
      { stage: 'Overdue Verifications', type: 'verification', items: overdueVerifications, subtitle: 'Verifications past their 24h deadline' },
      { stage: 'Pending Retailer Approval', type: 'retailer', items: retailers.filter(r => r.status === 'pending'), subtitle: 'Retailer registrations awaiting admin review' },
    ].map(b => ({ ...b, count: b.items.length }))
      .filter(b => b.count > 0)
      .sort((a, b) => b.count - a.count);

    return { avgProcessingHours, avgApprovalHours, overdueVerifications, failedOrders, dailyActivity, complianceRate, submitted, bottlenecks };
  }, [data]);

  const handleExport = () => {
    const rows = [['Date', 'Orders', 'Verifications']];
    metrics.dailyActivity.forEach(d => rows.push([d.day, d.orders, d.verifications]));
    rows.push([]);
    rows.push(['Bottleneck Stage', 'Count']);
    metrics.bottlenecks.forEach(b => rows.push([b.stage, b.count]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `operational_report_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleExport} className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-foreground border border-border rounded-xl bg-card hover:border-accent transition-colors">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Clock} label="Avg Processing Time" value={`${metrics.avgProcessingHours}h`} />
        <KpiCard icon={Zap} label="Avg Approval Time" value={`${metrics.avgApprovalHours}h`} />
        <KpiCard icon={AlertTriangle} label="Overdue Verifications" value={metrics.overdueVerifications.length} color={metrics.overdueVerifications.length > 0 ? 'text-red-600' : 'text-green-600'} />
        <KpiCard icon={CheckCircle2} label="Compliance Rate" value={`${metrics.complianceRate}%`} color={metrics.complianceRate >= 80 ? 'text-green-600' : 'text-yellow-600'} />
      </div>

      {/* Daily Activity */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Daily Activity — Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metrics.dailyActivity}>
            <XAxis dataKey="day" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#ff0064" strokeWidth={2} dot={false} name="Orders" />
            <Line type="monotone" dataKey="verifications" stroke="#1e293b" strokeWidth={2} dot={false} name="Verifications" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bottlenecks */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Current Workflow Bottlenecks</h3>
          {metrics.bottlenecks.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 py-4">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-semibold">No bottlenecks detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.bottlenecks.map(b => (
                <button key={b.stage} onClick={() => setDrillDown({ title: b.stage, subtitle: b.subtitle, type: b.type, items: b.items })}
                  className="w-full flex items-center justify-between bg-muted/40 hover:bg-accent/10 rounded-xl px-4 py-3 transition-colors group">
                  <div className="flex items-center gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground">{b.stage}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${b.count > 5 ? 'text-red-600' : 'text-yellow-600'}`}>{b.count}</span>
                    <MousePointerClick className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shipment Pipeline Status */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Order Pipeline Status</h3>
          <div className="space-y-3">
            {[
              { label: 'New Orders Awaiting Processing', items: orders.filter(o => o.status === 'pending'), color: 'bg-gray-400', subtitle: 'New shipments awaiting receipt upload' },
              { label: 'Receipt Uploaded', items: orders.filter(o => o.status === 'receipt_uploaded'), color: 'bg-blue-400', subtitle: 'Receipts uploaded — awaiting payment' },
              { label: 'Payment Pending', items: orders.filter(o => o.status === 'payment_pending'), color: 'bg-yellow-400', subtitle: 'Shipments awaiting online payment' },
              { label: 'Paid / Processing', items: orders.filter(o => ['paid', 'packed'].includes(o.status)), color: 'bg-accent', subtitle: 'Paid shipments being packed' },
              { label: 'In Transit', items: orders.filter(o => o.status === 'in_transit'), color: 'bg-purple-400', subtitle: 'Shipments en route to destination' },
              { label: 'Delivered', items: orders.filter(o => o.status === 'delivered'), color: 'bg-green-500', subtitle: 'Successfully delivered shipments' },
              { label: 'Cancelled', items: orders.filter(o => o.status === 'cancelled'), color: 'bg-red-400', subtitle: 'Cancelled shipments' },
            ].map(s => (
              <div key={s.label} className="group">
                <StatusRow
                  label={s.label}
                  value={s.items.length}
                  total={Math.max(orders.length, 1)}
                  color={s.color}
                  onClick={() => setDrillDown({ title: s.label, subtitle: s.subtitle, type: 'order', items: s.items })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Government / Compliance Summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Government Compliance & Submission</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Verifications', value: verifications.length, color: 'text-foreground' },
            { label: 'With Customs Ref', value: metrics.submitted.length, color: 'text-green-600' },
            { label: 'Pending Submission', value: verifications.length - metrics.submitted.length, color: 'text-yellow-600' },
            { label: 'Compliance Rate', value: `${metrics.complianceRate}%`, color: metrics.complianceRate >= 80 ? 'text-green-600' : 'text-yellow-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted/40 rounded-xl p-4 text-center">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <OperationalDrillDown
        open={!!drillDown}
        title={drillDown?.title}
        subtitle={drillDown?.subtitle}
        type={drillDown?.type}
        items={drillDown?.items || []}
        onClose={() => setDrillDown(null)}
      />
    </div>
  );
}