import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowRight, Globe, Shield, Zap, Star, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HowItWorks from '../components/HowItWorks';

const FEATURES = [
  { icon: Globe, title: '50+ Countries', desc: 'Ship to over 50 destinations worldwide' },
  { icon: Zap, title: '1–3 Day Delivery', desc: 'Express air delivery via FedEx & DHL' },
  { icon: Shield, title: 'Fully Insured', desc: 'Every parcel is fully tracked and insured' },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-accent blur-2xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-6">
              <Star className="w-3 h-3 text-accent" />
              Trusted by 5-star hotels worldwide
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Shop Without Limits.
              <br />
              <span className="text-accent">Travel Without Luggage.</span>
            </h1>

            <p className="mt-5 text-white/70 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Ship your shopping home from any partner hotel.
              Just $60 per box — delivered in 1–3 working days via air.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl px-8 h-12">
                <Link to="/new-order">
                  Start Shipping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8 h-12">
                <Link to="/my-orders">
                  My Shipments
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Price highlight */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-14 max-w-sm mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">$60</p>
                  <p className="text-white/60 text-xs mt-1">per box</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-left">
                  <p className="text-white text-sm font-medium">10kg or 20kg</p>
                  <p className="text-white/60 text-xs">Same flat rate</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-4"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sample Hotel QR Code */}
      <section className="py-14 px-4 bg-muted/40">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <QrCode className="w-3.5 h-3.5" />
              Try It Now
            </div>
            <h2 className="text-2xl font-bold text-foreground">Scan to Experience the Guest Flow</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-8">Scan the QR code below — exactly as hotel guests would from reception</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              {/* QR Code */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-border inline-flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '/hotel/69c10e96d7e89842ae433412')}&bgcolor=ffffff&color=1a1f2e&qzone=1`}
                  alt="Hotel QR Code"
                  className="w-44 h-44"
                />
                <div className="mt-3 flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-accent fill-accent" />)}
                </div>
                <p className="text-sm font-bold text-foreground mt-1">Atlantis The Palm</p>
                <p className="text-xs text-muted-foreground">Dubai, UAE</p>
              </div>

              {/* Steps */}
              <div className="text-left space-y-4">
                {[
                  { n: '1', label: 'Guest scans QR at reception' },
                  { n: '2', label: 'Hotel page opens automatically' },
                  { n: '3', label: 'Guest registers & places order' },
                  { n: '4', label: 'Box shipped to their home' },
                ].map(({ n, label }) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shrink-0">{n}</div>
                    <p className="text-sm text-foreground">{label}</p>
                  </div>
                ))}
                <Link to="/hotel/69c10e96d7e89842ae433412">
                  <button className="mt-2 text-xs text-accent font-semibold underline underline-offset-2">Or click here to open hotel page →</button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-primary rounded-3xl p-10 md:p-14">
          <Package className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to ship?</h2>
          <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto">
            Collect your box from hotel reception and start packing your purchases.
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl px-10 h-12">
            <Link to="/new-order">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-accent" />
            <span className="font-bold text-xs text-foreground tracking-wide">SEND<span className="text-accent">IT</span>HOME</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Powered by FedEx & DHL · 50+ Countries · 1–3 Day Delivery
          </p>
        </div>
      </footer>
    </div>
  );
}