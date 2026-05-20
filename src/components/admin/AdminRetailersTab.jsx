import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, X, Loader2, Search, ExternalLink } from 'lucide-react';

export default function AdminRetailersTab({ retailers, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [processing, setProcessing] = useState(null);

  const filtered = retailers.filter(r => {
    const matchSearch = !search ||
      r.store_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.contact_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleApprove = async (retailer) => {
    setProcessing(retailer.id);
    await base44.functions.invoke('approveRetailer', { retailer_id: retailer.id });
    onRefresh();
    setProcessing(null);
  };

  const handleReject = async (retailer) => {
    setProcessing(retailer.id);
    await base44.entities.Retailer.update(retailer.id, { status: 'rejected' });
    onRefresh();
    setProcessing(null);
  };

  const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-600 border-red-200',
    suspended: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="space-y-4">
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
        <a href="/admin-retailers" target="_blank" className="ml-auto text-xs text-accent hover:underline flex items-center gap-1">
          Full Retailer Admin <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No retailers found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-foreground">{r.store_name}</p>
                    {r.brand_name && <span className="text-xs text-muted-foreground">({r.brand_name})</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.contact_name} · {r.contact_email}</p>
                  <p className="text-xs text-muted-foreground">{r.store_category} · {r.store_location}</p>
                  {r.partner_code && <p className="text-xs font-mono text-accent mt-1">{r.partner_code}</p>}
                </div>
                {r.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(r)}
                      disabled={processing === r.id}
                      className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {processing === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(r)}
                      disabled={processing === r.id}
                      className="flex items-center gap-1.5 text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
              {r.trade_license_url && (
                <a href={r.trade_license_url} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  <ExternalLink className="w-3 h-3" /> Trade License
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}