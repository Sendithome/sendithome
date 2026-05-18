import { useState, useMemo } from 'react';
import { Search, Filter, Download } from 'lucide-react';

const ACTION_LABELS = {
  pending: { label: 'Shipment Created', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  approved: { label: 'Government Cleared', color: 'text-green-400', bg: 'bg-green-500/10' },
  queried: { label: 'Held for Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  overdue: { label: 'Overdue — Flagged', color: 'text-red-400', bg: 'bg-red-500/10' },
  cancelled: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function AuditTrailTab({ verifications }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return verifications.filter(v => {
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !v.shipment_id?.toLowerCase().includes(q) &&
          !v.tourist_name?.toLowerCase().includes(q) &&
          !v.retailer_email?.toLowerCase().includes(q) &&
          !v.hotel_name?.toLowerCase().includes(q)
        ) return false;
      }
      if (dateFrom && new Date(v.created_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(v.created_date) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [verifications, search, filterStatus, dateFrom, dateTo]);

  const downloadCSV = () => {
    const rows = [
      ['Shipment ID', 'Tourist', 'Nationality', 'Hotel', 'Retailer', 'Value', 'Status', 'Customs Ref', 'Created', 'Approved At'],
      ...filtered.map(v => [
        v.shipment_id, v.tourist_name, v.tourist_passport_country, v.hotel_name,
        v.retailer_email, v.total_value, v.status, v.customs_ref || '',
        v.created_date, v.approved_at || ''
      ])
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Audit Trail</h3>
          <p className="text-xs text-slate-400 mt-0.5">Complete searchable log of all system events</p>
        </div>
        <button onClick={downloadCSV} className="px-3 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, tourist, retailer, hotel…"
            className="w-full h-9 bg-[#060D1F] border border-slate-700 rounded-xl pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-9 bg-[#060D1F] border border-slate-700 rounded-xl px-3 text-xs text-slate-300 focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="queried">On Hold</option>
          <option value="cancelled">Rejected</option>
          <option value="overdue">Overdue</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="h-9 bg-[#060D1F] border border-slate-700 rounded-xl px-3 text-xs text-slate-300 focus:outline-none focus:border-[#8B5CF6]"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="h-9 bg-[#060D1F] border border-slate-700 rounded-xl px-3 text-xs text-slate-300 focus:outline-none focus:border-[#8B5CF6]"
        />
      </div>

      <p className="text-[10px] text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Table */}
      <div className="bg-[#060D1F] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {['Timestamp', 'Shipment ID', 'Tourist', 'Nationality', 'Hotel', 'Retailer', 'Value', 'Status', 'Customs Ref'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-600 py-10">No records match your filters</td>
                </tr>
              ) : (
                filtered.map(v => {
                  const cfg = ACTION_LABELS[v.status] || ACTION_LABELS.pending;
                  return (
                    <tr key={v.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{v.created_date ? new Date(v.created_date).toLocaleString() : '—'}</td>
                      <td className="px-3 py-2.5 font-mono text-[#8B5CF6] whitespace-nowrap">{v.shipment_id}</td>
                      <td className="px-3 py-2.5 text-white">{v.tourist_name || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400">{v.tourist_passport_country || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400">{v.hotel_name || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-400 truncate max-w-24">{v.retailer_email || '—'}</td>
                      <td className="px-3 py-2.5 text-[#D4A855] font-semibold whitespace-nowrap">${(v.total_value || 0).toLocaleString()}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">{v.customs_ref || '—'}</td>
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