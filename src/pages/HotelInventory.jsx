import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, RefreshCw, Loader2, AlertTriangle, CheckCircle2,
  TrendingDown, BarChart3, History, ArrowLeft
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getInventoryTier, getStockStatusColor } from '@/utils/inventoryTiers';
import InventoryStatusCard from '@/components/inventory/InventoryStatusCard';
import ReplenishmentHistory from '@/components/inventory/ReplenishmentHistory';
import UsageChart from '@/components/inventory/UsageChart';

const TABS = [
  { id: 'overview', label: 'Current Stock', icon: Package },
  { id: 'history', label: 'Replenishment History', icon: History },
  { id: 'usage', label: 'Usage Analytics', icon: BarChart3 },
];

export default function HotelInventory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [orders, setOrders] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [adjusting, setAdjusting] = useState(false);
  const [adjust10, setAdjust10] = useState('');
  const [adjust20, setAdjust20] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const me = await base44.auth.me();

    const hotels = await base44.entities.Hotel.filter({ contact_email: me.email });
    if (hotels.length === 0) { setLoading(false); return; }
    const h = hotels[0];
    setHotel(h);

    const [invs, repOrders, logs] = await Promise.all([
      base44.entities.HotelInventory.filter({ hotel_id: h.id }),
      base44.entities.ReplenishmentOrder.filter({ hotel_id: h.id }, '-created_date', 50),
      base44.entities.InventoryUsageLog.filter({ hotel_id: h.id }, '-created_date', 100),
    ]);

    setInventory(invs[0] || null);
    setOrders(repOrders);
    setUsageLogs(logs);
    setLoading(false);
  };

  const handleAdjustSave = async () => {
    if (!inventory) return;
    setSaving(true);
    const now = new Date().toISOString();
    const updates = { last_updated: now };
    const logEntries = [];

    if (adjust10 !== '' && !isNaN(parseInt(adjust10))) {
      const prev = inventory.current_10kg || 0;
      const newVal = Math.max(0, prev + parseInt(adjust10));
      const tier = getInventoryTier(inventory.number_of_rooms);
      updates.current_10kg = newVal;
      // reset status if replenished
      if (parseInt(adjust10) > 0 && inventory.status_10kg === 'replenishment_in_progress') {
        updates.status_10kg = newVal <= tier.reorderAt ? 'low' : 'ok';
        updates.last_replenishment_10kg_at = now;
      } else {
        updates.status_10kg = newVal <= tier.reorderAt ? 'low' : 'ok';
      }
      logEntries.push({
        hotel_id: inventory.hotel_id,
        hotel_name: inventory.hotel_name,
        box_type: '10kg',
        quantity_used: parseInt(adjust10) < 0 ? Math.abs(parseInt(adjust10)) : 0,
        quantity_remaining: newVal,
        date: now.slice(0, 10),
        recorded_by: 'hotel',
        notes: parseInt(adjust10) > 0 ? `+${adjust10} received` : `${adjust10} used`,
      });
    }

    if (adjust20 !== '' && !isNaN(parseInt(adjust20))) {
      const prev = inventory.current_20kg || 0;
      const newVal = Math.max(0, prev + parseInt(adjust20));
      const tier = getInventoryTier(inventory.number_of_rooms);
      updates.current_20kg = newVal;
      if (parseInt(adjust20) > 0 && inventory.status_20kg === 'replenishment_in_progress') {
        updates.status_20kg = newVal <= tier.reorderAt ? 'low' : 'ok';
        updates.last_replenishment_20kg_at = now;
      } else {
        updates.status_20kg = newVal <= tier.reorderAt ? 'low' : 'ok';
      }
      logEntries.push({
        hotel_id: inventory.hotel_id,
        hotel_name: inventory.hotel_name,
        box_type: '20kg',
        quantity_used: parseInt(adjust20) < 0 ? Math.abs(parseInt(adjust20)) : 0,
        quantity_remaining: newVal,
        date: now.slice(0, 10),
        recorded_by: 'hotel',
        notes: parseInt(adjust20) > 0 ? `+${adjust20} received` : `${adjust20} used`,
      });
    }

    await base44.entities.HotelInventory.update(inventory.id, updates);
    await Promise.all(logEntries.map(e => base44.entities.InventoryUsageLog.create(e)));

    setAdjust10('');
    setAdjust20('');
    setAdjusting(false);
    setSaving(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const tier = inventory ? getInventoryTier(inventory.number_of_rooms) : null;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_transit');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/hotel-dashboard')} className="p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-[10px] font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
            <p className="text-xs font-bold text-muted-foreground">{hotel?.name || 'Hotel'} — Inventory Management</p>
          </div>
        </div>
        <button onClick={loadData} className="p-2 text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* No inventory yet */}
        {!inventory && (
          <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-bold">Inventory Not Initialized</p>
            <p className="text-sm mt-1">Inventory is automatically set up when your hotel completes physical onboarding (Fully Onboarded status).</p>
            <p className="text-xs mt-2 text-muted-foreground/60">Make sure your hotel profile includes the Number of Rooms for correct tier allocation.</p>
          </div>
        )}

        {inventory && (
          <>
            {/* Alert for pending replenishment */}
            {pendingOrders.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-300 rounded-2xl px-5 py-4 flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-800">
                    🔄 {pendingOrders.length} Replenishment Order{pendingOrders.length > 1 ? 's' : ''} In Progress
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">Your logistics partner has been notified and will deliver boxes shortly.</p>
                </div>
              </motion.div>
            )}

            {/* Tier info banner */}
            <div className="bg-card border border-border rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Hotel Inventory Tier</p>
                  <p className="text-lg font-black text-foreground mt-0.5">
                    Tier {inventory.tier} — {hotel?.number_of_rooms || inventory.number_of_rooms || '?'} Rooms
                  </p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Standard Allocation</p>
                    <p className="text-sm font-bold text-foreground">{inventory.allocated_10kg} + {inventory.allocated_20kg} boxes</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reorder Trigger</p>
                    <p className="text-sm font-bold text-amber-600">≤ {inventory.reorder_trigger_level} boxes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {TABS.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                      tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />{t.label}
                  </button>
                );
              })}
            </div>

            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InventoryStatusCard
                    boxType="10kg"
                    current={inventory.current_10kg ?? 0}
                    allocated={inventory.allocated_10kg}
                    reorderAt={inventory.reorder_trigger_level}
                    status={inventory.status_10kg}
                    lastReplenishedAt={inventory.last_replenishment_10kg_at}
                  />
                  <InventoryStatusCard
                    boxType="20kg"
                    current={inventory.current_20kg ?? 0}
                    allocated={inventory.allocated_20kg}
                    reorderAt={inventory.reorder_trigger_level}
                    status={inventory.status_20kg}
                    lastReplenishedAt={inventory.last_replenishment_20kg_at}
                  />
                </div>

                {/* Manual stock adjustment */}
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">Update Stock Count</p>
                    <button onClick={() => setAdjusting(!adjusting)}
                      className="text-xs text-accent hover:underline font-semibold">
                      {adjusting ? 'Cancel' : 'Adjust Stock'}
                    </button>
                  </div>
                  {!adjusting && (
                    <p className="text-xs text-muted-foreground">
                      Enter positive numbers to record received boxes (+5), negative to record used boxes (-3).
                      Replenishment status updates automatically.
                    </p>
                  )}
                  {adjusting && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">10 KG Boxes (e.g. -3 or +5)</label>
                          <input type="number" value={adjust10} onChange={e => setAdjust10(e.target.value)}
                            placeholder="e.g. -2" className="mt-1 w-full h-9 px-3 bg-muted/40 border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">20 KG Boxes (e.g. -3 or +5)</label>
                          <input type="number" value={adjust20} onChange={e => setAdjust20(e.target.value)}
                            placeholder="e.g. -1" className="mt-1 w-full h-9 px-3 bg-muted/40 border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
                        </div>
                      </div>
                      <button onClick={handleAdjustSave} disabled={saving || (adjust10 === '' && adjust20 === '')}
                        className="flex items-center gap-1.5 px-4 h-8 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-xs font-bold rounded-xl">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className="text-sm font-bold text-foreground">Replenishment Orders</p>
                <ReplenishmentHistory orders={orders} />
              </motion.div>
            )}

            {tab === 'usage' && (
              <motion.div key="usage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <p className="text-sm font-bold text-foreground">30-Day Usage Trend</p>
                <div className="bg-card border border-border rounded-2xl p-4">
                  <UsageChart logs={usageLogs} allocated10={inventory.allocated_10kg} allocated20={inventory.allocated_20kg} />
                </div>
                {/* Usage log table */}
                {usageLogs.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            {['Date', 'Box Type', 'Change', 'Remaining', 'Recorded By', 'Notes'].map(h => (
                              <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {usageLogs.slice(0, 50).map(log => (
                            <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20">
                              <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{log.date || '—'}</td>
                              <td className="px-3 py-2.5 font-semibold">{log.box_type}</td>
                              <td className={`px-3 py-2.5 font-bold ${log.quantity_used > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {log.quantity_used > 0 ? `-${log.quantity_used}` : log.notes?.startsWith('+') ? log.notes.split(' ')[0] : '—'}
                              </td>
                              <td className="px-3 py-2.5">{log.quantity_remaining ?? '—'}</td>
                              <td className="px-3 py-2.5 text-muted-foreground capitalize">{log.recorded_by}</td>
                              <td className="px-3 py-2.5 text-muted-foreground italic">{log.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}