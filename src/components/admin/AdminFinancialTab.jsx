import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Package, CreditCard } from 'lucide-react';

const COLORS = ['#ff0064', '#1e293b', '#3b82f6', '#10b981', '#f59e0b'];

function KpiCard({ icon: Icon, label, value, sub, highlight }) {
  return (
    <div className={`bg-card border rounded-2xl p-5 ${highlight ? 'border-accent/40 bg-accent/5' : 'border-border'}`}>
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className={`text-2xl font-black ${highlight ? 'text-accent' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminFinancialTab({ data }) {
  const { orders, verifications } = data;

  const metrics = useMemo(() => {
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const refundedOrders = orders.filter(o => o.payment_status === 'refunded');
    const unpaidOrders = orders.filter(o => o.payment_status === 'unpaid');
    const shippingRevenue = paidOrders.reduce((s, o) => s + (o.price || 60), 0);
    const commissionRevenue = verifications.filter(v => v.status === 'approved').reduce((s, v) => s + (v.commission_amount || 0), 0);
    const totalRevenue = shippingRevenue + commissionRevenue;
    const paymentSuccessRate = orders.length > 0 ? Math.round((paidOrders.length / orders.filter(o => ['paid', 'unpaid'].includes(o.payment_status)).length) * 100) || 0 : 0;
    const refundAmount = refundedOrders.reduce((s, o) => s + (o.price || 60), 0);

    const now = new Date();

    // Revenue by period
    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const mo = paidOrders.filter(o => {
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

    const thisMonth = byMonth[byMonth.length - 1];
    const lastMonth = byMonth[byMonth.length - 2];
    const monthlyRevenue = (thisMonth.shipping + thisMonth.commission);
    const prevMonthRevenue = (lastMonth.shipping + lastMonth.commission);
    const monthGrowth = prevMonthRevenue > 0 ? Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;

    // Revenue by box type
    const boxRevenue = {
      '10kg': paidOrders.filter(o => o.box_size === '10kg').reduce((s, o) => s + (o.price || 60), 0),
      '20kg': paidOrders.filter(o => o.box_size === '20kg').reduce((s, o) => s + (o.price || 60), 0),
    };
    const byBox = [
      { name: '10kg Box', value: boxRevenue['10kg'] },
      { name: '20kg Box', value: boxRevenue['20kg'] },
    ].filter(b => b.value > 0);

    // Revenue by country
    const countryRev = {};
    paidOrders.forEach(o => {
      if (o.destination_country) countryRev[o.destination_country] = (countryRev[o.destination_country] || 0) + (o.price || 60);
    });
    const byCountry = Object.entries(countryRev).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, r]) => ({ country: c.slice(0, 14), revenue: r }));

    // Revenue by hotel
    const hotelRev = {};
    paidOrders.forEach(o => {
      if (o.hotel_name) hotelRev[o.hotel_name] = (hotelRev[o.hotel_name] || 0) + (o.price || 60);
    });
    const byHotel = Object.entries(hotelRev).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([h, r]) => ({ hotel: h.slice(0, 18), revenue: r }));

    return { totalRevenue, shippingRevenue, commissionRevenue, refundAmount, paymentSuccessRate, monthlyRevenue, monthGrowth, byMonth, byBox, byCountry, byHotel, paidOrders, refundedOrders };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Total Revenue" value={`US$${metrics.totalRevenue.toLocaleString()}`} highlight />
        <KpiCard icon={TrendingUp} label="This Month" value={`US$${metrics.monthlyRevenue.toLocaleString()}`} sub={metrics.monthGrowth >= 0 ? `+${metrics.monthGrowth}% vs last month` : `${metrics.monthGrowth}% vs last month`} />
        <KpiCard icon={CreditCard} label="Payment Success" value={`${metrics.paymentSuccessRate}%`} />
        <KpiCard icon={Package} label="Refund Amount" value={`US$${metrics.refundAmount.toLocaleString()}`} sub={`${metrics.refundedOrders.length} orders`} />
      </div>

      {/* 12-month revenue trend */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">12-Month Revenue Trend</h3>
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
          <h3 className="text-sm font-bold mb-4">Revenue by Box Type</h3>
          {metrics.byBox.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
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
          <h3 className="text-sm font-bold mb-4">Revenue by Destination Country</h3>
          {metrics.byCountry.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data yet</p> : (
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
        <h3 className="text-sm font-bold mb-4">Revenue by Hotel (Top 6)</h3>
        {metrics.byHotel.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data yet</p> : (
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
          { label: 'Shipping Revenue', value: `US$${metrics.shippingRevenue.toLocaleString()}`, sub: `${metrics.paidOrders.length} paid orders` },
          { label: 'Commission Revenue', value: `US$${metrics.commissionRevenue.toLocaleString()}`, sub: 'From retailer approvals' },
          { label: 'Refund Exposure', value: `US$${metrics.refundAmount.toLocaleString()}`, sub: `${metrics.refundedOrders.length} refunded orders` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-muted/40 rounded-2xl p-5 text-center">
            <p className="text-2xl font-black text-foreground">{value}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}