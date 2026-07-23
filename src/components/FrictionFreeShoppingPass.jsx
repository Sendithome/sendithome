import { motion, AnimatePresence } from 'framer-motion';
import BrandName from '@/components/BrandName';
import {
  ArrowLeft, X, Gift, Plane, Settings, Smile, Sparkles, Route,
  CheckCircle2, ShoppingBag
} from 'lucide-react';

const sections = [
  {
    icon: Gift,
    title: '1. Travel Light. We\'ll Deliver Your Shopping Home.',
    body: 'Your holiday shopping, shipped from your hotel to your front door.\n\nSendITHome is a hotel-based shipping service for the things you buy on your trip. Instead of squeezing purchases into your suitcase or paying excess baggage, you register them at your hotel and we deliver them home.\n\nA new tourism retail mobility model — convenience delivered seamlessly.\n\nNo excess baggage fees. No airport queues. No customs confusion.',
  },
  {
    icon: Settings,
    title: '2. How It Works for You',
    steps: [
      'Register',
      'Collect Your Box',
      'Shop & Upload Receipts',
      'Pack & Send',
    ],
  },
  {
    icon: Smile,
    title: '3. Benefits of Global Membership',
    list: [
      'Shop without luggage limits.',
      'Continue enjoying your holiday—not your suitcase.',
      'Skip airport baggage queues.',
      'Track every shipment from hotel to home.',
      'Customs documentation completed for you.',
      'Delivered safely to your doorstep.',
    ],
  },
  {
    icon: Sparkles,
    title: '4. Why Choose SendITHome',
    list: [
      'One simple price.',
      'No excess baggage surprises.',
      'Pack when you\'re ready.',
      'Customs documentation prepared automatically.',
      'Protected from hotel to home.',
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
                <p className="text-sm text-muted-foreground mb-1">Welcome to <BrandName className="text-foreground" /></p>
                <h1 className="text-2xl font-black text-accent mb-1">Sail Through the Airport.</h1>
              </div>

              {/* Intro */}
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-8">
                <p>
                  Shopping should be one of the highlights of your holiday—not something you have to squeeze into your suitcase.
                </p>
                <p>
                  With <BrandName className="font-bold text-foreground" />, you can shop with confidence while we deliver your purchases safely from your hotel to your home.
                </p>
                <p className="font-semibold text-foreground">No heavy luggage. No excess baggage fees. No airport stress.</p>
                <p className="font-semibold text-accent">Simply enjoy your holiday—we'll take care of the journey home.</p>
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

              {/* Min spend note */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                Min spend US$1,500 · Personal Shopping Only
              </p>

              {/* CTA at bottom */}
              <div className="mt-6 text-center">
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