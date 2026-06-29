import { X, Clock, CheckCircle2, AlertTriangle, Package, MapPin, FileText, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const STATUS_CONFIG = {
  pending:   { label: 'Awaiting Approval',  color: 'text-yellow-600',  bg: 'bg-yellow-50 border-yellow-200' },
  overdue:   { label: 'Overdue',             color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
  queried:   { label: 'Queried',             color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
  approved:  { label: 'Approved',            color: 'text-green-600',   bg: 'bg-green-50 border-green-200' },
  cancelled: { label: 'Cancelled',           color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200' },
};

export default function ShipmentDetailModal({ verification, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!verification) return null;

  const v = verification;
  const status = STATUS_CONFIG[v.status] || STATUS_CONFIG.pending;
  const isOverdue = v.status === 'pending' && v.deadline_at && new Date(v.deadline_at) < new Date();

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const order = {
      order_number: v.shipment_id,
      recipient_name: v.tourist_name,
      hotel_name: v.hotel_name,
      hotel_country: 'United Arab Emirates',
      nationality: v.tourist_passport_country,
      destination_country: v.destination_country,
    };
    const items = (v.items || []).map(i => ({
      item_name: i.description || i.item_name || 'Item',
      category: i.category || '',
      quantity: 1,
      price: i.price || 0,
      currency: 'USD',
      eligible: i.eligible !== false,
    }));
    try {
      const response = await base44.functions.invoke('generateDeclarationPDF', { order, items, signature: null });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customs-declaration-${v.shipment_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error', err);
    }
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <p className="text-sm font-bold text-foreground font-mono">{v.shipment_id}</p>
            <p className="text-[11px] text-muted-foreground">{v.tourist_name} · {v.tourist_passport_country || '—'}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status + Countdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${isOverdue ? STATUS_CONFIG.overdue.bg + ' ' + STATUS_CONFIG.overdue.color : status.bg + ' ' + status.color}`}>
              {isOverdue ? 'Overdue' : status.label}
            </span>
            {v.status === 'pending' && v.deadline_at && (
              <CountdownBadge deadline_at={v.deadline_at} />
            )}
          </div>

          {/* Shipment Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <InfoBox icon={<Package className="w-3 h-3" />} label="Destination" value={v.destination_country || '—'} />
            <InfoBox icon={<MapPin className="w-3 h-3" />} label="Hotel" value={v.hotel_name || '—'} />
            <InfoBox icon={<Clock className="w-3 h-3" />} label="Created" value={v.created_date ? new Date(v.created_date).toLocaleDateString('en-GB') : '—'} />
            <InfoBox icon={<CheckCircle2 className="w-3 h-3" />} label="Approved" value={v.approved_at ? new Date(v.approved_at).toLocaleDateString('en-GB') : '—'} />
          </div>

          {/* Query reason */}
          {v.status === 'queried' && v.query_reason && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-700">
              <span className="font-semibold">Query: </span>{v.query_reason}
            </div>
          )}

          {/* Value breakdown */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Declared Value</span>
              <span className="font-bold text-foreground">${(v.total_value || 0).toFixed(2)}</span>
            </div>
            {v.commission_amount && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Commission</span>
                <span className="font-bold text-amber-600">${v.commission_amount.toFixed(2)}</span>
              </div>
            )}
            {v.customs_ref && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Customs Ref</span>
                <span className="font-mono text-foreground">{v.customs_ref}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {v.items && v.items.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Items ({v.items.length})</p>
              <div className="space-y-1">
                {v.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-muted/30 rounded-lg px-3 py-2 text-xs">
                    <div>
                      <p className="font-medium text-foreground">{item.description || item.item_name || 'Item'}</p>
                      <p className="text-muted-foreground">{item.category}{item.hs_code ? ` · HS: ${item.hs_code}` : ''}</p>
                    </div>
                    <p className="font-semibold text-foreground">${(item.price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button onClick={handleDownloadPDF} disabled={downloading}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 text-xs font-semibold bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 disabled:opacity-50 transition-colors">
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download Declaration PDF
            </button>
            <button onClick={onClose}
              className="h-9 px-4 flex items-center justify-center text-xs font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <p className="text-[9px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">{icon} {label}</p>
      <p className="font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function CountdownBadge({ deadline_at }) {
  if (!deadline_at) return null;
  const diff = new Date(deadline_at) - new Date();
  if (diff <= 0) return <span className="text-[10px] text-red-500 font-bold">⏱ OVERDUE</span>;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return (
    <span className="text-[10px] text-yellow-600 font-medium flex items-center gap-0.5">
      <Clock className="w-3 h-3" />{hours}h {mins}m left
    </span>
  );
}