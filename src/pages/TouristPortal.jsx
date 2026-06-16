import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, MapPin, Truck, CheckCircle2, Clock, ArrowLeft,
  Globe, Box, FileText, Download, Loader2, ChevronRight,
  Star, RefreshCw, Phone, Home, Plane, ShoppingBag, QrCode,
  AlertCircle, PackageCheck
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TrackingTimeline from '../components/TrackingTimeline';
import { cn } from '@/lib/utils';

const STATUS_STEPS = [
  { key: 'paid',       label: 'Confirmed',   icon: CheckCircle2, desc: 'Payment received & shipment confirmed' },
  { key: 'packed',     label: 'Packed',      icon: Box,          desc: 'Items packed and ready for pickup' },
  { key: 'picked_up',  label: 'Collected',   icon: Truck,        desc: 'Picked up by our courier partner' },
  { key: 'in_transit', label: 'In Transit',  icon: Plane,        desc: 'Your parcel is on its way home!' },
  { key: 'delivered',  label: 'Delivered',   icon: Home,         desc: 'Successfully delivered to your door' },
];

const STATUS_ORDER = ['pending', 'receipt_uploaded', 'payment_pending', 'paid', 'packed', 'picked_up', 'in_transit', 'delivered'];

function getStepIndex(status) {
  return STATUS_ORDER.indexOf(status);
}

const STATUS_CONFIG = {
  pending:           { label: 'Pending',          color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  receipt_uploaded:  { label: 'Processing',        color: 'bg-blue-50 text-blue-700',      dot: 'bg-blue-500' },
  payment_pending:   { label: 'Awaiting Payment',  color: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-500' },
  paid:              { label: 'Confirmed',          color: 'bg-green-50 text-green-700',    dot: 'bg-green-500' },
  packed:            { label: 'Packed',             color: 'bg-indigo-50 text-indigo-700',  dot: 'bg-indigo-500' },
  picked_up:         { label: 'Collected',          color: 'bg-purple-50 text-purple-700',  dot: 'bg-purple-500' },
  in_transit:        { label: 'In Transit',         color: 'bg-orange-50 text-orange-700',  dot: 'bg-orange-500' },
  delivered:         { label: 'Delivered ✓',        color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled:         { label: 'Cancelled',          color: 'bg-red-50 text-red-700',         dot: 'bg-red-400' },
};

const TABS = [
  { id: 'tracking',  label: 'Tracking',    icon: Truck },
  { id: 'items',     label: 'My Items',    icon: ShoppingBag },
  { id: 'details',   label: 'Details',     icon: FileText },
];

export default function TouristPortal() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tracking');
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) loadData();
  }, [orderId]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const [orderData, orderItems] = await Promise.all([
      base44.entities.Order.get(orderId),
      base44.entities.OrderItem.filter({ order_id: orderId }),
    ]);
    if (orderData) setOrder(orderData);
    setItems(orderItems);
    setLoading(false);
    setRefreshing(false);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const eligibleItems = items.filter(i => i.eligible !== false);
    const response = await base44.functions.invoke(
      'generateDeclarationPDF',
      { order, items: eligibleItems, signature: null },
      { responseType: 'arraybuffer' }
    );
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customs-declaration-${order?.order_number || 'SIH'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-foreground font-semibold">Shipment not found</p>
        <button onClick={() => navigate('/my-orders')} className="text-accent text-sm font-semibold">← Back to My Orders</button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const eligibleItems = items.filter(i => i.eligible !== false);
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isPostPayment = getStepIndex(order.status) >= getStepIndex('paid');
  const totalValue = eligibleItems.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
  const currency = eligibleItems[0]?.currency || 'AED';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate('/my-orders')}
          className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{order.order_number || 'Shipment'}</p>
          <p className="text-[10px] text-muted-foreground">{order.box_size} box · {order.destination_country}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-muted-foreground', refreshing && 'animate-spin')} />
          </button>
          <span className={cn('text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1', cfg.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </span>
        </div>
      </header>

      {/* Hero card */}
      <div className="bg-white border-b border-border px-4 py-5">
        <div className="max-w-lg mx-auto">

          {/* Delivery destination strip */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Delivering to</p>
              <p className="text-sm font-bold text-foreground truncate">
                {[order.destination_address, order.destination_city, order.destination_country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          {/* Progress bar (post-payment only) */}
          {isPostPayment && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStepIdx;
                  const active = i === currentStepIdx;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                      <div className={cn(
                        'h-1.5 w-full rounded-full transition-all',
                        done ? 'bg-accent' : 'bg-muted'
                      )} />
                      <p className={cn('text-[8px] font-semibold text-center leading-tight', active ? 'text-accent' : done ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {currentStepIdx >= 0 && (
                <p className="text-[11px] text-muted-foreground text-center mt-1">
                  {STATUS_STEPS[currentStepIdx]?.desc}
                </p>
              )}
            </div>
          )}

          {/* Tracking number */}
          {order.tracking_number && (
            <div className="mt-3 flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">Tracking Number</p>
                <p className="text-sm font-black font-mono text-foreground">{order.tracking_number}</p>
              </div>
              <QrCode className="w-5 h-5 text-muted-foreground" />
            </div>
          )}

          {/* Est delivery */}
          {order.estimated_delivery && (
            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <div>
                <p className="text-[9px] text-green-700 uppercase font-semibold">Estimated Delivery</p>
                <p className="text-xs font-bold text-green-800">{order.estimated_delivery}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <nav className="bg-white border-b border-border px-4 sticky top-[57px] z-20">
        <div className="max-w-lg mx-auto flex gap-0">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors',
                  tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-5">
        <AnimatePresence mode="wait">

          {/* ── TRACKING TAB ── */}
          {tab === 'tracking' && (
            <motion.div key="tracking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Milestone cards */}
              <div className="space-y-2">
                {STATUS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i < currentStepIdx;
                  const active = i === currentStepIdx;
                  const upcoming = i > currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl p-4 border transition-all',
                        active ? 'bg-accent/5 border-accent/30 shadow-sm' :
                        done   ? 'bg-white border-border' :
                                 'bg-white border-border opacity-40'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        active ? 'bg-accent text-white' :
                        done   ? 'bg-green-50' : 'bg-muted'
                      )}>
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-muted-foreground')} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn('text-sm font-bold', active ? 'text-accent' : done ? 'text-foreground' : 'text-muted-foreground')}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                      </div>
                      {active && (
                        <span className="text-[9px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">NOW</span>
                      )}
                      {done && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Delivered celebration */}
              {order.status === 'delivered' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-lg font-black text-emerald-800">Your shopping has arrived!</p>
                  <p className="text-sm text-emerald-700 mt-1">We hope you enjoy your purchases. Thank you for using Send It Home.</p>
                  <div className="flex justify-center gap-1 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
              )}

              {/* Download declaration CTA */}
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="w-full flex items-center justify-between bg-white border border-border rounded-2xl px-4 py-3.5 hover:bg-muted/30 transition-colors disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <FileText className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground">Customs Declaration (CN22/CN23)</p>
                    <p className="text-[10px] text-muted-foreground">Download your signed declaration PDF</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          )}

          {/* ── ITEMS TAB ── */}
          {tab === 'items' && (
            <motion.div key="items" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Summary strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Items', value: eligibleItems.length },
                  { label: 'Box Size', value: order.box_size || '—' },
                  { label: 'Total Value', value: `${currency} ${totalValue.toFixed(0)}` },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-border rounded-2xl p-3 text-center">
                    <p className="text-lg font-black text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Item cards */}
              <div className="space-y-2">
                {eligibleItems.map((item, i) => (
                  <div key={item.id || i} className="bg-white border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.item_name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.category} · qty {item.quantity || 1}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{item.currency} {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                      {item.hs_code && (
                        <p className="text-[9px] font-mono text-blue-700">{item.hs_code}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ineligible items note */}
              {items.filter(i => i.eligible === false).length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3">
                  <p className="text-xs font-semibold text-red-700 mb-2">Not included in shipment</p>
                  {items.filter(i => i.eligible === false).map((item, i) => (
                    <p key={i} className="text-[10px] text-red-600 line-through">{item.item_name} — {item.ineligible_reason}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── DETAILS TAB ── */}
          {tab === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Shipment info */}
              <div className="bg-white border border-border rounded-2xl overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Shipment Info</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'Shipment ID', value: order.order_number },
                    { label: 'Box Size', value: order.box_size },
                    { label: 'Status', value: cfg.label },
                    { label: 'Tracking #', value: order.tracking_number || '—' },
                    { label: 'Est. Delivery', value: order.estimated_delivery || '1–3 working days' },
                    { label: 'Service', value: 'Send It Home · FedEx / DHL' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-foreground text-right max-w-[55%] truncate">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup location */}
              {order.hotel_name && (
                <div className="bg-white border border-border rounded-2xl overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> Pickup Location
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { label: 'Hotel', value: order.hotel_name },
                      { label: 'Room', value: order.hotel_room || '—' },
                      { label: 'Country', value: 'United Arab Emirates' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold text-foreground">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery address */}
              <div className="bg-white border border-border rounded-2xl overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Home className="w-3 h-3" /> Delivery Address
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'Name', value: order.recipient_name },
                    { label: 'Address', value: order.destination_address },
                    { label: 'City', value: order.destination_city },
                    { label: 'Postal Code', value: order.destination_postal_code },
                    { label: 'Country', value: order.destination_country },
                    { label: 'Phone', value: order.recipient_phone || '—' },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-foreground text-right max-w-[60%]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment summary */}
              <div className="bg-white border border-border rounded-2xl overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Payment</p>
                </div>
                <div className="px-4 py-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="font-semibold">$50 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className={cn('font-semibold', order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600')}>
                      {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Declared Goods Value</span>
                    <span className="font-bold">{currency} {totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-primary rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-primary-foreground">Need help?</p>
                  <p className="text-[10px] text-primary-foreground/70 mt-0.5">Our team is available 24/7</p>
                </div>
                <a
                  href="mailto:support@senditome.com"
                  className="flex items-center gap-1.5 text-xs font-bold text-accent bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors"
                >
                  Contact Us <ChevronRight className="w-3 h-3" />
                </a>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}