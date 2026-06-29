import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ExternalLink, ArrowUpDown, AlertTriangle, MapPin } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-600',
  receipt_uploaded: 'bg-blue-100 text-blue-700',
  payment_pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  packed: 'bg-teal-100 text-teal-700',
  picked_up: 'bg-purple-100 text-purple-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-500',
};

// Orders stuck in a pre-delivery state for more than 3 days are flagged as stalled.
const STALLED_STATUSES = ['pending', 'receipt_uploaded', 'payment_pending', 'paid', 'packed'];
const STALL_DAYS = 3;

function isStalled(o) {
  if (!STALLED_STATUSES.includes(o.status)) return false;
  if (!o.created_date) return false;
  const ageDays = (Date.now() - new Date(o.created_date).getTime()) / 86400000;
  return ageDays > STALL_DAYS;
}

function inDateRange(dateStr, range) {
  if (range === 'all') return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  if (range === 'today') return d.toDateString() === now.toDateString();
  if (range === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (range === '30d') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  }
  return true;
}

export default function AdminOrdersTab({ orders }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHotel, setFilterHotel] = useState('all');
  const [filterDest, setFilterDest] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);

  const hotelOptions = useMemo(
    () => Array.from(new Set(orders.map(o => o.hotel_name).filter(Boolean))).sort(),
    [orders]
  );
  const destOptions = useMemo(
    () => Array.from(new Set(orders.map(o => o.destination_country).filter(Boolean))).sort(),
    [orders]
  );

  const filtered = useMemo(() => {
    const result = orders.filter(o => {
      const matchSearch = !search ||
        o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.shipment_id?.toLowerCase().includes(search.toLowerCase()) ||
        o.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.hotel_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.destination_country?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchHotel = filterHotel === 'all' || o.hotel_name === filterHotel;
      const matchDest = filterDest === 'all' || o.destination_country === filterDest;
      const matchDate = inDateRange(o.created_date, filterDate);
      return matchSearch && matchStatus && matchHotel && matchDest && matchDate;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      let av, bv;
      if (sortBy === 'created') { av = a.created_date || ''; bv = b.created_date || ''; }
      else if (sortBy === 'status') { av = a.status || ''; bv = b.status || ''; }
      else if (sortBy === 'hotel') { av = a.hotel_name || ''; bv = b.hotel_name || ''; }
      else if (sortBy === 'destination') { av = a.destination_country || ''; bv = b.destination_country || ''; }
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return result;
  }, [orders, search, filterStatus, filterHotel, filterDest, filterDate, sortBy, sortDir]);

  const stalledCount = useMemo(() => filtered.filter(isStalled).length, [filtered]);

  const selectCls = 'h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
            className="h-9 pl-7 pr-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent w-52" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
          <option value="all">All Status</option>
          {['pending', 'receipt_uploaded', 'payment_pending', 'paid', 'packed', 'picked_up', 'in_transit', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={filterHotel} onChange={e => setFilterHotel(e.target.value)} className={selectCls}>
          <option value="all">All Hotels</option>
          {hotelOptions.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select value={filterDest} onChange={e => setFilterDest(e.target.value)} className={selectCls}>
          <option value="all">All Destinations</option>
          {destOptions.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterDate} onChange={e => setFilterDate(e.target.value)} className={selectCls}>
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="month">This Month</option>
          <option value="30d">Last 30 Days</option>
        </select>
        <select value={`${sortBy}:${sortDir}`} onChange={e => { const [b, d] = e.target.value.split(':'); setSortBy(b); setSortDir(d); }} className={selectCls}>
          <option value="created:desc">Newest first</option>
          <option value="created:asc">Oldest first</option>
          <option value="status:asc">Status (A–Z)</option>
          <option value="hotel:asc">Hotel (A–Z)</option>
          <option value="destination:asc">Destination (A–Z)</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} orders</span>
      </div>

      {stalledCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {stalledCount} order{stalledCount > 1 ? 's' : ''} stalled (no progress for over {STALL_DAYS} days) — highlighted below.
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                {['Order #', 'Recipient', 'Hotel', 'Destination', 'Box', 'Status', 'Multi-Retailer', 'Created', ''].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(o => {
                const stalled = isStalled(o);
                return (
                  <>
                    <tr key={o.id} className={`transition-colors ${stalled ? 'bg-red-50/70 hover:bg-red-50' : 'hover:bg-muted/20'}`}>
                      <td className="py-2.5 px-3">
                        <a
                          href={`/shipment/${o.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold text-accent hover:underline inline-flex items-center gap-1"
                          title="Open full shipment record"
                        >
                          {o.order_number || o.shipment_id || '—'}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {stalled && (
                          <span className="ml-2 text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">STALLED</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{o.recipient_name || '—'}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{o.hotel_name || '—'}</td>
                      <td className="py-2.5 px-3">{o.destination_country || '—'}</td>
                      <td className="py-2.5 px-3">{o.box_size || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || STATUS_COLORS.pending}`}>
                          {o.status?.replace(/_/g, ' ') || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {o.multi_retailer_status !== 'not_applicable' && (
                          <span className="text-[10px] text-blue-600 font-semibold">
                            {o.retailer_verifications_approved || 0}/{o.retailer_verifications_count || 0} approved
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        {o.created_date ? new Date(o.created_date).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <button onClick={() => setExpandedId(expandedId === o.id ? null : o.id)} className="text-muted-foreground hover:text-foreground">
                          {expandedId === o.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === o.id && (
                      <tr key={o.id + '-d'} className="bg-muted/10">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <InfoBlock label="Shipment ID" value={o.shipment_id} />
                            <InfoBlock label="Hotel Room" value={o.hotel_room} />
                            <InfoBlock label="Tracking #" value={o.tracking_number} />
                            <InfoBlock label="Payment" value={o.payment_status} />
                            <InfoBlock label="Destination Address" value={o.destination_address} />
                            <InfoBlock label="Destination City" value={o.destination_city} />
                            <InfoBlock label="Recipient Phone" value={o.recipient_phone} />
                            <InfoBlock label="Total Value" value={o.consolidated_total_value ? `US$${o.consolidated_total_value.toFixed(2)}` : '—'} />
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <a href={`/shipment/${o.id}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" /> Open Shipment Record
                            </a>
                            <a href={`/track?order=${encodeURIComponent(o.order_number || '')}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:border-accent transition-colors">
                              <MapPin className="w-3.5 h-3.5" /> Track Shipment
                            </a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{value || '—'}</p>
    </div>
  );
}