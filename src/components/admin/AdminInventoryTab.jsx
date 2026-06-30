import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Package, RefreshCw, Loader2, AlertTriangle, CheckCircle2,
  TrendingDown, Search, Filter, Download
} from 'lucide-react';
import { getInventoryTier, TIER_LABELS } from '@/utils/inventoryTiers';
import ReplenishmentOrderCard from '@/components/admin/ReplenishmentOrderCard';

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
  const [filterHotel, setFilterHotel] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const hotelById = useMemo(() => Object.fromEntries(hotels.map(h => [h.id, h])), [hotels]);
  const regionOf = (inv) => hotelById[inv.hotel_id]?.country || '';
  const regions = useMemo(
    () => [...new Set(inventories.map(regionOf).filter(Boolean))].sort(),
    [inventories, hotelById]
  );

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
    if (newStatus === 'delivered') {
      const order = repOrders.find(o => o.id === orderId);
      if (!window.confirm(`Confirm delivery of ${order?.quantity_requested || 0}× ${order?.box_type || ''} boxes to "${order?.hotel_name || 'this hotel'}"? This will update inventory stock levels.`)) return;
    }
    setUpdatingOrder(orderId);
    const now = new Date().toISOString();
    const currentOrder = repOrders.find(o => o.id === orderId);
    const update = {
      status: newStatus,
      status_history: [...(currentOrder?.status_history || []), { status: newStatus, at: now, note: '' }],
    };
    if (newStatus === 'delivered') {
      update.delivered_at = now;
      // Update inventory stock
      const order = currentOrder;
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

  const handleSaveOrderDetails = async (orderId, details) => {
    await base44.entities.ReplenishmentOrder.update(orderId, details);
    await loadData();
  };

  const filtered = inventories.filter(inv => {
    const matchSearch = !search || inv.hotel_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || inv.status_10kg === filterStatus || inv.status_20kg === filterStatus;
    const matchHotel = filterHotel === 'all' || inv.hotel_id === filterHotel;
    const matchRegion = filterRegion === 'all' || regionOf(inv) === filterRegion;
    const isLow = ['low', 'critical'].includes(inv.status_10kg) || ['low', 'critical'].includes(inv.status_20kg);
    const matchLow = !lowStockOnly || isLow;
    return matchSearch && matchStatus && matchHotel && matchRegion && matchLow;
  });

  const pendingOrders = repOrders.filter(o => o.status === 'pending' || o.status === 'acknowledged' || o.status === 'in_transit');

  const handleExport = () => {
    const rows = [['Hotel', 'Tier', 'Rooms', '10KG Stock', '10KG Status', '20KG Stock', '20KG Status', 'Reorder At', 'Last Updated']];
    filtered.forEach(inv => rows.push([
      inv.hotel_name || '', `T${inv.tier}`, inv.number_of_rooms || '',
      `${inv.current_10kg ?? 0}/${inv.allocated_10kg}`, inv.status_10kg || '',
      `${inv.current_20kg ?? 0}/${inv.allocated_20kg}`, inv.status_20kg || '',
      inv.reorder_trigger_level ?? '',
      inv.last_updated ? new Date(inv.last_updated).toLocaleDateString('en-GB') : '',
    ]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `box_inventory_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Hotel Box Inventory Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Automated tier-based allocation with real-time replenishment tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 h-8 text-xs font-semibold text-foreground border border-border rounded-xl hover:border-accent bg-card transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => { loadData(); onRefresh?.(); }}
            className="flex items-center gap-1.5 px-3 h-8 text-xs text-muted-foreground border border-border rounded-xl hover:text-foreground bg-card">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
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

      {/* Search & Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 h-9 bg-card border border-border rounded-xl text-xs flex-1 min-w-40">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search hotel…"
            className="bg-transparent outline-none flex-1 text-xs text-foreground placeholder:text-muted-foreground" />
        </div>
        <select value={filterHotel} onChange={e => setFilterHotel(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none">
          <option value="all">All Hotels</option>
          {inventories.map(inv => (
            <option key={inv.id} value={inv.hotel_id}>{inv.hotel_name}</option>
          ))}
        </select>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none">
          <option value="all">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none">
          <option value="all">All Status</option>
          <option value="ok">OK</option>
          <option value="low">Low Stock</option>
          <option value="replenishment_in_progress">In Progress</option>
          <option value="critical">Critical</option>
        </select>
        <button onClick={() => setLowStockOnly(v => !v)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border transition-colors ${
            lowStockOnly ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-card text-muted-foreground border-border hover:text-foreground'
          }`}>
          <AlertTriangle className="w-3.5 h-3.5" /> Low-Stock Alerts
        </button>
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

      {/* Active Replenishment Orders */}
      {pendingOrders.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            🔄 Active Replenishment Orders ({pendingOrders.length})
          </p>
          <div className="space-y-2">
            {pendingOrders.map(order => (
              <ReplenishmentOrderCard
                key={order.id}
                order={order}
                updating={updatingOrder === order.id}
                onStatusUpdate={updateOrderStatus}
                onSaveDetails={handleSaveOrderDetails}
              />
            ))}
          </div>
        </div>
      )}

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