import { motion } from 'framer-motion';
import {
  Package, Globe, ShieldCheck, Headset, Plane, Sparkles,
  CalendarCheck, BadgeDollarSign, ArrowRight
} from 'lucide-react';
import BrandName from '@/components/BrandName';

const MEMBERSHIP_UNTIL = 'Dec 31, 2029';

const INCLUDED_ITEMS = [
  {
    icon: Package,
    title: 'Your Current Shipment',
    desc: 'Hassle-free shipping of your box today, delivered straight to your home doorstep.',
  },
  {
    icon: Globe,
    title: 'Global Membership Activation',
    desc: `Complimentary membership (valid until ${MEMBERSHIP_UNTIL}) for all your future travels.`,
  },
  {
    icon: ShieldCheck,
    title: 'Premium Protection',
    desc: `Up to US$3,000 in shipping insurance is included for today's shipment and all future shipments through ${MEMBERSHIP_UNTIL}.`,
  },
  {
    icon: Headset,
    title: 'Seamless Shipping Features',
    desc: 'Full digital customs registration, tracking and live human customer service from our premier international courier partners and SendITHome. No endless robot menus—just instant help.',
  },
];

const FUTURE_BENEFITS = [
  {
    icon: Plane,
    title: 'The Global Rate',
    desc: 'Next time you travel to any participating destination, ship a 10kg or 20kg box home for just US$75.',
  },
  {
    icon: ShieldCheck,
    title: 'Same Premium Benefits',
    desc: 'Every future US$75 shipment still includes your US$3,000 insurance, priority tracking, customs clearance, and customer support.',
  },
  {
    icon: Sparkles,
    title: 'More to Come',
    desc: 'Your membership unlocks exclusive global member benefits and partner offers as our network grows.',
  },
];

function Item({ icon: Icon, title, desc, compact }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`shrink-0 rounded-xl bg-accent/10 flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <Icon className={`text-accent ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
      </div>
      <div className="min-w-0">
        <p className={`font-bold text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>{title}</p>
        <p className={`text-muted-foreground leading-relaxed mt-0.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>{desc}</p>
      </div>
    </div>
  );
}

export default function PricingCard() {
  return (
    <div className="mt-4 space-y-5">
      {/* Checkout hero total */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-primary p-5 text-center"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent/15 blur-2xl" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 mb-1.5">Checkout &amp; Activation</p>
          <div className="flex items-end justify-center gap-1.5">
            <span className="text-sm font-semibold text-white/60 mb-1">US$</span>
            <span className="text-5xl font-black text-accent leading-none">150</span>
          </div>
          <p className="text-xs text-white/70 mt-2.5 leading-relaxed max-w-[280px] mx-auto">
            Includes your current shipment +{' '}
            <span className="font-semibold text-white">Premium Global Membership</span> until {MEMBERSHIP_UNTIL}.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-white/10 border border-white/15 rounded-full px-3 py-1">
            <CalendarCheck className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-semibold text-white/80">Membership active through {MEMBERSHIP_UNTIL}</span>
          </div>
        </div>
      </motion.div>

      {/* What's included */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          What's included in your checkout today?
        </p>
        <div className="space-y-3.5">
          {INCLUDED_ITEMS.map((item, i) => (
            <Item key={i} {...item} />
          ))}
        </div>
      </div>

      {/* How it works for future travels */}
      <div className="rounded-2xl bg-accent/5 border border-accent/20 p-4">
        <p className="text-sm font-bold text-foreground">How it works for your future travels</p>
        <p className="text-[11px] text-muted-foreground mb-3.5 mt-1 leading-relaxed">
          Whether you are travelling for business, a holiday, or a conference—your membership goes with you.
        </p>
        <div className="space-y-3">
          {FUTURE_BENEFITS.map((item, i) => (
            <Item key={i} {...item} compact />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-accent/15">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Future shipment rate</span>
          <ArrowRight className="w-3 h-3 text-accent/60" />
          <span className="ml-auto text-base font-black text-accent">US$75</span>
          <span className="text-[10px] text-muted-foreground">/ box</span>
        </div>
      </div>

      {/* Hotel service fee note */}
      <div className="flex items-start gap-2.5 bg-muted/60 border border-border rounded-xl px-3.5 py-3">
        <BadgeDollarSign className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Hotel Service Fee:</span> A separate US$20 concierge fee is charged to your room bill by participating hotels. This directly covers your physical 10kg or 20kg box, all packing materials (bubble wrap, tape), document and customs printing, and secure handover to our international courier. The hotel collects this fee and adds it to your room bill.
        </p>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Your <BrandName /> membership activates instantly at checkout.
      </p>
    </div>
  );
}