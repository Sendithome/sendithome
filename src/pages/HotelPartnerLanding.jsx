import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, QrCode, Globe, Zap, Shield, Star, ArrowRight, CheckCircle2, Users, TrendingUp, Clock, Truck, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BENEFITS = [
  { icon: Globe, title: '50+ Countries', desc: 'Your guests can ship to over 50 countries worldwide with full tracking.' },
  { icon: Zap, title: '1–3 Day Delivery', desc: 'Express international courier via FedEx & DHL for fast delivery.' },
  { icon: Package, title: 'No Logistics Hassle', desc: 'We collect from your hotel within 24 hours. Zero work for your staff.' },
  { icon: Shield, title: 'Fully Insured', desc: 'Every shipment is fully insured with end-to-end tracking.' },
  { icon: Users, title: 'Guest Satisfaction', desc: 'Give guests a premium service that extends their shopping experience.' },
  { icon: TrendingUp, title: 'Zero Cost to Hotel', desc: 'Free partnership. Guests pay directly. No fees or commissions.' },
];

const STEPS = [
  { n: '01', title: 'Private Registration', desc: 'Create your account via the hotel partner portal using your official hotel email. Open by invitation only.', phase: 'Hotel' },
  { n: '02', title: 'Sign the NDA', desc: 'Review and electronically sign the Non-Disclosure Agreement within 5 days to activate your account.', phase: 'Hotel', deadline: '5 Days' },
  { n: '03', title: 'Submit Documents', desc: 'Upload your trade license and staff employment ID cards for identity verification.', phase: 'Hotel' },
  { n: '04', title: 'Admin Verification', desc: 'Our team reviews your submitted documents and hotel profile for compliance.', phase: 'SendITHome' },
  { n: '05', title: 'QR Code & Final Approval', desc: 'Approved hotels receive their unique QR code. A permanent, dedicated guest shipping link is activated.', phase: 'SendITHome' },
  { n: '06', title: 'Logistics Onboarding', desc: 'Our logistics partner contacts your hotel within 1–2 business days for staff briefing, signage setup, and kit delivery. Completed within 10 working days.', phase: 'Logistics', deadline: '10 Working Days' },
];

const TESTIMONIALS = [
  { hotel: 'Grand Hyatt Dubai', stars: 5, quote: 'Our guests love being able to ship their shopping home. It removes a major pain point during checkout.' },
  { hotel: 'JW Marriott Marquis', stars: 5, quote: "SendITHome has become one of the most requested concierge services. It's seamless and guests are thrilled." },
];

export default function HotelPartnerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-sm tracking-wide text-white">SEND<span className="text-accent">IT</span>HOME</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/hotel-signup')}
              className="text-sm text-white/70 hover:text-white font-medium transition-colors"
            >
              Sign In
            </button>
            <Button
              onClick={() => navigate('/hotel-signup')}
              className="bg-accent hover:bg-accent/90 text-white font-bold rounded-xl h-9 px-5 text-sm"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,0,100,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,0,100,0.08),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
              <QrCode className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wide">Hotel Partner Programme</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Let Your Guests<br />
              <span className="text-accent">Ship Their Shopping Home</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join our hotel partner network and give your guests the ultimate convenience — ship their shopping purchases directly home from your hotel. Free for hotels. Loved by guests.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/hotel-signup')}
                className="h-13 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl text-base px-8 py-4"
              >
                Register Your Hotel <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="h-13 border border-white/20 text-white font-semibold rounded-2xl text-base px-8 py-4 hover:bg-white/10 transition-colors"
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
              { value: '50+', label: 'Countries' },
              { value: '1–3 Days', label: 'Delivery Time' },
              { value: '100%', label: 'Free for Hotels' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl py-5 px-3 text-center">
                <p className="text-2xl font-black text-accent">{stat.value}</p>
                <p className="text-xs text-white/50 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-foreground">Why Partner with SendITHome?</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">A premium service that enhances your guest experience with zero operational burden on your team.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/40 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground">How the Partnership Works</h2>
            <p className="text-muted-foreground mt-3">A structured onboarding process — transparent, trackable, and completed within 10 working days.</p>
          </div>
          <div className="space-y-4">
            {STEPS.map((s, i) => {
              const phaseIcon = s.phase === 'Logistics' ? Truck : s.phase === 'SendITHome' ? Shield : Building2;
              const PhaseIcon = phaseIcon;
              const phaseColor = s.phase === 'Logistics' ? 'bg-blue-50 border-blue-200 text-blue-700' : s.phase === 'SendITHome' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-secondary border-border text-secondary-foreground';
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start"
                >
                  <div className="text-3xl font-black text-accent/20 leading-none shrink-0 w-10 text-center">{s.n}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="font-bold text-foreground">{s.title}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${phaseColor}`}>
                        <PhaseIcon className="w-2.5 h-2.5" /> {s.phase}
                      </span>
                      {s.deadline && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                          <Clock className="w-2.5 h-2.5" /> {s.deadline}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Separator: guest shipping is separate */}
          <div className="mt-8 bg-accent/5 border-2 border-accent/20 rounded-2xl p-5 flex gap-4 items-start">
            <QrCode className="w-8 h-8 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">After Onboarding: Guest Shipping Portal</p>
              <p className="text-sm text-muted-foreground mt-1">Once live, your hotel receives a dedicated, permanent guest-facing link (e.g. <span className="font-mono text-accent text-xs">sendithomedxb.com/hotel/your-id</span>). Guests access it by scanning your QR code — it is completely separate from the hotel management system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-foreground">Trusted by Leading Hotels</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.hotel} className="bg-card border border-border rounded-2xl p-8">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-4 italic">"{t.quote}"</p>
              <p className="text-sm font-bold text-muted-foreground">— Concierge Manager, {t.hotel}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Partner With Us?</h2>
          <p className="text-white/60 mb-8">Register your hotel in minutes. Get approved. Start offering this premium service to your guests.</p>
          <Button
            onClick={() => navigate('/hotel-signup')}
            className="h-13 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl text-base px-10 py-4"
          >
            Register Your Hotel Now <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <div className="flex items-center justify-center gap-5 mt-8 flex-wrap">
            {['Free to join', 'NDA within 5 days', 'Live in 10 working days'].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-white/50 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary border-t border-white/10 py-6 text-center">
        <p className="text-xs text-white/30">© 2025 SendITHome · Powered by FedEx & DHL · All rights reserved</p>
      </footer>
    </div>
  );
}