import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Receipt, Truck } from 'lucide-react';
import ShipmentDocuments from '../components/ShipmentDocuments';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import TrackingTimeline from '../components/TrackingTimeline';
import { cn } from '@/lib/utils';

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

export default function OrderDetail() {
  const navigate = useNavigate();
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[2];

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!orderId) return;
    loadData();
  }, [orderId]);

  const loadData = async () => {
    const [orders, orderItems] = await Promise.all([
      base44.entities.Order.filter({ id: orderId }),
      base44.entities.OrderItem.filter({ order_id: orderId }),
    ]);
    if (orders.length > 0) setOrder(orders[0]);
    setItems(orderItems);
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const eligibleItems = items.filter(i => i.eligible !== false);
  const needsReceipts = order.status === 'pending';
  const needsPayment = order.status === 'receipt_uploaded' || order.status === 'payment_pending';

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/my-orders')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">{order.order_number || 'Shipment'}</h1>
          <p className="text-xs text-white/60">{order.box_size} box · {order.destination_country}</p>
        </div>
        <span className={cn("text-[10px] font-semibold px-3 py-1.5 rounded-full", config.color)}>
          {config.label}
        </span>
      </div>

      {/* Action cards */}
      {needsReceipts && (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Receipt className="w-5 h-5 text-accent mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Upload your shopping receipts</p>
              <p className="text-xs text-white/60 mt-0.5">Our AI will scan and extract eligible items</p>
              <Button asChild size="sm" className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium">
                <Link to={`/order/${orderId}/receipts`}>Upload Receipts</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tourist Portal CTA for active shipments */}
      {['paid', 'packed', 'picked_up', 'in_transit', 'delivered'].includes(order.status) && (
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-accent mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Track your shipment</p>
              <p className="text-xs text-white/60 mt-0.5">View live tracking, your items, and customs documents</p>
              <Button asChild size="sm" className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium">
                <Link to={`/shipment/${orderId}`}>Open Shipment Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery details */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Delivery Details</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium">{order.recipient_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Address</span>
            <span className="font-medium text-right max-w-[60%]">{order.destination_address}, {order.destination_city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Country</span>
            <span className="font-medium">{order.destination_country}</span>
          </div>
          {order.hotel_name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hotel</span>
              <span className="font-medium">{order.hotel_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      {eligibleItems.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">Items ({eligibleItems.length})</span>
          </div>
          <div className="space-y-2">
            {eligibleItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <div>
                  <span className="font-medium">{item.item_name}</span>
                  <span className="text-muted-foreground text-xs ml-2">×{item.quantity}</span>
                </div>
                <span className="text-muted-foreground">{item.currency} {item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents — download only */}
      <div className="mt-4">
        <ShipmentDocuments orderId={orderId} order={order} items={items} />
      </div>
    </div>
  );
}