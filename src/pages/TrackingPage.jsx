import { useState, useEffect } from 'react';
import ShipmentMap from '../components/ShipmentMap';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Loader2, MapPin, Clock, CheckCircle2, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

const STATUS_STEPS = [
  { key: 'pending',          label: 'Order Placed',       icon: Package,       desc: 'Your shipment has been registered.' },
  { key: 'receipt_uploaded', label: 'Receipts Uploaded',  icon: CheckCircle2,  desc: 'Shopping receipts have been submitted.' },
  { key: 'payment_pending',  label: 'Payment Pending',    icon: Clock,         desc: 'Awaiting payment confirmation.' },
  { key: 'paid',             label: 'Payment Confirmed',  icon: CheckCircle2,  desc: 'Payment received. Preparing your box.' },
  { key: 'packed',           label: 'Packed',             icon: Package,       desc: 'Your items have been packed and sealed.' },
  { key: 'picked_up',        label: 'Picked Up',          icon: Truck,         desc: 'Shipment collected by courier.' },
  { key: 'in_transit',       label: 'In Transit',         icon: Truck,         desc: 'Your package is on its way.' },
  { key: 'delivered',        label: 'Delivered',          icon: CheckCircle2,  desc: 'Package delivered successfully.' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

function getStepIndex(status) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function TrackingPage() {
  const [trackingInput, setTrackingInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const runSearch = async (rawVal) => {
    const val = (rawVal || '').trim().toUpperCase();
    if (!val) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    // Search by tracking_number OR order_number
    const [byTracking, byOrder] = await Promise.all([
      base44.entities.Order.filter({ tracking_number: val }),
      base44.entities.Order.filter({ order_number: val }),
    ]);

    const found = [...(byTracking || []), ...(byOrder || [])][0] || null;
    if (!found) {
      setError('No shipment found with that tracking or shipment number.');
    } else {
      setOrder(found);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    runSearch(trackingInput);
  };

  // Auto-search when arriving with ?order= or ?tracking= in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('order') || params.get('tracking');
    if (preset) {
      setTrackingInput(preset);
      runSearch(preset);
    }
  }, []);

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #191919 0%, #0D3E7F 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-white">Track Your Shipment</h1>
          <p className="text-sm text-white/70 mt-1">Enter your tracking or shipment number to get real-time updates.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={trackingInput}
            onChange={e => setTrackingInput(e.target.value)}
            placeholder="e.g. SIH-20240001 or FX123456789"
            className="h-12 text-base"
          />
          <Button type="submit" className="h-12 px-6" disabled={loading || !trackingInput.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {/* Error */}
          {searched && !loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-destructive"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Result */}
          {order && !loading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Order Summary Card */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Shipment</p>
                    <p className="font-bold text-lg text-foreground">{order.order_number || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Tracking #</p>
                    <p className="font-mono text-sm font-bold text-foreground">{order.tracking_number || 'Not assigned yet'}</p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Destination</p>
                      <p className="font-medium">{[order.destination_city, order.destination_country].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Box Size</p>
                      <p className="font-medium">{order.box_size || '—'}</p>
                    </div>
                  </div>
                  {order.estimated_delivery && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Est. Delivery</p>
                        <p className="font-medium">{order.estimated_delivery}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => handleSearch()}
                  disabled={loading}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
                </Button>
              </div>

              {/* Map */}
              {order.destination_country && (
                <ShipmentMap order={order} />
              )}

              {/* Timeline */}
              {isCancelled ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive">Shipment Cancelled</p>
                    <p className="text-xs text-muted-foreground mt-0.5">This shipment has been cancelled. Contact support for assistance.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-5">Shipment Timeline</p>
                  <div className="space-y-0">
                    {STATUS_STEPS.map((step, idx) => {
                      const StepIcon = step.icon;
                      const isDone = idx < currentStep;
                      const isCurrent = idx === currentStep;
                      const isPending = idx > currentStep;
                      const isLast = idx === STATUS_STEPS.length - 1;

                      return (
                        <div key={step.key} className="flex gap-4">
                          {/* Left: icon + line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors
                              ${isDone ? 'bg-green-500 border-green-500 text-white' : ''}
                              ${isCurrent ? 'bg-accent border-accent text-white scale-110' : ''}
                              ${isPending ? 'bg-muted border-border text-muted-foreground' : ''}
                            `}>
                              <StepIcon className="w-3.5 h-3.5" />
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 flex-1 min-h-[24px] my-1 rounded-full transition-colors
                                ${isDone ? 'bg-green-400' : 'bg-border'}
                              `} />
                            )}
                          </div>
                          {/* Right: text */}
                          <div className={`pb-5 pt-1 ${isLast ? 'pb-0' : ''}`}>
                            <p className={`text-sm font-semibold ${isCurrent ? 'text-accent' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                              {isCurrent && <span className="ml-2 text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase">Current</span>}
                            </p>
                            <p className={`text-xs mt-0.5 ${isPending ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}