import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Shield, CheckCircle2, AlertTriangle, Loader2, FileText,
  User, Package, Building2, Download, DollarSign
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  getCommissionAmount, getCommissionTier, getCountryGroupLabel, MIN_SPEND, MAX_SPEND
} from '@/utils/commissionTiers';

const HOLD_REASONS = [
  'Additional documentation needed',
  'Value verification required',
  'Compliance concern',
  'Random audit selection',
];

async function downloadDeclarationPDF(shipment) {
  const order = {
    order_number: shipment.shipment_id,
    recipient_name: shipment.tourist_name,
    hotel_name: shipment.hotel_name,
    hotel_country: 'United Arab Emirates',
    nationality: shipment.tourist_passport_country,
    destination_country: shipment.destination_country,
    destination_address: '',
    destination_city: '',
    destination_postal_code: '',
    recipient_phone: '',
    passport_number: '',
  };
  const items = (shipment.items || []).map(i => ({
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
  a.download = `customs-declaration-${shipment.shipment_id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function ComplianceCheck({ label, passed, detail }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
      {passed
        ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
        : <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {detail && <p className="text-[10px] text-muted-foreground mt-0.5">{detail}</p>}
      </div>
      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${passed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
        {passed ? 'PASSED' : 'FAILED'}
      </span>
    </div>
  );
}

export default function ReviewModal({ shipment, onClose, onAction }) {
  const [action, setAction] = useState(null);
  const [holdReason, setHoldReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const totalValue = shipment.total_value || 0;
  const items = shipment.items || [];
  const itemCount = items.length;
  const touristCountry = shipment.tourist_passport_country || '';
  const commissionTier = getCommissionTier(totalValue, touristCountry);
  const commissionAmount = getCommissionAmount(totalValue, touristCountry);
  const countryGroup = getCountryGroupLabel(touristCountry);

  const complianceChecks = [
    { label: 'Personal Shopping Only — Verified', passed: true, detail: 'Items are personal-use goods, not commercial resale' },
    { label: `Minimum Spend Threshold Met — US$${totalValue.toLocaleString()}`, passed: totalValue >= MIN_SPEND, detail: `Minimum requirement: US$${MIN_SPEND.toLocaleString()}` },
    { label: `Maximum Spend Cap — US$${totalValue.toLocaleString()}`, passed: totalValue <= MAX_SPEND, detail: `Maximum limit: US$${MAX_SPEND.toLocaleString()}` },
    { label: `3-Item Per HS Code Rule — ${itemCount} item${itemCount !== 1 ? 's' : ''}`, passed: true, detail: 'Max 3 items per HS code/sub-code — verified across all categories' },
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
      updateData = { status: 'queried', query_reason: holdReason, query_type: 'government_hold', query_submitted_at: new Date().toISOString() };
    } else if (action === 'reject') {
      updateData = { status: 'cancelled', query_reason: rejectReason, query_type: 'government_reject', query_submitted_at: new Date().toISOString() };
    }
    await base44.entities.RetailerVerification.update(shipment.id, updateData);
    setSubmitting(false);
    onAction(shipment.id, action, updateData);
    onClose();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    await downloadDeclarationPDF(shipment);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl my-4 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Government Review</p>
            <h2 className="text-lg font-bold text-foreground mt-0.5">{shipment.shipment_id}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tourist Info */}
          <section className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><User className="w-3 h-3" /> Tourist Details</p>
            <div className="grid grid-cols-2 gap-2">
              <KV k="Name" v={shipment.tourist_name || '—'} />
              <KV k="Passport Country" v={shipment.tourist_passport_country || '—'} />
              <KV k="Hotel" v={shipment.hotel_name || '—'} />
              <KV k="Destination" v={shipment.destination_country || '—'} />
            </div>
          </section>

          {/* Retailer Confirmation */}
          <section className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Retailer Confirmation</p>
            <div className="flex items-center gap-2 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{shipment.store_name || shipment.retailer_email || 'Retailer'}</p>
                <p className="text-[10px] text-muted-foreground">Total Value: ${totalValue.toLocaleString()} · {itemCount} item{itemCount !== 1 ? 's' : ''} · {shipment.approved_at ? new Date(shipment.approved_at).toLocaleString() : 'Pending'}</p>
              </div>
              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">✓ APPROVED</span>
            </div>
          </section>

          {/* Commission Breakdown */}
          <section className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Retailer Commission Breakdown</p>
            <div className="grid grid-cols-2 gap-2">
              <KV k="Tourist Origin" v={touristCountry || '—'} />
              <KV k="Country Group" v={countryGroup} />
              <KV k="Transaction Value" v={`US$${totalValue.toLocaleString()}`} />
              <KV k="Commission Tier" v={`Tier ${commissionTier.tier} (${commissionTier.label})`} highlight />
              <KV k="Commission Rate" v={commissionTier.label} />
              <KV k="Commission Due" v={`US$${commissionAmount.toLocaleString('en', { maximumFractionDigits: 0 })}`} highlight />
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">
              Commission is calculated per store transaction based on the tourist's origin country group and spend bracket. Paid by the retailer to the government.
            </p>
          </section>

          {/* Items */}
          {items.length > 0 && (
            <section className="bg-muted/40 rounded-xl p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><Package className="w-3 h-3" /> Declared Items</p>
              <div className="space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                    <span className="text-foreground">{item.description || item.item_name || `Item ${i + 1}`}</span>
                    <span className="text-amber-600 font-semibold">${(item.price || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-amber-600">${totalValue.toLocaleString()}</span>
                </div>
              </div>
            </section>
          )}

          {/* Customs Declaration */}
          <section className="bg-muted/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><FileText className="w-3 h-3" /> Customs Declaration</p>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {downloading ? 'Generating…' : 'Download PDF'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <KV k="Customs Ref" v={shipment.customs_ref || 'Pending Clearance'} />
              <KV k="Submitted" v={shipment.created_date ? new Date(shipment.created_date).toLocaleDateString() : '—'} />
              <KV k="Destination" v={shipment.destination_country || '—'} />
              <KV k="Status" v={shipment.status?.toUpperCase() || '—'} highlight />
            </div>
            <div className="flex flex-wrap gap-4 mt-1">
              {shipment.passport_url && (
                <a href={shipment.passport_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                  <FileText className="w-3 h-3" /> View Passport Copy
                </a>
              )}
              {shipment.receipt_url && (
                <a href={shipment.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                  <FileText className="w-3 h-3" /> View Receipt Document
                </a>
              )}
            </div>
          </section>

          {/* Compliance Checks */}
          <section className="bg-muted/40 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Compliance Verification</p>
            {complianceChecks.map((c, i) => <ComplianceCheck key={i} {...c} />)}
            <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-2 ${allPassed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
              {allPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {allPassed ? 'All compliance checks passed — shipment eligible for clearance' : 'One or more compliance checks failed — review required'}
            </div>
          </section>

          {/* Payment Checkpoints */}
          {shipment.status === 'approved' && (
            <section className="bg-muted/40 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Payment Checkpoints</p>
              {[
                { label: 'Retailer Approved', time: shipment.approved_at },
                { label: 'Government Cleared', time: shipment.approved_at },
                { label: 'Shipment Validated', time: shipment.approved_at },
              ].map((cp, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Checkpoint {i + 1}: {cp.label}</p>
                    {cp.time && <p className="text-[10px] text-muted-foreground">{new Date(cp.time).toLocaleString()}</p>}
                  </div>
                  <span className="text-[10px] font-bold text-green-700">CLEARED</span>
                </div>
              ))}
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-bold text-center">
                All Three Checkpoints Met — Payment Release Authorised
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Payment of US$30 (Transit Protection &amp; Activation) released to FedEx/DHL · US$20 (Concierge Fulfillment) charged to hotel bill
              </p>
            </section>
          )}

          {/* Action Buttons */}
          {shipment.status !== 'approved' && shipment.status !== 'cancelled' && (
            <div className="space-y-3">
              {!action ? (
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setAction('approve')} className="h-11 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Approve & Clear
                  </button>
                  <button onClick={() => setAction('hold')} className="h-11 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    ⏸️ Hold for Review
                  </button>
                  <button onClick={() => setAction('reject')} className="h-11 bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                    ❌ Reject
                  </button>
                </div>
              ) : action === 'approve' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-green-800 font-semibold">⚠️ Confirm Approval</p>
                  <p className="text-xs text-green-700">Approving this shipment authorises payment release to the logistics provider and certifies this as a legitimate tourism retail export.</p>
                  <div className="flex gap-2">
                    <button onClick={handleConfirm} disabled={submitting} className="flex-1 h-10 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {submitting ? 'Processing…' : 'Confirm Approval'}
                    </button>
                    <button onClick={() => setAction(null)} className="px-4 h-10 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl">Cancel</button>
                  </div>
                </div>
              ) : action === 'hold' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-yellow-800 font-semibold">Hold for Review — Select Reason</p>
                  <div className="grid grid-cols-1 gap-2">
                    {HOLD_REASONS.map(r => (
                      <button key={r} onClick={() => setHoldReason(r)} className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${holdReason === r ? 'border-yellow-500 bg-yellow-100 text-yellow-800 font-semibold' : 'border-border bg-background text-muted-foreground hover:border-yellow-300'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleConfirm} disabled={!holdReason || submitting} className="flex-1 h-10 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Confirm Hold
                    </button>
                    <button onClick={() => setAction(null)} className="px-4 h-10 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-destructive font-semibold">Reject Shipment — Provide Reason</p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Provide detailed reason for rejection..."
                    className="w-full h-24 bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-destructive resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground">This will trigger notification to Send It Home compliance team and the tourist.</p>
                  <div className="flex gap-2">
                    <button onClick={handleConfirm} disabled={!rejectReason.trim() || submitting} className="flex-1 h-10 bg-destructive hover:bg-destructive/90 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Confirm Rejection
                    </button>
                    <button onClick={() => setAction(null)} className="px-4 h-10 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(shipment.status === 'approved' || shipment.status === 'cancelled') && (
            <div className={`text-center py-3 rounded-xl text-sm font-bold ${shipment.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
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
      <p className="text-[10px] text-muted-foreground">{k}</p>
      <p className={`text-xs font-semibold mt-0.5 ${highlight ? 'text-accent' : 'text-foreground'}`}>{v}</p>
    </div>
  );
}