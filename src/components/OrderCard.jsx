import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, MapPin, Building2 } from 'lucide-react';
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

const ACTIVE_STATUSES = ['paid', 'packed', 'picked_up', 'in_transit', 'delivered'];

export default function OrderCard({ order }) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const linkTo = isActive ? `/shipment/${order.id}` : `/order/${order.id}`;

  // Primary identifier: hotel name, or destination, or fallback
  const primaryLabel = order.hotel_name || [order.destination_city, order.destination_country].filter(Boolean).join(', ') || order.order_number || `#${order.id?.slice(0, 8)}`;
  const secondaryLabel = order.hotel_name
    ? [order.destination_city, order.destination_country].filter(Boolean).join(', ')
    : order.order_number || `#${order.id?.slice(0, 8)}`;

  return (
    <Link
      to={linkTo}
      className="block bg-card rounded-2xl border border-border p-4 hover:border-accent/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            {order.hotel_name ? (
              <Building2 className="w-5 h-5 text-accent" />
            ) : (
              <MapPin className="w-5 h-5 text-accent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {primaryLabel}
            </p>
            {secondaryLabel !== primaryLabel && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {secondaryLabel}
              </p>
            )}
          </div>
        </div>
        {isActive ? (
          <span className="text-[9px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full shrink-0">TRACK</span>
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", config.color)}>
            {config.label}
          </span>
          {order.box_size && (
            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <Package className="w-3 h-3" />
              {order.box_size}
            </span>
          )}
        </div>
        {order.destination_country && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="w-3 h-3" />
            <span>{order.destination_country}</span>
          </div>
        )}
      </div>
    </Link>
  );
}