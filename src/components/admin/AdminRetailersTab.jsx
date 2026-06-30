import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, X, Loader2, Search, Download, ChevronUp, ChevronDown, Eye, ExternalLink } from 'lucide-react';
import RetailerDetailsModal from './RetailerDetailsModal';
import RetailerRejectModal from './RetailerRejectModal';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-600 border-red-200',
  suspended: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_ORDER = { pending: 0, approved: 1, rejected: 2, suspended: 3 };

const SORT_OPTIONS = [
  { id: 'name', label: 'Retailer Name' },
  { id: 'date', label: 'Registration Date' },
  { id: 'status', label: 'Approval Status' },
  { id: 'category', label: 'Category' },
];

export default function AdminRetailersTab({ retailers, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [processing, setProcessing] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const stats = useMemo(() => ({
    total: retailers.length,
    pending: retailers.filter(r => r.status === 'pending').length,
    approved: retailers.filter(r => r.status === 'approved').length,
    inactive: retailers.filter(r => r.status === 'rejected' || r.status === 'suspended').length,
  }), [retailers]);

  const filtered = useMemo(() => {
    const list = retailers.filter(r => {
      const matchSearch = !search ||
        r.store_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.contact_email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let av, bv;
      if (sortKey === 'name') { av = (a.store_name || '').toLowerCase(); bv = (b.store_name || '').toLowerCase(); return av < bv ? -dir : av > bv ? dir : 0; }
      if (sortKey === 'date') { av = new Date(a.created_date || 0).getTime(); bv = new Date(b.created_date || 0).getTime(); return (av - bv) * dir; }
      if (sortKey === 'status') { av = STATUS_ORDER[a.status] ?? 9; bv = STATUS_ORDER[b.status] ?? 9; return (av - bv) * dir; }
      if (sortKey === 'category') { av = (a.store_category || '').toLowerCase(); bv = (b.store_category || '').toLowerCase(); return av < bv ? -dir : av > bv ? dir : 0; }
      return 0;
    });
    return list;
  }, [retailers, search, filterStatus, sortKey, sortDir]);

  const handleApprove = async (retailer) => {
    setProcessing(retailer.id);
    await base44.functions.invoke('approveRetailer', { retailer_id: retailer.id });
    onRefresh();
    setProcessing(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setProcessing(rejectTarget.id);
    await base44.entities.Retailer.update(rejectTarget.id, { status: 'rejected' });
    onRefresh();
    setProcessing(null);
    setRejectTarget(null);
  };

  const handleExport = () => {
    const rows = [['Store', 'Brand', 'Contact', 'Email', 'Category', 'Location', 'Partner Code', 'Commission %', 'Registered', 'Status']];
    filtered.forEach(r => rows.push([
      r.store_name || '', r.brand_name || '', r.contact_name || '', r.contact_email || '',
      r.store_category || '', r.store_location || '', r.partner_code || '', r.commission_rate ?? '',
      r.created_date ? new Date(r.created_date).toLocaleDateString('en-GB') : '', r.status || '',
    ]));
    const csv = rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `retailers_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryChip label="Total" value={stats.total} />
        <SummaryChip label="Pending" value={stats.pending} color="text-yellow-700" />
        <SummaryChip label="Approved" value={stats.approved} color="text-green-700" />
        <SummaryChip label="Rejected / Suspended" value={stats.inactive} color="text-red-600" />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search retailers…"
            className="h-9 pl-7 pr-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent w-52" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={sortKey} onChange={e => setSortKey(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
          {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>Sort: {o.label}</option>)}
        </select>
        <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:border-accent flex items-center gap-1">
          {sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} {sortDir === 'asc' ? 'Asc' : 'Desc'}
        </button>
        <button onClick={handleExport} className="flex items-center gap-1.5 h-9 px-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:border-accent transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
        <a href="/admin-retailers" target="_blank" className="ml-auto text-xs text-accent hover:underline flex items-center gap-1">
          Full Retailer Admin <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No retailers found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const isPending = r.status === 'pending';
            return (
              <div key={r.id} className={`border rounded-2xl p-4 shadow-sm ${isPending ? 'bg-yellow-50/60 border-orange-200' : 'bg-card border-border'}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground">{r.store_name}</p>
                      {r.brand_name && <span className="text-xs text-muted-foreground">({r.brand_name})</span>}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.contact_name} · {r.contact_email}</p>
                    <p className="text-xs text-muted-foreground">{r.store_category} · {r.store_location}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {r.partner_code && <p className="text-xs font-mono text-accent">{r.partner_code}</p>}
                      {r.commission_rate != null && <p className="text-xs text-muted-foreground">Commission: {r.commission_rate}%</p>}
                      <p className="text-xs text-muted-foreground">Registered: {r.created_date ? new Date(r.created_date).toLocaleDateString('en-GB') : '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetailsTarget(r)}
                      className="flex items-center gap-1.5 text-xs border border-border text-foreground font-semibold px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Eye className="w-3 h-3" /> View Details
                    </button>
                    {isPending && (
                      <>
                        <button onClick={() => handleApprove(r)} disabled={processing === r.id}
                          className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                          {processing === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                        </button>
                        <button onClick={() => setRejectTarget(r)} disabled={processing === r.id}
                          className="flex items-center gap-1.5 text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors">
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {r.trade_license_url && (
                  <a href={r.trade_license_url} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    <ExternalLink className="w-3 h-3" /> Trade License
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RetailerDetailsModal retailer={detailsTarget} onClose={() => setDetailsTarget(null)} />
      <RetailerRejectModal retailer={rejectTarget} processing={processing === rejectTarget?.id} onConfirm={handleConfirmReject} onClose={() => setRejectTarget(null)} />
    </div>
  );
}

function SummaryChip({ label, value, color = 'text-foreground' }) {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}