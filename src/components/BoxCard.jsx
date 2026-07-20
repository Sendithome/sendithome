import { Package, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BoxCard({ size, selected, onSelect }) {
  const is10 = size === '10kg';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(size)}
      className={cn(
        "relative w-full rounded-2xl p-5 text-left border-2 transition-all duration-300",
        selected
          ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
          : "border-border bg-card hover:border-accent/30"
      )}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 bg-accent rounded-full flex items-center justify-center"
        >
          <Check className="w-3.5 h-3.5 text-accent-foreground" />
        </motion.div>
      )}

      {/* Box size — primary focus */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
          is10 ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
        )}>
          <Package className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-foreground">{is10 ? '10' : '20'}</span>
            <span className="text-sm text-muted-foreground font-medium">kg max</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {is10 ? 'Perfect for small items' : 'For larger shopping hauls'}
          </p>
        </div>
      </div>

      {/* Weight difference note */}
      <div className="bg-muted/40 rounded-lg px-3 py-2 mb-3">
        <p className="text-[11px] text-muted-foreground text-center">
          {is10 ? 'Up to 10 kg of shopping' : 'Up to 20 kg of shopping'}
        </p>
      </div>

      {/* Price breakdown — separated, less prominent */}
      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Checkout &amp; Membership</span>
          <span className="font-semibold text-foreground">US$150</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Concierge Fulfillment</span>
          <span className="text-muted-foreground">US$20 (hotel bill)</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Shipping Insurance</span>
          <span className="text-green-600 font-medium">US$3,000 included</span>
        </div>
      </div>

      <p className="text-xs text-accent font-medium mt-2">Expedited delivery in 1–3 working days (M-F)</p>

      <ul className="mt-3 space-y-1">
        {[
          'Free hotel pickup',
          '50+ countries',
          'Full tracking included',
        ].map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3 h-3 text-accent shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}