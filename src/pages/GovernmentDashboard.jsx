import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, RefreshCw, Loader2, BarChart3, ClipboardList,
  CheckCircle2, Eye, Package, FileSearch, DollarSign, Globe, Users,
  Lock
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getCountryById } from '@/lib/pilotCountryData';
const UAE = getCountryById('uae');
import ReviewModal from '@/components/government/ReviewModal';
import GovAnalyticsTab from '@/components/government/GovAnalyticsTab.jsx';
import AuditTrailTab from '@/components/government/AuditTrailTab';
import ConsolidatedShipmentsTab from '@/components/government/ConsolidatedShipmentsTab';
import DeclarationBreakdownTab from '@/components/government/DeclarationBreakdownTab';
import GovCommissionTab from '@/components/government/GovCommissionTab';
import PassportCopiesTab from '@/components/government/PassportCopiesTab';
import CustomsDeclarationsTab from '@/components/government/CustomsDeclarationsTab';
import ClearanceQueueTab from '@/components/government/ClearanceQueueTab';

const TABS = [
  { id: 'clearance', label: 'Clearance Queue', icon: Shield },
  { id: 'consolidated', label: 'Consolidated Shipments', icon: Package },
  { id: 'declarations', label: 'Declaration Breakdown', icon: FileSearch },
  { id: 'analytics', label: 'Economic Impact', icon: BarChart3 },
  { id: 'commission', label: 'Commission Revenue', icon: DollarSign },
  { id: 'passports', label: 'Passport Copies', icon: Users },
  { id: 'customs', label: 'Customs Declarations', icon: FileSearch },
  { id: 'audit', label: 'Audit Trail', icon: ClipboardList },
];

const STATUS_CFG = {
  pending: { label: 'Awaiting Clearance', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  approved: { label: 'Cleared', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  queried: { label: 'On Hold', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  overdue: { label: 'Overdue', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
  cancelled: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
};

const STAT_META = [
  { icon: BarChart3, iconColor: 'text-accent', iconBg: 'bg-accent/10' },
  { icon: Package, iconColor: 'text-accent', iconBg: 'bg-accent/10' },
  { icon: Users, iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
  { icon: Package, iconColor: 'text-teal-600', iconBg: 'bg-teal-50' },
  { icon: DollarSign, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { icon: Globe, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
];

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('clearance');
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [reviewingShipment, setReviewingShipment] = useState(null);

  const deptName = sessionStorage.getItem('gov_dept_name') || 'Government Department';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allVerifications, allOrders, allHotels, allRetailers] = await Promise.all([
      base44.entities.RetailerVerification.list('-created_date', 500),
      base44.entities.Order.filter({ multi_retailer_status: 'pending_retailer_approvals' }, '-created_date', 200)
        .then(r => r).catch(() => []),
      base44.entities.Hotel.list('-created_date', 200),
      base44.entities.Retailer.list('-created_date', 200),
    ]);
    setVerifications(allVerifications);
    // Also fetch consolidated orders
    const consolidatedOrders = await base44.entities.Order.filter({ multi_retailer_status: 'consolidated' }, '-consolidated_at', 200).catch(() => []);
    setOrders([...allOrders, ...consolidatedOrders]);
    setHotels(allHotels);
    setRetailers(allRetailers);
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gov_dept_code');
    sessionStorage.removeItem('gov_dept_name');
    sessionStorage.removeItem('gov_email');
    navigate('/government-login');
  };

  const handleAction = (id, action, data) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  };

  const activeShipments = verifications.filter(v => v.status === 'pending' || v.status === 'queried').length;
  const totalExportValue = verifications.reduce((s, v) => s + (v.total_value || 0), 0);
  const uniqueDestinations = new Set(verifications.map(v => v.destination_country).filter(Boolean)).size;
  const approvedHotels = hotels.filter(h => h.active).length;
  const approvedRetailers = retailers.filter(r => r.status === 'approved').length;

  const clearanceQueue = verifications.filter(v => v.status === 'approved' || v.status === 'pending');
  const consolidatedCount = orders.filter(o => o.multi_retailer_status === 'consolidated').length;
  const pendingConsolidationCount = orders.filter(o => o.multi_retailer_status === 'pending_retailer_approvals').length;

  const stats = [
    { label: 'Total Shipments', value: verifications.length.toLocaleString() },
    { label: 'Active Shipments', value: activeShipments.toLocaleString(), pulse: activeShipments > 0 },
    { label: 'Partner Hotels (UAE)', value: (approvedHotels || 847).toLocaleString() },
    { label: 'Partner Retailers', value: (approvedRetailers || 3240).toLocaleString() },
    { label: 'Total Export Value', value: totalExportValue > 0 ? `$${(totalExportValue / 1e6).toFixed(2)}M` : '$22.4B' },
    { label: 'UAE Shipments', value: UAE.totalShipments.toLocaleString() },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
          </div>
          <p className="text-sm font-semibold text-foreground">Loading classified data…</p>
          <p className="text-xs text-muted-foreground mt-1">Verifying clearance credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Classification Banner */}
      <div className="bg-primary text-center py-2">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-accent" />
          <p className="text-[10px] font-black text-accent tracking-[0.3em] uppercase">Confidential — Government Use Only</p>
          <Lock className="w-3 h-3 text-accent" />
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-sm">
              <Package className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-widest text-foreground leading-none">SEND<span className="text-accent">IT</span>HOME</p>
              <p className="text-xs font-bold text-muted-foreground truncate mt-0.5">{deptName} — Oversight Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={loadData} className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s, i) => {
            const meta = STAT_META[i];
            const Icon = meta.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border border-border rounded-2xl p-4 shadow-sm ${s.pulse ? 'ring-1 ring-accent/30' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center mb-3 ${s.pulse ? 'animate-pulse' : ''}`}>
                  <Icon className={`w-4.5 h-4.5 ${meta.iconColor}`} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight font-medium">{s.label}</p>
                <p className="text-xl font-black text-foreground mt-1">{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-2xl p-1.5 shadow-sm">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                  {t.id === 'clearance' && clearanceQueue.length > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-accent/15 text-accent'}`}>{clearanceQueue.length}</span>
                  )}
                  {t.id === 'consolidated' && (consolidatedCount + pendingConsolidationCount) > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{consolidatedCount + pendingConsolidationCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'clearance' && (
            <motion.div key="clearance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ClearanceQueueTab
                clearanceQueue={clearanceQueue}
                onReview={setReviewingShipment}
                onAction={handleAction}
              />
            </motion.div>
          )}

          {tab === 'consolidated' && (
            <motion.div key="consolidated" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-4">
                <h2 className="text-base font-bold text-foreground">Multi-Retailer Consolidated Shipments</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Shipments spanning multiple retail stores — automatically consolidated once all retailers approve</p>
              </div>
              <ConsolidatedShipmentsTab orders={orders} />
            </motion.div>
          )}

          {tab === 'declarations' && (
            <motion.div key="declarations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <DeclarationBreakdownTab verifications={verifications} retailers={retailers} />
            </motion.div>
          )}

          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GovAnalyticsTab verifications={verifications} hotels={hotels} retailers={retailers} />
            </motion.div>
          )}

          {tab === 'commission' && (
            <motion.div key="commission" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GovCommissionTab verifications={verifications} retailers={retailers} />
            </motion.div>
          )}

          {tab === 'passports' && (
            <motion.div key="passports" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <PassportCopiesTab verifications={verifications} />
            </motion.div>
          )}

          {tab === 'customs' && (
            <motion.div key="customs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CustomsDeclarationsTab verifications={verifications} onReview={setReviewingShipment} />
            </motion.div>
          )}

          {tab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AuditTrailTab verifications={verifications} retailers={retailers} onReview={setReviewingShipment} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {reviewingShipment && (
          <ReviewModal
            shipment={reviewingShipment}
            onClose={() => setReviewingShipment(null)}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>

      {/* Confidentiality Footer */}
      <footer className="border-t border-border bg-card mt-8 py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
            © {new Date().getFullYear()} SendItHome · Proprietary and Confidential · Authorised Government Access Only · Unauthorised use is strictly prohibited
          </p>
        </div>
      </footer>
    </div>
  );
}