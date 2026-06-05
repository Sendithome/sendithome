import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Truck, CheckCircle2, Clock, AlertTriangle, LogOut, RefreshCw,
  Loader2, MapPin, ChevronRight, Phone, Mail, Bell, Package
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const STAGE_LABELS = {
  dispatched_to_logistics: 'New Assignment',
  logistics_contacted: 'Hotel Contacted',
  site_visit_scheduled: 'Site Visit Scheduled',
  site_visit_done: 'Site Visit Done',
  materials_delivered: 'Materials Delivered',
  fully_onboarded: 'Fully Onboarded',
};

const STAGE_NEXT = {
  dispatched_to_logistics: { next: 'logistics_contacted', label: 'Mark: Hotel Contacted' },
  logistics_contacted: { next: 'site_visit_scheduled', label: 'Mark: Site Visit Scheduled' },
  site_visit_scheduled: { next: 'site_visit_done', label: 'Mark: Site Visit Done' },
  site_visit_done: { next: 'materials_delivered', label: 'Mark: Materials Delivered' },
  materials_delivered: { next: 'fully_onboarded', label: 'Mark: Fully Onboarded ✓' },
};

const STAGE_ORDER = [
  'dispatched_to_logistics',
  'logistics_contacted',
  'site_visit_scheduled',
  'site_visit_done',
  'materials_delivered',
  'fully_onboarded',
];

function getStageProgress(stage) {
  const idx = STAGE_ORDER.indexOf(stage);
  return Math.round(((idx + 1) / STAGE_ORDER.length) * 100);
}

function getWorkingDaysLeft(targetDate) {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (target.getTime() === today.getTime()) return 0;
  const sign = target > today ? 1 : -1;
  let count = 0;
  let cur = new Date(today);
  while (cur.toDateString() !== target.toDateString()) {
    cur.setDate(cur.getDate() + sign);
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count += sign;
  }
  return count;
}

function StatCard({ label, value, color, bg, icon: Icon }) {
  return (
    <div className={`rounded-2xl border p-4 ${bg}`}>
      <div className={`w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function CourierDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onboardings, setOnboardings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [repOrders, setRepOrders] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [notes, setNotes] = useState({});

  const courierCompany = sessionStorage.getItem('courier_company') || 'Courier Partner';
  const courierEmail = sessionStorage.getItem('courier_email') || '';

  useEffect(() => {
    const id = sessionStorage.getItem('courier_id');
    if (!id) { navigate('/courier-login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allOnboardings, allHotels, orders] = await Promise.all([
      base44.entities.HotelOnboardingStatus.list('-stage_updated_at', 300),
      base44.entities.Hotel.list('-created_date', 300),
      base44.entities.ReplenishmentOrder.filter({ status: 'pending' }, '-created_date', 100),
    ]);
    setOnboardings(allOnboardings.filter(o => o.logistics_stage && o.logistics_stage !== 'pending_dispatch'));
    setHotels(allHotels);
    setRepOrders(orders);
    setLoading(false);
  };

  const handleReplenishmentAction = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    const updates = { status: newStatus };
    if (newStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
      const order = repOrders.find(o => o.id === orderId);
      if (order) {
        const invs = await base44.entities.HotelInventory.filter({ hotel_id: order.hotel_id });
        if (invs.length > 0) {
          const inv = invs[0];
          const now = new Date().toISOString();
          const invUpdates = { last_updated: now };
          if (order.box_type === '10kg') {
            const newVal = (inv.current_10kg || 0) + (order.quantity_requested || 0);
            invUpdates.current_10kg = newVal;
            invUpdates.status_10kg = newVal <= inv.reorder_trigger_level ? 'low' : 'ok';
            invUpdates.last_replenishment_10kg_at = now;
          } else {
            const newVal = (inv.current_20kg || 0) + (order.quantity_requested || 0);
            invUpdates.current_20kg = newVal;
            invUpdates.status_20kg = newVal <= inv.reorder_trigger_level ? 'low' : 'ok';
            invUpdates.last_replenishment_20kg_at = now;
          }
          await base44.entities.HotelInventory.update(inv.id, invUpdates);
        }
      }
    }
    await base44.entities.ReplenishmentOrder.update(orderId, updates);
    await loadData();
    setUpdatingOrder(null);
  };

  const updateStage = async (ob, newStage) => {
    setUpdating(ob.id);
    await base44.entities.HotelOnboardingStatus.update(ob.id, {
      logistics_stage: newStage,
      stage_updated_at: new Date().toISOString(),
      stage_updated_by: courierEmail,
      ...(notes[ob.id] ? { logistics_notes: notes[ob.id] } : {}),
    });
    setNotes(prev => ({ ...prev, [ob.id]: '' }));
    await loadData();
    setUpdating(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('courier_id');
    sessionStorage.removeItem('courier_company');
    sessionStorage.removeItem('courier_email');
    navigate('/courier-login');
  };

  const active = onboardings.filter(o => o.logistics_stage !== 'fully_onboarded');
  const completed = onboardings.filter(o => o.logistics_stage === 'fully_onboarded');
  const newTasks = active.filter(o => o.logistics_stage === 'dispatched_to_logistics');
  const overdue = active.filter(o => {
    const d = getWorkingDaysLeft(o.target_completion_date);
    return d !== null && d < 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
            <p className="text-xs font-bold text-muted-foreground">{courierCompany} — Logistics Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {newTasks.length > 0 && (
            <div className="relative">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {newTasks.length}
              </span>
            </div>
          )}
          <button onClick={loadData} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-accent transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* New task / overdue alerts */}
        {newTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-300 rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <Bell className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-800">
                🔔 {newTasks.length} new hotel{newTasks.length !== 1 ? 's' : ''} assigned for physical onboarding
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Please contact each hotel and complete physical onboarding within <strong>5 working days</strong> of assignment
              </p>
            </div>
          </motion.div>
        )}

        {overdue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/40 rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm font-bold text-destructive">
              ⚠️ {overdue.length} hotel{overdue.length !== 1 ? 's are' : ' is'} overdue — immediate action required
            </p>
          </motion.div>
        )}

        {/* Replenishment Orders Alert */}
        {repOrders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm font-bold text-amber-800">
                📦 {repOrders.length} Box Replenishment Request{repOrders.length > 1 ? 's' : ''} Pending
              </p>
            </div>
            <div className="space-y-2">
              {repOrders.map(order => (
                <div key={order.id} className="bg-white/70 rounded-xl px-3 py-2.5 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{order.hotel_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.quantity_requested}× {order.box_type} boxes · Stock at trigger: {order.stock_at_trigger ?? '—'}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button disabled={updatingOrder === order.id}
                      onClick={() => handleReplenishmentAction(order.id, 'in_transit')}
                      className="px-3 h-7 text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      In Transit
                    </button>
                    <button disabled={updatingOrder === order.id}
                      onClick={() => handleReplenishmentAction(order.id, 'delivered')}
                      className="px-3 h-7 text-[10px] font-bold bg-green-600 text-white rounded-lg hover:bg-green-700">
                      {updatingOrder === order.id ? '…' : '✓ Delivered'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="New Assignments" value={newTasks.length} color="text-blue-600" bg="bg-blue-50 border-blue-200" icon={Bell} />
          <StatCard label="In Progress" value={active.length - newTasks.length} color="text-amber-600" bg="bg-amber-50 border-amber-200" icon={Clock} />
          <StatCard label="Overdue" value={overdue.length} color={overdue.length > 0 ? 'text-destructive' : 'text-green-600'} bg={overdue.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} icon={AlertTriangle} />
          <StatCard label="Completed" value={completed.length} color="text-green-600" bg="bg-green-50 border-green-200" icon={CheckCircle2} />
        </div>

        {/* Active Tasks */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">
            Active Onboarding Tasks
            <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">{active.length}</span>
          </h2>

          {active.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground bg-card border border-border rounded-2xl">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400/40" />
              <p className="font-semibold">No active tasks</p>
              <p className="text-xs mt-1">New hotel assignments will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-4">
              {active.map(ob => {
                const hotel = hotels.find(h => h.id === ob.hotel_id);
                const nextStage = STAGE_NEXT[ob.logistics_stage];
                const daysLeft = getWorkingDaysLeft(ob.target_completion_date);
                const isNew = ob.logistics_stage === 'dispatched_to_logistics';
                const isOverdue = daysLeft !== null && daysLeft < 0;
                const progress = getStageProgress(ob.logistics_stage);

                return (
                  <motion.div
                    key={ob.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-card border rounded-2xl p-5 shadow-sm ${
                      isNew ? 'border-blue-300 shadow-blue-100' :
                      isOverdue ? 'border-destructive/40' :
                      'border-border'
                    }`}
                  >
                    {/* Hotel Header */}
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-foreground">
                            {ob.hotel_name || hotel?.name || 'Unknown Hotel'}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isNew ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {STAGE_LABELS[ob.logistics_stage] || ob.logistics_stage}
                          </span>
                          {isNew && (
                            <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>

                        {hotel && (
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {[hotel.address, hotel.area, hotel.city, hotel.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Deadline */}
                      <div className="shrink-0 text-right">
                        {ob.target_completion_date && (
                          <div className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                            isOverdue ? 'bg-destructive/10 text-destructive border border-destructive/30' :
                            daysLeft === 0 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            daysLeft !== null && daysLeft <= 1 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {isOverdue
                              ? `⚠️ ${Math.abs(daysLeft)} working day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`
                              : daysLeft === 0 ? '🔴 Due today!'
                              : `⏱ ${daysLeft} working day${daysLeft !== 1 ? 's' : ''} left`}
                          </div>
                        )}
                        {ob.dispatched_at && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Assigned: {new Date(ob.dispatched_at).toLocaleDateString('en-AE')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Hotel contacts */}
                    {hotel && (hotel.gm_name || hotel.gm_phone || hotel.hoc_name) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 p-3 bg-muted/30 rounded-xl">
                        {hotel.gm_name && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">GM: </span>
                            <span className="font-semibold text-foreground">{hotel.gm_name}</span>
                            {hotel.gm_phone && <span className="text-muted-foreground ml-1">· {hotel.gm_phone}</span>}
                          </div>
                        )}
                        {hotel.hoc_name && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">HOC: </span>
                            <span className="font-semibold text-foreground">{hotel.hoc_name}</span>
                            {hotel.hoc_phone && <span className="text-muted-foreground ml-1">· {hotel.hoc_phone}</span>}
                          </div>
                        )}
                        {hotel.official_email && (
                          <div className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Mail className="w-3 h-3" /> {hotel.official_email}
                          </div>
                        )}
                        {hotel.official_phone && (
                          <div className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" /> {hotel.official_phone}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                        <span>Onboarding Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress === 100 ? 'bg-green-500' :
                            isOverdue ? 'bg-destructive' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {/* Stage steps */}
                      <div className="flex gap-1 mt-2 overflow-x-auto">
                        {STAGE_ORDER.map((s, i) => {
                          const currentIdx = STAGE_ORDER.indexOf(ob.logistics_stage);
                          const isDone = i <= currentIdx;
                          return (
                            <div
                              key={s}
                              className={`text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap font-semibold shrink-0 ${
                                isDone
                                  ? i === currentIdx ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {STAGE_LABELS[s]}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Add update notes (optional)…"
                        value={notes[ob.id] !== undefined ? notes[ob.id] : (ob.logistics_notes || '')}
                        onChange={e => setNotes(prev => ({ ...prev, [ob.id]: e.target.value }))}
                        className="w-full h-9 px-3 bg-muted/40 border border-border rounded-xl text-xs focus:outline-none focus:border-accent"
                      />
                    </div>

                    {/* Action */}
                    {nextStage && (
                      <button
                        onClick={() => updateStage(ob, nextStage.next)}
                        disabled={updating === ob.id}
                        className="flex items-center gap-2 px-4 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        {updating === ob.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <ChevronRight className="w-3.5 h-3.5" />}
                        {updating === ob.id ? 'Updating…' : nextStage.label}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">
              Completed Onboardings
              <span className="ml-2 text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5">{completed.length}</span>
            </h2>
            <div className="space-y-2">
              {completed.map(ob => {
                const hotel = hotels.find(h => h.id === ob.hotel_id);
                return (
                  <div key={ob.id} className="bg-card border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{ob.hotel_name || hotel?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hotel?.city}{hotel?.country ? `, ${hotel.country}` : ''}
                        {ob.stage_updated_at ? ` · Completed ${new Date(ob.stage_updated_at).toLocaleDateString('en-AE')}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5 shrink-0">
                      ✓ Fully Onboarded
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}