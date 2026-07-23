import { motion } from 'framer-motion';
import {
  Package, Globe, ShieldCheck, Headset, Plane, Sparkles,
  CalendarCheck, BadgeDollarSign
} from 'lucide-react';
import BrandName from '@/components/BrandName';

const MEMBERSHIP_UNTIL = '31 December 2029';

const INCLUDED_ITEMS = [
  {
    icon: Package,
    title: "Today's Shipment",
    desc: 'Hassle-free shipping of your box today, delivered straight to your home doorstep.',
  },
  {
    icon: Globe,
    title: 'Global Membership',
    desc: `Global Membership (valid until ${MEMBERSHIP_UNTIL}) for all your future travels.`,
  },
  {
    icon: ShieldCheck,
    title: 'Premium Protection',
    desc: `Up to US$3,000 in shipping protection is included for today's shipment and all future shipments through ${MEMBERSHIP_UNTIL}.`,
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
    title: 'Global Member Rate',
    desc: 'Ship a 10kg or 20kg box home for just US$75 per shipment until 31 December 2029.*',
  },
  {
    icon: ShieldCheck,
    title: 'Same Premium Benefits',
    desc: 'Every Global Member Rate shipment includes up to US$3,000 shipping protection, customs clearance, priority tracking and customer support.',
  },
  {
    icon: Sparkles,
    title: 'More to Come',
    desc: 'Your Global Membership will continue to unlock new destinations, partner offers and exclusive member benefits as the SendITHome network expands.',
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
    <div className="mt-4 space-y-6">
      {/* Checkout hero total */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-primary p-6 text-center"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent/15 blur-2xl" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 mb-2">Checkout &amp; Activation</p>
          <div className="flex items-end justify-center gap-0.5">
            <span className="text-5xl font-black text-accent leading-none">US$150</span>
            <span className="text-2xl font-black text-accent leading-none mb-1">*</span>
          </div>
          <p className="text-xs text-white/70 mt-3 leading-relaxed max-w-[300px] mx-auto">
            Your <span className="font-semibold text-white">Global Membership</span> is activated today and remains valid until 31 December 2029, giving you access to the Global Member Rate on all future eligible shipments.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-white/10 border border-white/15 rounded-full px-3 py-1">
            <CalendarCheck className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-semibold text-white/80">Global Membership Active Until 31 December 2029</span>
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

      {/* Your Membership Travels With You */}
      <div className="rounded-2xl bg-accent/5 border border-accent/20 p-5">
        <p className="text-lg font-bold text-foreground">Your Membership Travels With You</p>
        <p className="text-[11px] text-muted-foreground mb-4 mt-1.5 leading-relaxed">
          Whether you're travelling for business, a holiday or a conference, your Global Membership gives you access to member pricing and premium shipping benefits at participating SendITHome destinations until 31 December 2029.
        </p>
        <div className="space-y-4">
          {FUTURE_BENEFITS.map((item, i) => (
            <Item key={i} {...item} compact />
          ))}
        </div>
      </div>

      {/* Global Member Rate — second strongest pricing element */}
      <div className="rounded-2xl bg-accent/10 border-2 border-accent/30 p-5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-2">Global Member Rate</p>
        <div className="flex items-end justify-center gap-0.5">
          <span className="text-4xl font-black text-accent leading-none">US$75</span>
          <span className="text-xl font-black text-accent leading-none mb-1">*</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">per shipment · until 31 December 2029</p>
      </div>

      {/* Hotel Packing & Collection Service */}
      <div className="flex items-start gap-2.5 bg-muted/60 border border-border rounded-xl px-3.5 py-3">
        <BadgeDollarSign className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Hotel Packing &amp; Collection Service:</span> A separate US$20 Hotel Packing &amp; Collection Service is charged by participating hotels. This includes your shipping box, packing materials, customs documentation, printing and secure handover to our international courier. The charge is added directly to your hotel account.
        </p>
      </div>

      {/* Membership confirmation */}
      <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-center">
        <p className="text-xs font-semibold text-green-800">
          ✓ Your <BrandName /> Global Membership activates instantly at checkout.
        </p>
      </div>

      {/* Pricing footnote */}
      <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
        * Pricing applies to participating SendITHome destinations, approved hotels and eligible shipping corridors. Available routes will continue to expand as the SendITHome network grows.
      </p>
    </div>
  );
}