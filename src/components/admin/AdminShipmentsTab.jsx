import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  queried: 'bg-orange-100 text-orange-700 border-orange-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  overdue: 'bg-red-100 text-red-600 border-red-200',
};

export default function AdminShipmentsTab({ verifications, retailers, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [overriding, setOverriding] = useState(null);

  const retailerMap = Object.fromEntries(retailers.map(r => [r.id, r]));

  const filtered = verifications.filter(v => {
    const matchSearch = !search ||
      v.shipment_id?.toLowerCase().includes(search.toLowerCase()) ||
      v.tourist_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.store_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOverride = async (id, newStatus) => {
    setOverriding(id);
    await base44.entities.RetailerVerification.update(id, {
      status: newStatus,
      approved_at: newStatus === 'approved' ? new Date().toISOString() : undefined,
      approved_by: 'admin_override',
    });
    onRefresh();
    setOverriding(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by shipment, tourist, store…"
            className="h-9 pl-7 pr-3 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent w-56" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-accent">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="queried">Queried</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} verifications</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No verifications found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                {['Shipment ID', 'Store', 'Tourist', 'Destination', 'Items', 'Value', 'Status', 'Deadline', ''].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(v => {
                const isOverdue = v.status === 'pending' && v.deadline_at && new Date(v.deadline_at) < new Date();
                const retailer = retailerMap[v.retailer_id];
                return (
                  <>
                    <tr key={v.id} className={`hover:bg-muted/20 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-accent">{v.shipment_id}</td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{v.store_name || '—'}</td>
                      <td className="py-2.5 px-3">{v.tourist_name || '—'}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{v.destination_country || '—'}</td>
                      <td className="py-2.5 px-3 text-center">{v.items?.length || 0}</td>
                      <td className="py-2.5 px-3 font-semibold">${(v.total_value || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[isOverdue ? 'overdue' : v.status] || STATUS_COLORS.pending}`}>
                          {isOverdue ? 'OVERDUE' : v.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {v.deadline_at ? new Date(v.deadline_at).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} className="text-muted-foreground hover:text-foreground">
                          {expandedId === v.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === v.id && (
                      <tr key={v.id + '-detail'} className="bg-muted/10">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            <InfoBlock label="Hotel" value={v.hotel_name} />
                            <InfoBlock label="Passport Country" value={v.tourist_passport_country} />
                            <InfoBlock label="Customs Ref" value={v.customs_ref} />
                            <InfoBlock label="Retailer" value={retailer ? `${retailer.store_name} (${retailer.partner_code})` : 'Unmatched'} />
                            <InfoBlock label="Retailer Email" value={v.retailer_email} />
                            <InfoBlock label="Approved By" value={v.approved_by} />
                          </div>

                          {/* Selected Items — the shipment-specific subset */}
                          {v.items?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-bold text-foreground mb-2">Selected Items for Shipment ({v.items.length})</p>
                              <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-xs">
                                  <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                      <th className="text-left py-2 px-3">Description</th>
                                      <th className="text-left py-2 px-3">Category</th>
                                      <th className="text-left py-2 px-3">HS Code</th>
                                      <th className="text-right py-2 px-3">Price</th>
                                      <th className="text-left py-2 px-3">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border">
                                    {v.items.map((item, i) => (
                                      <tr key={i}>
                                        <td className="py-2 px-3 font-medium">{item.description}</td>
                                        <td className="py-2 px-3 text-muted-foreground">{item.category}</td>
                                        <td className="py-2 px-3 font-mono">{item.hs_code || '—'}</td>
                                        <td className="py-2 px-3 text-right font-semibold">${(item.price || 0).toFixed(2)}</td>
                                        <td className="py-2 px-3">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {item.eligible ? 'Eligible' : 'Ineligible'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t border-border bg-muted/20">
                                      <td colSpan={3} className="py-2 px-3 font-bold text-foreground">Total Shipment Value</td>
                                      <td className="py-2 px-3 text-right font-bold text-foreground">${(v.total_value || 0).toFixed(2)}</td>
                                      <td className="py-2 px-3 text-amber-600 font-bold text-[10px]">10% = ${((v.total_value || 0) * 0.10).toFixed(2)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}

                          {v.receipt_url && (
                            <a href={v.receipt_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-accent hover:underline mb-4">
                              <ExternalLink className="w-3 h-3" /> View Receipt
                            </a>
                          )}

                          {/* Admin Override Actions */}
                          {v.status !== 'approved' && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleOverride(v.id, 'approved')}
                                disabled={overriding === v.id}
                                className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Admin Approve
                              </button>
                              <button
                                onClick={() => handleOverride(v.id, 'cancelled')}
                                disabled={overriding === v.id}
                                className="flex items-center gap-1.5 text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                              >
                                Cancel Verification
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{value || '—'}</p>
    </div>
  );
}