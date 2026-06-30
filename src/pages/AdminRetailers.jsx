import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Building2, Mail, Phone, MapPin, ChevronDown, ChevronUp, Search, FileText, KeyRound, StickyNote, History, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RetailerApprovalHistory from '@/components/admin/RetailerApprovalHistory';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  suspended: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function AdminRetailers() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(null);
  const [me, setMe] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [noteDraft, setNoteDraft] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadRetailers(); base44.auth.me().then(setMe).catch(() => {}); }, []);

  const loadRetailers = async () => {
    setLoading(true);
    const data = await base44.entities.Retailer.list('-created_date', 200);
    setRetailers(data);
    setLoading(false);
  };

  const actor = () => me?.email || 'admin';

  const handleApprove = async (retailer) => {
    setActioningId(retailer.id);
    const note = (noteDraft[retailer.id] || '').trim();
    await base44.functions.invoke('approveRetailer', { retailer_id: retailer.id });
    const history = [...(retailer.approval_history || []), { action: 'approved', by: actor(), at: new Date().toISOString(), note }];
    await base44.entities.Retailer.update(retailer.id, {
      approval_history: history,
      approved_at: new Date().toISOString(),
      approved_by: actor(),
      ...(note ? { admin_notes: note } : {}),
    });
    setNoteDraft(p => ({ ...p, [retailer.id]: '' }));
    await loadRetailers();
    setActioningId(null);
  };

  const handleReject = async (retailer) => {
    setActioningId(retailer.id);
    const note = (rejectReason || '').trim();
    const history = [...(retailer.approval_history || []), { action: 'rejected', by: actor(), at: new Date().toISOString(), note }];
    await base44.entities.Retailer.update(retailer.id, {
      status: 'rejected',
      reject_reason: note,
      approval_history: history,
    });
    await loadRetailers();
    setActioningId(null);
    setShowRejectInput(null);
    setRejectReason('');
  };

  const handleResendCredentials = async (retailer) => {
    setResendingId(retailer.id);
    await base44.functions.invoke('resendRetailerCredentials', { retailer_id: retailer.id });
    const history = [...(retailer.approval_history || []), { action: 'resent', by: actor(), at: new Date().toISOString(), note: '' }];
    await base44.entities.Retailer.update(retailer.id, { approval_history: history, credentials_resent_at: new Date().toISOString() });
    await loadRetailers();
    setResendingId(null);
  };

  const handleSaveNote = async (retailer) => {
    const note = (noteDraft[retailer.id] || '').trim();
    if (!note) return;
    setSavingNoteId(retailer.id);
    const history = [...(retailer.approval_history || []), { action: 'note', by: actor(), at: new Date().toISOString(), note }];
    await base44.entities.Retailer.update(retailer.id, { admin_notes: note, approval_history: history });
    setNoteDraft(p => ({ ...p, [retailer.id]: '' }));
    await loadRetailers();
    setSavingNoteId(null);
  };

  const uniqueCategories = useMemo(() => {
    const set = new Set();
    retailers.forEach(r => { if (r.store_category) set.add(r.store_category); });
    return Array.from(set).sort();
  }, [retailers]);

  const uniqueLocations = useMemo(() => {
    const set = new Set();
    retailers.forEach(r => { if (r.store_location) set.add(r.store_location); });
    return Array.from(set).sort();
  }, [retailers]);

  const filtered = retailers.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = [r.store_name, r.brand_name, r.contact_name, r.contact_email].map(v => (v || '').toLowerCase()).join(' ');
      if (!hay.includes(q)) return false;
    }
    if (categoryFilter !== 'all' && r.store_category !== categoryFilter) return false;
    if (locationFilter !== 'all' && r.store_location !== locationFilter) return false;
    if (dateFrom || dateTo) {
      const created = r.created_date ? new Date(r.created_date).getTime() : 0;
      if (dateFrom && created < new Date(dateFrom).getTime()) return false;
      if (dateTo && created > new Date(dateTo).getTime() + 86400000) return false;
    }
    return true;
  });

  const filtersActive = search || categoryFilter !== 'all' || locationFilter !== 'all' || dateFrom || dateTo;

  const counts = {
    pending: retailers.filter(r => r.status === 'pending').length,
    approved: retailers.filter(r => r.status === 'approved').length,
    rejected: retailers.filter(r => r.status === 'rejected').length,
    all: retailers.length,
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
            <h1 className="text-2xl font-bold text-primary mt-1">Retailer Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage retailer registrations & approvals</p>
          </div>
          <button onClick={loadRetailers} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors capitalize ${filter === s ? 'bg-accent text-accent-foreground border-accent' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>
              {s} ({counts[s]})
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, brand, email…"
              className="h-9 pl-8 pr-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent w-60" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
            className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent max-w-48">
            <option value="all">All Locations</option>
            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="h-9 px-2 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
            <span>To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="h-9 px-2 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
          </div>
          {filtersActive ? (
            <button onClick={() => { setSearch(''); setCategoryFilter('all'); setLocationFilter('all'); setDateFrom(''); setDateTo(''); }}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl bg-card transition-colors">
              Clear
            </button>
          ) : null}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {retailers.length}</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">{filtersActive ? 'No retailers match your filters' : `No ${filter} retailers`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <motion.div key={r.id} layout
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

                {/* Card Header */}
                <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary text-sm truncate">{r.store_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.brand_name} · {r.store_category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                    {r.partner_code && (
                      <span className="text-[10px] font-mono bg-secondary text-primary px-2 py-1 rounded-lg border border-border">
                        {r.partner_code}
                      </span>
                    )}
                    <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors">
                      {expandedId === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === r.id && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-t border-border px-4 pb-4 pt-3 space-y-4">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={r.contact_email} />
                      <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={r.contact_phone} />
                      <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={r.store_location} />
                      <InfoRow icon={null} label="Trade License" value={r.trade_license_number} />
                      <InfoRow icon={null} label="Contact Person" value={r.contact_name} />
                      <InfoRow icon={null} label="Branches" value={r.branches_count} />
                      <InfoRow icon={null} label="Submitted" value={r.created_date ? new Date(r.created_date).toLocaleDateString() : '—'} />
                      {r.login_password && (
                        <InfoRow icon={null} label="Generated Password" value={r.login_password} highlight />
                      )}
                    </div>

                    {/* Trade License Document */}
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-1.5">Trade License Document</p>
                      {r.trade_license_url ? (
                        <a href={r.trade_license_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent border border-accent/30 bg-accent/5 rounded-xl px-3 py-2 hover:bg-accent/10 transition-colors">
                          <FileText className="w-3.5 h-3.5" /> View Trade License
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No document uploaded.</p>
                      )}
                    </div>

                    {/* Approval Notes */}
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <StickyNote className="w-3 h-3" /> Approval Notes
                      </p>
                      {r.admin_notes && (
                        <p className="text-xs text-foreground bg-muted/50 rounded-lg px-3 py-2 mb-2">{r.admin_notes}</p>
                      )}
                      <textarea
                        value={noteDraft[r.id] || ''}
                        onChange={e => setNoteDraft(p => ({ ...p, [r.id]: e.target.value }))}
                        placeholder="Add an internal note (saved to history)…"
                        rows={2}
                        className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent resize-none"
                      />
                      <button onClick={() => handleSaveNote(r)} disabled={!(noteDraft[r.id] || '').trim() || savingNoteId === r.id}
                        className="mt-1.5 inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-foreground border border-border rounded-lg bg-card hover:border-accent disabled:opacity-40 transition-colors">
                        {savingNoteId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Note
                      </button>
                    </div>

                    {/* Approval History */}
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <History className="w-3 h-3" /> Approval History
                      </p>
                      <RetailerApprovalHistory history={r.approval_history} />
                    </div>

                    {/* Resend Credentials */}
                    {r.status === 'approved' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => handleResendCredentials(r)} disabled={resendingId === r.id}
                          className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-blue-700 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 disabled:opacity-50 transition-colors">
                          {resendingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                          Resend Login Credentials
                        </button>
                        {r.credentials_resent_at && (
                          <span className="text-[10px] text-muted-foreground">Last resent: {new Date(r.credentials_resent_at).toLocaleString('en-GB')}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {r.status === 'pending' && (
                      <div className="space-y-2 pt-1">
                        {showRejectInput === r.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Reason for rejection (optional)…"
                              rows={2}
                              className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-destructive resize-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => { setShowRejectInput(null); setRejectReason(''); }}
                                className="flex-1 h-9 border border-border text-muted-foreground rounded-xl text-xs font-semibold hover:bg-secondary transition-colors">
                                Cancel
                              </button>
                              <button onClick={() => handleReject(r)} disabled={actioningId === r.id}
                                className="flex-1 h-9 bg-destructive hover:bg-destructive/90 disabled:opacity-40 text-destructive-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
                                {actioningId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                Confirm Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(r)} disabled={actioningId === r.id}
                              className="flex-1 h-10 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                              {actioningId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve & Send Credentials
                            </button>
                            <button onClick={() => setShowRejectInput(r.id)}
                              className="flex-1 h-10 border border-destructive/40 text-destructive hover:bg-destructive/10 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {r.status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700">
                        ✅ Approved — Partner Code: <strong>{r.partner_code}</strong> · Credentials sent via email.
                      </div>
                    )}

                    {r.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
                        ❌ Rejected
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</p>
        <p className={`font-semibold mt-0.5 ${highlight ? 'text-accent font-mono' : 'text-foreground'}`}>{value || '—'}</p>
      </div>
    </div>
  );
}