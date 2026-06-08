import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, QrCode, ArrowRight, CheckCircle2, Clock, Truck,
  DollarSign, Shield, Star, Zap, Box, Globe, Users, FileText
} from 'lucide-react';

const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Zero-Cost Revenue Stream',
    desc: 'Empower your property to charge a $20 USD service fee per box, billed directly to the guest\'s room.',
  },
  {
    icon: Zap,
    title: 'Operational Excellence',
    desc: 'Eliminate post-checkout luggage storage bottlenecks. We turn a liability into a premium concierge service.',
  },
  {
    icon: Box,
    title: 'Zero Overhead',
    desc: 'High-quality, flat-pack 10kg and 20kg shipping boxes are provided to your property at no charge.',
  },
  {
    icon: Shield,
    title: 'Government-Aligned',
    desc: 'A turnkey program endorsed by regional ministries to drive foreign currency inflows and luxury retail growth.',
  },
  {
    icon: Globe,
    title: 'International Reach',
    desc: 'Connect high-net-worth visitors with local luxury retail within a multilateral economic framework.',
  },
  {
    icon: Users,
    title: 'AI-Powered Platform',
    desc: 'Our platform transforms the tourism economy as the Economic Architecture of Tourism Retail Mobility.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'In-Room Discovery',
    desc: 'Guests scan a bespoke QR code provided by your hotel to access the SendITHome portal.',
  },
  {
    n: '02',
    title: 'Government-Backed Marketing',
    desc: 'In-room marketing materials backed by regional government tourism authorities are provided to your hotel.',
  },
  {
    n: '03',
    title: 'Inventory Management',
    desc: 'SendITHome\'s AI manages your box stock; you are provided with 10kg and 20kg flat-pack inventory at no cost.',
  },
  {
    n: '04',
    title: 'Guest Fulfilment',
    desc: 'The guest registers via the app, collects their box, and uses your provided packing materials (tape, bubble wrap) to prepare their luxury purchases.',
  },
  {
    n: '05',
    title: 'Digital Logistics',
    desc: 'The guest pays the $20 USD platform fee, completes the digital customs declaration, and prints the shipping labels emailed directly to your hotel\'s nominated address.',
  },
  {
    n: '06',
    title: 'Secure Handover',
    desc: 'The guest seals the box and drops it at your designated secure lobby location. Our courier partner handles the rest within 24 hours (Mon–Fri).',
  },
];

const MILESTONES = [
  { label: 'Registration', status: 'done' },
  { label: 'NDA Signed', status: 'done' },
  { label: 'Documents Uploaded', status: 'done' },
  { label: 'Platform Approval', status: 'done' },
  { label: 'Hotel QR Code Provisioned', status: 'done' },
  { label: 'Staff Training & Certification', status: 'pending' },
];

const NEXT_STEPS = [
  {
    icon: FileText,
    title: 'Document Upload',
    desc: 'Upload your property\'s authorised point-of-contact details.',
  },
  {
    icon: Users,
    title: 'Schedule Onboarding Training',
    desc: 'Our Implementation Team will conduct a training session covering staff workflow, in-room integration, and platform management.',
  },
  {
    icon: Box,
    title: 'Inventory Provisioning',
    desc: 'Once certified, your property receives initial stock of 10kg and 20kg flat-pack shipping boxes at no cost, with automatic AI-managed replenishment.',
  },
];

export default function HotelPartnerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: '#0F1B2E', color: '#D4AF37' }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: '#0F1B2E', borderColor: '#D4AF37', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#D4AF37' }}>
              <Package className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-sm tracking-wide" style={{ color: '#D4AF37' }}>
              SEND<span style={{ color: '#D4AF37' }}>IT</span>HOME
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/hotel-signup')}
              className="text-sm font-medium transition-colors"
              style={{ color: '#D4AF37' }}
              onMouseOver={e => e.target.style.opacity = '0.8'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/hotel-signup')}
              className="font-bold rounded-xl h-9 px-5 text-sm transition-all"
              style={{ background: '#D4AF37', color: '#000' }}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#0F1B2E' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.1) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(212,175,55,0.05) 0%, transparent 60%)' }} />

        <div className="relative max-w-6xl mx-auto px-5 py-24 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border" style={{ background: 'transparent', borderColor: '#D4AF37' }}>
              <QrCode className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D4AF37' }}>Hotel Partner Programme</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4" style={{ color: '#D4AF37' }}>
              SendITHome
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#D4AF37' }}>
              Hotel Partner Portal
            </h2>
            <p className="text-lg mb-3" style={{ color: '#D4AF37', fontStyle: 'italic', letterSpacing: '0.05em' }}>
              Convenience Delivered Seamlessly.
            </p>

            <div className="max-w-3xl mx-auto mb-10">
              <p className="text-base leading-relaxed mb-4" style={{ color: '#D4AF37' }}>
                We provide an AI-powered platform that transforms the tourism economy and serves as the{' '}
                <span style={{ color: '#D4AF37', fontWeight: 700 }}>Economic Architecture of Tourism Retail Mobility</span>.
              </p>
              <p className="text-base leading-relaxed" style={{ color: '#D4AF37' }}>
                By creating a controlled international shopping corridor — a reciprocal tourism spending ecosystem — we connect high-net-worth visitors with local luxury retail within a{' '}
                <span style={{ color: '#D4AF37' }}>Government-Aligned Tourism Retail Ecosystem</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/hotel-signup')}
                className="font-bold rounded-2xl text-base px-8 py-4 flex items-center justify-center gap-2 transition-all"
                style={{ background: '#D4AF37', color: '#000' }}
              >
                Sign NDA & Register <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="font-semibold rounded-2xl text-base px-8 py-4 border transition-colors"
                style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
              >
                How It Works
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto"
          >
            {[
              { value: '$20 USD', label: 'Per Box Revenue' },
              { value: '100%', label: 'Zero Overhead' },
              { value: '24h', label: 'Courier Pickup' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl py-5 px-3 text-center border" style={{ background: '#0F1B2E', borderColor: '#D4AF37' }}>
                <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>{stat.value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: '#D4AF37' }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 max-w-6xl mx-auto px-5" style={{ background: '#0F1B2E' }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3" style={{ color: '#D4AF37' }}>Why Join the SendITHome Ecosystem?</h2>
          <p style={{ color: '#D4AF37' }}>A premium service that enhances your guest experience with zero operational burden on your team.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-6 border"
              style={{ background: '#0F1B2E', borderColor: '#D4AF37' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'transparent' }}>
                <b.icon className="w-5 h-5" style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#D4AF37' }}>{b.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#D4AF37' }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-px" style={{ background: '#D4AF37' }} />
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="py-20" style={{ background: '#0F1B2E' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: '#D4AF37' }}>The Operational Flow: How It Works</h2>
            <p style={{ color: '#D4AF37' }}>
              Once your property is registered and trained, the seamless guest experience is managed via our AI platform.
            </p>
          </div>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5 flex gap-4 items-start border"
                style={{ background: '#0F1B2E', borderColor: '#D4AF37' }}
              >
                <div className="text-3xl font-black leading-none shrink-0 w-10 text-center" style={{ color: '#D4AF37' }}>{s.n}</div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: '#D4AF37' }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#D4AF37' }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding Dashboard / Status Tracker */}
      <section className="py-20 max-w-4xl mx-auto px-5" style={{ background: '#0F1B2E' }}>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2" style={{ color: '#D4AF37' }}>Your Onboarding Dashboard</h2>
          <p style={{ color: '#D4AF37' }}>This is the secure, real-time interface for your hotel management team.</p>
        </div>
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#0F1B2E', borderColor: '#D4AF37' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#D4AF37', background: '#0F1B2E' }}>
            <p className="text-sm font-bold" style={{ color: '#D4AF37' }}>Status Tracker — Hotel Partner Milestones</p>
          </div>
          <div className="divide-y" style={{ borderColor: '#D4AF37' }}>
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5">
                <span className="text-sm font-medium" style={{ color: '#D4AF37' }}>{m.label}</span>
                {m.status === 'done' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border" style={{ color: '#4ade80', background: '#0F1B2E', borderColor: '#4ade80' }}>
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border" style={{ color: '#D4AF37', background: '#0F1B2E', borderColor: '#D4AF37' }}>
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-5 border-t" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
            <p className="text-sm text-center mb-4" style={{ color: 'rgba(245,240,224,0.55)' }}>
              Ready to elevate your guest experience and capture new revenue?
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/hotel-signup')}
                className="font-bold rounded-xl px-8 py-3 flex items-center gap-2 transition-all text-sm"
                style={{ background: 'linear-gradient(135deg,#d4af37,#b8962e)', color: '#000' }}
              >
                Sign NDA & Register to Unlock Full Operational Manual <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome / Next Steps */}
      <section className="py-20" style={{ background: '#0F1B2E' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: '#D4AF37' }}>Welcome to the SendITHome Ecosystem</h2>
            <p style={{ color: '#D4AF37' }}>
              Once registered, your dedicated portal unlocks the full operational suite — designed to integrate seamlessly into your existing operations.
            </p>
          </div>

          <div className="rounded-2xl border p-6 mb-8" style={{ background: '#0F1B2E', borderColor: '#D4AF37' }}>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#D4AF37' }}>
              Your registration and Non-Disclosure Agreement (NDA) will be successfully processed and verified. You will then gain exclusive access to the <strong style={{ color: '#D4AF37' }}>SendITHome Hotel Partner Portal</strong> — enabling you to offer a high-end shipping service to your guests while capturing a recurring, zero-cost revenue stream.
            </p>
          </div>

          <h3 className="text-lg font-black mb-5" style={{ color: '#D4AF37' }}>Your Immediate Next Steps</h3>
          <div className="space-y-4 mb-10">
            {NEXT_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start rounded-2xl p-5 border"
                style={{ background: '#0F1B2E', borderColor: '#D4AF37' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'transparent' }}>
                  <step.icon className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ color: '#D4AF37' }}>{step.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: '#D4AF37' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* What to Expect */}
          <div className="rounded-2xl border p-6" style={{ background: '#0F1B2E', borderColor: '#D4AF37' }}>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5" style={{ color: '#D4AF37' }} />
              <h4 className="font-bold" style={{ color: '#D4AF37' }}>What to Expect Next</h4>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#D4AF37' }}>
              Once your team is certified, we will immediately provision your property with your initial stock of <strong style={{ color: '#D4AF37' }}>10kg and 20kg flat-pack shipping boxes at no cost</strong>. Our system will then automatically manage your replenishment, ensuring you never run out of inventory during peak tourism seasons.
            </p>
            <p className="text-sm mt-3" style={{ color: '#D4AF37' }}>
              Our dedicated Partner Success Manager will contact your team shortly after certification.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: '#0F1B2E' }}>
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#D4AF37' }}>
            <Star className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-black mb-4" style={{ color: '#D4AF37' }}>
            Ready to elevate your guest experience?
          </h2>
          <p className="mb-8" style={{ color: '#D4AF37' }}>
            Register your hotel today and join the government-aligned, AI-powered tourist retail ecosystem.
          </p>
          <button
            onClick={() => navigate('/hotel-signup')}
            className="font-bold rounded-2xl text-base px-10 py-4 flex items-center gap-2 mx-auto transition-all"
            style={{ background: '#D4AF37', color: '#000' }}
          >
            Register Your Hotel Now <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center gap-5 mt-8 flex-wrap">
            {['Free to join', 'Zero overhead', 'AI-managed inventory'].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-sm" style={{ color: '#D4AF37' }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: '#D4AF37' }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center" style={{ borderColor: '#D4AF37', background: '#0F1B2E' }}>
        <p className="text-xs" style={{ color: '#D4AF37' }}>
          © 2025 SendITHome · Powered by FedEx & DHL · All rights reserved
        </p>
        <p className="text-xs mt-1" style={{ color: '#D4AF37', fontStyle: 'italic' }}>
          Convenience, delivered seamlessly.
        </p>
      </footer>
    </div>
  );
}