import { useState, useMemo, Fragment } from 'react';
import { Search, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, MapPin, ArrowUp, ArrowDown } from 'lucide-react';

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

// Meaningful pipeline order for status sorting (instead of alphabetical).
const STATUS_ORDER = {
  pending: 0, receipt_uploaded: 1, payment_pending: 2, paid: 3, packed: 4,
  picked_up: 5, in_transit: 6, delivered: 7, cancelled: 8,
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
      else if (sortBy === 'status') { av = STATUS_ORDER[a.status] ?? 99; bv = STATUS_ORDER[b.status] ?? 99; }
      else if (sortBy === 'hotel') { av = (a.hotel_name || '').toLowerCase(); bv = (b.hotel_name || '').toLowerCase(); }
      else if (sortBy === 'destination') { av = (a.destination_country || '').toLowerCase(); bv = (b.destination_country || '').toLowerCase(); }
      else if (sortBy === 'recipient') { av = (a.recipient_name || '').toLowerCase(); bv = (b.recipient_name || '').toLowerCase(); }
      else if (sortBy === 'order') { av = (a.order_number || a.shipment_id || '').toLowerCase(); bv = (b.order_number || b.shipment_id || '').toLowerCase(); }
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
    return result;
  }, [orders, search, filterStatus, filterHotel, filterDest, filterDate, sortBy, sortDir]);

  const stalledCount = useMemo(() => filtered.filter(isStalled).length, [filtered]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir(column === 'created' ? 'desc' : 'asc');
    }
  };

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
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} orders · click a column to sort</span>
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
                <SortHeader label="Order #" column="order" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Recipient" column="recipient" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Hotel" column="hotel" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Destination" column="destination" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="text-left py-2.5 px-3 font-semibold whitespace-nowrap">Box</th>
                <SortHeader label="Status" column="status" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="text-left py-2.5 px-3 font-semibold whitespace-nowrap">Multi-Retailer</th>
                <SortHeader label="Created" column="created" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <th className="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(o => {
                const stalled = isStalled(o);
                return (
                  <Fragment key={o.id}>
                    <tr className={`transition-colors border-l-[3px] ${stalled ? 'border-l-red-400 bg-red-50/40' : 'border-l-transparent'} hover:bg-muted/20`}>
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
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{o.recipient_name || '—'}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{o.hotel_name || '—'}</td>
                      <td className="py-2.5 px-3">{o.destination_country || '—'}</td>
                      <td className="py-2.5 px-3">{o.box_size || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] || STATUS_COLORS.pending}`}>
                          {o.status?.replace(/_/g, ' ') || '—'}
                        </span>
                        {stalled && (
                          <span className="block mt-1 text-[9px] font-bold text-red-600 uppercase tracking-wide">⚠ Stalled</span>
                        )}
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
                      <tr className="bg-muted/10">
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
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SortHeader({ label, column, sortBy, sortDir, onSort }) {
  const active = sortBy === column;
  return (
    <th className="text-left py-2.5 px-3 font-semibold whitespace-nowrap">
      <button
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 transition-colors ${active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}
      >
        {label}
        {active && (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </button>
    </th>
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