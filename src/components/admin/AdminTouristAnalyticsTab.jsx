import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Package, DollarSign, Globe } from 'lucide-react';

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

export default function AdminTouristAnalyticsTab({ data }) {
  const { orders, users } = data;

  const metrics = useMemo(() => {
    const tourists = (users || []).filter(u => u.role !== 'admin');
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const completedOrders = orders.filter(o => ['delivered', 'in_transit', 'packed'].includes(o.status));
    const pendingOrders = orders.filter(o => ['pending', 'receipt_uploaded', 'payment_pending'].includes(o.status));
    const avgOrderValue = paidOrders.length ? Math.round(paidOrders.reduce((s, o) => s + (o.price || 60), 0) / paidOrders.length) : 0;

    // Repeat users: users with more than 1 order
    const userOrderCount = {};
    orders.forEach(o => { if (o.created_by_id) userOrderCount[o.created_by_id] = (userOrderCount[o.created_by_id] || 0) + 1; });
    const repeatUsers = Object.values(userOrderCount).filter(c => c > 1).length;

    // New registrations per month (last 6 months)
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const newUsers = tourists.filter(u => {
        const cd = new Date(u.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      const newOrders = orders.filter(o => {
        const cd = new Date(o.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      return { month: d.toLocaleString('default', { month: 'short' }), registrations: newUsers, orders: newOrders };
    });

    // Top destination countries by tourists
    const destMap = {};
    orders.forEach(o => { if (o.destination_country) destMap[o.destination_country] = (destMap[o.destination_country] || 0) + 1; });
    const topDests = Object.entries(destMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => ({ country: c.slice(0, 14), shipments: n }));

    return { tourists, paidOrders, completedOrders, pendingOrders, avgOrderValue, repeatUsers, monthly, topDests };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={Users} label="Total Tourists" value={metrics.tourists.length} />
        <KpiCard icon={TrendingUp} label="Repeat Users" value={metrics.repeatUsers} />
        <KpiCard icon={Package} label="Completed Shipments" value={metrics.completedOrders.length} />
        <KpiCard icon={Package} label="Pending Shipments" value={metrics.pendingOrders.length} />
        <KpiCard icon={DollarSign} label="Avg Order Value" value={`US$${metrics.avgOrderValue}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">New Registrations & Orders (6 Months)</h3>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={metrics.monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="registrations" stroke="#ff0064" strokeWidth={2} dot={{ r: 3 }} name="New Users" />
              <Line type="monotone" dataKey="orders" stroke="#1e293b" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Top Tourist Destinations</h3>
          {metrics.topDests.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data yet</p> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={metrics.topDests} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="shipments" fill="#ff0064" radius={[0, 4, 4, 0]} name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">User Activity Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Registered', value: metrics.tourists.length, color: 'text-foreground' },
            { label: 'Have Placed Orders', value: Object.keys(orders.reduce((m, o) => { if (o.created_by_id) m[o.created_by_id] = 1; return m; }, {})).length, color: 'text-accent' },
            { label: 'Repeat Users', value: metrics.repeatUsers, color: 'text-green-600' },
            { label: 'Paid Shipments', value: metrics.paidOrders.length, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted/40 rounded-xl p-4 text-center">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}