import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Check, Package, Lock, ChevronDown } from 'lucide-react';
import { convertToLocalCurrency } from '../utils/currencyConversion';
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
  const [showItems, setShowItems] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0,2) + '/' + d.slice(2) : d;
  };
  const cardValid = cardNumber.replace(/\s/g,'').length === 16 && cardName.trim().length > 1 && expiry.length === 5 && cvv.length >= 3;

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
    if (!cardValid) return;
    setProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2500));
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
            Go to My Shipments
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
          <span className="text-muted-foreground">Transit Protection &amp; Activation</span>
          <span className="font-semibold">$30.00 USD</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Concierge Fulfillment</span>
          <span className="text-muted-foreground">$20 — charged to hotel bill</span>
        </div>
        <div className="border-t border-border">
          <button
            onClick={() => setShowItems(!showItems)}
            className="w-full flex justify-between text-sm py-2 items-center"
          >
            <span className="text-muted-foreground">Items</span>
            <span className="text-accent font-semibold flex items-center gap-1">
              {items.length} eligible {items.length === 1 ? 'item' : 'items'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showItems ? 'rotate-180' : ''}`} />
            </span>
          </button>
          {showItems && (
            <div className="space-y-1.5 pb-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-muted-foreground pl-2">
                  <span>{item.item_name} ×{item.quantity || 1}</span>
                  <span>{item.currency} {item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Insurance ($2,000 coverage)</span>
          <span className="text-green-600">Included</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tracking</span>
          <span className="text-green-600">Included</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="font-semibold">Amount Due Now</span>
          <span className="text-2xl font-bold text-accent">$30.00 USD</span>
        </div>
        </div>
      </div>

      {/* Card Payment Form */}
      <div className="mt-6 bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-foreground">Secure Card Payment</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">VISA</span>
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">MC</span>
            <span className="text-xs bg-blue-400 text-white px-1.5 py-0.5 rounded font-bold">AMEX</span>
          </div>
        </div>

        {/* Card Number */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Card Number</label>
          <div className="relative mt-1.5">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full h-11 rounded-lg border border-input bg-transparent px-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Card Name */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cardholder Name</label>
          <input
            type="text"
            placeholder="John Smith"
            value={cardName}
            onChange={e => setCardName(e.target.value)}
            className="mt-1.5 w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expiry Date</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              className="mt-1.5 w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CVV / CVC</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="•••"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
              className="mt-1.5 w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Shield className="w-3.5 h-3.5 text-green-600 shrink-0" />
          <span>Your payment info is encrypted with 256-bit SSL. We never store your card details.</span>
        </div>
      </div>

      {/* Pay button */}
      <Button
        className="w-full mt-5 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-14 text-base"
        onClick={handlePayment}
        disabled={processing || !cardValid}
      >
        {processing ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            Processing Payment...
          </div>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay $30.00 USD
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