import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, X, Gift, Plane, Settings, Smile, Sparkles, Route,
  CheckCircle2, ShoppingBag
} from 'lucide-react';

const sections = [
  {
    icon: Gift,
    title: '1. What Send It Home Is',
    body: 'Your holiday shopping, shipped from your hotel to your front door.\n\nSend It Home is a hotel-based shipping service for the things you buy on your trip. Instead of squeezing purchases into your suitcase or paying excess baggage, you register them at your hotel and we deliver them home.\n\nNo excess baggage fees. No airport queues. No customs confusion.\n\nConvenience Delivered Seamlessly.',
  },
  {
    icon: Settings,
    title: '2. How It Works for You',
    body: 'Built to be done in about 3 minutes, right from your hotel:\n\n• Scan & register your purchases from the QR code in your room or at reception.\n• Choose your box — 10kg or 20kg, same flat price (so you can size up and bring more home).\n• Pay a simple flat rate through secure Stripe checkout.\n• Hand your items + receipts to the concierge team — they pack and seal the box in front of you.\n• Stored under CCTV until FedEx or DHL collects it.\n• Track it all the way to your doorstep.',
  },
  {
    icon: Smile,
    title: '3. Your Benefits as a Tourist',
    list: [
      'Shop freely — forget the 23kg airline luggage limit.',
      'Save money — one flat box rate vs. $300+ for an extra checked bag.',
      'Pack-free travel — walk to your gate with just your carry-on.',
      'Skip the tax-refund queue at the airport entirely.',
      'Arrives safely — professionally packed by trained hotel staff.',
      'Always know where it is — real-time FedEx/DHL tracking.',
    ],
  },
  {
    icon: Sparkles,
    title: "4. Why It's Different for You",
    list: [
      'One flat price per box — not confusing weight-based courier pricing.',
      'From your hotel lobby — not a courier depot across town.',
      'Customs paperwork done for you — generated automatically from your declared items.',
      'Personal Shopping Only — a strict policy that keeps every shipment compliant, trusted, and hassle-free at customs.',
      'Same price, bigger box — more of your trip comes home for the same cost.',
    ],
  },
  {
    icon: Route,
    title: '5. Your Step-by-Step Journey',
    steps: [
      'Scan the QR code at your hotel.',
      'Register your items and home address (~3 min).',
      'Choose your box — 10kg or 20kg, same price.',
      'Pay the flat rate via secure checkout.',
      'Drop off items + receipts at the concierge; watch them pack and seal.',
      'We collect, ship, and track via FedEx/DHL — straight to your door.',
    ],
  },
];

export default function FrictionFreeShoppingPass({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-2xl h-[100dvh] sm:h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Sticky header with Back button */}
            <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-6 sm:px-8 sm:py-8">
              {/* Hero */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <Plane className="w-7 h-7 text-accent-foreground" />
                </div>
                <h1 className="text-2xl font-black text-accent mb-1">Friction-Free Shopping Pass.</h1>
                <p className="text-lg font-bold text-foreground">Sail Through the Airport.</p>
                <p className="text-sm text-muted-foreground mt-2">Welcome to <span className="font-bold text-foreground">Send it Home</span></p>
              </div>

              {/* Intro */}
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-8">
                <p>
                  We've all been there: you're standing in a gorgeous boutique overseas, looking at a stunning pair of shoes or an incredible jacket, and that annoying little voice in your head stops you. "How am I going to fit this in my suitcase?" "Do I really want to drag this through three airport transfers?" "Is it worth standing in that massive, chaotic tax-refund line at 4:00 AM before my flight?" The airport tax and luggage game is broken. It adds friction to your holiday and ruins the thrill of shopping.
                </p>
                <p>
                  That's why we created <strong className="text-foreground">Send it Home</strong> — a brand-new, first-of-its-kind shopping corridor built entirely around your freedom.
                </p>
                <p className="font-semibold text-foreground">No heavy bags. No customs lines. No airport baggage stress.</p>
                <p className="font-semibold text-accent">Just ultimate shopping mobility.</p>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {sections.map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="text-base font-bold text-foreground">{section.title}</h3>
                      </div>

                      {section.body && (
                        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {section.body}
                        </div>
                      )}

                      {section.list && (
                        <ul className="space-y-2.5 mt-1">
                          {section.list.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.steps && (
                        <ol className="space-y-3 mt-1">
                          {section.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                              <div className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 text-xs font-bold">
                                {i + 1}
                              </div>
                              <span className="mt-1">{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTA at bottom */}
              <div className="mt-8 text-center">
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Got it — Let's Start
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}