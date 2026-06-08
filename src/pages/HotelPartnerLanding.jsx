import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, QrCode, ArrowRight, CheckCircle2, Clock, Truck,
  DollarSign, Shield, Star, Zap, Box, Globe, Users, FileText
} from 'lucide-react';



const GOLD = '#C9A84C';
const NAVY = '#0D1422';
const NAVY2 = '#111C30';
const CREAM = 'rgba(255,245,220,0.82)';

const BENEFITS = [
  { icon: DollarSign, title: 'Zero-Cost Revenue Stream', desc: 'Charge a $20 USD service fee per box, billed directly to the guest\'s room — with zero operational cost.' },
  { icon: Zap, title: 'Operational Excellence', desc: 'Eliminate post-checkout luggage bottlenecks. We turn a liability into a premium concierge service.' },
  { icon: Box, title: 'Zero Overhead', desc: 'High-quality flat-pack 10kg and 20kg shipping boxes are provided to your property at no charge.' },
  { icon: Shield, title: 'Government-Aligned', desc: 'Endorsed by regional ministries to drive foreign currency inflows and luxury retail growth.' },
  { icon: Globe, title: 'International Reach', desc: 'Connect high-net-worth visitors with local luxury retail across 58+ destination countries.' },
  { icon: Users, title: 'AI-Powered Platform', desc: 'Our AI manages inventory, customs, and logistics — your team simply facilitates the drop-off.' },
];

const STEPS = [
  { n: '01', title: 'In-Room Discovery', desc: 'Guests scan a bespoke QR code provided by your hotel to access the SendITHome portal.' },
  { n: '02', title: 'Government-Backed Marketing', desc: 'In-room marketing materials backed by regional tourism authorities are provided to your hotel.' },
  { n: '03', title: 'Inventory Management', desc: 'SendITHome\'s AI manages your box stock automatically — flat-pack inventory provided at no cost.' },
  { n: '04', title: 'Guest Fulfilment', desc: 'The guest registers via the app, collects their box, and prepares their luxury purchases for shipping.' },
  { n: '05', title: 'Digital Logistics', desc: 'Guest pays the $20 USD platform fee, completes digital customs declaration, and prints shipping labels.' },
  { n: '06', title: 'Secure Handover', desc: 'Box sealed and dropped at your designated lobby location. Our courier handles the rest within 24h (Mon–Fri).' },
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
  { icon: FileText, title: 'Document Upload', desc: 'Upload your property\'s authorised point-of-contact details.' },
  { icon: Users, title: 'Schedule Onboarding Training', desc: 'Our team conducts a training session covering staff workflow, in-room integration, and platform management.' },
  { icon: Box, title: 'Inventory Provisioning', desc: 'Once certified, your property receives initial stock with automatic AI-managed replenishment.' },
];

export default function HotelPartnerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: NAVY, color: CREAM }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(13,20,34,0.97)', borderColor: 'rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GOLD }}>
              <Package className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-sm tracking-widest" style={{ color: GOLD }}>
              SENDIT<span style={{ color: '#fff' }}>HOME</span>
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
              style={{ background: GOLD, color: '#000' }}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />

        <div className="relative max-w-6xl mx-auto px-5 py-32 md:py-40 flex flex-col justify-center" style={{ minHeight: '85vh' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border" style={{ borderColor: 'rgba(201,168,76,0.5)', background: 'rgba(201,168,76,0.1)' }}>
              <QrCode className="w-3.5 h-3.5" style={{ color: GOLD }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Hotel Partner Programme</span>
            </div>

            <h1 className="font-black leading-tight mb-3" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', color: GOLD, fontFamily: 'Georgia, serif' }}>
              Luxury Without Limits.
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold mb-6 tracking-wide" style={{ color: '#fff' }}>
              We'll Ship Your Guests' Purchases Home.
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: CREAM }}>
              An AI-powered logistics platform that transforms the tourism economy — connecting high-net-worth visitors with local luxury retail through a <span style={{ color: GOLD, fontWeight: 600 }}>Government-Aligned Tourism Retail Ecosystem</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/hotel-signup')}
                className="font-bold rounded-2xl text-base px-8 py-4 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: GOLD, color: '#000' }}
              >
                Sign NDA & Register <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="font-semibold rounded-2xl text-base px-8 py-4 border transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(201,168,76,0.5)', color: CREAM }}
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
            className="flex gap-4 mt-16 flex-wrap"
          >
            {[
              { value: '$20 USD', label: 'Per Box Revenue' },
              { value: '100%', label: 'Zero Overhead' },
              { value: '24h', label: 'Courier Pickup' },
              { value: '58+', label: 'Countries Served' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl py-4 px-5 text-center border" style={{ background: 'rgba(13,20,34,0.7)', borderColor: 'rgba(201,168,76,0.4)', backdropFilter: 'blur(8px)' }}>
                <p className="text-2xl font-black" style={{ color: GOLD }}>{stat.value}</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: CREAM }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>Why Join the SendITHome Ecosystem?</h2>
          <p style={{ color: CREAM }}>A premium service that enhances your guest experience with zero operational burden on your team.</p>
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
              style={{ background: NAVY2, borderColor: 'rgba(201,168,76,0.3)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(201,168,76,0.12)' }}>
                <b.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: GOLD }}>{b.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>



      {/* How It Works */}
      <section id="how-it-works" className="py-20" style={{ background: NAVY2 }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>The Operational Flow</h2>
            <p style={{ color: CREAM }}>
              Once registered and trained, the seamless guest experience is fully managed via our AI platform.
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
                style={{ background: NAVY, borderColor: 'rgba(201,168,76,0.3)' }}
              >
                <div className="text-3xl font-black leading-none shrink-0 w-10 text-center" style={{ color: 'rgba(201,168,76,0.4)' }}>{s.n}</div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: GOLD }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Onboarding Status Tracker */}
      <section className="py-20 max-w-4xl mx-auto px-5">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>Your Onboarding Dashboard</h2>
          <p style={{ color: CREAM }}>A real-time interface for your hotel management team, tracking every milestone.</p>
        </div>
        <div className="rounded-2xl border overflow-hidden" style={{ background: NAVY2, borderColor: 'rgba(201,168,76,0.35)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.06)' }}>
            <p className="text-sm font-bold tracking-wide" style={{ color: GOLD }}>STATUS TRACKER — HOTEL PARTNER MILESTONES</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5">
                <span className="text-sm font-medium" style={{ color: CREAM }}>{m.label}</span>
                {m.status === 'done' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.35)' }}>
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border" style={{ color: GOLD, background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.4)' }}>
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-5 border-t text-center" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
            <p className="text-sm mb-4" style={{ color: CREAM }}>Ready to elevate your guest experience and capture new revenue?</p>
            <button
              onClick={() => navigate('/hotel-signup')}
              className="font-bold rounded-xl px-8 py-3 flex items-center gap-2 transition-all hover:opacity-90 mx-auto text-sm"
              style={{ background: GOLD, color: '#000' }}
            >
              Sign NDA & Register to Unlock Full Operational Manual <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20" style={{ background: NAVY2 }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>Welcome to the Ecosystem</h2>
            <p style={{ color: CREAM }}>
              Once registered, your dedicated portal unlocks the full operational suite — designed to integrate seamlessly into your existing operations.
            </p>
          </div>

          <div className="rounded-2xl border p-6 mb-8" style={{ background: NAVY, borderColor: 'rgba(201,168,76,0.3)' }}>
            <p className="text-sm leading-relaxed" style={{ color: CREAM }}>
              Your registration and Non-Disclosure Agreement (NDA) will be processed and verified. You will then gain exclusive access to the <strong style={{ color: GOLD }}>SendITHome Hotel Partner Portal</strong> — enabling you to offer a high-end shipping service to your guests while capturing a recurring, zero-cost revenue stream.
            </p>
          </div>

          <h3 className="text-lg font-black mb-5" style={{ color: GOLD }}>Your Immediate Next Steps</h3>
          <div className="space-y-4 mb-10">
            {NEXT_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start rounded-2xl p-5 border"
                style={{ background: NAVY, borderColor: 'rgba(201,168,76,0.3)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(201,168,76,0.12)' }}>
                  <step.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ color: GOLD }}>{step.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border p-6" style={{ background: NAVY, borderColor: 'rgba(201,168,76,0.3)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5" style={{ color: GOLD }} />
              <h4 className="font-bold" style={{ color: GOLD }}>What to Expect Next</h4>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: CREAM }}>
              Once your team is certified, we immediately provision your property with initial stock of <strong style={{ color: GOLD }}>10kg and 20kg flat-pack shipping boxes at no cost</strong>. Our system automatically manages replenishment, ensuring you never run out during peak seasons.
            </p>
            <p className="text-sm mt-3" style={{ color: CREAM }}>
              Your dedicated Partner Success Manager will contact your team shortly after certification.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden" style={{ background: NAVY2 }}>
        <div className="max-w-2xl mx-auto px-5 text-center">
          <Star className="w-10 h-10 mx-auto mb-5" style={{ color: GOLD }} />
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
            Ready to Elevate Your Guest Experience?
          </h2>
          <p className="mb-8 text-base leading-relaxed" style={{ color: CREAM }}>
            Register your hotel today and join the government-aligned, AI-powered tourist retail ecosystem.
          </p>
          <button
            onClick={() => navigate('/hotel-signup')}
            className="font-bold rounded-2xl text-base px-10 py-4 flex items-center gap-2 mx-auto transition-all hover:opacity-90"
            style={{ background: GOLD, color: '#000' }}
          >
            Register Your Hotel Now <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
            {['Free to join', 'Zero overhead', 'AI-managed inventory'].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-sm" style={{ color: CREAM }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: GOLD }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center" style={{ borderColor: 'rgba(201,168,76,0.2)', background: NAVY }}>
        <p className="text-xs" style={{ color: 'rgba(255,245,220,0.4)' }}>
          © 2025 SendITHome · Powered by FedEx & DHL · All rights reserved
        </p>
        <p className="text-xs mt-1" style={{ color: GOLD, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          Luxury Delivered Beyond Stay.
        </p>
      </footer>
    </div>
  );
}