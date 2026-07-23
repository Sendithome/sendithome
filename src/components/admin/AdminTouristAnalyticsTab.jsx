import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Package, DollarSign, MousePointerClick, ShoppingCart } from 'lucide-react';
import OperationalDrillDown from './OperationalDrillDown';

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
  const [periodKey, setPeriodKey] = useState('month');
  const [filterDestination, setFilterDestination] = useState('all');
  const [filterNationality, setFilterNationality] = useState('all');
  const [filterHotel, setFilterHotel] = useState('all');
  const [drillDown, setDrillDown] = useState(null);

  const period = PERIODS.find(p => p.key === periodKey);

  const destinations = useMemo(() => [...new Set(orders.map(o => o.destination_country).filter(Boolean))].sort(), [orders]);
  const nationalities = useMemo(() => [...new Set(orders.map(o => o.nationality).filter(Boolean))].sort(), [orders]);
  const hotelNames = useMemo(() => [...new Set(orders.map(o => o.hotel_name).filter(Boolean))].sort(), [orders]);

  const metrics = useMemo(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period.days);

    const matchFilters = (o) => {
      if (!inRange(o.created_date, startDate)) return false;
      if (filterDestination !== 'all' && o.destination_country !== filterDestination) return false;
      if (filterNationality !== 'all' && o.nationality !== filterNationality) return false;
      if (filterHotel !== 'all' && o.hotel_name !== filterHotel) return false;
      return true;
    };

    const fOrders = orders.filter(matchFilters);
    const fTourists = (users || []).filter(u => u.role !== 'admin' && inRange(u.created_date, startDate));

    const paidOrders = fOrders.filter(o => o.payment_status === 'paid');
    const completedOrders = fOrders.filter(o => ['delivered', 'in_transit', 'packed'].includes(o.status));
    const pendingOrders = fOrders.filter(o => ['pending', 'receipt_uploaded', 'payment_pending'].includes(o.status));
    const avgOrderValue = paidOrders.length ? Math.round(paidOrders.reduce((s, o) => s + (o.price || 60), 0) / paidOrders.length) : 0;

    // Average spend per tourist (distinct creators of paid orders)
    const spendByTourist = {};
    paidOrders.forEach(o => { if (o.created_by_id) spendByTourist[o.created_by_id] = (spendByTourist[o.created_by_id] || 0) + (o.price || 60); });
    const distinctTouristCount = Object.keys(spendByTourist).length;
    const avgSpendPerTourist = distinctTouristCount > 0 ? Math.round(Object.values(spendByTourist).reduce((s, v) => s + v, 0) / distinctTouristCount) : 0;

    // Average items per shipment
    const ordersWithItems = fOrders.filter(o => o.items_count > 0);
    const avgItemsPerShipment = ordersWithItems.length > 0
      ? (ordersWithItems.reduce((s, o) => s + (o.items_count || 0), 0) / ordersWithItems.length).toFixed(1)
      : '0.0';

    // Repeat users (within filtered orders)
    const userOrderCount = {};
    fOrders.forEach(o => { if (o.created_by_id) userOrderCount[o.created_by_id] = (userOrderCount[o.created_by_id] || 0) + 1; });
    const repeatUsers = Object.values(userOrderCount).filter(c => c > 1).length;

    // Monthly trend (last 6 months, filtered set)
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const newUsers = fTourists.filter(u => {
        const cd = new Date(u.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      const newOrders = fOrders.filter(o => {
        const cd = new Date(o.created_date);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      return { month: d.toLocaleString('default', { month: 'short' }), registrations: newUsers, orders: newOrders };
    });

    const buildBreakdown = (field, labelKey, limit) => {
      const map = {};
      fOrders.forEach(o => { if (o[field]) map[o[field]] = (map[o[field]] || 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([c, n]) => ({
        [labelKey]: c.slice(0, 14), shipments: n,
        items: fOrders.filter(o => o[field] === c),
      }));
    };
    const topDests = buildBreakdown('destination_country', 'country', 8);
    const byNationality = buildBreakdown('nationality', 'nationality', 8);
    const byHotel = buildBreakdown('hotel_name', 'hotel', 6);

    return {
      fOrders, fTourists, paidOrders, completedOrders, pendingOrders,
      avgOrderValue, avgSpendPerTourist, avgItemsPerShipment, repeatUsers,
      monthly, topDests, byNationality, byHotel,
      registeredCount: Object.keys(orders.reduce((m, o) => { if (o.created_by_id) m[o.created_by_id] = 1; return m; }, {})).length,
    };
  }, [data, periodKey, filterDestination, filterNationality, filterHotel]);

  const filtersActive = filterDestination !== 'all' || filterNationality !== 'all' || filterHotel !== 'all';

  const openDrill = (title, items) => setDrillDown({ title, subtitle: `${period.label} period · ${items.length} shipments`, type: 'order', items });

  return (
    <div className="space-y-6">
      {/* Period + filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriodKey(p.key)}
              className={`px-4 h-9 rounded-xl text-xs font-bold border transition-colors ${periodKey === p.key ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <select value={filterDestination} onChange={e => setFilterDestination(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
          <option value="all">All Destinations</option>
          {destinations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterNationality} onChange={e => setFilterNationality(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent max-w-48">
          <option value="all">All Nationalities</option>
          {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterHotel} onChange={e => setFilterHotel(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent max-w-48">
          <option value="all">All Hotels</option>
          {hotelNames.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        {filtersActive && (
          <button onClick={() => { setFilterDestination('all'); setFilterNationality('all'); setFilterHotel('all'); }}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl bg-card transition-colors">
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={Users} label="Total Tourists" value={metrics.fTourists.length} />
        <KpiCard icon={TrendingUp} label="Returning Tourists" value={metrics.repeatUsers} />
        <KpiCard icon={DollarSign} label="Average Tourist Spend" value={metrics.avgSpendPerTourist ? `US$${metrics.avgSpendPerTourist}` : '—'} />
        <KpiCard icon={ShoppingCart} label="Avg Items / Shipment" value={metrics.avgItemsPerShipment} />
        <KpiCard icon={Package} label="Completed Shipments" value={metrics.completedOrders.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">New Registrations & Orders (6 Months) <span className="text-xs font-normal text-muted-foreground">(filtered)</span></h3>
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
          <h3 className="text-sm font-bold mb-1">Top Tourist Destinations <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click a bar for shipments</p>
          {metrics.topDests.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data for this period</p> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={metrics.topDests} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="shipments" fill="#ff0064" radius={[0, 4, 4, 0]} name="Shipments" cursor="pointer"
                  onClick={(payload) => { const d = metrics.topDests[payload.index]; if (d) openDrill(d.country, d.items); }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-1">Shipments by Tourist Nationality <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click a bar for shipments</p>
          {metrics.byNationality.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data for this period</p> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={metrics.byNationality} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="nationality" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="shipments" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Shipments" cursor="pointer"
                  onClick={(payload) => { const n = metrics.byNationality[payload.index]; if (n) openDrill(n.nationality, n.items); }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-1">Shipments by Hotel <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click a bar for shipments</p>
          {metrics.byHotel.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data for this period</p> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={metrics.byHotel} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="hotel" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="shipments" fill="#1e293b" radius={[0, 4, 4, 0]} name="Shipments" cursor="pointer"
                  onClick={(payload) => { const h = metrics.byHotel[payload.index]; if (h) openDrill(h.hotel, h.items); }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-4">User Activity Summary <span className="text-xs font-normal text-muted-foreground">(filtered)</span></h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Registered', value: metrics.fTourists.length, color: 'text-foreground' },
            { label: 'Have Placed Orders', value: metrics.registeredCount, color: 'text-accent' },
            { label: 'Returning Tourists', value: metrics.repeatUsers, color: 'text-green-600' },
            { label: 'Paid Shipments', value: metrics.paidOrders.length, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-muted/40 rounded-xl p-4 text-center">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
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