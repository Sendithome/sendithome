import { useState } from 'react';
import { Package, Truck, Calendar, Hash, Loader2, Save, History } from 'lucide-react';

const STATUS_BADGE = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function ReplenishmentOrderCard({ order, updating, onStatusUpdate, onSaveDetails }) {
  const [eta, setEta] = useState(order.estimated_delivery_date || '');
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const dirty = eta !== (order.estimated_delivery_date || '') || tracking !== (order.tracking_number || '');
  const history = [...(order.status_history || [])].sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));

  const save = async () => {
    setSaving(true);
    await onSaveDetails(order.id, { estimated_delivery_date: eta, tracking_number: tracking });
    setSaving(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Package className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{order.hotel_name}</p>
          <p className="text-xs text-muted-foreground">
            {order.quantity_requested}× {order.box_type} boxes · Triggered {order.triggered_at ? new Date(order.triggered_at).toLocaleDateString('en-GB') : '—'} · Stock at trigger: {order.stock_at_trigger ?? '—'}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}>
          {order.status}
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {order.status === 'pending' && (
            <button disabled={updating} onClick={() => onStatusUpdate(order.id, 'acknowledged')}
              className="px-3 h-7 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Acknowledge
            </button>
          )}
          {order.status === 'acknowledged' && (
            <button disabled={updating} onClick={() => onStatusUpdate(order.id, 'in_transit')}
              className="px-3 h-7 text-[10px] font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              Mark In Transit
            </button>
          )}
          {(order.status === 'acknowledged' || order.status === 'in_transit') && (
            <button disabled={updating} onClick={() => onStatusUpdate(order.id, 'delivered')}
              className="px-3 h-7 text-[10px] font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {updating ? '…' : '✓ Mark Delivered'}
            </button>
          )}
        </div>
      </div>

      {/* Estimated delivery + courier tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-2.5 h-8">
          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <input type="date" value={eta} onChange={e => setEta(e.target.value)}
            className="bg-transparent outline-none text-xs flex-1 text-foreground" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-2.5 h-8">
          <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Courier tracking number"
            className="bg-transparent outline-none text-xs flex-1 text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>
      {dirty && (
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-1.5 h-7 px-3 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save Delivery Details
        </button>
      )}

      {/* Stock movement history */}
      {history.length > 0 && (
        <div>
          <button onClick={() => setShowHistory(s => !s)}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
            <History className="w-3 h-3" /> Stock Movement History ({history.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5 pl-1">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] flex-wrap">
                  <Truck className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="font-semibold text-foreground capitalize">{(h.status || '').replace('_', ' ')}</span>
                  <span className="text-muted-foreground">{h.at ? new Date(h.at).toLocaleString('en-GB') : ''}</span>
                  {h.note && <span className="text-muted-foreground">· {h.note}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}