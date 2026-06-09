import { motion } from 'framer-motion';
import { Package, ArrowRight, DollarSign, Zap, Box, Shield, Globe, TrendingUp, Users, CheckCircle2, BarChart2, Truck } from 'lucide-react';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const GOLD_DIM = 'rgba(201,168,76,0.12)';
const GOLD_BORDER = 'rgba(201,168,76,0.30)';
const BLACK = '#0A0A0A';
const BLACK2 = '#111111';
const BLACK3 = '#1A1A1A';
const CREAM = 'rgba(255,245,220,0.88)';

const slides = [
  {
    id: 'cover',
    label: 'Cover',
  },
  {
    id: 'problem',
    label: 'The Problem',
  },
  {
    id: 'solution',
    label: 'The Solution',
  },
  {
    id: 'how',
    label: 'How It Works',
  },
  {
    id: 'market',
    label: 'Market Opportunity',
  },
  {
    id: 'model',
    label: 'Business Model',
  },
  {
    id: 'traction',
    label: 'Traction',
  },
  {
    id: 'ask',
    label: 'The Ask',
  },
];

function Slide({ children, id }) {
  return (
    <section id={id} className="min-h-screen flex flex-col justify-center py-20 px-6 md:px-16 max-w-5xl mx-auto w-full">
      {children}
    </section>
  );
}

function SlideLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border w-fit" style={{ borderColor: GOLD_BORDER, background: GOLD_DIM }}>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>{children}</span>
    </div>
  );
}

function SlideTitle({ children }) {
  return (
    <h2 className="font-black leading-tight mb-6" style={{
      fontSize: 'clamp(2rem,5vw,3.5rem)',
      fontFamily: 'Georgia, serif',
      background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 60%, #8B6914 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>
      {children}
    </h2>
  );
}

export default function PitchDeck() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: BLACK, color: CREAM, minHeight: '100vh' }}>

      {/* Sticky nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b"
        style={{ background: 'rgba(10,10,10,0.96)', borderColor: GOLD_BORDER, backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #8B6914)` }}>
            <Package className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-black text-sm tracking-widest" style={{ color: GOLD }}>SENDIT<span style={{ color: '#fff' }}>HOME</span></span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {slides.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: CREAM }}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.5)' }}>Investor Deck · 2026</div>
      </nav>

      {/* ── SLIDE 1: Cover ── */}
      <section id="cover" className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1400&h=900&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.85) 100%)' }} />
        <motion.div className="relative z-10 max-w-3xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 border" style={{ borderColor: GOLD_BORDER, background: GOLD_DIM }}>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Confidential · Investor Presentation</span>
          </div>
          <h1 className="font-black mb-4" style={{
            fontSize: 'clamp(3rem,8vw,6rem)', fontFamily: 'Georgia, serif',
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Send It Home
          </h1>
          <p className="text-xl font-light mb-4" style={{ color: CREAM }}>
            The Economic Architecture of Tourism Retail Mobility
          </p>
          <p className="text-sm leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,245,220,0.65)' }}>
            An AI-powered international shipping platform embedded inside luxury hotels, turning tourist shopping into frictionless global logistics.
          </p>
          <button onClick={() => scrollTo('problem')} className="inline-flex items-center gap-2 font-bold rounded-2xl px-8 py-4 text-sm transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, color: '#000', boxShadow: `0 8px 32px rgba(201,168,76,0.35)` }}>
            View Deck <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* ── SLIDE 2: The Problem ── */}
      <Slide id="problem">
        <SlideLabel>The Problem</SlideLabel>
        <SlideTitle>Tourists Can't Take Their Shopping Home</SlideTitle>
        <p className="text-base leading-relaxed mb-10 max-w-2xl" style={{ color: CREAM }}>
          High-net-worth tourists visiting Dubai spend an average of <strong style={{ color: GOLD }}>$2,400 USD</strong> on luxury goods per trip — yet face a critical last-mile problem: their purchases are too heavy, too fragile, or too restricted to carry on the plane home.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: '🧳', title: 'Luggage Overweight Fees', desc: 'Airlines charge $50–$200 for excess baggage, making shipping a cheaper, smarter option.' },
            { icon: '🛍️', title: 'Fragile Luxury Items', desc: 'Designer bags, shoes, and glassware are damaged when crammed into hand luggage.' },
            { icon: '🏨', title: 'No Hotel Solution', desc: 'Hotels store abandoned shopping bags for weeks — a liability with zero revenue.' },
          ].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 border" style={{ background: `linear-gradient(160deg, #150f00, ${BLACK3})`, borderColor: GOLD_BORDER }}>
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-bold mb-2 text-sm" style={{ color: GOLD }}>{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Slide>

      {/* ── SLIDE 3: The Solution ── */}
      <Slide id="solution">
        <SlideLabel>The Solution</SlideLabel>
        <SlideTitle>Ship It Home. Seamlessly.</SlideTitle>
        <p className="text-base leading-relaxed mb-10 max-w-2xl" style={{ color: CREAM }}>
          Send It Home is an <strong style={{ color: GOLD }}>AI-powered hotel-embedded logistics platform</strong> that lets tourists ship their luxury purchases directly from their hotel room to their home — in minutes, at a flat rate of <strong style={{ color: GOLD }}>$60 USD per box</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: Zap, title: 'In-Room QR Code', desc: 'Guests scan a hotel-provided QR code, register, and book a shipment — no app download required.' },
            { icon: Package, title: 'AI Receipt Scanning', desc: 'Our AI extracts item data from receipts, auto-fills customs declarations, and assigns HS codes.' },
            { icon: Shield, title: 'Government-Aligned', desc: 'Backed by UAE ministries to drive foreign currency inflows and luxury retail growth.' },
            { icon: Globe, title: '58+ Countries', desc: 'Powered by FedEx & DHL. Every major destination covered with 1–3 day delivery.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex gap-4 items-start rounded-2xl p-5 border" style={{ background: `linear-gradient(135deg, #150f00, ${BLACK3})`, borderColor: GOLD_BORDER }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
                <s.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-sm" style={{ color: GOLD }}>{s.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Slide>

      {/* ── SLIDE 4: How It Works ── */}
      <Slide id="how">
        <SlideLabel>How It Works</SlideLabel>
        <SlideTitle>Six Steps. Zero Friction.</SlideTitle>
        <div className="space-y-4">
          {[
            { n: '01', title: 'Guest Scans QR Code', desc: 'Hotel-provided QR code in the room links directly to the Send It Home portal.' },
            { n: '02', title: 'Upload Receipt Photos', desc: 'AI scans receipts, identifies items, applies customs eligibility rules, and auto-fills the CN22/CN23 declaration.' },
            { n: '03', title: 'Select Box Size & Pay', desc: 'Choose 10kg or 20kg flat-rate box. Pay $60 USD via the app. Labels are emailed to the hotel.' },
            { n: '04', title: 'Pack & Drop at Lobby', desc: 'Hotel provides packing materials. Guest seals the box and drops it at the designated secure lobby point.' },
            { n: '05', title: '24-Hour Courier Pickup', desc: 'Our logistics partner picks up Mon–Fri within 24 hours of booking.' },
            { n: '06', title: 'Delivered Home', desc: 'FedEx / DHL delivers to 58+ countries in 1–3 working days with full tracking.' },
          ].map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 flex gap-4 items-start border" style={{ background: `linear-gradient(135deg, #150f00, ${BLACK3})`, borderColor: GOLD_BORDER }}>
              <div className="text-2xl font-black w-10 text-center shrink-0" style={{ color: 'rgba(201,168,76,0.3)' }}>{s.n}</div>
              <div>
                <h4 className="font-bold mb-1 text-sm" style={{ color: GOLD }}>{s.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Slide>

      {/* ── SLIDE 5: Market Opportunity ── */}
      <Slide id="market">
        <SlideLabel>Market Opportunity</SlideLabel>
        <SlideTitle>A $2.4B Untapped Corridor</SlideTitle>
        <p className="text-base leading-relaxed mb-10 max-w-2xl" style={{ color: CREAM }}>
          Dubai welcomed <strong style={{ color: GOLD }}>17.15 million international visitors</strong> in 2023. Each high-net-worth tourist spends an average of $2,400 on retail — yet the outbound logistics market for tourist purchases is almost entirely unserved.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { value: '17M+', label: 'Annual Dubai Tourists' },
            { value: '$2,400', label: 'Avg. Tourist Retail Spend' },
            { value: '700+', label: 'Partner Hotels (Target)' },
            { value: '$60', label: 'Flat-Rate Per Shipment' },
          ].map(m => (
            <div key={m.label} className="rounded-2xl py-5 px-4 text-center border" style={{ background: GOLD_DIM, borderColor: GOLD_BORDER }}>
              <p className="text-2xl font-black" style={{ color: GOLD }}>{m.value}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: CREAM }}>{m.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6 border" style={{ background: `linear-gradient(135deg, #150f00, ${BLACK3})`, borderColor: GOLD_BORDER }}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5" style={{ color: GOLD }} />
            <h4 className="font-bold" style={{ color: GOLD }}>Revenue Projection</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { year: 'Year 1', rev: '$2.16M', hotels: '60 hotels', ships: '36,000 shipments' },
              { year: 'Year 2', rev: '$9M', hotels: '250 hotels', ships: '150,000 shipments' },
              { year: 'Year 3', rev: '$27M', hotels: '700 hotels', ships: '450,000 shipments' },
            ].map(r => (
              <div key={r.year} className="rounded-xl py-4 px-3" style={{ background: GOLD_DIM }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(201,168,76,0.6)' }}>{r.year}</p>
                <p className="text-xl font-black" style={{ color: GOLD }}>{r.rev}</p>
                <p className="text-[10px] mt-1" style={{ color: CREAM }}>{r.hotels}</p>
                <p className="text-[10px]" style={{ color: CREAM }}>{r.ships}</p>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ── SLIDE 6: Business Model ── */}
      <Slide id="model">
        <SlideLabel>Business Model</SlideLabel>
        <SlideTitle>Multiple Revenue Streams</SlideTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {[
            { icon: DollarSign, title: '$60 Flat-Rate Shipping Fee', desc: 'Paid by the tourist per box. Covers courier costs, platform fee, and hotel service charge.', highlight: true },
            { icon: DollarSign, title: '$20 Hotel Service Charge', desc: 'Billed directly to the guest\'s room by the hotel. Zero-cost revenue for our hotel partners.' },
            { icon: BarChart2, title: 'Retailer Commission (2.5%)', desc: 'Partner retailers pay a commission on verified tourist purchases shipped via our platform.' },
            { icon: Users, title: 'Government Data License', desc: 'Anonymised retail intelligence sold to tourism ministries and economic development boards.' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex gap-4 items-start rounded-2xl p-5 border" style={{ background: m.highlight ? `linear-gradient(135deg, #2a1800, ${BLACK3})` : `linear-gradient(135deg, #150f00, ${BLACK3})`, borderColor: m.highlight ? GOLD : GOLD_BORDER }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
                <m.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-sm" style={{ color: GOLD }}>{m.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-2xl p-5 border" style={{ background: GOLD_DIM, borderColor: GOLD_BORDER }}>
          <p className="text-sm font-bold mb-1" style={{ color: GOLD }}>Unit Economics — Per Shipment</p>
          <div className="flex flex-wrap gap-6 mt-3">
            {[
              { label: 'Revenue', value: '$60' },
              { label: 'Courier Cost', value: '~$28' },
              { label: 'Platform & Ops', value: '~$7' },
              { label: 'Gross Profit', value: '~$25' },
              { label: 'Gross Margin', value: '~42%' },
            ].map(u => (
              <div key={u.label} className="text-center">
                <p className="text-lg font-black" style={{ color: GOLD }}>{u.value}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: CREAM }}>{u.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ── SLIDE 7: Traction ── */}
      <Slide id="traction">
        <SlideLabel>Traction</SlideLabel>
        <SlideTitle>Built, Validated & Expanding</SlideTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {[
            'Full-stack AI platform live — receipt scanning, customs declarations, retailer verifications',
            'Government-aligned program with UAE ministry endorsement in progress',
            'Hotel partner portal with NDA, onboarding pipeline, and inventory management live',
            'Retailer verification engine with automated commission tracking deployed',
            'FedEx & DHL courier integration for 58+ destination countries',
            'Multi-portal ecosystem: Tourist, Hotel, Retailer, Courier, Government — all live',
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 rounded-2xl p-4 border" style={{ background: `linear-gradient(135deg, #150f00, ${BLACK3})`, borderColor: GOLD_BORDER }}>
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#4ade80' }} />
              <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{t}</p>
            </motion.div>
          ))}
        </div>
      </Slide>

      {/* ── SLIDE 8: The Ask ── */}
      <Slide id="ask">
        <SlideLabel>The Ask</SlideLabel>
        <SlideTitle>Join the Ecosystem</SlideTitle>
        <p className="text-base leading-relaxed mb-10 max-w-2xl" style={{ color: CREAM }}>
          We are raising a <strong style={{ color: GOLD }}>Seed Round</strong> to scale hotel partnerships across the UAE and GCC, grow our courier network, and accelerate government alignment programs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { icon: Truck, title: 'Logistics Expansion', desc: 'Scale courier partnerships across 10 new GCC cities.' },
            { icon: Users, title: 'Hotel Partnerships', desc: 'Onboard 250 hotel properties within 12 months.' },
            { icon: Globe, title: 'Government Programs', desc: 'Formalize retail intelligence data agreements with 3 ministries.' },
          ].map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 border text-center" style={{ background: `linear-gradient(160deg, #1c1400, ${BLACK3})`, borderColor: GOLD_BORDER }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
                <a.icon className="w-6 h-6" style={{ color: GOLD }} />
              </div>
              <h4 className="font-bold mb-2 text-sm" style={{ color: GOLD }}>{a.title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{a.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="rounded-2xl border p-8 text-center" style={{ background: `linear-gradient(135deg, #2a1800, ${BLACK3})`, borderColor: GOLD }}>
          <p className="text-4xl font-black mb-2" style={{ color: GOLD }}>$2.5M USD</p>
          <p className="text-sm font-semibold mb-4" style={{ color: CREAM }}>Seed Round · 2026</p>
          <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: 'rgba(255,245,220,0.65)' }}>
            Use of funds: 40% Technology & AI, 30% Logistics & Operations, 20% Sales & Partnerships, 10% Legal & Compliance.
          </p>
          <a href="mailto:invest@sendithome.com" className="inline-flex items-center gap-2 font-bold rounded-2xl px-8 py-4 text-sm transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, color: '#000' }}>
            Get In Touch <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </Slide>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: GOLD_BORDER, background: BLACK }}>
        <p className="text-xs" style={{ color: 'rgba(255,245,220,0.3)' }}>© 2026 Send It Home · Vacation Logistics DMCC, Dubai · All rights reserved</p>
        <p className="text-xs mt-1" style={{ color: GOLD, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Convenience, Delivered Seamlessly.</p>
        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,245,220,0.2)' }}>This document is confidential and intended solely for the recipient. Not for distribution.</p>
      </footer>
    </div>
  );
}