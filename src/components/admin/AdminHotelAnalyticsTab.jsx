import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Hotel, TrendingUp, MapPin, Download, FileText, MousePointerClick } from 'lucide-react';
import HotelProfileDrawer from './HotelProfileDrawer';

const PERIODS = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: 'quarter', label: 'Quarter', days: 90 },
  { key: 'year', label: 'Year', days: 365 },
];

function inRange(dateStr, start) {
  if (!dateStr) return false;
  return new Date(dateStr) >= start;
}

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
  const [periodKey, setPeriodKey] = useState('month');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const period = PERIODS.find(p => p.key === periodKey);

  const metrics = useMemo(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period.days);
    const fOrders = orders.filter(o => inRange(o.created_date, startDate));

    const activeHotels = hotels.filter(h => h.active !== false);
    const inactiveHotels = hotels.filter(h => h.active === false);

    // Country/city distribution — all-time (hotel roster doesn't change with period)
    const countryMap = {};
    hotels.forEach(h => { if (h.country) countryMap[h.country] = (countryMap[h.country] || 0) + 1; });
    const byCountry = Object.entries(countryMap).map(([c, n]) => ({ country: c.slice(0, 14), count: n })).sort((a, b) => b.count - a.count).slice(0, 8);

    const cityMap = {};
    hotels.forEach(h => { if (h.city) cityMap[h.city] = (cityMap[h.city] || 0) + 1; });
    const byCity = Object.entries(cityMap).map(([c, n]) => ({ city: c.slice(0, 12), count: n })).sort((a, b) => b.count - a.count).slice(0, 8);

    // Hotel shipment stats — period-filtered
    const hotelStats = {};
    fOrders.forEach(o => {
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
    const totalRevenue = Object.values(hotelStats).reduce((s, h) => s + h.revenue, 0);
    const totalShipments = fOrders.filter(o => o.hotel_name).length;

    // Monthly trend (last 6 months, period-filtered base)
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const count = fOrders.filter(o => {
        const cd = new Date(o.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear() && o.hotel_name;
      }).length;
      return { month: d.toLocaleString('default', { month: 'short' }), shipments: count };
    });

    return { activeHotels, inactiveHotels, byCountry, byCity, topHotels, topByRevenue, monthly, totalRevenue, totalShipments };
  }, [data, periodKey]);

  const findHotelByName = (name) => hotels.find(h => h.name === name);

  const handleExportCSV = () => {
    const rows = [['#', 'Hotel Name', 'Total Shipments', 'Boxes Sold', 'Revenue (US$)']];
    metrics.topHotels.forEach((h, i) => rows.push([i + 1, h.name, h.shipments, h.boxes, h.revenue]));
    rows.push([]);
    rows.push(['Period', period.label, 'Total Shipments', metrics.totalShipments, 'Total Revenue']);
    rows.push(['', '', '', '', metrics.totalRevenue]);
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `hotel_analytics_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const now = new Date().toLocaleString('en-GB');
    doc.setFontSize(16);
    doc.text('Send It Home — Hotel Analytics Report', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated: ${now}  |  Period: ${period.label}`, 14, 25);
    doc.setTextColor(20);

    let y = 36;
    doc.setFontSize(12);
    doc.text('Summary', 14, y); y += 7;
    doc.setFontSize(9);
    const summary = [
      ['Total Hotels', hotels.length],
      ['Active Hotels', metrics.activeHotels.length],
      ['Countries Covered', new Set(hotels.map(h => h.country).filter(Boolean)).size],
      ['Shipments (period)', metrics.totalShipments],
      ['Revenue (period)', `US$${metrics.totalRevenue.toLocaleString()}`],
    ];
    summary.forEach(([k, v]) => { doc.text(`${k}:`, 16, y); doc.text(String(v), 100, y); y += 6; });

    y += 4;
    doc.setFontSize(12);
    doc.text('Top Performing Hotels', 14, y); y += 7;
    doc.setFontSize(9);
    doc.text('#', 16, y); doc.text('Hotel Name', 22, y); doc.text('Shipments', 120, y); doc.text('Boxes', 145, y); doc.text('Revenue', 165, y); y += 6;
    metrics.topHotels.forEach((h, i) => {
      doc.text(String(i + 1), 16, y);
      doc.text(h.name.slice(0, 38), 22, y);
      doc.text(String(h.shipments), 120, y);
      doc.text(String(h.boxes), 145, y);
      doc.text(`US$${h.revenue.toLocaleString()}`, 165, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save(`hotel_analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Period + export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriodKey(p.key)}
              className={`px-4 h-9 rounded-xl text-xs font-bold border transition-colors ${periodKey === p.key ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-foreground border border-border rounded-xl bg-card hover:border-accent transition-colors">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleExportPDF}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-foreground border border-border rounded-xl bg-card hover:border-accent transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

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
          <h3 className="text-sm font-bold mb-4">Monthly Shipments from Hotels <span className="text-xs font-normal text-muted-foreground">(period base)</span></h3>
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
        <h3 className="text-sm font-bold mb-4">Revenue Generated per Hotel (Top 6) <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
        {metrics.topByRevenue.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No revenue data for this period</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.topByRevenue} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `US$${v}`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={v => [`US$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1e293b" radius={[0, 4, 4, 0]} name="Revenue" cursor="pointer"
                onClick={(payload) => {
                  const h = findHotelByName(metrics.topByRevenue[payload.index]?.name);
                  if (h) setSelectedHotel(h);
                }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-1">Top Performing Hotels — Shipment Volume <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click a hotel name to open its profile</p>
        {metrics.topHotels.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hotel shipment data for this period</p>
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
                {metrics.topHotels.map((h, i) => {
                  const hotel = findHotelByName(h.name);
                  return (
                    <tr key={h.name} className="border-b border-border/50 hover:bg-accent/5 transition-colors group">
                      <td className="py-2.5 pr-3 text-xs text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 text-xs">
                        <button onClick={() => hotel && setSelectedHotel(hotel)}
                          className="font-medium text-foreground hover:text-accent flex items-center gap-1.5 text-left">
                          {h.name}
                          {hotel && <MousePointerClick className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                      </td>
                      <td className="py-2.5 text-right text-xs">{h.shipments}</td>
                      <td className="py-2.5 text-right text-xs">{h.boxes}</td>
                      <td className="py-2.5 text-right text-xs font-bold text-accent">US${h.revenue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HotelProfileDrawer
        hotel={selectedHotel}
        orders={orders}
        onClose={() => setSelectedHotel(null)}
      />
    </div>
  );
}