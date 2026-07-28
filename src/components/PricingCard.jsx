import { motion } from 'framer-motion';
import {
  Package, Globe, ShieldCheck, Headset, MapPin, Plane, Route,
  MessageCircle, CalendarCheck, BadgeDollarSign
} from 'lucide-react';
import BrandName from '@/components/BrandName';

const MEMBERSHIP_UNTIL = '31 December 2029';

const INCLUDED_ITEMS = [
  {
    icon: Package,
    title: 'Your Initial Shipment',
    desc: 'Expedited delivery of your 10 kg or 20 kg amenity box, shipped directly to your doorstep.',
  },
  {
    icon: Globe,
    title: 'Global Membership',
    desc: `Instant access to exclusive Global Member Rates across all participating SendITHome partner hotels until ${MEMBERSHIP_UNTIL}.`,
  },
  {
    icon: ShieldCheck,
    title: 'Premium Transit Protection',
    desc: 'Up to US$3,000 of Declared Value Transit Protection for eligible personal shopping items.',
  },
  {
    icon: Headset,
    title: 'Seamless Shipping Experience',
    desc: 'Digital customs processing, online shipment tracking, and dedicated human customer support every step of the way.',
  },
  {
    icon: MapPin,
    title: 'Destination Verification',
    desc: 'Available shipping destinations are confirmed during account creation based on active approved shipping corridors.',
  },
];

const FUTURE_BENEFITS = [
  {
    icon: Plane,
    title: 'Global Member Rate',
    desc: `Enjoy the exclusive SendITHome Global Member Rate of US$75 per shipment for every eligible 10 kg or 20 kg official amenity box from participating SendITHome partner hotels until ${MEMBERSHIP_UNTIL}.`,
  },
  {
    icon: Route,
    title: 'Growing Global Network',
    desc: 'Available destinations are confirmed during account creation based on active approved shipping corridors. New global shipping corridors will continue to be added as the SendITHome network expands.',
  },
  {
    icon: ShieldCheck,
    title: 'Premium Transit Protection',
    desc: 'Every eligible shipment includes up to US$3,000 of Declared Value Transit Protection for qualified personal shopping items.',
  },
  {
    icon: Headset,
    title: 'Seamless Shipping Experience',
    desc: 'Every shipment includes digital customs processing, online shipment tracking and dedicated human customer support from collection through to delivery.',
  },
  {
    icon: MessageCircle,
    title: 'Exclusive Member Benefits',
    desc: "As a Global Member, you'll receive updates on new destinations, partner offers and exclusive membership benefits via WhatsApp throughout your membership.",
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
          <div className="flex items-start justify-center gap-0.5">
            <span className="text-5xl font-black text-accent leading-none">US$150</span>
            <sup className="text-lg font-black text-accent leading-none">*</sup>
          </div>
          <p className="text-xs text-white/70 mt-3 leading-relaxed max-w-[300px] mx-auto">
            Includes your initial shipment and <span className="font-semibold text-white">Global Membership</span>, valid through to {MEMBERSHIP_UNTIL}.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-white/10 border border-white/15 rounded-full px-3 py-1">
            <CalendarCheck className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-semibold text-white/80">Global Membership Active Until {MEMBERSHIP_UNTIL}</span>
          </div>
        </div>
      </motion.div>

      {/* What's included today */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          What's Included Today
        </p>
        <div className="space-y-3.5">
          {INCLUDED_ITEMS.map((item, i) => (
            <Item key={i} {...item} />
          ))}
        </div>
      </div>

      {/* Our Future Benefits */}
      <div className="rounded-2xl bg-accent/5 border border-accent/20 p-5">
        <p className="text-lg font-bold text-foreground">Our Future Benefits</p>
        <p className="text-[11px] text-muted-foreground mb-4 mt-1.5 leading-relaxed">
          Your Global Membership travels with you — unlocking member pricing and premium shipping benefits at participating <BrandName /> destinations until {MEMBERSHIP_UNTIL}.
        </p>
        <div className="space-y-4">
          {FUTURE_BENEFITS.map((item, i) => (
            <Item key={i} {...item} compact />
          ))}
        </div>

        {/* Global Member Rate — featured */}
        <div className="rounded-xl bg-accent/10 border-2 border-accent/30 p-4 text-center mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1.5">Global Member Rate</p>
          <div className="flex items-start justify-center gap-0.5">
            <span className="text-3xl font-black text-accent leading-none">US$75</span>
            <sup className="text-sm font-black text-accent leading-none">*</sup>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">per shipment · until {MEMBERSHIP_UNTIL}</p>
        </div>
      </div>

      {/* Hotel Concierge & Amenity Service — supplementary, smaller font */}
      <div className="flex items-start gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2.5">
        <BadgeDollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Hotel Concierge &amp; Amenity Service: US$20</span> — Billed directly to your hotel room account by the hotel. Provides complete on-site white-glove service, including your 10 kg or 20 kg official amenity box, expert packing materials, printing of all customs declarations and shipping documentation, digital box scanning, tamper-proof security taping, and 24/7 hotel CCTV-monitored holding until secure handover to our international courier partner.
        </p>
      </div>

      {/* Pricing footnote */}
      <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
        * Pricing applies to participating <BrandName /> destinations, approved hotels and eligible shipping corridors. Available routes will continue to expand as the <BrandName /> network grows.
      </p>
    </div>
  );
}