import { Package, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';

const STATUS_CFG = {
  pending:      { label: 'Pending',      bg: 'bg-yellow-50  border-yellow-200', text: 'text-yellow-700',   icon: Clock },
  acknowledged: { label: 'Acknowledged', bg: 'bg-blue-50    border-blue-200',   text: 'text-blue-700',    icon: Package },
  in_transit:   { label: 'In Transit',   bg: 'bg-purple-50  border-purple-200', text: 'text-purple-700',  icon: Truck },
  delivered:    { label: 'Delivered',    bg: 'bg-green-50   border-green-200',  text: 'text-green-700',   icon: CheckCircle2 },
  cancelled:    { label: 'Cancelled',    bg: 'bg-red-50     border-red-200',    text: 'text-destructive', icon: XCircle },
};

export default function ReplenishmentHistory({ orders = [] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-2xl border border-border">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No replenishment orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map(order => {
        const cfg = STATUS_CFG[order.status] || STATUS_CFG.pending;
        const Icon = cfg.icon;
        return (
          <div key={order.id} className={`rounded-xl border px-4 py-3 flex items-center gap-3 flex-wrap ${cfg.bg}`}>
            <div className={`w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center shrink-0 ${cfg.text}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">
                  {order.quantity_requested}× {order.box_type} boxes
                </p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/60 ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex gap-3 mt-0.5 flex-wrap">
                <p className="text-[10px] text-muted-foreground">
                  Triggered: {order.triggered_at ? new Date(order.triggered_at).toLocaleDateString('en-AE') : '—'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Stock when triggered: {order.stock_at_trigger ?? '—'} boxes
                </p>
                {order.delivered_at && (
                  <p className="text-[10px] text-green-700 font-semibold">
                    Delivered: {new Date(order.delivered_at).toLocaleDateString('en-AE')}
                  </p>
                )}
              </div>
              {order.courier_notes && (
                <p className="text-[10px] text-muted-foreground italic mt-0.5">"{order.courier_notes}"</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}