import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Loader2, Search, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ShipmentDetailModal from './ShipmentDetailModal';

async function downloadDeclarationPDF(v, setDownloading) {
  setDownloading(v.id);
  const order = {
    order_number: v.shipment_id,
    recipient_name: v.tourist_name,
    hotel_name: v.hotel_name,
    hotel_country: 'United Arab Emirates',
    nationality: v.tourist_passport_country,
    destination_country: v.destination_country,
  };
  const items = (v.items || []).map(i => ({
    item_name: i.description || i.item_name || 'Item',
    category: i.category || '',
    quantity: 1,
    price: i.price || 0,
    currency: 'USD',
    eligible: i.eligible !== false,
  }));
  const response = await base44.functions.invoke('generateDeclarationPDF', { order, items, signature: null });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customs-declaration-${v.shipment_id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  setDownloading(null);
}

const QUICK_FILTERS = [
  { id: 'all', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'ytd', label: 'Year to Date' },
];

export default function ApprovedHistoryTab({ verifications }) {
  const [sortField, setSortField] = useState('approved_at');
  const [sortDir, setSortDir] = useState(-1);
  const [quickFilter, setQuickFilter] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => -d);
    else { setSortField(field); setSortDir(-1); }
  };

  const applyQuickFilter = (filterId) => {
    setQuickFilter(filterId);
    setFilterFrom('');
    setFilterTo('');
  };

  const filtered = verifications
    .filter(v => {
      // Quick filter
      if (quickFilter !== 'all' && v.approved_at) {
        const d = new Date(v.approved_at);
        const now = new Date();
        if (quickFilter === 'month') {
          if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
        } else if (quickFilter === '30d') {
          if (d < new Date(now.getTime() - 30 * 86400000)) return false;
        } else if (quickFilter === 'ytd') {
          if (d.getFullYear() !== now.getFullYear()) return false;
        }
      }
      // Custom date range
      if (filterFrom && v.approved_at && v.approved_at < filterFrom) return false;
      if (filterTo && v.approved_at && v.approved_at > filterTo + 'T23:59:59') return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        if (!v.shipment_id?.toLowerCase().includes(q) &&
            !v.tourist_name?.toLowerCase().includes(q) &&
            !v.destination_country?.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const va = a[sortField] || '';
      const vb = b[sortField] || '';
      return va < vb ? sortDir : va > vb ? -sortDir : 0;
    });

  const exportCSV = () => {
    const header = ['Shipment ID', 'Tourist Name', 'Date Approved', 'Items Count', 'Value (US$)', 'Commission (US$)', 'Destination'];
    const rows = filtered.map(v => [
      v.shipment_id, v.tourist_name,
      v.approved_at ? new Date(v.approved_at).toLocaleDateString() : '',
      v.items?.length || 0,
      v.total_value?.toFixed(2) || 0,
      v.commission_amount?.toFixed(2) || 0,
      v.destination_country
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'approved-history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? 'text-accent' : 'text-muted-foreground/50'}`}>
      {sortField === field ? (sortDir === -1 ? '▼' : '▲') : '⇅'}
    </span>
  );

  const inputCls = "h-8 bg-background border border-input rounded-lg px-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="space-y-4">
      {/* Quick date filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-xl border border-border overflow-hidden bg-card">
          {QUICK_FILTERS.map(f => (
            <button key={f.id} onClick={() => applyQuickFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${quickFilter === f.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Custom date range + Export */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shipment ID, tourist, destination…"
            className={`${inputCls} pl-7 w-full`} />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">From</label>
          <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setQuickFilter('all'); }} className={inputCls} />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground">To</label>
          <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setQuickFilter('all'); }} className={inputCls} />
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-semibold text-foreground border border-border rounded-lg px-3 h-8 hover:bg-muted transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No approved verifications found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                {[['shipment_id','Shipment ID'], ['tourist_name','Tourist Name'], ['approved_at','Date Approved'],
                  ['items','Items'], ['total_value','Value'], ['commission_amount','Commission'], ['destination_country','Destination']
                ].map(([f, l]) => (
                  <th key={f} onClick={() => toggleSort(f)} className="text-left py-2.5 px-3 cursor-pointer hover:text-foreground whitespace-nowrap">
                    {l}<SortIcon field={f} />
                  </th>
                ))}
                <th className="py-2.5 px-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(v => (
                <>
                  <tr key={v.id} className="text-foreground hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3">
                      <button onClick={() => setSelectedShipment(v)} className="font-mono text-accent font-semibold hover:underline">
                        {v.shipment_id}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-medium">{v.tourist_name || '—'}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{v.approved_at ? new Date(v.approved_at).toLocaleDateString() : '—'}</td>
                    <td className="py-2.5 px-3 text-center">{v.items?.length || 0}</td>
                    <td className="py-2.5 px-3 font-semibold">US${v.total_value?.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-amber-600 font-semibold">US${v.commission_amount?.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{v.destination_country || '—'}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadDeclarationPDF(v, setDownloadingId)}
                          disabled={downloadingId === v.id}
                          title="Download Customs Declaration PDF"
                          className="text-accent hover:text-accent/80 disabled:opacity-40 transition-colors"
                        >
                          {downloadingId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} className="text-muted-foreground hover:text-foreground">
                          {expandedId === v.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === v.id && (
                    <tr key={v.id + '-detail'} className="bg-muted/10">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div><p className="text-muted-foreground">Hotel</p><p className="text-foreground font-medium">{v.hotel_name || '—'}</p></div>
                          <div><p className="text-muted-foreground">Passport Country</p><p className="text-foreground font-medium">{v.tourist_passport_country || '—'}</p></div>
                          <div><p className="text-muted-foreground">Customs Ref</p><p className="text-foreground font-mono">{v.customs_ref || '—'}</p></div>
                          <div><p className="text-muted-foreground">Shipment Date</p><p className="text-foreground font-medium">{v.shipment_date ? new Date(v.shipment_date).toLocaleDateString() : '—'}</p></div>
                        </div>
                        {v.items?.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {v.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs text-muted-foreground">
                                <span>{item.description} ({item.category})</span>
                                <span>US${item.price?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedShipment && (
        <ShipmentDetailModal verification={selectedShipment} onClose={() => setSelectedShipment(null)} />
      )}
    </div>
  );
}