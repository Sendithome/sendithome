import { Package, RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { getStockStatusColor } from '@/utils/inventoryTiers';

const BOX_TYPE_LABELS = { '10kg': '10 KG Box', '20kg': '20 KG Box' };

export default function InventoryStatusCard({ label, current, allocated, reorderAt, status, lastReplenishedAt, boxType }) {
  const pct = Math.min(100, Math.round((current / allocated) * 100));
  const statusColor = getStockStatusColor(current, reorderAt);
  const isReplenishing = status === 'replenishment_in_progress';

  return (
    <div className={`rounded-2xl border-2 p-4 space-y-3 ${statusColor.bg} ${statusColor.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className={`w-4 h-4 ${statusColor.text}`} />
          <p className="text-sm font-bold text-foreground">{BOX_TYPE_LABELS[boxType] || boxType}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isReplenishing ? 'bg-blue-50 text-blue-700 border-blue-200' :
          statusColor.bg + ' ' + statusColor.text + ' ' + statusColor.border
        }`}>
          {isReplenishing ? '🔄 Replenishment In Progress' : statusColor.label}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className={`font-black text-lg ${statusColor.text}`}>{current}</span>
          <span className="text-muted-foreground text-xs self-end">/ {allocated} allocated</span>
        </div>
        <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-white/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct <= 25 ? 'bg-destructive' :
              pct <= 50 ? 'bg-amber-500' :
              'bg-green-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
          <span>{pct}% remaining</span>
          <span>Reorder at ≤ {reorderAt}</span>
        </div>
      </div>

      {/* Last replenishment */}
      {lastReplenishedAt && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Last replenished: {new Date(lastReplenishedAt).toLocaleDateString('en-AE')}
        </div>
      )}

      {/* Alert if at reorder level */}
      {current <= reorderAt && !isReplenishing && (
        <div className="flex items-center gap-1.5 bg-white/50 rounded-xl px-2.5 py-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-800 font-semibold">Below reorder threshold — replenishment triggered</p>
        </div>
      )}

      {isReplenishing && (
        <div className="flex items-center gap-1.5 bg-blue-50 rounded-xl px-2.5 py-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
          <p className="text-[10px] text-blue-800 font-semibold">Courier partner has been notified — delivery incoming</p>
        </div>
      )}
    </div>
  );
}