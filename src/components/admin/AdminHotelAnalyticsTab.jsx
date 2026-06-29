import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Hotel, TrendingUp, MapPin, Package } from 'lucide-react';

function KpiCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminHotelAnalyticsTab({ data }) {
  const { orders, hotels } = data;

  const metrics = useMemo(() => {
    const activeHotels = hotels.filter(h => h.active !== false);
    const inactiveHotels = hotels.filter(h => h.active === false);

    const countryMap = {};
    hotels.forEach(h => { if (h.country) countryMap[h.country] = (countryMap[h.country] || 0) + 1; });
    const byCountry = Object.entries(countryMap).map(([c, n]) => ({ country: c.slice(0, 14), count: n })).sort((a, b) => b.count - a.count).slice(0, 8);

    const cityMap = {};
    hotels.forEach(h => { if (h.city) cityMap[h.city] = (cityMap[h.city] || 0) + 1; });
    const byCity = Object.entries(cityMap).map(([c, n]) => ({ city: c.slice(0, 12), count: n })).sort((a, b) => b.count - a.count).slice(0, 8);

    const hotelStats = {};
    orders.forEach(o => {
      if (!o.hotel_name) return;
      if (!hotelStats[o.hotel_name]) hotelStats[o.hotel_name] = { name: o.hotel_name, shipments: 0, revenue: 0, boxes: 0 };
      hotelStats[o.hotel_name].shipments++;
      if (o.payment_status === 'paid') {
        hotelStats[o.hotel_name].revenue += (o.price || 60);
        hotelStats[o.hotel_name].boxes++;
      }
    });
    const topHotels = Object.values(hotelStats).sort((a, b) => b.shipments - a.shipments).slice(0, 10);
    const topByRevenue = Object.values(hotelStats).sort((a, b) => b.revenue - a.revenue).slice(0, 6).map(h => ({ name: h.name.slice(0, 18), revenue: h.revenue }));

    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const count = orders.filter(o => {
        const cd = new Date(o.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear() && o.hotel_name;
      }).length;
      return { month: d.toLocaleString('default', { month: 'short' }), shipments: count };
    });

    return { activeHotels, inactiveHotels, byCountry, byCity, topHotels, topByRevenue, monthly };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Hotel} label="Total Hotels" value={hotels.length} />
        <KpiCard icon={TrendingUp} label="Active Hotels" value={metrics.activeHotels.length} />
        <KpiCard icon={Hotel} label="Inactive Hotels" value={metrics.inactiveHotels.length} />
        <KpiCard icon={MapPin} label="Countries Covered" value={new Set(hotels.map(h => h.country).filter(Boolean)).size} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Hotels by Country</h3>
          {metrics.byCountry.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data yet</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.byCountry}>
                <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ff0064" radius={[4, 4, 0, 0]} name="Hotels" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">Monthly Shipments from Hotels</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="shipments" stroke="#ff0064" strokeWidth={2} dot={{ r: 4 }} name="Shipments" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Revenue Generated per Hotel (Top 6)</h3>
        {metrics.topByRevenue.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.topByRevenue} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `US$${v}`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={v => [`US$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1e293b" radius={[0, 4, 4, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">Top Performing Hotels — Shipment Volume</h3>
        {metrics.topHotels.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hotel shipment data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['#', 'Hotel Name', 'Total Shipments', 'Boxes Sold', 'Revenue'].map(h => (
                    <th key={h} className={`text-xs text-muted-foreground font-semibold pb-2 ${h === '#' ? 'text-left pr-3' : h === 'Hotel Name' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.topHotels.map((h, i) => (
                  <tr key={h.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="py-2.5 font-medium text-foreground text-xs">{h.name}</td>
                    <td className="py-2.5 text-right text-xs">{h.shipments}</td>
                    <td className="py-2.5 text-right text-xs">{h.boxes}</td>
                    <td className="py-2.5 text-right text-xs font-bold text-accent">${h.revenue.toLocaleString()}</td>
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