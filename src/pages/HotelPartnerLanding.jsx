import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, QrCode, ArrowRight, CheckCircle2, Clock, Truck,
  DollarSign, Shield, Zap, Box, FileText, Users, Star
} from 'lucide-react';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const GOLD_DIM = 'rgba(201,168,76,0.15)';
const GOLD_BORDER = 'rgba(201,168,76,0.35)';
const BLACK = '#0A0A0A';
const BLACK2 = '#111111';
const BLACK3 = '#1A1A1A';
const CREAM = 'rgba(255,245,220,0.85)';

const BENEFITS = [
  { icon: DollarSign, title: 'Zero-Cost Revenue Stream', desc: 'Empower your property to charge a $20 USD service fee per box, billed directly to the guest\'s room.' },
  { icon: Zap, title: 'Operational Excellence', desc: 'Eliminate post-checkout luggage storage bottlenecks. We turn a liability into a premium concierge service.' },
  { icon: Box, title: 'Zero Overhead', desc: 'High-quality, flat-pack 10kg and 20kg shipping boxes are provided to your property at no charge.' },
  { icon: Shield, title: 'Government-Aligned', desc: 'A turnkey program endorsed by regional ministries to drive foreign currency inflows and luxury retail growth.' },
];

const STEPS = [
  { n: '01', title: 'In-Room Discovery', desc: 'Guests scan a bespoke QR code provided by your hotel to access the SendITHome portal.' },
  { n: '02', title: 'Marketing Integration', desc: 'Government-backed in-room marketing materials are provided to your hotel at no cost.' },
  { n: '03', title: 'Inventory Management', desc: 'SendITHome\'s AI manages your box stock; you are provided with 10kg and 20kg flat-pack inventory at no cost.' },
  { n: '04', title: 'Guest Fulfilment', desc: 'The guest registers via the app, collects their box, and uses your provided packing materials (tape, bubble wrap) to prepare their luxury purchases.' },
  { n: '05', title: 'Digital Logistics', desc: 'The guest pays the $20 USD platform fee, completes the digital customs declaration, and prints the shipping labels emailed directly to your hotel\'s nominated address.' },
  { n: '06', title: 'Security Assurance — Secure Handover', desc: 'The guest seals the box and drops it at your designated secure lobby location. Our courier partner handles the rest within 24 hours (Mon–Fri).' },
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
    desc: 'Our Implementation Team will conduct a training session with your key personnel covering: Staff Workflow, In-Room Integration, and Platform Management (real-time inventory and revenue reporting tools).',
  },
  {
    icon: Box,
    title: 'Inventory Provisioning',
    desc: 'Once your team is certified, we immediately provision your property with initial stock of 10kg and 20kg flat-pack shipping boxes at no cost. Our system automatically manages replenishment, ensuring you never run out during peak tourism seasons.',
  },
];

export default function HotelPartnerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: BLACK, color: CREAM }}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'rgba(10,10,10,0.97)', borderColor: GOLD_BORDER, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #8B6914)` }}>
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
              style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: '#000' }}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: '90vh', backgroundImage: 'url(https://media.base44.com/images/public/69c10418ed4e1fe65d094ced/67d854caf_ChatGPTImageJun9202610_54_23AM.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.7) 100%)' }} />

        <div className="relative max-w-6xl mx-auto px-5 py-32 md:py-44 flex flex-col justify-center" style={{ minHeight: '90vh' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 border" style={{ borderColor: GOLD_BORDER, background: GOLD_DIM }}>
              <QrCode className="w-3.5 h-3.5" style={{ color: GOLD }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Hotel Partner Portal</span>
            </div>

            <h1 className="font-black leading-tight mb-4" style={{ fontSize: 'clamp(2.8rem,6vw,5rem)', fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, #8B6914 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Convenience Delivered Seamlessly.
            </h1>

            <p className="text-base leading-relaxed mb-3 font-medium" style={{ color: '#fff' }}>
              Generate additional revenue from every guest — with <span style={{ color: GOLD, fontWeight: 700 }}>no operational cost</span> to your hotel.
            </p>
            <p className="text-sm leading-relaxed mb-10" style={{ color: CREAM }}>
              We handle everything: the shipping, the customs paperwork, and the courier collection. Your hotel earns a service fee on every shipment while offering guests a premium, hassle-free way to send their shopping home.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/hotel-signup')}
                className="font-bold rounded-2xl text-base px-8 py-4 flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, color: '#000', boxShadow: `0 8px 32px rgba(201,168,76,0.35)` }}
              >
                Sign NDA & Register <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="font-semibold rounded-2xl text-base px-8 py-4 border transition-colors hover:bg-white/5"
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
            className="flex gap-4 mt-16 flex-wrap"
          >
            {[
              { value: '$20 USD', label: 'Per Box Revenue' },
              { value: '100%', label: 'Zero Overhead' },
              { value: '24h', label: 'Courier Pickup' },
              { value: '58+', label: 'Countries Served' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl py-4 px-5 text-center border" style={{ background: 'rgba(201,168,76,0.06)', borderColor: GOLD_BORDER, backdropFilter: 'blur(8px)' }}>
                <p className="text-2xl font-black" style={{ color: GOLD }}>{stat.value}</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: CREAM }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12" style={{ background: `linear-gradient(180deg, ${BLACK} 0%, ${BLACK2} 100%)` }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Why Join the SendITHome Ecosystem?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 border"
                style={{ background: `linear-gradient(160deg, #1c1400 0%, ${BLACK3} 100%)`, borderColor: GOLD_BORDER }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
                  <b.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 className="font-bold mb-2 text-sm" style={{ color: GOLD }}>{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-12 overflow-hidden" style={{ backgroundImage: 'url(https://media.base44.com/images/public/69c10418ed4e1fe65d094ced/94e976d94_ChatGPTImageJun9202611_54_03AM.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.8) 100%)' }} />
        <div className="relative">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              The Operational Flow: How It Works
            </h2>
            <p style={{ color: CREAM }}>
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
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-5 flex gap-4 items-start border"
                style={{ background: `linear-gradient(135deg, #150f00 0%, ${BLACK3} 100%)`, borderColor: GOLD_BORDER }}
              >
                <div className="text-3xl font-black leading-none shrink-0 w-10 text-center" style={{ color: 'rgba(201,168,76,0.35)' }}>{s.n}</div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1" style={{ color: GOLD }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Onboarding Status Tracker */}
      <section className="py-12" style={{ background: `linear-gradient(180deg, ${BLACK2} 0%, ${BLACK} 100%)` }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Your Onboarding Dashboard
            </h2>
            <p style={{ color: CREAM }}>The secure, real-time interface for your hotel management team.</p>
          </div>
          <div className="rounded-2xl border overflow-hidden" style={{ background: `linear-gradient(160deg, #150f00 0%, ${BLACK3} 100%)`, borderColor: GOLD_BORDER }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(201,168,76,0.2)', background: GOLD_DIM }}>
              <p className="text-sm font-bold tracking-widest uppercase" style={{ color: GOLD }}>Status Tracker — Hotel Partner Milestones</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm font-medium" style={{ color: CREAM }}>{m.label}</span>
                  {m.status === 'done' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.3)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border" style={{ color: GOLD, background: GOLD_DIM, borderColor: GOLD_BORDER }}>
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-6 border-t text-center" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
              <p className="text-sm mb-5" style={{ color: CREAM }}>Ready to elevate your guest experience and capture new revenue?</p>
              <button
                onClick={() => navigate('/hotel-signup')}
                className="font-bold rounded-xl px-8 py-3 flex items-center gap-2 transition-all hover:opacity-90 mx-auto text-sm shadow-lg"
                style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, color: '#000', boxShadow: `0 6px 24px rgba(201,168,76,0.3)` }}
              >
                Sign NDA & Register to Unlock Full Operational Manual <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome / Next Steps */}
      <section className="py-12" style={{ background: `linear-gradient(180deg, ${BLACK} 0%, #0f0800 50%, ${BLACK} 100%)` }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Welcome to the SendITHome Ecosystem
            </h2>
          </div>

          <div className="rounded-2xl border p-6 mb-10" style={{ background: `linear-gradient(135deg, #150f00 0%, ${BLACK3} 100%)`, borderColor: GOLD_BORDER }}>
            <p className="text-sm leading-relaxed mb-3" style={{ color: CREAM }}>
              Thank you for registering your property as a premier partner of the SendITHome ecosystem. Your registration and Non-Disclosure Agreement (NDA) have been successfully processed and verified.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: CREAM }}>
              You have now gained exclusive access to the <strong style={{ color: GOLD }}>SendITHome Hotel Partner Portal</strong>. This platform is designed to integrate seamlessly into your existing operations, enabling you to offer a high-end shipping service to your guests while capturing a recurring, zero-cost revenue stream.
            </p>
          </div>

          <h3 className="text-lg font-black mb-6" style={{ color: GOLD }}>Your Immediate Next Steps</h3>
          <div className="space-y-4 mb-10">
            {NEXT_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start rounded-2xl p-5 border"
                style={{ background: `linear-gradient(135deg, #150f00 0%, ${BLACK3} 100%)`, borderColor: GOLD_BORDER }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}` }}>
                  <step.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ color: GOLD }}>{step.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: CREAM }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl border p-6" style={{ background: `linear-gradient(135deg, #1c1400 0%, ${BLACK3} 100%)`, borderColor: GOLD_BORDER }}>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5" style={{ color: GOLD }} />
              <h4 className="font-bold" style={{ color: GOLD }}>What to Expect Next</h4>
            </div>
            <p className="text-sm leading-relaxed mb-3" style={{ color: CREAM }}>
              Once your team is certified, we will immediately provision your property with your initial stock of <strong style={{ color: GOLD }}>10kg and 20kg flat-pack shipping boxes at no cost</strong> to your hotel. Our system will then automatically manage your replenishment, ensuring you never run out of inventory during peak tourism seasons.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: CREAM }}>
              We are excited to have your property at the forefront of this government-aligned, AI-powered tourist retail ecosystem. Our dedicated Partner Success Manager will contact your team shortly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 overflow-hidden" style={{ background: `linear-gradient(160deg, #1c1400 0%, ${BLACK} 40%, #0f0a00 100%)` }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.12) 0%, transparent 65%)` }} />
        <div className="relative max-w-2xl mx-auto px-5 text-center">
          <Star className="w-10 h-10 mx-auto mb-5" style={{ color: GOLD }} />
          <h2 className="text-3xl md:text-4xl font-black mb-5" style={{ fontFamily: 'Georgia, serif', background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Ready to Elevate Your Guest Experience?
          </h2>
          <p className="mb-10 text-base leading-relaxed" style={{ color: CREAM }}>
            Register your hotel today and join the government-aligned, AI-powered tourist retail ecosystem. Convenience, delivered seamlessly.
          </p>
          <button
            onClick={() => navigate('/hotel-signup')}
            className="font-bold rounded-2xl text-base px-10 py-4 flex items-center gap-2 mx-auto transition-all hover:opacity-90 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, #8B6914)`, color: '#000', boxShadow: `0 12px 40px rgba(201,168,76,0.4)` }}
          >
            Register Your Hotel Now <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
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
      <footer className="border-t py-7 text-center" style={{ borderColor: GOLD_BORDER, background: BLACK }}>
        <p className="text-xs" style={{ color: 'rgba(255,245,220,0.35)' }}>
          © 2025 SendITHome · Powered by FedEx & DHL · All rights reserved
        </p>
        <p className="text-xs mt-1" style={{ color: GOLD, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          Convenience, Delivered Seamlessly.
        </p>
      </footer>
    </div>
  );
}