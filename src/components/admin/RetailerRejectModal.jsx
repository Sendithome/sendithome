import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export default function RetailerRejectModal({ retailer, onConfirm, onClose, processing }) {
  const [reason, setReason] = useState('');
  if (!retailer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Reject Retailer?</h3>
            <p className="text-xs text-muted-foreground">{retailer.store_name}{retailer.brand_name ? ` (${retailer.brand_name})` : ''}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Are you sure you want to reject this retailer? They will not be able to access the retailer portal.</p>
        <label className="text-xs font-semibold text-muted-foreground">Internal rejection reason (optional)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection…" rows={3}
          className="mt-1.5 w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-destructive resize-none" />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 h-10 border border-border text-muted-foreground rounded-xl text-xs font-semibold hover:bg-muted transition-colors">Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={processing}
            className="flex-1 h-10 bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-destructive-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
            {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Reject Retailer
          </button>
        </div>
      </div>
    </div>
  );
}