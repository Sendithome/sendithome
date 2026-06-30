import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  X, Loader2, CheckCircle2, Circle, Plus, Trash2, MessageSquare,
  StickyNote, Save, Phone, Mail, MessageCircle, User, Clock
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

const STAGE_NOTES = {
  pending_dispatch: 'Hotel application approved. Awaiting admin dispatch to logistics partner for onboarding kit.',
  dispatched_to_logistics: 'Onboarding kit dispatched to assigned courier. Courier should initiate hotel contact within 48 hours.',
  logistics_contacted: 'Courier has made first contact with hotel. Coordinate site visit scheduling with hotel operations team.',
  site_visit_scheduled: 'Site visit confirmed. Ensure hotel concierge desk measurements taken and QR placement confirmed.',
  site_visit_done: 'Site visit complete. Materials should be delivered to concierge desk within agreed timeline.',
  materials_delivered: 'Onboarding materials delivered. Final training and handover to hotel staff pending.',
  fully_onboarded: 'Hotel fully onboarded. Concierge desk operational and ready to receive guest shipments.',
};

const CHANNEL_META = {
  email: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
  phone: { icon: Phone, color: 'text-green-600', bg: 'bg-green-50' },
  whatsapp: { icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  in_person: { icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
  note: { icon: StickyNote, color: 'text-muted-foreground', bg: 'bg-muted/50' },
};

export default function OnboardingDetailDrawer({ onboarding, hotel, onClose }) {
  const [notes, setNotes] = useState(onboarding.logistics_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [newChannel, setNewChannel] = useState('note');
  const [addingMsg, setAddingMsg] = useState(false);
  const [me, setMe] = useState(null);
  const [local, setLocal] = useState(onboarding);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const actor = () => me?.email || 'admin';

  const persist = async (updates) => {
    const updated = await base44.entities.HotelOnboardingStatus.update(onboarding.id, updates);
    setLocal(prev => ({ ...prev, ...updates }));
    return updated;
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await persist({ logistics_notes: notes });
    setSavingNotes(false);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setAddingTask(true);
    const tasks = [...(local.outstanding_tasks || []), { title: newTask.trim(), done: false, created_at: new Date().toISOString(), created_by: actor() }];
    await persist({ outstanding_tasks: tasks });
    setNewTask('');
    setAddingTask(false);
  };

  const handleToggleTask = async (idx) => {
    const tasks = (local.outstanding_tasks || []).map((t, i) =>
      i === idx ? { ...t, done: !t.done, completed_at: !t.done ? new Date().toISOString() : null } : t
    );
    await persist({ outstanding_tasks: tasks });
  };

  const handleDeleteTask = async (idx) => {
    const tasks = (local.outstanding_tasks || []).filter((_, i) => i !== idx);
    await persist({ outstanding_tasks: tasks });
  };

  const handleAddMessage = async () => {
    if (!newMsg.trim()) return;
    setAddingMsg(true);
    const log = [...(local.communication_log || []), { message: newMsg.trim(), by: actor(), at: new Date().toISOString(), channel: newChannel }];
    await persist({ communication_log: log });
    setNewMsg('');
    setAddingMsg(false);
  };

  const tasks = local.outstanding_tasks || [];
  const log = local.communication_log || [];
  const openTasks = tasks.filter(t => !t.done);
  const progressIdx = STAGE_ORDER.indexOf(local.logistics_stage);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
            <h2 className="text-base font-bold text-primary mt-0.5 truncate">{local.hotel_name || hotel?.name || 'Onboarding'}</h2>
            <p className="text-xs text-muted-foreground">{hotel ? `${hotel.city || ''}${hotel.country ? ', ' + hotel.country : ''}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Stage Timeline */}
          <section>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Onboarding Progress</p>
            <div className="space-y-0">
              {STAGE_ORDER.map((stage, idx) => {
                const reached = idx <= progressIdx;
                const isCurrent = stage === local.logistics_stage;
                return (
                  <div key={stage} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        reached ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {reached ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3 opacity-40" />}
                      </div>
                      {idx < STAGE_ORDER.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-4 ${idx < progressIdx ? 'bg-accent' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className={`pb-3 flex-1 ${isCurrent ? '' : ''}`}>
                      <p className={`text-xs font-semibold ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {STAGE_LABELS[stage]}
                        {isCurrent && <span className="ml-2 text-[9px] font-bold text-accent uppercase">Current</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{STAGE_NOTES[stage]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Key Dates */}
          <section className="grid grid-cols-2 gap-2">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Dispatched</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {local.dispatched_at ? new Date(local.dispatched_at).toLocaleDateString('en-GB') : '—'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Target Completion</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {local.target_completion_date ? new Date(local.target_completion_date).toLocaleDateString('en-GB') : '—'}
              </p>
            </div>
          </section>

          {/* Outstanding Tasks */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Outstanding Tasks ({openTasks.length}/{tasks.length})
              </p>
            </div>
            <div className="space-y-1.5">
              {tasks.length === 0 && (
                <p className="text-xs text-muted-foreground italic bg-card border border-border rounded-xl px-3 py-2.5">
                  No tasks yet. Add one below.
                </p>
              )}
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 group">
                  <button onClick={() => handleToggleTask(idx)} className="shrink-0">
                    {task.done
                      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                      : <Circle className="w-4 h-4 text-muted-foreground hover:text-accent" />}
                  </button>
                  <span className={`flex-1 text-xs ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                  {task.completed_at && (
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                      {new Date(task.completed_at).toLocaleDateString('en-GB')}
                    </span>
                  )}
                  <button onClick={() => handleDeleteTask(idx)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a task…"
                className="flex-1 h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent"
              />
              <button onClick={handleAddTask} disabled={addingTask || !newTask.trim()}
                className="h-9 px-3 bg-accent text-accent-foreground rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1">
                {addingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add
              </button>
            </div>
          </section>

          {/* Implementation Notes */}
          <section>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <StickyNote className="w-3 h-3" /> Implementation Notes
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Add implementation notes, blockers, next steps…"
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent resize-none"
            />
            <button onClick={handleSaveNotes} disabled={savingNotes || notes === (local.logistics_notes || '')}
              className="mt-1.5 h-8 px-3 text-xs font-semibold border border-border rounded-lg bg-card hover:border-accent disabled:opacity-40 flex items-center gap-1.5">
              {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save Notes
            </button>
          </section>

          {/* Communication History */}
          <section>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Communication History
            </p>
            <div className="space-y-2">
              {log.length === 0 && (
                <p className="text-xs text-muted-foreground italic bg-card border border-border rounded-xl px-3 py-2.5">
                  No communication logged yet.
                </p>
              )}
              {[...log].reverse().map((entry, idx) => {
                const meta = CHANNEL_META[entry.channel] || CHANNEL_META.note;
                const Icon = meta.icon;
                return (
                  <div key={idx} className="flex gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground whitespace-pre-wrap">{entry.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {entry.by} · {new Date(entry.at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1.5">
                <select value={newChannel} onChange={e => setNewChannel(e.target.value)}
                  className="h-9 px-2 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
                  <option value="note">Note</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="in_person">In Person</option>
                </select>
                <input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMessage()}
                  placeholder="Log a communication…"
                  className="flex-1 h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent"
                />
                <button onClick={handleAddMessage} disabled={addingMsg || !newMsg.trim()}
                  className="h-9 px-3 bg-accent text-accent-foreground rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1">
                  {addingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}