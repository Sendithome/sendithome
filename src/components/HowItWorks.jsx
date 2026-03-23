import { QrCode, UserPlus, Receipt, CreditCard, Package, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  { icon: QrCode, title: "Scan QR Code", desc: "Scan the QR at hotel reception or concierge" },
  { icon: UserPlus, title: "Register", desc: "Quick sign-up with passport details" },
  { icon: Receipt, title: "Upload Receipts", desc: "Our AI auto-extracts eligible items" },
  { icon: CreditCard, title: "Pay $60", desc: "Flat rate per box — no surprises" },
  { icon: Package, title: "Pack & Drop", desc: "Pack your box, leave at hotel reception" },
  { icon: Truck, title: "Delivered", desc: "1–3 working days to your doorstep" },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">Simple Process</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2 text-foreground">How It Works</h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
            Ship your shopping home in 6 easy steps
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-card rounded-2xl p-5 border border-border hover:border-accent/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-accent/60 uppercase tracking-wider">Step {i + 1}</span>
                  <h3 className="font-semibold text-sm text-foreground mt-0.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}