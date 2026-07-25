import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, QrCode, ArrowRight, CheckCircle2, Clock, Truck,
  DollarSign, Shield, Zap, Box, FileText, Users, Star, Megaphone,
  ShieldCheck, ScrollText, Building2, AlertTriangle
} from 'lucide-react';
import BrandName from '@/components/BrandName';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const PLATINUM = '#D8DEE9';
const GOLD_DIM = 'rgba(201,168,76,0.12)';
const GOLD_BORDER = 'rgba(201,168,76,0.30)';
const NAVY = '#0A0E1A';
const NAVY2 = '#0D1320';
const NAVY3 = '#131B2E';
const CREAM = 'rgba(226,232,240,0.82)';

const OFFICIAL_TAGLINE = 'The Multilateral Retail Mobility & Cross-Border Shopping Corridor Ecosystem';
const SUBTITLE = 'The SendITHome Luxury Guest Shipping Solution';

const YIELD_BENEFITS = [
  {
    icon: Star,
    title: 'Enhance Your Guest Experience',
    desc: 'The hotel serves as the guest service point where concierge staff provide the SENDITHOME experience. Guests collect their complimentary shipping box, pack their purchases, complete a quick digital registration, and leave the sealed box securely with the concierge. All courier documentation is automatically generated, and the courier collects the shipment directly from the hotel within 24 hours, M-F.',
  },
  {
    icon: DollarSign,
    title: 'Guaranteed Ancillary Revenue',
    desc: 'Earn a guaranteed USD $20 for every completed SENDITHOME shipment processed by your hotel — inclusive of custom luxury packaging, inventory management, training, and portal analytics.',
  },
  {
    icon: ShieldCheck,
    title: 'White-Glove Global Support',
    desc: 'Full customer care, tracking, and customs clearing are managed entirely by our tier-one global courier partner, insulating your front-of-house team from post-departure logistics.',
  },
];

const WORKFLOW_STEPS = [
  {
    n: 'a',
    title: 'Validate Credentials',
    badge: 'Takes 2 minutes',
    desc: 'Enter your official Government License Number and Property ID to instantly map your hotel to the national retail network.',
  },
  {
    n: 'b',
    title: 'Deploy Concierge & Media Assets',
    badge: 'Instant Activation',
    desc: 'Download your digital ecosystem kit, including guest-facing QR codes, tracking integrations, and the official DET-mandated digital signage packages ready for immediate upload to your lobby boards and in-room media networks.',
  },
  {
    n: 'c',
    title: 'White-Glove Presentation & Fulfilment',
    badge: 'Free Materials',
    desc: 'Your concierge provides the supplied luxury packing materials and securing tools entirely free of charge. Once packed by the guest, print the pre-generated transit paperwork at the front desk, secure it into the transit pouch, and affix it to the package.',
  },
  {
    n: 'd',
    title: 'VIP Custody & Collection',
    badge: 'Within 24 hours',
    desc: 'Place the prepared shipment in a CCTV-monitored holding area. Our integrated courier network will pick up the parcel within 24 hours (Monday – Friday).',
  },
];

const LIABILITY_POINTS = [
  {
    title: 'Aligned with Standard Luggage Policy',
    desc: 'The property\'s liability during the short-term holding window mirrors standard hotel luggage custody protocols. The hotel is solely responsible for exercising reasonable care of the physical parcel while in its secure holding area.',
  },
  {
    title: 'Comprehensive Transit Insurance',
    desc: 'Once our global courier partner collects and scans the shipment, transit liability transfers immediately to the carrier. Every shipment automatically includes standard protection up to USD $3,000 against damage or loss during transit, with secondary coverage options up to USD $20,000 available directly to the guest for high-value apparel and footwear from the SendITHome platform.',
  },
  {
    title: 'Declining Content Liability',
    desc: 'The hotel bears no liability for the declared value, condition, or contents of the package — only for the secure custody of the sealed box itself until handover to the courier.',
  },
];

export default function HotelPartnerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: NAVY, color: CREAM }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(10,14,26,0.97)', borderColor: GOLD_BORDER, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Package className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-black text-sm tracking-widest" style={{ color: GOLD }}>
              SEND<span className="text-accent">IT</span>HOME
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/hotel-signup')}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: CREAM }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/hotel-signup')}
              className="font-bold rounded-xl h-9 px-5 text-sm transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: NAVY }}
              >
              Activate Hotel
              </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh', backgroundImage: 'url(https://media.base44.com/images/public/69c10418ed4e1fe65d094ced/67d854caf_ChatGPTImageJun9202610_54_23AM.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(10,14,26,0.55) 0%, rgba(10,14,26,0.86) 100%)' }} />

        <div className="relative max-w-6xl mx-auto px-5 py-28 md:py-40 flex flex-col justify-center" style={{ minHeight: '92vh' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 border" style={{ borderColor: GOLD_BORDER, background: GOLD_DIM }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: GOLD }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Sovereign-Backed · Hotel Partner Activation Portal</span>
            </div>

            <h1 className="font-black leading-tight mb-3" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 55%, #8B6914 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Become a SendITHome Hotel Partner
            </h1>

            <p className="text-lg md:text-xl leading-snug mb-6 font-semibold" style={{ color: PLATINUM, fontFamily: 'Georgia, serif' }}>
              {SUBTITLE}
            </p>

            <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#fff', fontWeight: 500 }}>
              Enhance Your Guest Experience
            </p>
            <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: CREAM }}>
              Offer your guests a premium travel-light service while earning a guaranteed USD $20 for every completed <BrandName /> shipment processed by your hotel.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/hotel-signup')}
                className="font-bold rounded-2xl text-base px-8 py-4 flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, color: NAVY, boxShadow: `0 8px 32px rgba(201,168,76,0.35)` }}
              >
                Activate Your Hotel <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="font-semibold rounded-2xl text-base px-8 py-4 border transition-colors hover:bg-white/10"
                style={{ borderColor: GOLD_BORDER, color: CREAM }}
                >
                How It Works
                </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex gap-4 mt-14 flex-wrap"
          >
            {[
               { value: 'US$20', label: 'Hotel Revenue Per Shipment' },
               { value: '7 Days', label: 'Ready in 7 Days' },
               { value: 'Up to US$3,000', label: 'Shipment Cover' },
               { value: '24-Hour', label: 'VIP Courier Collection' },
             ].map(stat => (
              <div key={stat.label} className="rounded-2xl py-4 px-5 text-center border" style={{ background: 'rgba(201,168,76,0.06)', borderColor: GOLD_BORDER, backdropFilter: 'blur(8px)' }}>
                <p className="text-2xl font-black" style={{ color: GOLD }}>{stat.value}</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: CREAM }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DET Directive Banner */}
      <section className="py-10" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="rounded-2xl border p-6 flex gap-4 items-start" style={{ background: 'rgba(201,168,76,0.05)', borderColor: GOLD_BORDER }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
              <ScrollText className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>National Directive · Compliance Notice</p>
              <p className="text-sm leading-relaxed" style={{ color: CREAM }}>
                Following the recent <strong style={{ color: '#fff' }}>Department of Economy and Tourism (DET)</strong> briefing, and in compliance with the national directive, all licensed 4 and 5-star hospitality properties are required to activate their operational profile within <strong style={{ color: GOLD }}>seven (7) days</strong> of this notice to ensure synchronised launch readiness across the city's luxury corridors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Elite Guest Experience & Financial Yield */}
      <section className="py-12" style={{ background: `linear-gradient(180deg, ${NAVY2} 0%, ${NAVY} 100%)` }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Section 01</p>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Elite Guest Experience & Financial Yield
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {YIELD_BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 border"
                style={{ background: `linear-gradient(160deg, ${NAVY3} 0%, ${NAVY2} 100%)`, borderColor: GOLD_BORDER }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
                  <b.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 className="font-bold mb-2 text-sm" style={{ color: GOLD }}>{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Unified National Messaging */}
      <section className="py-12" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Section 02</p>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Unified National Messaging & Zero-Friction Marketing
            </h2>
          </div>
          <div className="rounded-2xl border p-6 flex gap-4 items-start" style={{ background: `linear-gradient(135deg, ${NAVY3} 0%, ${NAVY2} 100%)`, borderColor: GOLD_BORDER }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
              <Megaphone className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: CREAM }}>
              To ensure a flawless, synchronised guest experience across Dubai's luxury hospitality sector, all marketing assets are centrally managed. The <strong style={{ color: '#fff' }}>Department of Economy and Tourism (DET)</strong> will directly supply your property with pre-approved, high-conversion digital collateral for immediate deployment across your in-room television networks and property-wide digital displays. This removes the need for external corporate or regional marketing approvals, allowing your team to deploy instantly without operational delays.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sovereign Integration & Frictionless Workflow */}
      <section id="how-it-works" className="relative py-12 overflow-hidden" style={{ backgroundImage: 'url(https://media.base44.com/images/public/69c10418ed4e1fe65d094ced/94e976d94_ChatGPTImageJun9202611_54_03AM.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,14,26,0.88) 0%, rgba(10,14,26,0.92) 100%)' }} />
        <div className="relative">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Section 03</p>
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            How It Works
            </h2>
            </div>
            <div className="space-y-4">
              {WORKFLOW_STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-5 flex gap-4 items-start border"
                  style={{ background: `linear-gradient(135deg, ${NAVY3} 0%, ${NAVY2} 100%)`, borderColor: GOLD_BORDER }}
                >
                  <div className="text-3xl font-black leading-none shrink-0 w-10 text-center uppercase" style={{ color: 'rgba(201,168,76,0.40)', fontFamily: 'Georgia, serif' }}>{s.n}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="font-bold" style={{ color: GOLD }}>{s.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: PLATINUM, background: 'rgba(216,222,233,0.06)', borderColor: 'rgba(216,222,233,0.2)' }}>{s.badge}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Front Office Operations & Folio Settlement */}
      <section className="py-12" style={{ background: `linear-gradient(180deg, ${NAVY2} 0%, ${NAVY} 100%)` }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Section 04</p>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Integrated Front Office Operations & Folio Settlement
            </h2>
          </div>
          <div className="rounded-2xl border p-6 flex gap-4 items-start" style={{ background: `linear-gradient(135deg, ${NAVY3} 0%, ${NAVY2} 100%)`, borderColor: GOLD_BORDER }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
              <FileText className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <h3 className="font-bold mb-1.5" style={{ color: GOLD }}>Verified Chain of Custody</h3>
              <p className="text-sm leading-relaxed" style={{ color: CREAM }}>
                The shipment charge is posted directly to the guest's room folio. Upon digital or physical signature at the front office, a receipt is issued to the guest, establishing a verified chain of custody.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Audited Trust & Liability Ringfencing */}
      <section className="py-12" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Section 05</p>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Audited Trust & Liability Ringfencing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {LIABILITY_POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 border"
                style={{ background: `linear-gradient(160deg, ${NAVY3} 0%, ${NAVY2} 100%)`, borderColor: GOLD_BORDER }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
                  <Shield className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 className="font-bold mb-2 text-sm" style={{ color: GOLD }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Corporate Onboarding Profile / CTA */}
      <section className="relative py-16 overflow-hidden" style={{ background: `linear-gradient(160deg, ${NAVY3} 0%, ${NAVY} 45%, ${NAVY2} 100%)` }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.10) 0%, transparent 65%)` }} />
        <div className="relative max-w-3xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Section 06</p>
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Corporate Onboarding Profile
            </h2>
            <p style={{ color: CREAM }}>The activation fields validate directly against official databases.</p>
          </div>

          <div className="rounded-2xl border p-6 mb-8" style={{ background: `linear-gradient(135deg, ${NAVY3} 0%, ${NAVY2} 100%)`, borderColor: GOLD_BORDER }}>
            {[
              { label: 'Government Property License Number', hint: 'Validates against the Dubai tourism database' },
              { label: 'Corporate Hospitality Group', hint: 'Marriott, Hilton, Rotana, Independent, etc.' },
              { label: 'Property Name', hint: 'e.g. Atlantis The Palm, Dubai' },
              { label: 'Authorised Contact Person', hint: 'Typically the General Manager or Front Office Director' },
              { label: 'Secure Corporate Email', hint: 'Official property domain required' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b last:border-b-0" style={{ borderColor: 'rgba(201,168,76,0.12)' }}>
                <Building2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#fff' }}>{f.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(226,232,240,0.55)' }}>{f.hint}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/hotel-signup')}
              className="font-bold rounded-2xl text-base px-10 py-4 flex items-center gap-2 mx-auto transition-all hover:opacity-90 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, color: NAVY, boxShadow: `0 12px 40px rgba(201,168,76,0.4)` }}
            >
              Complete Official Onboarding <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {['Validates against DET database', 'Instant activation', 'Sovereign-backed'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-sm" style={{ color: CREAM }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: GOLD }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-7 text-center" style={{ borderColor: GOLD_BORDER, background: NAVY }}>
        <p className="text-xs font-semibold mb-1" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
          {OFFICIAL_TAGLINE}
        </p>
        <p className="text-xs" style={{ color: 'rgba(226,232,240,0.35)' }}>
          © 2026 <BrandName /> · Sovereign-Backed Shopping Corridor Partnership · All rights reserved
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'rgba(226,232,240,0.3)' }}>
          Proprietary and Confidential
        </p>
      </footer>
    </div>
  );
}