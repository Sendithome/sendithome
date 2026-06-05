import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell } from 'recharts';
import { Package, CheckCircle2, Clock, XCircle, Globe } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  queried: '#3b82f6',
  overdue: '#f97316',
  cancelled: '#ef4444',
};

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

export default function AdminShipmentAnalyticsTab({ data }) {
  const { orders, verifications, retailers, hotels } = data;

  const metrics = useMemo(() => {
    const statuses = ['pending', 'approved', 'queried', 'overdue', 'cancelled'];
    const verificationByStatus = statuses.map(s => ({
      status: s.charAt(0).toUpperCase() + s.slice(1),
      count: verifications.filter(v => v.status === s).length,
      fill: STATUS_COLORS[s],
    })).filter(s => s.count > 0);

    // Order status funnel
    const orderFunnel = [
      { step: 'Order Created', count: orders.length },
      { step: 'Receipt Uploaded', count: orders.filter(o => ['receipt_uploaded', 'payment_pending', 'paid', 'packed', 'picked_up', 'in_transit', 'delivered'].includes(o.status)).length },
      { step: 'Payment Completed', count: orders.filter(o => o.payment_status === 'paid').length },
      { step: 'In Transit / Delivered', count: orders.filter(o => ['in_transit', 'delivered'].includes(o.status)).length },
    ];

    // By country
    const countryMap = {};
    verifications.forEach(v => { if (v.destination_country) countryMap[v.destination_country] = (countryMap[v.destination_country] || 0) + 1; });
    const byCountry = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => ({ country: c.slice(0, 14), count: n }));

    // By hotel
    const hotelMap = {};
    verifications.forEach(v => { if (v.hotel_name) hotelMap[v.hotel_name] = (hotelMap[v.hotel_name] || 0) + 1; });
    const byHotel = Object.entries(hotelMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([h, n]) => ({ hotel: h.slice(0, 18), count: n }));

    // By retailer
    const retailerMap = {};
    verifications.forEach(v => {
      const r = retailers.find(r => r.id === v.retailer_id);
      const name = r ? (r.brand_name || r.store_name) : (v.store_name || 'Unknown');
      retailerMap[name] = (retailerMap[name] || 0) + 1;
    });
    const byRetailer = Object.entries(retailerMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([r, n]) => ({ retailer: r.slice(0, 16), count: n }));

    return { verificationByStatus, orderFunnel, byCountry, byHotel, byRetailer };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Package} label="Total Verifications" value={verifications.length} />
        <KpiCard icon={Clock} label="Pending" value={verifications.filter(v => v.status === 'pending').length} color="text-yellow-600" />
        <KpiCard icon={CheckCircle2} label="Approved" value={verifications.filter(v => v.status === 'approved').length} color="text-green-600" />
        <KpiCard icon={XCircle} label="Cancelled" value={verifications.filter(v => v.status === 'cancelled').length} color="text-red-600" />
      </div>

      {/* Order Funnel */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Shipment Processing Funnel</h3>
        <div className="space-y-3">
          {metrics.orderFunnel.map((step, i) => {
            const pct = metrics.orderFunnel[0].count > 0 ? Math.round((step.count / metrics.orderFunnel[0].count) * 100) : 0;
            return (
              <div key={step.step}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{step.step}</span>
                  <span className="font-bold text-foreground">{step.count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification status breakdown */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Verification Status Breakdown</h3>
        {metrics.verificationByStatus.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data yet</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.verificationByStatus}>
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                {metrics.verificationByStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Volume by Destination Country</h3>
          {metrics.byCountry.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data yet</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.byCountry} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#ff0064" radius={[0, 4, 4, 0]} name="Verifications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Volume by Retailer</h3>
          {metrics.byRetailer.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data yet</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.byRetailer} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="retailer" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e293b" radius={[0, 4, 4, 0]} name="Verifications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}