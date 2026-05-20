import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, DollarSign, Settings, LogOut, AlertTriangle, RefreshCw, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import VerificationCard from '@/components/retailer/VerificationCard';
import ApprovedHistoryTab from '@/components/retailer/ApprovedHistoryTab';
import AnalyticsTab from '@/components/retailer/AnalyticsTab';
import ShipmentsTab from '@/components/retailer/ShipmentsTab';

const TABS = [
  { id: 'pending', label: 'Pending Approvals' },
  { id: 'shipments', label: 'Shipments' },
  { id: 'history', label: 'Approved History' },
  { id: 'analytics', label: 'Analytics & Reports' },
];

export default function RetailerDashboard() {
  const navigate = useNavigate();
  const [retailer, setRetailer] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    const id = sessionStorage.getItem('retailer_id');
    if (!id) { navigate('/retailer-portal'); return; }
    loadData(id);
  }, []);

  const loadData = async (id) => {
    setLoading(true);
    const retailerId = id || sessionStorage.getItem('retailer_id');
    const [retailers, allVerifications] = await Promise.all([
      base44.entities.Retailer.filter({ id: retailerId }),
      base44.entities.RetailerVerification.filter({ retailer_id: retailerId }, '-created_date', 200)
    ]);
    if (retailers.length > 0) setRetailer(retailers[0]);
    setVerifications(allVerifications);
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('retailer_id');
    sessionStorage.removeItem('retailer_name');
    navigate('/retailer-portal');
  };

  const pending = verifications.filter(v => v.status === 'pending' || v.status === 'overdue');
  const approved = verifications.filter(v => v.status === 'approved');

  const now = new Date();
  const overdueCount = pending.filter(v => v.deadline_at && new Date(v.deadline_at) < now).length;

  const thisMonthStr = new Date().toISOString().slice(0, 7);
  const monthCommission = approved
    .filter(v => v.approved_at?.startsWith(thisMonthStr))
    .reduce((s, v) => s + (v.commission_amount || 0), 0);

  const onApproved = (id) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'approved', approved_at: new Date().toISOString() } : v));
  };

  const onQueried = (id) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'queried' } : v));
  };

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
        <div>
          <p className="text-[10px] font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
          <p className="text-sm font-bold text-primary mt-0.5">
            {retailer?.store_name} — Retailer Partner Portal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadData()} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/retailer-settings" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
          </Link>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-accent transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Urgent Alert Banner */}
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl px-5 py-4 flex items-center gap-3 border ${overdueCount > 0 ? 'bg-destructive/10 border-destructive/40 animate-pulse' : 'bg-yellow-50 border-yellow-200'}`}
          >
            <AlertTriangle className={`w-5 h-5 shrink-0 ${overdueCount > 0 ? 'text-destructive' : 'text-yellow-600'}`} />
            <p className={`text-sm font-bold ${overdueCount > 0 ? 'text-destructive' : 'text-yellow-700'}`}>
              ⚠️ You have {pending.length} shipment verification{pending.length !== 1 ? 's' : ''} awaiting your approval
              {overdueCount > 0 ? ` — ${overdueCount} OVERDUE` : ' — respond within 24 hours'}
            </p>
          </motion.div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Approvals"
            value={pending.length}
            colorCls="text-yellow-600"
            bgCls="bg-yellow-50 border-yellow-200"
            pulse={overdueCount > 0}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Approved This Month"
            value={approved.filter(v => v.approved_at?.startsWith(thisMonthStr)).length}
            colorCls="text-green-600"
            bgCls="bg-green-50 border-green-200"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Govt. Commission (10%*)"
            value={`$${(approved.filter(v => v.approved_at?.startsWith(thisMonthStr)).reduce((s, v) => s + (v.total_value || 0), 0) * 0.10).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            colorCls="text-amber-600"
            bgCls="bg-amber-50 border-amber-200"
            footnote="on shipped items only"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              {t.id === 'pending' && pending.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${overdueCount > 0 ? 'bg-destructive text-white' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {pending.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400/40" />
                  <p className="font-semibold">All clear — no pending verifications</p>
                  <p className="text-xs mt-1">New shipments will appear here automatically</p>
                </div>
              ) : (
                pending.map(v => (
                  <VerificationCard
                    key={v.id}
                    verification={v}
                    retailer={retailer}
                    onApproved={onApproved}
                    onQueried={onQueried}
                  />
                ))
              )}
            </motion.div>
          )}

          {tab === 'shipments' && (
            <motion.div key="shipments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ShipmentsTab verifications={verifications} retailer={retailer} />
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ApprovedHistoryTab verifications={approved} />
            </motion.div>
          )}

          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AnalyticsTab verifications={verifications} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, colorCls, bgCls, pulse, footnote }) {
  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 shadow-sm ${bgCls} ${pulse ? 'animate-pulse' : ''}`}>
      <div className={`w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center ${colorCls}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold mt-0.5 ${colorCls}`}>{value}</p>
        {footnote && <p className="text-[10px] text-muted-foreground/70 italic mt-0.5">{footnote}</p>}
      </div>
    </div>
  );
}