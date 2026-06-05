import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, Hotel, Store, Users, Package, TrendingUp, Activity, Globe } from 'lucide-react';

const COLORS = ['#ff0064', '#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

function KpiCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-600 font-semibold mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminExecutiveTab({ data }) {
  const { orders, verifications, retailers, hotels, users } = data;

  const metrics = useMemo(() => {
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.price || 60), 0);
    const commissionRevenue = verifications.filter(v => v.status === 'approved').reduce((s, v) => s + (v.commission_amount || 0), 0);
    const totalEarnings = totalRevenue + commissionRevenue;
    const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;
    const activeHotels = hotels.filter(h => h.active !== false).length;
    const activeRetailers = retailers.filter(r => r.status === 'approved').length;
    const tourists = (users || []).filter(u => u.role !== 'admin');

    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const mo = paidOrders.filter(o => {
        const cd = new Date(o.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      });
      return { month: label, revenue: mo.reduce((s, o) => s + (o.price || 60), 0), shipments: mo.length };
    });

    const statusData = [
      { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
      { name: 'In Transit', value: orders.filter(o => o.status === 'in_transit').length },
      { name: 'Paid/Packed', value: orders.filter(o => ['paid', 'packed'].includes(o.status)).length },
      { name: 'Pending', value: orders.filter(o => ['pending', 'receipt_uploaded', 'payment_pending'].includes(o.status)).length },
      { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
    ].filter(d => d.value > 0);

    const countryMap = {};
    orders.forEach(o => { if (o.destination_country) countryMap[o.destination_country] = (countryMap[o.destination_country] || 0) + 1; });
    const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([country, count]) => ({ country: country.slice(0, 14), count }));

    return { totalEarnings, totalRevenue, commissionRevenue, avgOrderValue, activeHotels, activeRetailers, tourists, monthlyData, statusData, topCountries, paidOrders };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={DollarSign} label="Total Revenue" value={`$${metrics.totalEarnings.toLocaleString()}`} />
        <KpiCard icon={Hotel} label="Active Hotels" value={metrics.activeHotels} />
        <KpiCard icon={Store} label="Active Retailers" value={metrics.activeRetailers} />
        <KpiCard icon={Users} label="Tourists" value={metrics.tourists.length} />
        <KpiCard icon={Package} label="Total Shipments" value={orders.length} />
        <KpiCard icon={TrendingUp} label="Avg Order Value" value={`$${metrics.avgOrderValue}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Monthly Revenue & Shipments</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `$${v}` : v, n === 'revenue' ? 'Revenue' : 'Shipments']} />
              <Legend />
              <Bar dataKey="revenue" fill="#ff0064" radius={[4, 4, 0, 0]} name="Revenue ($)" />
              <Bar dataKey="shipments" fill="#1e293b" radius={[4, 4, 0, 0]} name="Shipments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Shipment Status Distribution</h3>
          {metrics.statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={metrics.statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                  {metrics.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Top Destination Countries</h3>
          {metrics.topCountries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.topCountries} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#ff0064" radius={[0, 4, 4, 0]} name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Operational Health</h3>
          <div className="space-y-4 mt-2">
            {[
              { label: 'Pending Verifications', value: verifications.filter(v => v.status === 'pending').length, total: Math.max(verifications.length, 1), color: 'bg-yellow-400' },
              { label: 'Approved Verifications', value: verifications.filter(v => v.status === 'approved').length, total: Math.max(verifications.length, 1), color: 'bg-green-500' },
              { label: 'Paid Orders', value: metrics.paidOrders.length, total: Math.max(orders.length, 1), color: 'bg-accent' },
              { label: 'Pending Retailers', value: retailers.filter(r => r.status === 'pending').length, total: Math.max(retailers.length, 1), color: 'bg-blue-500' },
            ].map(({ label, value, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold text-foreground">{value} / {total}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.round((value / total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Shipping Revenue', value: `$${metrics.totalRevenue.toLocaleString()}`, sub: 'From paid orders', icon: Package },
          { label: 'Retailer Commission', value: `$${metrics.commissionRevenue.toLocaleString()}`, sub: 'From approved verifications', icon: Store },
          { label: 'Total Platform Revenue', value: `$${metrics.totalEarnings.toLocaleString()}`, sub: 'Combined earnings', icon: DollarSign },
        ].map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-black text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}