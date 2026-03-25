import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function Payment() {
  const navigate = useNavigate();
  const pathParts = window.location.pathname.split('/');
  const orderId = pathParts[2];

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const [orders, orderItems] = await Promise.all([
      base44.entities.Order.filter({ id: orderId }),
      base44.entities.OrderItem.filter({ order_id: orderId }),
    ]);
    if (orders.length > 0) setOrder(orders[0]);
    setItems(orderItems.filter(i => i.eligible !== false));
  };

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    await base44.entities.Order.update(orderId, {
      status: 'paid',
      payment_status: 'paid',
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    });
    // Order picked up within 24 working hours after payment
    setPaid(true);
    setProcessing(false);
  };

  if (paid) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">
          Payment confirmed! Pack your items in your box and leave it at the hotel reception desk. We'll arrange pickup within <strong className="text-foreground">24 working hours</strong>.
        </p>
        <div className="mt-8 space-y-3">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-12 font-semibold"
            onClick={() => navigate(`/order/${orderId}`)}
          >
            View Order & Tracking
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => navigate('/my-orders')}
          >
            Go to My Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Payment</h1>
          <p className="text-xs text-muted-foreground">{order.order_number}</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{order.box_size} Box</p>
            <p className="text-xs text-muted-foreground">To {order.destination_country}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping ({order.box_size})</span>
            <span>$60.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span>{items.length} eligible items</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Insurance</span>
            <span className="text-green-600">Included</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tracking</span>
            <span className="text-green-600">Included</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-accent">$60.00</span>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-green-600" />
          <span>Secure Payment</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5" />
          <span>All cards accepted</span>
        </div>
      </div>

      {/* Pay button */}
      <Button
        className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-14 text-base"
        onClick={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay $60.00
          </>
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground text-center mt-4">
        By proceeding, you agree to our Terms of Service and Privacy Policy.
        Powered by FedEx & DHL.
      </p>
    </div>
  );
}