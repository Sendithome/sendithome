import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Building2, Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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

  useEffect(() => { loadRetailers(); }, []);

  const loadRetailers = async () => {
    setLoading(true);
    const data = await base44.entities.Retailer.list('-created_date', 200);
    setRetailers(data);
    setLoading(false);
  };

  const handleApprove = async (retailer) => {
    setActioningId(retailer.id);
    await base44.functions.invoke('approveRetailer', { retailer_id: retailer.id });
    await loadRetailers();
    setActioningId(null);
  };

  const handleReject = async (retailer) => {
    setActioningId(retailer.id);
    await base44.entities.Retailer.update(retailer.id, { status: 'rejected' });
    await loadRetailers();
    setActioningId(null);
    setShowRejectInput(null);
    setRejectReason('');
  };

  const filtered = retailers.filter(r => filter === 'all' ? true : r.status === filter);

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

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No {filter} retailers</p>
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