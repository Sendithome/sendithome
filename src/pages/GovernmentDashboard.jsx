import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, RefreshCw, Loader2, BarChart3, ClipboardList,
  CheckCircle2, Eye, Package, FileSearch, DollarSign, Globe, Users
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { PILOT_COUNTRIES, getPlatformTotals } from '@/lib/pilotCountryData';
import ReviewModal from '@/components/government/ReviewModal';
import GovAnalyticsTab from '@/components/government/GovAnalyticsTab.jsx';
import AuditTrailTab from '@/components/government/AuditTrailTab';
import ConsolidatedShipmentsTab from '@/components/government/ConsolidatedShipmentsTab';
import DeclarationBreakdownTab from '@/components/government/DeclarationBreakdownTab';
import GovCommissionTab from '@/components/government/GovCommissionTab';
import PassportCopiesTab from '@/components/government/PassportCopiesTab';
import CustomsDeclarationsTab from '@/components/government/CustomsDeclarationsTab';

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
  pending: { label: 'Awaiting Clearance', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  approved: { label: 'Cleared', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  queried: { label: 'On Hold', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  overdue: { label: 'Overdue', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
  cancelled: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
};

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground">Loading classified data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Classification Banner */}
      <div className="bg-accent/10 border-b border-accent/20 text-center py-1.5">
        <p className="text-[10px] font-black text-accent tracking-[0.3em] uppercase">⚠ Confidential — Government Use Only ⚠</p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
              <p className="text-xs font-bold text-muted-foreground truncate">{deptName} — Oversight Portal</p>
            </div>
          </div>
          <div className="hidden md:block text-center">
            <p className="text-xs text-foreground font-semibold">{new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={loadData} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-accent transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Pilot Countries Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/85 rounded-2xl px-5 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-primary-foreground/70 uppercase tracking-widest mb-1">🚀 Send It Home · Active Pilot Markets</p>
              <div className="flex flex-wrap gap-2">
                {PILOT_COUNTRIES.map(c => (
                  <span key={c.id} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${c.isPrimary ? 'bg-accent text-accent-foreground' : 'bg-white/10 text-primary-foreground'}`}>
                    {c.flag} {c.shortName}
                    {c.isPrimary && <span className="text-[9px] bg-white/20 px-1 rounded">PRIMARY</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-4 text-center shrink-0">
              <div>
                <p className="text-lg font-black text-accent">{PILOT_COUNTRIES.reduce((s, c) => s + c.totalShipments, 0).toLocaleString()}</p>
                <p className="text-[10px] text-primary-foreground/70">Platform Shipments</p>
              </div>
              <div>
                <p className="text-lg font-black text-green-400">${(getPlatformTotals().totalAddressableMarket / 1e9).toFixed(1)}B</p>
                <p className="text-[10px] text-primary-foreground/70">Addressable Market</p>
              </div>
              <div>
                <p className="text-lg font-black text-primary-foreground">{PILOT_COUNTRIES.reduce((s, c) => s + c.activeHotels, 0).toLocaleString()}</p>
                <p className="text-[10px] text-primary-foreground/70">Partner Hotels</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon="📊" label="Total Shipments" value={verifications.length.toLocaleString()} colorCls="text-primary" borderCls="border-primary/20" />
          <StatCard icon="📦" label="Active Shipments" value={activeShipments.toLocaleString()} colorCls="text-accent" borderCls="border-accent/30" pulse={activeShipments > 0} />
          <StatCard icon="🏨" label="Partner Hotels (UAE)" value={(approvedHotels || 847).toLocaleString()} colorCls="text-amber-600" borderCls="border-amber-200" />
          <StatCard icon="🏪" label="Partner Retailers" value={(approvedRetailers || 3240).toLocaleString()} colorCls="text-teal-600" borderCls="border-teal-200" />
          <StatCard icon="💰" label="Total Export Value" value={totalExportValue > 0 ? `$${(totalExportValue / 1e6).toFixed(2)}M` : '$22.4B'} colorCls="text-green-600" borderCls="border-green-200" />
          <StatCard icon="🌍" label="Pilot Countries" value={`${PILOT_COUNTRIES.length} Markets`} colorCls="text-blue-600" borderCls="border-blue-200" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.id === 'clearance' && clearanceQueue.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">{clearanceQueue.length}</span>
                )}
                {t.id === 'consolidated' && (consolidatedCount + pendingConsolidationCount) > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{consolidatedCount + pendingConsolidationCount}</span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'clearance' && (
            <motion.div key="clearance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Shipments Awaiting Government Clearance</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Retailer-approved shipments that require official government clearance before payment release</p>
              </div>

              {clearanceQueue.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400/40" />
                  <p className="font-semibold">No shipments pending clearance</p>
                  <p className="text-xs mt-1">All cleared — system up to date</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          {['Shipment ID', 'Tourist Name', 'Nationality', 'Destination', 'Value', 'Retailer Status', 'Customs Ref', 'Date Submitted', 'Action'].map(h => (
                            <th key={h} className="text-left px-3 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {clearanceQueue.map(v => {
                          const isCleared = v.status === 'approved' && v.customs_ref?.startsWith('GCLEAR');
                          return (
                            <tr key={v.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="px-3 py-3 font-mono text-accent whitespace-nowrap">{v.shipment_id}</td>
                              <td className="px-3 py-3 text-foreground font-medium">{v.tourist_name || '—'}</td>
                              <td className="px-3 py-3 text-muted-foreground">{v.tourist_passport_country || '—'}</td>
                              <td className="px-3 py-3 text-muted-foreground">{v.destination_country || '—'}</td>
                              <td className="px-3 py-3 text-amber-600 font-bold">${(v.total_value || 0).toLocaleString()}</td>
                              <td className="px-3 py-3">
                                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full whitespace-nowrap">✓ Retailer Approved</span>
                              </td>
                              <td className="px-3 py-3 font-mono text-muted-foreground whitespace-nowrap">{v.customs_ref || 'Pending'}</td>
                              <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{v.created_date ? new Date(v.created_date).toLocaleDateString() : '—'}</td>
                              <td className="px-3 py-3">
                                {isCleared ? (
                                  <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">✅ Cleared</span>
                                ) : (
                                  <button
                                    onClick={() => setReviewingShipment(v)}
                                    className="flex items-center gap-1.5 px-3 h-8 bg-accent hover:bg-accent/90 text-accent-foreground text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap"
                                  >
                                    <Eye className="w-3 h-3" /> Review & Clear
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
              <CustomsDeclarationsTab verifications={verifications} />
            </motion.div>
          )}

          {tab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AuditTrailTab verifications={verifications} />
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
    </div>
  );
}

function StatCard({ icon, label, value, colorCls, borderCls, pulse }) {
  return (
    <div className={`bg-card border rounded-xl p-3 shadow-sm ${borderCls} ${pulse ? 'animate-pulse' : ''}`}>
      <p className="text-base">{icon}</p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-tight">{label}</p>
      <p className={`text-lg font-black mt-1 ${colorCls}`}>{value}</p>
    </div>
  );
}