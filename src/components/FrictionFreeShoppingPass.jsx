import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, QrCode, Package, Receipt, MapPin, CheckCircle2, ShoppingBag } from 'lucide-react';

const steps = [
  { icon: QrCode, text: 'Scan QR & register your details*', note: 'The registration process is seamless, and takes less than 4 minutes to complete.' },
  { icon: Package, text: 'Pick up your box (10kg/20kg)**', note: 'Your selected box size can be collected from hotel reception, or conveniently delivered to your room.' },
  { icon: Receipt, text: 'Scan & Upload your shopping receipts***', note: 'Upload unlimited shopping receipts, subject to the terms and conditions.' },
  { icon: MapPin, text: 'Drop box at reception****', note: 'Once your box is packed, simply visit reception to seal and send.' },
];

const touristBenefits = [
  'Travel luggage-free while continuing luxury shopping experiences.',
  'Seamless "shop now, deliver home" capability',
  'Reduced airport stress, baggage handling, and carousel wait times',
  'Consolidated fulfillment in the convenience of their hotel room.',
  'Improved convenience, security, and customer experience',
  'End-to-end tracking and integrated logistics management',
  'Enhanced premium travel experience aligned with luxury expectations.',
  'Expedited international priority shipping, conveniently delivered to your home within 1–3 working days.',
];

export default function FrictionFreeShoppingPass({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-2xl h-[100dvh] sm:h-[90vh] sm:rounded-3xl overflow-hidden flex flex-col"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">
              {/* ── IMAGE 3: Branding Hero ── */}
              <div className="bg-black px-6 py-12 text-center">
                <h1 className="font-bold mb-3" style={{ fontSize: 'clamp(32px, 7vw, 52px)', lineHeight: 1.1 }}>
                  <span className="text-white">SEND</span>
                  <span style={{ color: '#E91E63' }}>IT</span>
                  <span className="text-white">HOME</span>
                </h1>
                <p style={{ color: '#D4AF37' }} className="font-semibold mb-1" >
                  Convenience Delivered Seamlessly
                </p>
                <p className="text-white text-xs tracking-widest font-semibold uppercase">
                  AI Driven Platform
                </p>
                <p className="text-white italic mt-3 mb-6" style={{ fontSize: 'clamp(16px, 3.5vw, 22px)' }}>
                  A New Tourism Retail Mobility Model
                </p>
                {/* Magenta divider */}
                <div className="w-full h-px mb-6" style={{ background: '#E91E63' }} />
                <p className="text-white mb-4" style={{ fontSize: 'clamp(18px, 4vw, 28px)' }}>
                  "Shop in Dubai. We deliver it home."
                </p>
                <p style={{ color: '#D4AF37' }} className="text-sm mb-2">
                  We have created a controlled international tourist shopping corridor*
                </p>
                <p style={{ color: '#E91E63' }} className="text-sm font-semibold">
                  A Reciprocal Tourism Spending Ecosystem Targeting Mid to High Wealth Tourists
                </p>
                <p style={{ color: '#E91E63' }} className="text-sm font-semibold">
                  Within A Multilateral Economic Framework.
                </p>
              </div>

              {/* ── IMAGE 1: HOW IT WORKS ── */}
              <div className="px-6 py-10" style={{ background: '#10141D' }}>
                <h2 className="text-center font-black mb-8" style={{ color: '#E51C77', fontSize: 'clamp(20px, 5vw, 30px)' }}>
                  HOW IT WORKS
                </h2>

                {/* Steps */}
                <div className="space-y-6">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center">
                        {/* Icon circle */}
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                          style={{ background: '#D5006D' }}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-white text-sm font-semibold mb-1">{step.text}</p>
                        {/* Arrow between steps (except last) */}
                        {idx < steps.length - 1 && (
                          <div className="my-1" style={{ color: '#E51C77' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sub-text */}
                <p className="text-center text-white/80 text-sm mt-8">
                  Min spend US$1,500 · Personal Shopping Only
                </p>

                {/* Pink divider */}
                <div className="w-full h-px my-6" style={{ background: '#E51C77' }} />

                {/* Footnotes */}
                <div className="space-y-3 text-white/70 text-xs leading-relaxed">
                  {steps.map((step, idx) => (
                    <p key={idx}>
                      <span style={{ color: '#E51C77' }}>{step.note.match(/\*/)?.[0] || ''}</span> {step.note}
                    </p>
                  ))}
                </div>
              </div>

              {/* ── IMAGE 2: TOURISTS ── */}
              <div className="px-6 py-10" style={{ background: '#101624' }}>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <CheckCircle2 className="w-6 h-6" style={{ color: '#4ADE80' }} />
                  <h2 className="font-black tracking-wide" style={{ color: '#4ADE80', fontSize: 'clamp(20px, 5vw, 30px)' }}>
                    TOURISTS
                  </h2>
                </div>

                <ul className="space-y-4 max-w-md mx-auto">
                  {touristBenefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: '#D4AF37' }}
                      >
                        <CheckCircle2 className="w-3 h-3 text-black" />
                      </span>
                      <span className="text-white text-sm leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-6 bg-black">
                <p className="text-center" style={{ color: '#AAAAAA', fontSize: '10px' }}>
                  PROPRIETARY &amp; CONFIDENTIAL — MAY 2026 · SendITHome is an Operating Company of Vacation Logistics DMCC
                </p>
                <p className="text-center mt-1" style={{ color: '#AAAAAA', fontSize: '10px' }}>
                  *for participating countries.
                </p>
              </div>

              {/* CTA */}
              <div className="bg-background px-6 py-8 text-center">
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-sm transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Got it — Let's Start
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}