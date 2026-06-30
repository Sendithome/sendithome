import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hotel, MapPin, Package, DollarSign, Building2, Phone, Mail, Star } from 'lucide-react';

function fmtMoney(n) { return `US$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }
function fmtDate(s) { return s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

export default function HotelProfileDrawer({ hotel, orders, onClose }) {
  const hOrders = useMemo(
    () => orders.filter(o => o.hotel_name === hotel?.name || o.hotel_id === hotel?.id).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    [hotel, orders]
  );
  const paidOrders = hOrders.filter(o => o.payment_status === 'paid');
  const revenue = paidOrders.reduce((s, o) => s + (o.price || 60), 0);
  const boxes = paidOrders.length;

  if (!hotel) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={onClose}>
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="bg-card border-l border-border w-full max-w-md h-full overflow-y-auto shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Hotel className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{hotel.name}</p>
                <p className="text-xs text-muted-foreground truncate">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <Package className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{hOrders.length}</p>
                <p className="text-[10px] text-muted-foreground">Shipments</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <DollarSign className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{fmtMoney(revenue)}</p>
                <p className="text-[10px] text-muted-foreground">Revenue</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <Building2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-black text-foreground">{hotel.number_of_rooms || '—'}</p>
                <p className="text-[10px] text-muted-foreground">Rooms</p>
              </div>
            </div>

            {/* Profile details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Detail icon={Star} label="Star Rating" value={hotel.star_rating ? `${hotel.star_rating}★` : '—'} />
              <Detail icon={MapPin} label="Area" value={hotel.area || '—'} />
              <Detail icon={Phone} label="Phone" value={hotel.official_phone || hotel.contact_phone || '—'} />
              <Detail icon={Mail} label="Email" value={hotel.official_email || hotel.contact_email || '—'} />
              <Detail icon={MapPin} label="State" value={hotel.state || '—'} />
              <Detail icon={MapPin} label="Postal" value={hotel.postal_code || '—'} />
            </div>

            {/* GM contact */}
            {(hotel.gm_name || hotel.gm_email) && (
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">General Manager</p>
                <p className="text-xs font-semibold text-foreground">{hotel.gm_name || '—'}</p>
                {hotel.gm_email && <p className="text-[10px] text-muted-foreground">{hotel.gm_email}</p>}
                {hotel.gm_phone && <p className="text-[10px] text-muted-foreground">{hotel.gm_phone}</p>}
              </div>
            )}

            {/* Recent shipments */}
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Recent Shipments ({hOrders.length})</h3>
              {hOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No shipments recorded</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {hOrders.slice(0, 30).map(o => (
                    <div key={o.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{o.shipment_id || o.order_number || o.id}</p>
                        <p className="text-[10px] text-muted-foreground">{fmtDate(o.created_date)} → {o.destination_country || '—'}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap ml-2 ${
                        o.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        o.payment_status === 'unpaid' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-foreground truncate">{value || '—'}</p>
      </div>
    </div>
  );
}