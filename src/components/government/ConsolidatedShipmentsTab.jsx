import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, CheckCircle2, Clock, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CFG = {
  not_applicable: { label: 'Single Store', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border' },
  pending_retailer_approvals: { label: 'Awaiting Retailer Approvals', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  all_retailers_approved: { label: 'All Approved', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  consolidated: { label: 'Consolidated ✓', color: 'text-accent', bg: 'bg-accent/5 border-accent/30' },
};

export default function ConsolidatedShipmentsTab({ orders }) {
  const [expandedId, setExpandedId] = useState(null);

  const multiRetailerOrders = orders.filter(o => o.multi_retailer_status && o.multi_retailer_status !== 'not_applicable');

  if (multiRetailerOrders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">No multi-retailer shipments yet</p>
        <p className="text-xs mt-1">Consolidated shipments will appear here once tourists upload multiple store receipts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {multiRetailerOrders.map(order => {
        const cfg = STATUS_CFG[order.multi_retailer_status] || STATUS_CFG.not_applicable;
        const isExpanded = expandedId === order.id;
        const isConsolidated = order.multi_retailer_status === 'consolidated';
        const progress = order.retailer_verifications_count > 0
          ? Math.round((order.retailer_verifications_approved / order.retailer_verifications_count) * 100)
          : 0;

        return (
          <div key={order.id} className={`bg-card border rounded-2xl overflow-hidden shadow-sm ${isConsolidated ? 'border-accent/30' : 'border-border'}`}>
            {/* Header Row */}
            <div
              className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isConsolidated ? 'bg-accent/10' : 'bg-muted'}`}>
                  <Package className={`w-5 h-5 ${isConsolidated ? 'text-accent' : 'text-muted-foreground'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground font-mono">{order.shipment_id || order.order_number || order.id.slice(0, 8)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{order.recipient_name || '—'}</span>
                    <span>→ {order.destination_country || '—'}</span>
                    {order.hotel_name && <span>🏨 {order.hotel_name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {/* Approval Progress */}
                {order.retailer_verifications_count > 0 && (
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-muted-foreground">Retailer Approvals</p>
                    <p className="text-sm font-bold text-foreground">
                      {order.retailer_verifications_approved}/{order.retailer_verifications_count}
                    </p>
                    <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-yellow-400'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {isConsolidated && order.consolidated_total_value && (
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-sm font-bold text-amber-600">${order.consolidated_total_value.toLocaleString()}</p>
                  </div>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            {/* Expanded Detail */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border overflow-hidden"
                >
                  <div className="p-5 space-y-4">
                    {/* Consolidated Items */}
                    {isConsolidated && order.consolidated_items?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Consolidated Items ({order.consolidated_items.length})</p>
                        {/* Group by store */}
                        {Object.entries(
                          order.consolidated_items.reduce((acc, item) => {
                            const s = item.store_name || 'Unknown Store';
                            if (!acc[s]) acc[s] = [];
                            acc[s].push(item);
                            return acc;
                          }, {})
                        ).map(([storeName, items]) => (
                          <div key={storeName} className="mb-3 bg-muted/30 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 border-b border-border">
                              <Store className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-bold text-foreground">{storeName}</span>
                              <span className="ml-auto text-xs text-amber-600 font-semibold">
                                ${items.reduce((s, i) => s + (i.price || 0), 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="divide-y divide-border">
                              {items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                                  <div>
                                    <p className="text-foreground font-medium">{item.description}</p>
                                    <p className="text-muted-foreground">{item.category}</p>
                                  </div>
                                  <p className="text-foreground font-semibold">${(item.price || 0).toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Consolidated Summary */}
                    {isConsolidated && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <InfoBox label="Customs Ref" value={order.consolidated_customs_ref || '—'} mono />
                        <InfoBox label="Consolidated At" value={order.consolidated_at ? new Date(order.consolidated_at).toLocaleString() : '—'} />
                        <InfoBox label="Total Value" value={`$${(order.consolidated_total_value || 0).toLocaleString()}`} highlight />
                      </div>
                    )}

                    {/* Pending notice */}
                    {order.multi_retailer_status === 'pending_retailer_approvals' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
                        <p className="text-xs text-yellow-700">
                          Waiting for <strong>{(order.retailer_verifications_count || 0) - (order.retailer_verifications_approved || 0)}</strong> retailer(s) to approve their items. Consolidation will happen automatically once all approved.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function InfoBox({ label, value, mono, highlight }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold mt-1 ${highlight ? 'text-amber-600' : 'text-foreground'} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}