import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Store, FileCheck, Clock, AlertTriangle } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  receipt_uploaded: 'bg-blue-50 text-blue-700 border-blue-200',
  payment_pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  paid: 'bg-pink-50 text-pink-700 border-pink-200',
  packed: 'bg-pink-50 text-pink-700 border-pink-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  queried: 'bg-orange-50 text-orange-700 border-orange-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function OrderRow({ item }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Package className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {item.shipment_id || item.order_number || item.id}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {item.hotel_name || '—'} → {item.destination_country || '—'} · {timeAgo(item.created_date)}
        </p>
      </div>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_COLORS[item.status] || 'bg-muted text-muted-foreground border-border'}`}>
        {item.status}
      </span>
      {item.payment_status === 'unpaid' && (
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 whitespace-nowrap">
          Unpaid
        </span>
      )}
    </div>
  );
}

function VerificationRow({ item }) {
  const isOverdue = item.status === 'pending' && item.deadline_at && new Date(item.deadline_at) < new Date();
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <FileCheck className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {item.shipment_id || '—'} · {item.store_name || '—'}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {item.tourist_name || '—'} · US${item.total_value || 0} · {timeAgo(item.created_date)}
        </p>
      </div>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_COLORS[isOverdue ? 'overdue' : item.status] || 'bg-muted text-muted-foreground border-border'}`}>
        {isOverdue ? 'overdue' : item.status}
      </span>
    </div>
  );
}

function RetailerRow({ item }) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Store className="w-4 h-4 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{item.store_name || '—'}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          {item.brand_name || '—'} · {item.store_location || '—'} · {timeAgo(item.created_date)}
        </p>
      </div>
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_COLORS[item.status] || 'bg-muted text-muted-foreground border-border'}`}>
        {item.status}
      </span>
    </div>
  );
}

export default function OperationalDrillDown({ open, title, subtitle, items, type, onClose }) {
  if (!open) return null;
  const Row = type === 'order' ? OrderRow : type === 'verification' ? VerificationRow : RetailerRow;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                <h3 className="text-sm font-bold text-foreground truncate">{title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle} — {items.length} item{items.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No items requiring action right now.</p>
              </div>
            ) : (
              items.map(item => <Row key={item.id} item={item} />)
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}