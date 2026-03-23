import { Check, Circle, Package, Truck, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRACKING_STEPS = [
  { key: 'paid', label: 'Order Confirmed', icon: Check },
  { key: 'packed', label: 'Packed & Ready', icon: Package },
  { key: 'picked_up', label: 'Picked Up', icon: Building2 },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const STATUS_ORDER = ['pending', 'receipt_uploaded', 'payment_pending', 'paid', 'packed', 'picked_up', 'in_transit', 'delivered'];

export default function TrackingTimeline({ status }) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-0">
      {TRACKING_STEPS.map((step, i) => {
        const stepIndex = STATUS_ORDER.indexOf(step.key);
        const isCompleted = currentIndex >= stepIndex;
        const isCurrent = step.key === status;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-start gap-4">
            {/* Line + Circle */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                isCompleted
                  ? "bg-accent border-accent text-accent-foreground"
                  : "bg-muted border-border text-muted-foreground",
                isCurrent && "ring-4 ring-accent/20"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {i < TRACKING_STEPS.length - 1 && (
                <div className={cn(
                  "w-0.5 h-12 transition-colors",
                  isCompleted ? "bg-accent" : "bg-border"
                )} />
              )}
            </div>

            {/* Label */}
            <div className="pt-2">
              <p className={cn(
                "text-sm font-medium",
                isCompleted ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-accent font-medium mt-0.5">Current status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}