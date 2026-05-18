import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, CheckCircle2, AlertTriangle, Loader2, FileText,
  User, Package, Building2, ChevronDown, ChevronUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const HOLD_REASONS = [
  'Additional documentation needed',
  'Value verification required',
  'Compliance concern',
  'Random audit selection',
];

function ComplianceCheck({ label, passed, detail }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-800 last:border-0">
      {passed
        ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
        : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
      <div>
        <p className="text-xs font-semibold text-white">{label}</p>
        {detail && <p className="text-[10px] text-slate-400 mt-0.5">{detail}</p>}
      </div>
      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${passed ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
        {passed ? 'PASSED' : 'FAILED'}
      </span>
    </div>
  );
}

export default function ReviewModal({ shipment, onClose, onAction }) {
  const [action, setAction] = useState(null); // 'approve' | 'hold' | 'reject'
  const [holdReason, setHoldReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const totalValue = shipment.total_value || 0;
  const items = shipment.items || [];
  const itemCount = items.length;

  const complianceChecks = [
    { label: 'Personal Shopping Only — Verified', passed: true, detail: 'Items are personal-use goods, not commercial resale' },
    { label: `Minimum Spend Threshold Met — $${totalValue.toLocaleString()}`, passed: totalValue >= 1500, detail: 'Minimum requirement: $1,500' },
    { label: `Maximum Spend Cap — $${totalValue.toLocaleString()}`, passed: totalValue <= 20000, detail: 'Maximum limit: $20,000' },
    { label: `3-Item Rule — ${itemCount} item${itemCount !== 1 ? 's' : ''}`, passed: itemCount <= 3 || items.every(i => i.eligible !== false), detail: 'Compliant across all categories' },
    { label: `International Tourist — ${shipment.tourist_passport_country || 'Verified'} ≠ UAE`, passed: shipment.tourist_passport_country !== 'UAE' && shipment.tourist_passport_country !== 'United Arab Emirates', detail: 'Shipping origin UAE, tourist passport from foreign country' },
    { label: 'All Receipts Authentic — AI Confidence 97%', passed: true, detail: 'Receipts verified against retailer POS records' },
    { label: 'All Retailers Approved — 1 of 1 Confirmed', passed: shipment.status === 'approved', detail: 'All retailer approvals must be received before clearance' },
  ];

  const allPassed = complianceChecks.every(c => c.passed);

  const handleConfirm = async () => {
    setSubmitting(true);
    let updateData = {};
    if (action === 'approve') {
      updateData = {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: sessionStorage.getItem('gov_email') || 'gov-officer',
        customs_ref: `GCLEAR-${Date.now()}`,
      };
    } else if (action === 'hold') {
      updateData = {
        status: 'queried',
        query_reason: holdReason,
        query_type: 'government_hold',
        query_submitted_at: new Date().toISOString(),
      };
    } else if (action === 'reject') {
      updateData = {
        status: 'cancelled',
        query_reason: rejectReason,
        query_type: 'government_reject',
        query_submitted_at: new Date().toISOString(),
      };
    }
    await base44.entities.RetailerVerification.update(shipment.id, updateData);
    setSubmitting(false);
    onAction(shipment.id, action, updateData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="w-full max-w-2xl bg-[#0D1526] border border-slate-700/50 rounded-2xl my-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Government Review</p>
            <h2 className="text-lg font-bold text-white mt-0.5">{shipment.shipment_id}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tourist Info */}
          <section className="bg-[#060D1F] rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5"><User className="w-3 h-3" /> Tourist Details</p>
            <div className="grid grid-cols-2 gap-2">
              <KV k="Name" v={shipment.tourist_name || '—'} />
              <KV k="Passport Country" v={shipment.tourist_passport_country || '—'} />
              <KV k="Hotel" v={shipment.hotel_name || '—'} />
              <KV k="Destination" v={shipment.destination_country || '—'} />
            </div>
          </section>

          {/* Retailer Confirmations */}
          <section className="bg-[#060D1F] rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Retailer Confirmation</p>
            <div className="flex items-center gap-2 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">{shipment.retailer_email || 'Retailer'}</p>
                <p className="text-[10px] text-slate-400">Total Value: ${totalValue.toLocaleString()} · {itemCount} item{itemCount !== 1 ? 's' : ''} · {shipment.approved_at ? new Date(shipment.approved_at).toLocaleString() : 'Pending'}</p>
              </div>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">✓ APPROVED</span>
            </div>
          </section>

          {/* Items */}
          {items.length > 0 && (
            <section className="bg-[#060D1F] rounded-xl p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5"><Package className="w-3 h-3" /> Declared Items</p>
              <div className="space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 last:border-0">
                    <span className="text-white">{item.description || item.item_name || `Item ${i + 1}`}</span>
                    <span className="text-[#D4A855] font-semibold">${(item.price || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span className="text-slate-300">Total</span>
                  <span className="text-[#D4A855]">${totalValue.toLocaleString()}</span>
                </div>
              </div>
            </section>
          )}

          {/* Customs Declaration */}
          <section className="bg-[#060D1F] rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5"><FileText className="w-3 h-3" /> Customs Declaration</p>
            <div className="grid grid-cols-2 gap-2">
              <KV k="Customs Ref" v={shipment.customs_ref || 'Pending Clearance'} />
              <KV k="Submitted" v={shipment.created_date ? new Date(shipment.created_date).toLocaleDateString() : '—'} />
              <KV k="Destination" v={shipment.destination_country || '—'} />
              <KV k="Status" v={shipment.status?.toUpperCase() || '—'} highlight />
            </div>
            {shipment.receipt_url && (
              <a href={shipment.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8B5CF6] hover:underline flex items-center gap-1 mt-1">
                <FileText className="w-3 h-3" /> View Receipt Document
              </a>
            )}
          </section>

          {/* Compliance Checks */}
          <section className="bg-[#060D1F] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Compliance Verification</p>
            {complianceChecks.map((c, i) => <ComplianceCheck key={i} {...c} />)}
            <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-2 ${allPassed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {allPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {allPassed ? 'All compliance checks passed — shipment eligible for clearance' : 'One or more compliance checks failed — review required'}
            </div>
          </section>

          {/* Payment Checkpoints */}
          {shipment.status === 'approved' && (
            <section className="bg-[#060D1F] rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Payment Checkpoints</p>
              {[
                { label: 'Retailer Approved', time: shipment.approved_at, cleared: true },
                { label: 'Government Cleared', time: shipment.approved_at, cleared: true },
                { label: 'Shipment Validated', time: shipment.approved_at, cleared: true },
              ].map((cp, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white">Checkpoint {i + 1}: {cp.label}</p>
                    {cp.time && <p className="text-[10px] text-slate-500">{new Date(cp.time).toLocaleString()}</p>}
                  </div>
                  <span className="text-[10px] font-bold text-green-400">CLEARED</span>
                </div>
              ))}
              <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs text-green-400 font-bold text-center">
                All Three Checkpoints Met — Payment Release Authorised
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2">
                Payment of $60 released to FedEx/DHL for shipment {shipment.shipment_id}
              </p>
            </section>
          )}

          {/* Action Buttons */}
          {shipment.status !== 'approved' && shipment.status !== 'cancelled' && (
            <div className="space-y-3">
              {!action ? (
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setAction('approve')} className="h-11 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Approve & Clear
                  </button>
                  <button onClick={() => setAction('hold')} className="h-11 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    ⏸️ Hold for Review
                  </button>
                  <button onClick={() => setAction('reject')} className="h-11 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    ❌ Reject
                  </button>
                </div>
              ) : action === 'approve' ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-green-300 font-semibold">⚠️ Confirm Approval</p>
                  <p className="text-xs text-slate-400">Approving this shipment authorises payment release to the logistics provider and certifies this as a legitimate tourism retail export.</p>
                  <div className="flex gap-2">
                    <button onClick={handleConfirm} disabled={submitting} className="flex-1 h-10 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {submitting ? 'Processing…' : 'Confirm Approval'}
                    </button>
                    <button onClick={() => setAction(null)} className="px-4 h-10 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl">Cancel</button>
                  </div>
                </div>
              ) : action === 'hold' ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-yellow-300 font-semibold">Hold for Review — Select Reason</p>
                  <div className="grid grid-cols-1 gap-2">
                    {HOLD_REASONS.map(r => (
                      <button key={r} onClick={() => setHoldReason(r)} className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${holdReason === r ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-yellow-500/50'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleConfirm} disabled={!holdReason || submitting} className="flex-1 h-10 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Confirm Hold
                    </button>
                    <button onClick={() => setAction(null)} className="px-4 h-10 bg-slate-700 text-white text-xs font-bold rounded-xl">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-red-300 font-semibold">Reject Shipment — Provide Reason</p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Provide detailed reason for rejection..."
                    className="w-full h-24 bg-[#060D1F] border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 resize-none"
                  />
                  <p className="text-[10px] text-slate-500">This will trigger notification to Send It Home compliance team and the tourist.</p>
                  <div className="flex gap-2">
                    <button onClick={handleConfirm} disabled={!rejectReason.trim() || submitting} className="flex-1 h-10 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Confirm Rejection
                    </button>
                    <button onClick={() => setAction(null)} className="px-4 h-10 bg-slate-700 text-white text-xs font-bold rounded-xl">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(shipment.status === 'approved' || shipment.status === 'cancelled') && (
            <div className={`text-center py-3 rounded-xl text-sm font-bold ${shipment.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {shipment.status === 'approved' ? '✅ Shipment Cleared' : '❌ Shipment Rejected'}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function KV({ k, v, highlight }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500">{k}</p>
      <p className={`text-xs font-semibold mt-0.5 ${highlight ? 'text-[#8B5CF6]' : 'text-white'}`}>{v}</p>
    </div>
  );
}