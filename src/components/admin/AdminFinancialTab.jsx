import { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Package, CreditCard } from 'lucide-react';

const COLORS = ['#ff0064', '#1e293b', '#3b82f6', '#10b981', '#f59e0b'];

const PERIODS = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: 'quarter', label: 'Quarter', days: 90 },
  { key: 'year', label: 'Year', days: 365 },
];

function KpiCard({ icon: Icon, label, value, delta, deltaLabel, highlight }) {
  const up = delta > 0;
  const down = delta < 0;
  return (
    <div className={`bg-card border rounded-2xl p-5 ${highlight ? 'border-accent/40 bg-accent/5' : 'border-border'}`}>
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className={`text-2xl font-black ${highlight ? 'text-accent' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {deltaLabel && (
        <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${up ? 'text-green-600' : down ? 'text-red-600' : 'text-muted-foreground'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : down ? <TrendingDown className="w-3 h-3" /> : null}
          {deltaLabel}
        </p>
      )}
    </div>
  );
}

function computeRange(period) {
  const now = new Date();
  const currentEnd = now;
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - period.days);
  const prevEnd = new Date(currentStart);
  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - period.days);
  return { currentStart, currentEnd, prevStart, prevEnd };
}

function inRange(dateStr, start, end) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

function pctDelta(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function fmtDelta(delta) {
  return delta >= 0 ? `+${delta}% vs prev` : `${delta}% vs prev`;
}

export default function AdminFinancialTab({ data }) {
  const { orders, verifications } = data;
  const [periodKey, setPeriodKey] = useState('month');
  const period = PERIODS.find(p => p.key === periodKey);

  const metrics = useMemo(() => {
    const range = computeRange(period);

    const currentPaid = orders.filter(o => o.payment_status === 'paid' && inRange(o.created_date, range.currentStart, range.currentEnd));
    const prevPaid = orders.filter(o => o.payment_status === 'paid' && inRange(o.created_date, range.prevStart, range.prevEnd));
    const currentRefunded = orders.filter(o => o.payment_status === 'refunded' && inRange(o.created_date, range.currentStart, range.currentEnd));
    const prevRefunded = orders.filter(o => o.payment_status === 'refunded' && inRange(o.created_date, range.prevStart, range.prevEnd));
    const currentUnpaid = orders.filter(o => o.payment_status === 'unpaid' && inRange(o.created_date, range.currentStart, range.currentEnd));
    const prevUnpaid = orders.filter(o => o.payment_status === 'unpaid' && inRange(o.created_date, range.prevStart, range.prevEnd));

    const currentComm = verifications.filter(v => v.status === 'approved' && inRange(v.created_date, range.currentStart, range.currentEnd));
    const prevComm = verifications.filter(v => v.status === 'approved' && inRange(v.created_date, range.prevStart, range.prevEnd));

    const shippingRevenue = currentPaid.reduce((s, o) => s + (o.price || 60), 0);
    const prevShippingRevenue = prevPaid.reduce((s, o) => s + (o.price || 60), 0);
    const commissionRevenue = currentComm.reduce((s, v) => s + (v.commission_amount || 0), 0);
    const prevCommissionRevenue = prevComm.reduce((s, v) => s + (v.commission_amount || 0), 0);
    const totalRevenue = shippingRevenue + commissionRevenue;
    const prevTotalRevenue = prevShippingRevenue + prevCommissionRevenue;

    const refundAmount = currentRefunded.reduce((s, o) => s + (o.price || 60), 0);
    const prevRefundAmount = prevRefunded.reduce((s, o) => s + (o.price || 60), 0);

    const currentPaymentAttempts = currentPaid.length + currentUnpaid.length;
    const prevPaymentAttempts = prevPaid.length + prevUnpaid.length;
    const paymentSuccessRate = currentPaymentAttempts > 0 ? Math.round((currentPaid.length / currentPaymentAttempts) * 100) : 0;
    const prevPaymentSuccessRate = prevPaymentAttempts > 0 ? Math.round((prevPaid.length / prevPaymentAttempts) * 100) : 0;

    // 12-month full-history trend (context, unaffected by preset)
    const now = new Date();
    const allPaid = orders.filter(o => o.payment_status === 'paid');
    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const mo = allPaid.filter(o => {
        const cd = new Date(o.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      });
      const comm = verifications.filter(v => v.status === 'approved' && v.created_date).filter(v => {
        const cd = new Date(v.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      });
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        shipping: mo.reduce((s, o) => s + (o.price || 60), 0),
        commission: comm.reduce((s, v) => s + (v.commission_amount || 0), 0),
      };
    });

    // Breakdowns — current period only
    const boxRevenue = {
      '10kg': currentPaid.filter(o => o.box_size === '10kg').reduce((s, o) => s + (o.price || 60), 0),
      '20kg': currentPaid.filter(o => o.box_size === '20kg').reduce((s, o) => s + (o.price || 60), 0),
    };
    const byBox = [
      { name: '10kg Box', value: boxRevenue['10kg'] },
      { name: '20kg Box', value: boxRevenue['20kg'] },
    ].filter(b => b.value > 0);

    const countryRev = {};
    currentPaid.forEach(o => {
      if (o.destination_country) countryRev[o.destination_country] = (countryRev[o.destination_country] || 0) + (o.price || 60);
    });
    const byCountry = Object.entries(countryRev).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, r]) => ({ country: c.slice(0, 14), revenue: r }));

    const hotelRev = {};
    currentPaid.forEach(o => {
      if (o.hotel_name) hotelRev[o.hotel_name] = (hotelRev[o.hotel_name] || 0) + (o.price || 60);
    });
    const byHotel = Object.entries(hotelRev).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([h, r]) => ({ hotel: h.slice(0, 18), revenue: r }));

    return {
      range,
      totalRevenue, shippingRevenue, commissionRevenue, refundAmount, paymentSuccessRate,
      currentPaid, currentRefunded,
      deltas: {
        total: pctDelta(totalRevenue, prevTotalRevenue),
        shipping: pctDelta(shippingRevenue, prevShippingRevenue),
        commission: pctDelta(commissionRevenue, prevCommissionRevenue),
        refund: pctDelta(refundAmount, prevRefundAmount),
        paidCount: pctDelta(currentPaid.length, prevPaid.length),
        success: paymentSuccessRate - prevPaymentSuccessRate,
      },
      byMonth, byBox, byCountry, byHotel,
    };
  }, [data, periodKey]);

  const rangeLabel = `${metrics.range.currentStart.toLocaleDateString('en-GB')} – ${metrics.range.currentEnd.toLocaleDateString('en-GB')}`;

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriodKey(p.key)}
              className={`px-4 h-9 rounded-xl text-xs font-bold border transition-colors ${periodKey === p.key ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Current: {rangeLabel}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Total Revenue" value={`US$${metrics.totalRevenue.toLocaleString()}`} highlight delta={metrics.deltas.total} deltaLabel={fmtDelta(metrics.deltas.total)} />
        <KpiCard icon={TrendingUp} label="Shipping Revenue" value={`US$${metrics.shippingRevenue.toLocaleString()}`} delta={metrics.deltas.shipping} deltaLabel={fmtDelta(metrics.deltas.shipping)} />
        <KpiCard icon={CreditCard} label="Payment Success" value={`${metrics.paymentSuccessRate}%`} delta={metrics.deltas.success} deltaLabel={`${metrics.deltas.success >= 0 ? '+' : ''}${metrics.deltas.success}pp vs prev`} />
        <KpiCard icon={Package} label="Refund Amount" value={`US$${metrics.refundAmount.toLocaleString()}`} delta={metrics.deltas.refund} deltaLabel={`${metrics.currentRefunded.length} orders · ${fmtDelta(metrics.deltas.refund)}`} />
      </div>

      {/* 12-month revenue trend */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-1">12-Month Revenue Trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Full-history context (independent of selected period)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={metrics.byMonth}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `US$${v}`} />
            <Tooltip formatter={v => [`US$${v}`, '']} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="shipping" stackId="a" fill="#ff0064" name="Shipping" />
            <Bar dataKey="commission" stackId="a" fill="#1e293b" radius={[4, 4, 0, 0]} name="Commission" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Revenue by Box Type <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
          {metrics.byBox.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No data for this period</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={metrics.byBox} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                    {metrics.byBox.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`US$${v}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {metrics.byBox.map((b, i) => (
                  <div key={b.name} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i] }} />
                      {b.name}
                    </span>
                    <span className="font-bold">US${b.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 col-span-1 lg:col-span-2">
          <h3 className="text-sm font-bold mb-4">Revenue by Destination Country <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
          {metrics.byCountry.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data for this period</p> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={metrics.byCountry} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `US$${v}`} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={v => [`US$${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#ff0064" radius={[0, 4, 4, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Revenue by Hotel (Top 6) <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
        {metrics.byHotel.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data for this period</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.byHotel} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `US$${v}`} />
              <YAxis dataKey="hotel" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={v => [`US$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1e293b" radius={[0, 4, 4, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Shipping Revenue', value: `US$${metrics.shippingRevenue.toLocaleString()}`, sub: `${metrics.currentPaid.length} paid orders`, delta: metrics.deltas.shipping },
          { label: 'Commission Revenue', value: `US$${metrics.commissionRevenue.toLocaleString()}`, sub: 'From retailer approvals', delta: metrics.deltas.commission },
          { label: 'Paid Orders', value: metrics.currentPaid.length, sub: fmtDelta(metrics.deltas.paidCount), delta: metrics.deltas.paidCount },
        ].map(({ label, value, sub, delta }) => (
          <div key={label} className="bg-muted/40 rounded-2xl p-5 text-center">
            <p className="text-2xl font-black text-foreground">{value}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">{label}</p>
            <p className={`text-xs mt-0.5 ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}