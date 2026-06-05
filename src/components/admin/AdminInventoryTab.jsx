import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Package, RefreshCw, Loader2, AlertTriangle, CheckCircle2,
  TrendingDown, Search, Filter
} from 'lucide-react';
import { getInventoryTier, TIER_LABELS } from '@/utils/inventoryTiers';

const STATUS_COLORS = {
  ok:                       'bg-green-50 text-green-700 border-green-200',
  low:                      'bg-amber-50 text-amber-700 border-amber-200',
  replenishment_in_progress:'bg-blue-50  text-blue-700  border-blue-200',
  critical:                 'bg-red-50   text-destructive border-red-200',
};

export default function AdminInventoryTab({ hotels = [], onRefresh }) {
  const [inventories, setInventories] = useState([]);
  const [repOrders, setRepOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [invs, orders] = await Promise.all([
      base44.entities.HotelInventory.list('-created_date', 500),
      base44.entities.ReplenishmentOrder.list('-created_date', 200),
    ]);
    setInventories(invs);
    setRepOrders(orders);
    setLoading(false);
  };

  const handleManualInit = async (hotel) => {
    if (!hotel.number_of_rooms) {
      alert('Please set Number of Rooms in the hotel profile first.');
      return;
    }
    const existing = await base44.entities.HotelInventory.filter({ hotel_id: hotel.id });
    if (existing.length > 0) { alert('Inventory already initialized for this hotel.'); return; }
    const tier = getInventoryTier(hotel.number_of_rooms);
    await base44.entities.HotelInventory.create({
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      number_of_rooms: hotel.number_of_rooms,
      tier: tier.tier,
      allocated_10kg: tier.allocated,
      allocated_20kg: tier.allocated,
      current_10kg: tier.allocated,
      current_20kg: tier.allocated,
      reorder_trigger_level: tier.reorderAt,
      status_10kg: 'ok',
      status_20kg: 'ok',
      last_updated: new Date().toISOString(),
    });
    await loadData();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    const now = new Date().toISOString();
    const update = { status: newStatus };
    if (newStatus === 'delivered') {
      update.delivered_at = now;
      // Update inventory stock
      const order = repOrders.find(o => o.id === orderId);
      if (order) {
        const inv = inventories.find(i => i.hotel_id === order.hotel_id);
        if (inv) {
          const field10 = order.box_type === '10kg' ? 'current_10kg' : null;
          const field20 = order.box_type === '20kg' ? 'current_20kg' : null;
          const fieldStatus10 = order.box_type === '10kg' ? 'status_10kg' : null;
          const fieldStatus20 = order.box_type === '20kg' ? 'status_20kg' : null;
          const invUpdates = { last_updated: now };
          if (field10) {
            const newVal = (inv.current_10kg || 0) + (order.quantity_requested || 0);
            invUpdates.current_10kg = newVal;
            invUpdates.status_10kg = newVal <= inv.reorder_trigger_level ? 'low' : 'ok';
            invUpdates.last_replenishment_10kg_at = now;
          }
          if (field20) {
            const newVal = (inv.current_20kg || 0) + (order.quantity_requested || 0);
            invUpdates.current_20kg = newVal;
            invUpdates.status_20kg = newVal <= inv.reorder_trigger_level ? 'low' : 'ok';
            invUpdates.last_replenishment_20kg_at = now;
          }
          await base44.entities.HotelInventory.update(inv.id, invUpdates);
          // Log delivery
          await base44.entities.InventoryUsageLog.create({
            hotel_id: inv.hotel_id,
            hotel_name: inv.hotel_name,
            box_type: order.box_type,
            quantity_used: 0,
            quantity_remaining: field10 ? (inv.current_10kg || 0) + (order.quantity_requested || 0) : (inv.current_20kg || 0) + (order.quantity_requested || 0),
            date: now.slice(0, 10),
            recorded_by: 'courier',
            notes: `Replenishment delivered: +${order.quantity_requested} ${order.box_type} boxes`,
          });
        }
      }
    }
    await base44.entities.ReplenishmentOrder.update(orderId, update);
    await loadData();
    setUpdatingOrder(null);
  };

  const filtered = inventories.filter(inv => {
    const matchSearch = !search || inv.hotel_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || inv.status_10kg === filterStatus || inv.status_20kg === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingOrders = repOrders.filter(o => o.status === 'pending' || o.status === 'acknowledged' || o.status === 'in_transit');

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Hotel Box Inventory Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Automated tier-based allocation with real-time replenishment tracking</p>
        </div>
        <button onClick={() => { loadData(); onRefresh?.(); }}
          className="flex items-center gap-1.5 px-3 h-8 text-xs text-muted-foreground border border-border rounded-xl hover:text-foreground bg-card">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Hotels Tracked', value: inventories.length, bg: 'bg-blue-50 border-blue-200', color: 'text-blue-700' },
          { label: 'Low Stock Alerts', value: inventories.filter(i => i.status_10kg === 'low' || i.status_20kg === 'low').length, bg: 'bg-amber-50 border-amber-200', color: 'text-amber-700' },
          { label: 'Replenishments Active', value: pendingOrders.length, bg: pendingOrders.length > 0 ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200', color: pendingOrders.length > 0 ? 'text-purple-700' : 'text-green-700' },
          { label: 'Hotels Without Inventory', value: hotels.filter(h => !inventories.find(i => i.hotel_id === h.id)).length, bg: 'bg-slate-50 border-slate-200', color: 'text-slate-600' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-4 ${kpi.bg}`}>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Replenishment Orders */}
      {pendingOrders.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            🔄 Active Replenishment Orders ({pendingOrders.length})
          </p>
          <div className="space-y-2">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                <Package className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{order.hotel_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.quantity_requested}× {order.box_type} boxes · Triggered {order.triggered_at ? new Date(order.triggered_at).toLocaleDateString('en-AE') : '—'} · Stock at trigger: {order.stock_at_trigger ?? '—'}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  order.status === 'acknowledged' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {order.status}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {order.status === 'pending' && (
                    <button disabled={updatingOrder === order.id}
                      onClick={() => updateOrderStatus(order.id, 'acknowledged')}
                      className="px-3 h-7 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Acknowledge
                    </button>
                  )}
                  {order.status === 'acknowledged' && (
                    <button disabled={updatingOrder === order.id}
                      onClick={() => updateOrderStatus(order.id, 'in_transit')}
                      className="px-3 h-7 text-[10px] font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Mark In Transit
                    </button>
                  )}
                  {(order.status === 'acknowledged' || order.status === 'in_transit') && (
                    <button disabled={updatingOrder === order.id}
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="px-3 h-7 text-[10px] font-bold bg-green-600 text-white rounded-lg hover:bg-green-700">
                      {updatingOrder === order.id ? '…' : '✓ Mark Delivered'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 h-9 bg-card border border-border rounded-xl text-xs flex-1 min-w-40">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search hotel…"
            className="bg-transparent outline-none flex-1 text-xs text-foreground placeholder:text-muted-foreground" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none">
          <option value="all">All Status</option>
          <option value="ok">OK</option>
          <option value="low">Low Stock</option>
          <option value="replenishment_in_progress">In Progress</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Hotel Inventory Status</p>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card border border-border rounded-2xl">
            <p className="text-sm">No inventory records found.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Hotel', 'Tier', 'Rooms', '10KG Stock', '20KG Stock', 'Reorder At', 'Last Updated'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-3 py-2.5 font-semibold text-foreground whitespace-nowrap">{inv.hotel_name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        T{inv.tier} · {TIER_LABELS[inv.tier] || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{inv.number_of_rooms || '—'}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{inv.current_10kg ?? 0}/{inv.allocated_10kg}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[inv.status_10kg] || STATUS_COLORS.ok}`}>
                            {inv.status_10kg === 'replenishment_in_progress' ? '🔄' : inv.status_10kg}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{inv.current_20kg ?? 0}/{inv.allocated_20kg}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[inv.status_20kg] || STATUS_COLORS.ok}`}>
                            {inv.status_20kg === 'replenishment_in_progress' ? '🔄' : inv.status_20kg}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-amber-600 font-bold">≤ {inv.reorder_trigger_level}</td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {inv.last_updated ? new Date(inv.last_updated).toLocaleDateString('en-AE') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Hotels without inventory - manual init */}
      {hotels.filter(h => !inventories.find(i => i.hotel_id === h.id)).length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Hotels Without Inventory (Need Initialization)</p>
          <div className="space-y-2">
            {hotels.filter(h => !inventories.find(i => i.hotel_id === h.id)).map(h => (
              <div key={h.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.city}, {h.country} · {h.number_of_rooms ? `${h.number_of_rooms} rooms` : 'Room count not set'}</p>
                </div>
                <button onClick={() => handleManualInit(h)}
                  className="px-3 h-7 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Initialize Inventory
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}