import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Truck, Plus, CheckCircle2, Loader2, Eye, EyeOff,
  Clock, AlertTriangle, MapPin, RefreshCw
} from 'lucide-react';

const STAGE_LABELS = {
  pending_dispatch: 'Pending Dispatch',
  dispatched_to_logistics: 'Assigned — Awaiting Contact',
  logistics_contacted: 'Hotel Contacted',
  site_visit_scheduled: 'Site Visit Scheduled',
  site_visit_done: 'Site Visit Done',
  materials_delivered: 'Materials Delivered',
  fully_onboarded: 'Fully Onboarded',
};

const STAGE_ORDER = [
  'pending_dispatch', 'dispatched_to_logistics', 'logistics_contacted',
  'site_visit_scheduled', 'site_visit_done', 'materials_delivered', 'fully_onboarded',
];

function getWorkingDaysLeft(targetDate) {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
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

export default function AdminCourierTab({ onboardings = [], hotels = [], onRefresh }) {
  const [couriers, setCouriers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPw, setShowPw] = useState({});
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCouriers(); }, []);

  const loadCouriers = async () => {
    const data = await base44.entities.CourierPartner.list('-created_date', 100);
    setCouriers(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.CourierPartner.create({ ...form, status: 'active' });
    setForm({ company_name: '', contact_name: '', email: '', password: '', phone: '' });
    setShowForm(false);
    setSaving(false);
    await loadCouriers();
  };

  const toggleStatus = async (c) => {
    await base44.entities.CourierPartner.update(c.id, { status: c.status === 'active' ? 'inactive' : 'active' });
    await loadCouriers();
  };

  const active = onboardings.filter(o => o.logistics_stage && o.logistics_stage !== 'pending_dispatch' && o.logistics_stage !== 'fully_onboarded');
  const completed = onboardings.filter(o => o.logistics_stage === 'fully_onboarded');
  const overdue = active.filter(o => {
    const d = getWorkingDaysLeft(o.target_completion_date);
    return d !== null && d < 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Courier Partner Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage courier credentials and track hotel onboarding progress</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Courier Partner
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Couriers', value: couriers.filter(c => c.status === 'active').length, bg: 'bg-blue-50 border-blue-200', color: 'text-blue-700' },
          { label: 'Hotels In Progress', value: active.length, bg: 'bg-amber-50 border-amber-200', color: 'text-amber-700' },
          { label: 'Overdue', value: overdue.length, bg: overdue.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200', color: overdue.length > 0 ? 'text-destructive' : 'text-green-700' },
          { label: 'Fully Onboarded', value: completed.length, bg: 'bg-green-50 border-green-200', color: 'text-green-700' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-4 ${kpi.bg}`}>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Add courier form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-bold text-foreground">New Courier Partner Credentials</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Company Name *</label>
              <input required value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                placeholder="DHL Express UAE" className="mt-1 w-full h-9 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Contact Name</label>
              <input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))}
                placeholder="John Smith" className="mt-1 w-full h-9 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Login Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="courier@dhl.com" className="mt-1 w-full h-9 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Login Password *</label>
              <input required type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Secure password" className="mt-1 w-full h-9 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+971 50 000 0000" className="mt-1 w-full h-9 px-3 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 px-4 h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {saving ? 'Creating…' : 'Create Partner'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 h-8 text-xs text-muted-foreground hover:text-foreground rounded-xl border border-border bg-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Courier Credentials */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Courier Accounts</p>
        {couriers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card border border-border rounded-2xl">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No courier partners yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {couriers.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.company_name}</p>
                  <p className="text-xs text-muted-foreground">{c.contact_name && `${c.contact_name} · `}{c.email}</p>
                </div>
                {/* Password reveal */}
                <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-lg px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">Password:</span>
                  <span className="text-xs font-mono font-semibold">
                    {showPw[c.id] ? c.password : '••••••••'}
                  </span>
                  <button onClick={() => setShowPw(p => ({ ...p, [c.id]: !p[c.id] }))} className="text-muted-foreground hover:text-foreground">
                    {showPw[c.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  c.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {c.status}
                </span>
                <button onClick={() => toggleStatus(c)}
                  className="text-[10px] text-muted-foreground hover:text-foreground border border-border rounded-lg px-2 py-1">
                  Toggle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Onboarding Status Table */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Hotel Onboarding Status (Logistics View)</p>

        {active.length + completed.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card border border-border rounded-2xl">
            <p className="text-sm">No hotels dispatched to logistics yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Hotel', 'Location', 'Stage', 'Assigned', 'Deadline', 'Days Left', 'Updated By'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...active, ...completed].map(ob => {
                    const hotel = hotels.find(h => h.id === ob.hotel_id);
                    const daysLeft = getWorkingDaysLeft(ob.target_completion_date);
                    const isOverdue = daysLeft !== null && daysLeft < 0;
                    const progressIdx = STAGE_ORDER.indexOf(ob.logistics_stage);

                    return (
                      <tr key={ob.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-3 py-2.5 font-semibold text-foreground whitespace-nowrap">
                          {ob.hotel_name || hotel?.name || '—'}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {hotel ? `${hotel.city || ''}${hotel.country ? `, ${hotel.country}` : ''}` : '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="space-y-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ob.logistics_stage === 'fully_onboarded' ? 'bg-green-50 text-green-700 border-green-200' :
                              isOverdue ? 'bg-red-50 text-destructive border-destructive/30' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {STAGE_LABELS[ob.logistics_stage] || ob.logistics_stage}
                            </span>
                            {/* Mini progress bar */}
                            <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${ob.logistics_stage === 'fully_onboarded' ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.round(((progressIdx + 1) / STAGE_ORDER.length) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {ob.dispatched_at ? new Date(ob.dispatched_at).toLocaleDateString('en-AE') : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {ob.target_completion_date ? new Date(ob.target_completion_date).toLocaleDateString('en-AE') : '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          {ob.logistics_stage === 'fully_onboarded' ? (
                            <span className="text-green-700 font-bold">✓ Done</span>
                          ) : daysLeft !== null ? (
                            <span className={`font-bold ${isOverdue ? 'text-destructive' : daysLeft <= 1 ? 'text-orange-600' : 'text-foreground'}`}>
                              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                          {ob.stage_updated_by || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}