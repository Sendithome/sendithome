import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, CheckCircle2, Clock, XCircle, Globe, Download, FileText, AlertTriangle, MousePointerClick, Timer } from 'lucide-react';
import OperationalDrillDown from './OperationalDrillDown';

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#10b981',
  queried: '#3b82f6',
  overdue: '#f97316',
  cancelled: '#ef4444',
};

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
function hoursBetween(a, b) {
  if (!a || !b) return null;
  return (new Date(b) - new Date(a)) / (1000 * 60 * 60);
}

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
  const [periodKey, setPeriodKey] = useState('month');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterRetailer, setFilterRetailer] = useState('all');
  const [filterHotel, setFilterHotel] = useState('all');
  const [drillDown, setDrillDown] = useState(null);

  const period = PERIODS.find(p => p.key === periodKey);

  // Options
  const countries = useMemo(() => [...new Set(verifications.map(v => v.destination_country).filter(Boolean))].sort(), [verifications]);
  const hotelNames = useMemo(() => [...new Set(verifications.map(v => v.hotel_name).filter(Boolean))].sort(), [verifications]);
  const retailerOpts = useMemo(() => retailers.filter(r => r.status === 'approved'), [retailers]);

  const metrics = useMemo(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period.days);

    // Retailer filter affects orders via verifications linkage
    let orderIdsForRetailer = null;
    if (filterRetailer !== 'all') {
      orderIdsForRetailer = new Set(verifications.filter(v => v.retailer_id === filterRetailer).map(v => v.order_id).filter(Boolean));
    }

    const matchFiltersOrder = (o) => {
      if (!inRange(o.created_date, startDate)) return false;
      if (filterCountry !== 'all' && o.destination_country !== filterCountry) return false;
      if (filterHotel !== 'all' && o.hotel_name !== filterHotel) return false;
      if (orderIdsForRetailer && !orderIdsForRetailer.has(o.id)) return false;
      return true;
    };
    const matchFiltersV = (v) => {
      if (!inRange(v.created_date, startDate)) return false;
      if (filterCountry !== 'all' && v.destination_country !== filterCountry) return false;
      if (filterHotel !== 'all' && v.hotel_name !== filterHotel) return false;
      if (filterRetailer !== 'all' && v.retailer_id !== filterRetailer) return false;
      return true;
    };

    const fOrders = orders.filter(matchFiltersOrder);
    const fVerifications = verifications.filter(matchFiltersV);

    const statuses = ['pending', 'approved', 'queried', 'overdue', 'cancelled'];
    const verificationByStatus = statuses.map(s => ({
      status: s.charAt(0).toUpperCase() + s.slice(1),
      key: s,
      count: fVerifications.filter(v => v.status === s).length,
      items: fVerifications.filter(v => v.status === s),
      fill: STATUS_COLORS[s],
    })).filter(s => s.count > 0);

    // Order status funnel with items
    const reached = (o, list) => list.includes(o.status);
    const funnelRaw = [
      { step: 'Order Created', items: fOrders, get: () => fOrders },
      { step: 'Receipt Uploaded', items: fOrders.filter(o => reached(o, ['receipt_uploaded', 'payment_pending', 'paid', 'packed', 'picked_up', 'in_transit', 'delivered'])) },
      { step: 'Payment Completed', items: fOrders.filter(o => o.payment_status === 'paid') },
      { step: 'In Transit', items: fOrders.filter(o => ['in_transit', 'delivered'].includes(o.status)) },
      { step: 'Delivered', items: fOrders.filter(o => o.status === 'delivered') },
    ];
    const funnel = funnelRaw.map((f, i) => {
      const prevCount = i === 0 ? f.items.length : funnelRaw[i - 1].items.length;
      const dropOff = i === 0 ? 0 : prevCount - f.items.length;
      const dropPct = i === 0 || prevCount === 0 ? 0 : Math.round((dropOff / prevCount) * 100);
      const convPct = funnelRaw[0].items.length > 0 ? Math.round((f.items.length / funnelRaw[0].items.length) * 100) : 0;
      return { ...f, count: f.items.length, convPct, dropOff, dropPct };
    });
    // Bottleneck = stage with biggest drop-off (excluding first)
    const bottleneck = funnel.slice(1).reduce(
      (max, s) => (s.dropPct > max.dropPct ? s : max),
      { step: '—', dropPct: 0 }
    );

    // By country
    const countryMap = {};
    fVerifications.forEach(v => { if (v.destination_country) countryMap[v.destination_country] = (countryMap[v.destination_country] || 0) + 1; });
    const byCountry = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => ({
      country: c.slice(0, 14), count: n,
      items: fVerifications.filter(v => v.destination_country === c),
    }));

    // By hotel
    const hotelMap = {};
    fVerifications.forEach(v => { if (v.hotel_name) hotelMap[v.hotel_name] = (hotelMap[v.hotel_name] || 0) + 1; });
    const byHotel = Object.entries(hotelMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([h, n]) => ({
      hotel: h.slice(0, 18), count: n,
      items: fVerifications.filter(v => v.hotel_name === h),
    }));

    // By retailer
    const retailerMap = {};
    fVerifications.forEach(v => {
      const r = retailers.find(r => r.id === v.retailer_id);
      const name = r ? (r.brand_name || r.store_name) : (v.store_name || 'Unknown');
      if (!retailerMap[name]) retailerMap[name] = { count: 0, items: [] };
      retailerMap[name].count++;
      retailerMap[name].items.push(v);
    });
    const byRetailer = Object.entries(retailerMap).sort((a, b) => b[1].count - a[1].count).slice(0, 6).map(([r, d]) => ({
      retailer: r.slice(0, 16), count: d.count, items: d.items,
    }));

    // Stage timing metrics
    const vApprovalTimes = fVerifications.filter(v => v.status === 'approved' && v.approved_at && v.created_date)
      .map(v => hoursBetween(v.created_date, v.approved_at));
    const avgApprovalHours = vApprovalTimes.length ? Math.round(vApprovalTimes.reduce((s, t) => s + t, 0) / vApprovalTimes.length) : 0;

    const deliveryTimes = fOrders.filter(o => o.status === 'delivered' && o.created_date)
      .map(o => hoursBetween(o.created_date, o.updated_date))
      .filter(t => t != null && t > 0);
    const avgDeliveryDays = deliveryTimes.length ? (deliveryTimes.reduce((s, t) => s + t, 0) / deliveryTimes.length / 24).toFixed(1) : 0;

    // Avg time in current stage (age) for non-terminal orders
    const activeOrders = fOrders.filter(o => !['delivered', 'cancelled'].includes(o.status) && o.created_date);
    const avgAgeDays = activeOrders.length
      ? (activeOrders.map(o => hoursBetween(o.created_date, new Date().toISOString())).reduce((s, t) => s + t, 0) / activeOrders.length / 24).toFixed(1)
      : 0;

    const stageTimings = [
      { stage: 'Verification Approval', value: avgApprovalHours ? `${avgApprovalHours}h` : '—', sub: 'created → approved' },
      { stage: 'Time to Delivery', value: avgDeliveryDays !== '0' ? `${avgDeliveryDays}d` : '—', sub: 'created → delivered' },
      { stage: 'Avg Age in Pipeline', value: avgAgeDays !== '0' ? `${avgAgeDays}d` : '—', sub: 'active orders stuck' },
    ];

    return {
      fOrders, fVerifications, verificationByStatus, funnel, bottleneck,
      byCountry, byHotel, byRetailer, stageTimings,
      pendingCount: fVerifications.filter(v => v.status === 'pending').length,
      approvedCount: fVerifications.filter(v => v.status === 'approved').length,
      cancelledCount: fVerifications.filter(v => v.status === 'cancelled').length,
    };
  }, [data, periodKey, filterCountry, filterRetailer, filterHotel]);

  const filtersActive = filterCountry !== 'all' || filterRetailer !== 'all' || filterHotel !== 'all';

  const handleExportCSV = () => {
    const rows = [['Shipment ID', 'Store', 'Tourist', 'Destination', 'Hotel', 'Status', 'Total Value', 'Commission', 'Created']];
    metrics.fVerifications.forEach(v => {
      rows.push([
        v.shipment_id || '', v.store_name || '', v.tourist_name || '',
        v.destination_country || '', v.hotel_name || '', v.status || '',
        v.total_value || 0, v.commission_amount || 0,
        v.created_date ? new Date(v.created_date).toLocaleDateString('en-GB') : '',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `shipment_analytics_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const now = new Date().toLocaleString('en-GB');
    doc.setFontSize(16);
    doc.text('SENDITHOME — Shipment Analytics Report', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated: ${now}  |  Period: ${period.label}  |  Filters: ${filtersActive ? 'active' : 'none'}`, 14, 25);

    let y = 36;
    doc.setTextColor(20);
    doc.setFontSize(12);
    doc.text('Summary', 14, y); y += 7;
    doc.setFontSize(9);
    const summary = [
      ['Total Verifications', metrics.fVerifications.length],
      ['Pending', metrics.pendingCount],
      ['Approved', metrics.approvedCount],
      ['Cancelled', metrics.cancelledCount],
      ['Orders in Period', metrics.fOrders.length],
      ['Bottleneck Stage', `${metrics.bottleneck.step} (${metrics.bottleneck.dropPct}% drop)`],
    ];
    summary.forEach(([k, v]) => {
      doc.text(`${k}:`, 16, y);
      doc.text(String(v), 100, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(12);
    doc.text('Processing Funnel', 14, y); y += 7;
    doc.setFontSize(9);
    doc.text('Stage', 16, y); doc.text('Count', 90, y); doc.text('Conversion', 110, y); doc.text('Drop-off', 140, y); y += 6;
    metrics.funnel.forEach((s) => {
      doc.text(s.step, 16, y);
      doc.text(String(s.count), 90, y);
      doc.text(`${s.convPct}%`, 110, y);
      doc.text(s.dropPct ? `${s.dropPct}%` : '—', 140, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(12);
    doc.text('Stage Timing', 14, y); y += 7;
    doc.setFontSize(9);
    metrics.stageTimings.forEach(t => {
      doc.text(`${t.stage}:`, 16, y);
      doc.text(`${t.value} (${t.sub})`, 80, y);
      y += 6;
    });

    doc.save(`shipment_analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Period + filters + export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Partner / region filters */}
      <div className="flex gap-2 flex-wrap">
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
          <option value="all">All Destinations</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterRetailer} onChange={e => setFilterRetailer(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent max-w-48">
          <option value="all">All Retailers</option>
          {retailerOpts.map(r => <option key={r.id} value={r.id}>{r.brand_name || r.store_name}</option>)}
        </select>
        <select value={filterHotel} onChange={e => setFilterHotel(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent max-w-48">
          <option value="all">All Hotels</option>
          {hotelNames.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        {filtersActive && (
          <button onClick={() => { setFilterCountry('all'); setFilterRetailer('all'); setFilterHotel('all'); }}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl bg-card transition-colors">
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Package} label="Total Verifications" value={metrics.fVerifications.length} />
        <KpiCard icon={Clock} label="Pending" value={metrics.pendingCount} color="text-yellow-600" />
        <KpiCard icon={CheckCircle2} label="Approved" value={metrics.approvedCount} color="text-green-600" />
        <KpiCard icon={XCircle} label="Cancelled" value={metrics.cancelledCount} color="text-red-600" />
      </div>

      {/* Stage timing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metrics.stageTimings.map(t => (
          <div key={t.stage} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Timer className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">{t.value}</p>
              <p className="text-xs text-muted-foreground">{t.stage}</p>
              <p className="text-[10px] text-muted-foreground">{t.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Funnel — with bottleneck highlight + drill-down */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">Shipment Processing Funnel</h3>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MousePointerClick className="w-3 h-3" /> Click a stage</span>
          </div>
          {metrics.bottleneck.dropPct > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Bottleneck: {metrics.bottleneck.step} ({metrics.bottleneck.dropPct}% drop-off)
            </div>
          )}
        </div>
        <div className="space-y-3">
          {metrics.funnel.map((step, i) => {
            const isBottleneck = step.step === metrics.bottleneck.step && step.dropPct > 0;
            return (
              <button key={step.step} onClick={() => setDrillDown({ title: step.step, subtitle: `Funnel stage · ${period.label} period`, type: 'order', items: step.items })}
                className={`block w-full text-left rounded-xl transition-colors ${step.count > 0 ? 'hover:bg-accent/5' : 'cursor-default'}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {isBottleneck && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    {step.step}
                  </span>
                  <span className="font-bold text-foreground">{step.count} <span className="text-muted-foreground font-normal">({step.convPct}%)</span>
                    {step.dropPct > 0 && <span className="text-red-500 ml-1">−{step.dropPct}%</span>}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isBottleneck ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${step.convPct}%`, opacity: 1 - i * 0.12 }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification status breakdown — clickable bars */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-1">Verification Status Breakdown <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click a bar to view records</p>
        {metrics.verificationByStatus.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data for this period</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.verificationByStatus}>
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count" cursor="pointer"
                onClick={(payload) => {
                  const s = metrics.verificationByStatus.find(v => v.key === payload.key);
                  if (s) setDrillDown({ title: s.status, subtitle: `Verifications · ${period.label} period`, type: 'verification', items: s.items });
                }}>
                {metrics.verificationByStatus.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-1">Volume by Destination Country <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click a bar</p>
          {metrics.byCountry.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data for this period</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.byCountry} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#ff0064" radius={[0, 4, 4, 0]} name="Verifications" cursor="pointer"
                  onClick={(payload) => {
                    const c = metrics.byCountry[payload.index];
                    if (c) setDrillDown({ title: c.country, subtitle: `Destination · ${period.label} period`, type: 'verification', items: c.items });
                  }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-1">Volume by Retailer <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5"><MousePointerClick className="w-3 h-3" /> Click a bar</p>
          {metrics.byRetailer.length === 0 ? <p className="text-sm text-muted-foreground text-center py-16">No data for this period</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.byRetailer} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="retailer" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e293b" radius={[0, 4, 4, 0]} name="Verifications" cursor="pointer"
                  onClick={(payload) => {
                    const r = metrics.byRetailer[payload.index];
                    if (r) setDrillDown({ title: r.retailer, subtitle: `Retailer · ${period.label} period`, type: 'verification', items: r.items });
                  }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-1">Volume by Hotel <span className="text-xs font-normal text-muted-foreground">(this period)</span></h3>
        {metrics.byHotel.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data for this period</p> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metrics.byHotel} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="hotel" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Verifications" cursor="pointer"
                onClick={(payload) => {
                  const h = metrics.byHotel[payload.index];
                  if (h) setDrillDown({ title: h.hotel, subtitle: `Hotel · ${period.label} period`, type: 'verification', items: h.items });
                }} />
            </BarChart>
          </ResponsiveContainer>
        )}
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