import { useMemo, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, Download, Search, FileText, Loader2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HOTEL_NAME = 'Atlantis The Palm, Dubai';

const STATUS_CONFIG = {
  in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: Truck },
  packed: { label: 'Packed', color: 'bg-amber-100 text-amber-700', icon: Package },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
};

const SHIPMENTS = [
  { id: 'SIH-2026-01284', guest: 'Mei Lin Zhao', dest: '🇬🇧 London', country: 'United Kingdom', boxes: 1, value: 1240, status: 'in_transit', date: '2026-06-29' },
  { id: 'SIH-2026-01283', guest: 'James Harrington', dest: '🇺🇸 New York', country: 'United States', boxes: 2, value: 2890, status: 'packed', date: '2026-06-28' },
  { id: 'SIH-2026-01282', guest: 'Yuki Tanaka', dest: '🇯🇵 Tokyo', country: 'Japan', boxes: 1, value: 3120, status: 'delivered', date: '2026-06-27' },
  { id: 'SIH-2026-01281', guest: 'Sophie Müller', dest: '🇩🇪 Berlin', country: 'Germany', boxes: 1, value: 980, status: 'in_transit', date: '2026-06-26' },
  { id: 'SIH-2026-01280', guest: 'Raj Patel', dest: '🇦🇺 Sydney', country: 'Australia', boxes: 2, value: 2340, status: 'delivered', date: '2026-06-24' },
  { id: 'SIH-2026-01279', guest: 'Isabelle Moreau', dest: '🇫🇷 Paris', country: 'France', boxes: 1, value: 4560, status: 'delivered', date: '2026-06-22' },
  { id: 'SIH-2026-01278', guest: 'Hans Weber', dest: '🇨🇭 Zurich', country: 'Switzerland', boxes: 1, value: 1780, status: 'pending', date: '2026-06-30' },
  { id: 'SIH-2026-01277', guest: 'Maria Rossi', dest: '🇮🇹 Milan', country: 'Italy', boxes: 2, value: 3450, status: 'packed', date: '2026-06-20' },
];

const MONTHLY = [
  { month: 'Jan', shipments: 42 },
  { month: 'Feb', shipments: 38 },
  { month: 'Mar', shipments: 51 },
  { month: 'Apr', shipments: 47 },
  { month: 'May', shipments: 63 },
  { month: 'Jun', shipments: 58 },
];

const QUICK = [
  { id: 'all', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'ytd', label: 'Year to Date' },
];

const DESTINATIONS = [...new Set(SHIPMENTS.map(s => s.country))];

export default function DemoShipmentsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  const [quick, setQuick] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  const filtered = useMemo(() => {
    const now = new Date('2026-06-30');
    return SHIPMENTS.filter(s => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.id.toLowerCase().includes(q) && !s.guest.toLowerCase().includes(q) && !s.country.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (destFilter !== 'all' && s.country !== destFilter) return false;
      const d = new Date(s.date);
      if (quick === 'month' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
      if (quick === '30d' && d < new Date(now.getTime() - 30 * 86400000)) return false;
      if (quick === 'ytd' && d.getFullYear() !== now.getFullYear()) return false;
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [search, statusFilter, destFilter, quick, dateFrom, dateTo]);

  const totalValue = filtered.reduce((s, x) => s + x.value, 0);
  const inputCls = "h-8 bg-white border border-border rounded-lg px-2 text-xs text-foreground focus:outline-none focus:border-accent";

  const exportCSV = () => {
    const header = ['Shipment ID', 'Guest', 'Destination', 'Boxes', 'Value (US$)', 'Status', 'Date'];
    const rows = filtered.map(s => [s.id, s.guest, s.country, s.boxes, s.value, s.status, s.date]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c)}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `hotel-shipments-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    setExportingPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297, margin = 14;
      doc.setFillColor(26, 27, 38); doc.rect(0, 0, W, 20, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('SendItHome — Hotel Shipment Report', margin, 9);
      doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      doc.text(`Hotel: ${HOTEL_NAME} · Generated: ${new Date().toLocaleDateString('en-GB')} · ${filtered.length} shipments · Total US$${totalValue.toLocaleString()}`, margin, 16);
      let y = 28;
      const cols = [
        { label: 'Shipment ID', x: margin },
        { label: 'Guest', x: margin + 38 },
        { label: 'Destination', x: margin + 88 },
        { label: 'Boxes', x: margin + 130 },
        { label: 'Value (US$)', x: margin + 155 },
        { label: 'Status', x: margin + 195 },
        { label: 'Date', x: margin + 235 },
      ];
      doc.setFillColor(245, 245, 245); doc.rect(margin, y - 4, W - margin * 2, 6, 'F');
      doc.setTextColor(80, 80, 80); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      cols.forEach(c => doc.text(c.label, c.x, y));
      y += 6;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40); doc.setFontSize(7.5);
      filtered.forEach((s, i) => {
        if (y > 200) { doc.addPage(); y = margin; }
        if (i % 2 === 1) { doc.setFillColor(250, 250, 250); doc.rect(margin, y - 4, W - margin * 2, 6, 'F'); }
        const row = [s.id, s.guest.substring(0, 20), s.country, String(s.boxes), s.value.toFixed(2), s.status, s.date];
        cols.forEach((c, ci) => doc.text(row[ci], c.x, y));
        y += 6;
      });
      doc.save(`hotel-shipments-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) { console.error(err); }
    setExportingPDF(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">Guest Shipments</h2>
          <p className="text-sm text-muted-foreground">All shipments originating from {HOTEL_NAME}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded-lg px-3 h-8 bg-white hover:bg-muted transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={exportPDF} disabled={exportingPDF} className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded-lg px-3 h-8 bg-white hover:bg-muted transition-colors disabled:opacity-50">
            {exportingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} Export PDF
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] text-muted-foreground">Shipments (selected)</p>
          <p className="text-xl font-black text-foreground">{filtered.length}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] text-muted-foreground">Total Value (selected)</p>
          <p className="text-xl font-black text-accent">US${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] text-muted-foreground">Delivered</p>
          <p className="text-xl font-black text-green-600">{filtered.filter(s => s.status === 'delivered').length}</p>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">Shipments per Month</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={MONTHLY} barSize={20}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="shipments" fill="hsl(330,100%,50%)" radius={[4, 4, 0, 0]} name="Shipments" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-border overflow-hidden bg-white">
          {QUICK.map(q => (
            <button key={q.id} onClick={() => { setQuick(q.id); setDateFrom(''); setDateTo(''); }}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${quick === q.id ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {q.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest, ref, destination…" className={`${inputCls} pl-7 w-48`} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="packed">Packed</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
        <select value={destFilter} onChange={e => setDestFilter(e.target.value)} className={inputCls}>
          <option value="all">All Destinations</option>
          {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setQuick('all'); }} className={inputCls} />
        <span className="text-xs text-muted-foreground">→</span>
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setQuick('all'); }} className={inputCls} />
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-2.5 border-b border-border bg-muted/30">
          <p className="text-[10px] font-bold uppercase text-muted-foreground col-span-4">Guest / Ref</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground col-span-3">Destination</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground col-span-2 text-right">Value</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground col-span-2 text-center">Status</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground col-span-1 text-right">Date</p>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">No shipments match your filters.</p>
          ) : filtered.map(s => {
            const cfg = STATUS_CONFIG[s.status];
            const SIcon = cfg.icon;
            return (
              <div key={s.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <div className="col-span-4">
                  <p className="text-xs font-bold text-foreground">{s.guest}</p>
                  <button onClick={() => setSelected(s)} className="text-[10px] text-accent font-mono hover:underline">{s.id}</button>
                </div>
                <div className="col-span-3 flex items-center">
                  <p className="text-xs text-foreground">{s.dest}</p>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <p className="text-xs font-bold text-foreground">US${s.value.toLocaleString()}</p>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                    <SIcon className="w-3 h-3" /> {cfg.label}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <p className="text-[10px] text-muted-foreground">{s.date.slice(5)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-white border border-border rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Shipment Details</p>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <h3 className="text-lg font-black text-foreground font-mono">{selected.id}</h3>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div><p className="text-muted-foreground">Guest</p><p className="font-semibold text-foreground">{selected.guest}</p></div>
              <div><p className="text-muted-foreground">Destination</p><p className="font-semibold text-foreground">{selected.dest}</p></div>
              <div><p className="text-muted-foreground">Boxes</p><p className="font-semibold text-foreground">{selected.boxes}</p></div>
              <div><p className="text-muted-foreground">Value</p><p className="font-semibold text-foreground">US${selected.value.toLocaleString()}</p></div>
              <div><p className="text-muted-foreground">Status</p><p className="font-semibold text-foreground capitalize">{selected.status}</p></div>
              <div><p className="text-muted-foreground">Date</p><p className="font-semibold text-foreground">{selected.date}</p></div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 text-center">Demo data — illustrative only.</p>
          </div>
        </div>
      )}
    </div>
  );
}