import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Package, CheckCircle2, Clock, XCircle, DollarSign, TrendingUp } from 'lucide-react';

const STATUS_META = {
  approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  queried: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  overdue: { icon: Clock, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  cancelled: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
};

function fmtDate(s) {
  return s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
}
function fmtMoney(n) {
  return `US$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RetailerDrillDown({ retailer, verifications, orders, onClose }) {
  const rvs = useMemo(
    () => verifications.filter(v => v.retailer_id === retailer?.id).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    [retailer, verifications]
  );

  const shipments = useMemo(() => {
    const orderIds = new Set(rvs.map(v => v.order_id).filter(Boolean));
    const linkedOrders = orders.filter(o => orderIds.has(o.id));
    return linkedOrders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [rvs, orders]);

  const approvedRvs = rvs.filter(v => v.status === 'approved');
  const totalCommission = approvedRvs.reduce((s, v) => s + (v.commission_amount || 0), 0);
  const totalValue = approvedRvs.reduce((s, v) => s + (v.total_value || 0), 0);

  if (!retailer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{retailer.brand_name || retailer.store_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {retailer.store_name}{retailer.store_location ? ` · ${retailer.store_location}` : ''} · {retailer.store_category || '—'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-muted/40 rounded-xl p-3">
                <DollarSign className="w-4 h-4 text-accent mb-1" />
                <p className="text-lg font-black text-foreground">{fmtMoney(totalCommission)}</p>
                <p className="text-[10px] text-muted-foreground">Total Commission</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <TrendingUp className="w-4 h-4 text-blue-600 mb-1" />
                <p className="text-lg font-black text-foreground">{fmtMoney(totalValue)}</p>
                <p className="text-[10px] text-muted-foreground">Shipment Value</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <Package className="w-4 h-4 text-purple-600 mb-1" />
                <p className="text-lg font-black text-foreground">{rvs.length}</p>
                <p className="text-[10px] text-muted-foreground">Verifications</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 mb-1" />
                <p className="text-lg font-black text-foreground">{approvedRvs.length}</p>
                <p className="text-[10px] text-muted-foreground">Approved</p>
              </div>
            </div>

            {/* Profile details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <Detail label="Partner Code" value={retailer.partner_code} mono />
              <Detail label="Status" value={retailer.status} />
              <Detail label="Commission Rate" value={retailer.commission_rate != null ? `${retailer.commission_rate}%` : '—'} />
              <Detail label="Contact" value={retailer.contact_name} />
              <Detail label="Email" value={retailer.contact_email} />
              <Detail label="Branches" value={retailer.branches_count} />
            </div>

            {/* Shipment History */}
            <Section title="Shipment History" icon={Package} count={shipments.length}>
              {shipments.length === 0 ? (
                <Empty text="No linked shipments" />
              ) : (
                <div className="space-y-2">
                  {shipments.map(o => {
                    const oRvs = rvs.filter(v => v.order_id === o.id);
                    const value = oRvs.reduce((s, v) => s + (v.total_value || 0), 0);
                    return (
                      <div key={o.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {o.shipment_id || o.order_number || o.id}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {fmtDate(o.created_date)} · {o.destination_country || '—'} · {oRvs.length} verification{oRvs.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-bold text-foreground">{fmtMoney(value)}</p>
                          <p className="text-[10px] text-muted-foreground">{o.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Verification Activity */}
            <Section title="Verification Activity" icon={CheckCircle2} count={rvs.length}>
              {rvs.length === 0 ? (
                <Empty text="No verification activity" />
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {rvs.map(v => {
                    const meta = STATUS_META[v.status] || STATUS_META.pending;
                    const Icon = meta.icon;
                    return (
                      <div key={v.id} className="flex items-start gap-2.5 bg-muted/30 rounded-xl px-3 py-2.5">
                        <Icon className={`w-4 h-4 ${meta.color} mt-0.5 shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground truncate">{v.shipment_id || '—'}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${meta.bg} ${meta.color} shrink-0`}>{v.status}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {fmtDate(v.created_date)} · {(v.items || []).length} item{(v.items || []).length !== 1 ? 's' : ''} · Value {fmtMoney(v.total_value)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Commission Payments */}
            <Section title="Commission Payments" icon={DollarSign} count={approvedRvs.length}>
              {approvedRvs.length === 0 ? (
                <Empty text="No commission payments yet" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {['Shipment', 'Date', 'Tier', 'Rate', 'Amount'].map(h => (
                          <th key={h} className={`text-[10px] text-muted-foreground font-semibold pb-1.5 ${h === 'Shipment' || h === 'Date' ? 'text-left' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {approvedRvs.map(v => (
                        <tr key={v.id} className="border-b border-border/40">
                          <td className="py-2 text-xs text-foreground font-medium">{v.shipment_id || '—'}</td>
                          <td className="py-2 text-xs text-muted-foreground">{fmtDate(v.approved_at || v.created_date)}</td>
                          <td className="py-2 text-xs text-right text-muted-foreground">{v.commission_tier || '—'}</td>
                          <td className="py-2 text-xs text-right text-muted-foreground">{v.commission_rate != null ? `${(v.commission_rate * 100).toFixed(0)}%` : '—'}</td>
                          <td className="py-2 text-xs text-right font-bold text-accent">{fmtMoney(v.commission_amount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td colSpan={4} className="py-2 text-xs font-bold text-foreground text-right">Total</td>
                        <td className="py-2 text-xs font-black text-accent text-right">{fmtMoney(totalCommission)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function Section({ title, icon: Icon, count, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {title} <span className="text-[10px] text-muted-foreground font-normal">({count})</span>
      </h3>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-xs text-muted-foreground text-center py-6">{text}</p>;
}