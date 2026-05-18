import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function useCountdown(deadline) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!deadline) return;
    const calc = () => {
      const diff = new Date(deadline) - new Date();
      setRemaining(diff);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [deadline]);
  return remaining;
}

function CountdownBadge({ deadline }) {
  const remaining = useCountdown(deadline);
  if (remaining === null) return null;
  const isOverdue = remaining <= 0;
  const isUrgent = remaining > 0 && remaining < 6 * 3600 * 1000;
  const hours = Math.max(0, Math.floor(remaining / 3600000));
  const mins = Math.max(0, Math.floor((remaining % 3600000) / 60000));

  if (isOverdue) {
    return (
      <span className="text-xs font-bold text-red-400 bg-red-500/20 border border-red-500/40 rounded-full px-2.5 py-1 animate-pulse flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> OVERDUE — Immediate response required
      </span>
    );
  }
  return (
    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 flex items-center gap-1 ${isUrgent ? 'text-red-400 bg-red-500/20 border border-red-500/30' : 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30'}`}>
      <Clock className="w-3 h-3" />
      Respond within: {hours}h {mins}m
    </span>
  );
}

export default function VerificationCard({ verification, retailer, onApproved, onQueried }) {
  const [expanded, setExpanded] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [queryType, setQueryType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);

  const isOverdue = verification.deadline_at && new Date(verification.deadline_at) < new Date();

  const handleApprove = async () => {
    setSubmitting(true);
    await base44.entities.RetailerVerification.update(verification.id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: retailer?.contact_email || '',
    });
    setSubmitting(false);
    setShowApproveModal(false);
    setApproved(true);
    setTimeout(() => onApproved(verification.id), 2000);
  };

  const handleQuery = async () => {
    setSubmitting(true);
    await base44.entities.RetailerVerification.update(verification.id, {
      status: 'queried',
      query_reason: queryText,
      query_type: queryType,
      query_submitted_at: new Date().toISOString(),
    });
    setSubmitting(false);
    setShowQueryModal(false);
    onQueried(verification.id);
  };

  if (approved) {
    return (
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.5, duration: 0.5 }}
        className="bg-green-500/10 border border-green-500/40 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        <p className="text-sm text-green-300 font-semibold">
          Approved ✓ — Shipment {verification.shipment_id} verified. Commission of ${verification.commission_amount?.toFixed(2)} recorded.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className={`bg-[#111827] border rounded-2xl overflow-hidden transition-colors ${isOverdue ? 'border-red-500/60' : 'border-slate-700'}`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-bold text-white">Shipment {verification.shipment_id} — {verification.tourist_name}</p>
            <div className="mt-1.5">
              <CountdownBadge deadline={verification.deadline_at} />
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white transition-colors shrink-0">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-700 overflow-hidden">
              <div className="p-4 space-y-4">
                {/* Tourist info */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <InfoBlock label="Tourist" value={verification.tourist_name} />
                  <InfoBlock label="Passport Country" value={verification.tourist_passport_country} />
                  <InfoBlock label="Hotel" value={verification.hotel_name} />
                </div>

                {/* Receipt */}
                {verification.receipt_url && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Receipt</p>
                    <a href={verification.receipt_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-green-400 hover:underline">
                      <img src={verification.receipt_url} alt="receipt" className="w-16 h-16 object-cover rounded-lg border border-slate-600" onError={e => e.target.style.display='none'} />
                      <span className="flex items-center gap-1">View full receipt <ExternalLink className="w-3 h-3" /></span>
                    </a>
                  </div>
                )}

                {/* Items table */}
                {verification.items?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Items Purchased at Your Store</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-700">
                            <th className="text-left py-1.5 pr-3">Item Description</th>
                            <th className="text-left py-1.5 pr-3">Category</th>
                            <th className="text-left py-1.5 pr-3">HS Code</th>
                            <th className="text-right py-1.5 pr-3">Price</th>
                            <th className="text-left py-1.5">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verification.items.map((item, i) => (
                            <tr key={i} className="border-b border-slate-800 text-slate-300">
                              <td className="py-2 pr-3 font-medium">{item.description}</td>
                              <td className="py-2 pr-3">{item.category}</td>
                              <td className="py-2 pr-3 font-mono">{item.hs_code || '—'}</td>
                              <td className="py-2 pr-3 text-right">${item.price?.toFixed(2)}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.eligible ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {item.eligible ? 'Eligible' : 'Ineligible'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between mt-3 pt-2 border-t border-slate-700">
                      <div>
                        <span className="text-xs text-slate-400">Total value from your store: </span>
                        <span className="text-sm font-bold text-white">${verification.total_value?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Commission payable: </span>
                        <span className="text-sm font-bold text-[#D4A855]">${verification.commission_amount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipment info */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <InfoBlock label="Destination" value={verification.destination_country} />
                  <InfoBlock label="Customs Ref" value={verification.customs_ref || '—'} />
                  <InfoBlock label="Shipment Date" value={verification.shipment_date ? new Date(verification.shipment_date).toLocaleDateString() : '—'} />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowApproveModal(true)}
                    className="flex-1 h-11 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Approve Export
                  </button>
                  <button onClick={() => setShowQueryModal(true)}
                    className="flex-1 h-11 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                    ❓ Query / Dispute
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111827] border border-green-500/40 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-base font-bold text-[#D4A855] mb-3">Confirm Export Approval</h3>
            <div className="bg-[#0B1120] rounded-xl p-4 text-xs text-slate-300 space-y-2 leading-relaxed mb-4">
              <p>You are confirming that:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>These items were genuinely purchased at <strong className="text-white">{retailer?.store_name}</strong> on {verification.shipment_date ? new Date(verification.shipment_date).toLocaleDateString() : '—'}.</li>
                <li>The receipt is authentic.</li>
                <li>You approve the export of these goods through the Send It Home certified channel.</li>
                <li>Commission of <strong className="text-[#D4A855]">${verification.commission_amount?.toFixed(2)}</strong> is payable.</li>
              </ol>
              <p className="text-slate-500 italic mt-2">This confirmation is legally binding and forms part of the export documentation.</p>
            </div>
            <label className="flex items-start gap-2 cursor-pointer mb-4">
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-0.5 accent-green-500" />
              <span className="text-xs text-slate-300">I confirm the above</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => { setShowApproveModal(false); setConfirmed(false); }}
                className="flex-1 h-10 border border-slate-600 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleApprove} disabled={!confirmed || submitting}
                className="flex-1 h-10 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Submit Approval
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Query Modal */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111827] border border-yellow-500/40 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-base font-bold text-[#D4A855] mb-3">Query / Dispute Shipment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Issue Type</label>
                <select value={queryType} onChange={e => setQueryType(e.target.value)} className="w-full h-10 bg-[#0B1120] border border-slate-700 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-yellow-500">
                  <option value="">Select reason…</option>
                  {['Receipt not from our store', 'Item description incorrect', 'Price discrepancy', 'Suspected fraud', 'Other'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Please describe your concern:</label>
                <textarea value={queryText} onChange={e => setQueryText(e.target.value)} rows={4}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none" />
              </div>
              <p className="text-xs text-slate-500 italic">Queries pause the 24-hour timer and escalate to Send It Home compliance team.</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowQueryModal(false)}
                className="flex-1 h-10 border border-slate-600 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleQuery} disabled={!queryText || !queryType || submitting}
                className="flex-1 h-10 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Submit Query
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-slate-500 text-[10px] uppercase tracking-wide">{label}</p>
      <p className="text-white font-semibold mt-0.5">{value || '—'}</p>
    </div>
  );
}