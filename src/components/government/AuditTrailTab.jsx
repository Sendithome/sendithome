import { useState, useMemo } from 'react';
import { Search, Download, Eye } from 'lucide-react';

const ACTION_LABELS = {
  pending: { label: 'Shipment Created', colorCls: 'text-blue-700 bg-blue-50 border-blue-200' },
  approved: { label: 'Government Cleared', colorCls: 'text-green-700 bg-green-50 border-green-200' },
  queried: { label: 'Held for Review', colorCls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  overdue: { label: 'Overdue — Flagged', colorCls: 'text-red-700 bg-red-50 border-red-200' },
  cancelled: { label: 'Rejected', colorCls: 'text-red-700 bg-red-50 border-red-200' },
};

export default function AuditTrailTab({ verifications, retailers = [], onReview }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const retailerMap = useMemo(() => {
    const m = {};
    retailers.forEach(r => { m[r.id] = r; });
    return m;
  }, [retailers]);

  function getRetailerName(v) {
    const r = retailerMap[v.retailer_id];
    if (r) return r.brand_name || r.store_name || '—';
    return v.store_name || v.retailer_email || '—';
  }

  const filtered = useMemo(() => {
    return verifications.filter(v => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!v.shipment_id?.toLowerCase().includes(q) && !v.tourist_name?.toLowerCase().includes(q) && !v.retailer_email?.toLowerCase().includes(q) && !v.hotel_name?.toLowerCase().includes(q) && !getRetailerName(v).toLowerCase().includes(q)) return false;
      }
      if (dateFrom && new Date(v.created_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(v.created_date) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [verifications, search, filterStatus, dateFrom, dateTo, retailerMap]);

  const downloadCSV = () => {
    const rows = [
      ['Shipment ID', 'Tourist', 'Nationality', 'Hotel', 'Retailer', 'Value', 'Status', 'Customs Ref', 'Created', 'Approved At', 'Performed By'],
      ...filtered.map(v => [v.shipment_id, v.tourist_name, v.tourist_passport_country, v.hotel_name, getRetailerName(v), v.total_value, v.status, v.customs_ref || '', v.created_date, v.approved_at || '', v.approved_by || ''])
    ];
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sih-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "h-9 bg-background border border-input rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">System Audit & Compliance Log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Complete searchable log of all system events</p>
        </div>
        <button onClick={downloadCSV} className="px-3 h-8 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, tourist, retailer, hotel…"
            className={inputCls + ' w-full pl-8'}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="queried">On Hold</option>
          <option value="cancelled">Rejected</option>
          <option value="overdue">Overdue</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls} />
      </div>

      <p className="text-[10px] text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Timestamp', 'Shipment ID', 'Tourist', 'Nationality', 'Hotel', 'Retailer', 'Value', 'Status', 'Performed By', 'Customs Ref'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted-foreground py-10">No records match your filters</td>
                </tr>
              ) : (
                filtered.map(v => {
                  const cfg = ACTION_LABELS[v.status] || ACTION_LABELS.pending;
                  return (
                    <tr key={v.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{v.created_date ? new Date(v.created_date).toLocaleString() : '—'}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {onReview ? (
                          <button onClick={() => onReview(v)} className="font-mono text-accent hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {v.shipment_id}
                          </button>
                        ) : (
                          <span className="font-mono text-accent">{v.shipment_id}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">{v.tourist_name || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{v.tourist_passport_country || '—'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{v.hotel_name || '—'}</td>
                      <td className="px-3 py-2.5 text-foreground font-medium truncate max-w-32">{getRetailerName(v)}</td>
                      <td className="px-3 py-2.5 text-amber-600 font-semibold whitespace-nowrap">${(v.total_value || 0).toLocaleString()}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.colorCls}`}>{cfg.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{v.approved_by || (v.status === 'pending' ? 'System' : '—')}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{v.customs_ref || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}