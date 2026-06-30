import { useState } from 'react';
import { Package2, CheckCircle2, AlertCircle, Truck, Shield, Clock, Loader2 } from 'lucide-react';

const INVENTORY = [
  { type: '10 kg', allocated: 60, current: 38, reorder: 50 },
  { type: '20 kg', allocated: 60, current: 47, reorder: 50 },
];

const REPLENISHMENTS = [
  { date: '2026-06-28', type: '10 kg', qty: 40, status: 'in_transit', eta: '2026-07-01' },
  { date: '2026-05-28', type: '10 kg', qty: 40, status: 'delivered', eta: null },
  { date: '2026-04-14', type: '20 kg', qty: 20, status: 'delivered', eta: null },
  { date: '2026-03-02', type: '10 kg', qty: 40, status: 'delivered', eta: null },
];

export default function DemoInventoryTab() {
  const [requesting, setRequesting] = useState(null);
  const [requested, setRequested] = useState(false);

  const handleRequest = (type) => {
    setRequesting(type);
    setTimeout(() => { setRequesting(null); setRequested(true); setTimeout(() => setRequested(false), 3000); }, 800);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Box Inventory</h2>
        <p className="text-sm text-muted-foreground">Current stock levels and replenishment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INVENTORY.map(inv => {
          const pct = Math.round(inv.current / inv.allocated * 100);
          const isLow = inv.current <= inv.reorder;
          return (
            <div key={inv.type} className={`bg-white border rounded-2xl p-5 shadow-sm ${isLow ? 'border-amber-200' : 'border-border'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{inv.type} Box</p>
                  <p className="text-xs text-muted-foreground">Flat-pack shipping box</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isLow ? 'bg-amber-50' : 'bg-blue-50'}`}>
                  <Package2 className={`w-5 h-5 ${isLow ? 'text-amber-500' : 'text-blue-500'}`} />
                </div>
              </div>
              <div className="flex items-end justify-between mb-2">
                <p className="text-3xl font-black text-foreground">{inv.current}</p>
                <p className="text-sm text-muted-foreground">/ {inv.allocated} allocated</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{pct}% stocked</span>
                <span>Reorder at {inv.reorder}</span>
              </div>
              {isLow && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 font-semibold">Stock low — replenishment recommended</p>
                </div>
              )}
              <button onClick={() => handleRequest(inv.type)} disabled={requesting === inv.type}
                className="mt-3 w-full flex items-center justify-center gap-1.5 h-8 text-xs font-semibold border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-50">
                {requesting === inv.type ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package2 className="w-3.5 h-3.5" />}
                {requesting === inv.type ? 'Requesting…' : `Request more ${inv.type} boxes`}
              </button>
            </div>
          );
        })}
      </div>

      {requested && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 font-semibold text-center">
          ✓ Request received — your logistics partner will deliver additional boxes within 24 hours (M-F).
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Truck className="w-4 h-4 text-accent" /> Replenishment History
          </h3>
        </div>
        <div className="divide-y divide-border">
          {REPLENISHMENTS.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.status === 'delivered' ? 'bg-green-50' : 'bg-blue-50'}`}>
                {r.status === 'delivered' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">{r.type} Box · {r.qty} units {r.status === 'delivered' ? 'delivered' : 'in transit'}</p>
                <p className="text-[10px] text-muted-foreground">Ordered: {r.date}</p>
              </div>
              {r.status === 'in_transit' && r.eta ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">ETA {r.eta}</span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Delivered</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">Automatic Replenishment</p>
          <p className="text-xs text-blue-700 mt-1">SendItHome monitors your stock levels 24/7. When boxes drop below your reorder threshold, a replenishment order is automatically raised and dispatched within 24 hours — at zero cost to your property. You can also request additional stock manually using the buttons above.</p>
        </div>
      </div>
    </div>
  );
}