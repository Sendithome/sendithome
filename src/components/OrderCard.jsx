import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700' },
  receipt_uploaded: { label: 'Receipt Uploaded', color: 'bg-blue-50 text-blue-700' },
  payment_pending: { label: 'Awaiting Payment', color: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Confirmed', color: 'bg-green-50 text-green-700' },
  packed: { label: 'Packed', color: 'bg-indigo-50 text-indigo-700' },
  picked_up: { label: 'Picked Up', color: 'bg-purple-50 text-purple-700' },
  in_transit: { label: 'In Transit', color: 'bg-accent/10 text-accent' },
  delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700' },
};

export default function OrderCard({ order }) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <Link
      to={`/order/${order.id}`}
      className="block bg-card rounded-2xl border border-border p-4 hover:border-accent/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {order.box_size} Box
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.order_number || `#${order.id?.slice(0, 8)}`}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", config.color)}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Truck className="w-3 h-3" />
          <span>{order.destination_country || 'Not set'}</span>
        </div>
      </div>
    </Link>
  );
}