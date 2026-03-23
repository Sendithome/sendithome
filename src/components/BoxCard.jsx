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
        "relative w-full rounded-2xl p-6 text-left border-2 transition-all duration-300",
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

      <div className="flex items-center gap-4">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center",
          is10 ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
        )}>
          <Package className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{is10 ? '10' : '20'}</span>
            <span className="text-sm text-muted-foreground font-medium">kg</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {is10 ? 'Perfect for small items' : 'For larger shopping hauls'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">$60</span>
          <span className="text-sm text-muted-foreground">/box</span>
        </div>
        <p className="text-xs text-accent font-medium mt-1">1–3 day air delivery</p>
      </div>

      <ul className="mt-3 space-y-1.5">
        {[
          'Free hotel pickup',
          '50+ countries',
          'Full tracking included',
          is10 ? 'Up to 10 kg' : 'Up to 20 kg',
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