import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function AdminOrdersTab({ orders }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.hotel_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.destination_country?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
            className="h-9 pl-7 pr-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent w-52" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
          <option value="all">All Status</option>
          {['pending', 'receipt_uploaded', 'payment_pending', 'paid', 'packed', 'picked_up', 'in_transit', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} orders</span>
      </div>

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
              {filtered.map(o => (
                <>
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-accent">{o.order_number || '—'}</td>
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
                          <InfoBlock label="Total Value" value={o.consolidated_total_value ? `$${o.consolidated_total_value.toFixed(2)}` : '—'} />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
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