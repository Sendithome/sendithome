import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, RefreshCw, Loader2, Package, Hotel, Store,
  Globe, DollarSign, BarChart3, ClipboardList, CheckCircle2,
  AlertTriangle, Clock, Eye
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '@/components/government/ReviewModal';
import GovAnalyticsTab from '@/components/government/GovAnalyticsTab';
import AuditTrailTab from '@/components/government/AuditTrailTab';

const TABS = [
  { id: 'clearance', label: 'Clearance Queue', icon: Shield },
  { id: 'analytics', label: 'Economic Impact', icon: BarChart3 },
  { id: 'audit', label: 'Audit Trail', icon: ClipboardList },
];

const STATUS_CFG = {
  pending: { label: 'Awaiting Clearance', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  approved: { label: 'Cleared', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  queried: { label: 'On Hold', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  cancelled: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
};

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('clearance');
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [reviewingShipment, setReviewingShipment] = useState(null);

  const deptName = sessionStorage.getItem('gov_dept_name') || 'Government Department';
  const govEmail = sessionStorage.getItem('gov_email') || '';

  useEffect(() => {
    const code = sessionStorage.getItem('gov_dept_code');
    if (!code) { navigate('/government-login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [allVerifications, allHotels, allRetailers] = await Promise.all([
      base44.entities.RetailerVerification.list('-created_date', 500),
      base44.entities.Hotel.list('-created_date', 200),
      base44.entities.Retailer.list('-created_date', 200),
    ]);
    setVerifications(allVerifications);
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

  // Stats
  const activeShipments = verifications.filter(v => v.status === 'pending' || v.status === 'queried').length;
  const totalExportValue = verifications.reduce((s, v) => s + (v.total_value || 0), 0);
  const uniqueDestinations = new Set(verifications.map(v => v.destination_country).filter(Boolean)).size;
  const approvedHotels = hotels.filter(h => h.active).length;
  const approvedRetailers = retailers.filter(r => r.status === 'approved').length;

  // Clearance queue = retailer-approved shipments awaiting gov clearance
  const clearanceQueue = verifications.filter(v => v.status === 'approved' || v.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading classified data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.07),transparent_60%)] pointer-events-none" />

      {/* Classification Banner */}
      <div className="bg-[#8B5CF6]/20 border-b border-[#8B5CF6]/30 text-center py-1.5">
        <p className="text-[10px] font-black text-[#8B5CF6] tracking-[0.3em] uppercase">⚠ Confidential — Government Use Only ⚠</p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0D1526]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-[#8B5CF6]/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-widest text-slate-500">SEND<span className="text-[#FF007F]">IT</span>HOME</p>
              <p className="text-xs font-bold text-white truncate">{deptName} — Oversight Portal</p>
            </div>
          </div>
          <div className="hidden md:block text-center">
            <p className="text-xs text-[#D4A855] font-semibold">{new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={loadData} className="p-2 text-slate-500 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-[#FF007F] transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 relative z-10">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon="📊" label="Total Shipments" value={verifications.length.toLocaleString()} color="text-[#8B5CF6]" border="border-[#8B5CF6]/30" />
          <StatCard icon="📦" label="Active Shipments" value={activeShipments.toLocaleString()} color="text-[#FF007F]" border="border-[#FF007F]/30" pulse={activeShipments > 0} />
          <StatCard icon="🏨" label="Participating Hotels" value={approvedHotels.toLocaleString()} color="text-[#D4A855]" border="border-[#D4A855]/30" />
          <StatCard icon="🏪" label="Participating Retailers" value={approvedRetailers.toLocaleString()} color="text-teal-400" border="border-teal-500/30" />
          <StatCard icon="💰" label="Total Export Value" value={`$${(totalExportValue / 1e6).toFixed(2)}M`} color="text-green-400" border="border-green-500/30" />
          <StatCard icon="🌍" label="Countries Served" value={`${uniqueDestinations} of 58`} color="text-blue-400" border="border-blue-500/30" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-800">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  tab === t.id ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.id === 'clearance' && clearanceQueue.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6]">{clearanceQueue.length}</span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* CLEARANCE QUEUE */}
          {tab === 'clearance' && (
            <motion.div key="clearance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">Shipments Awaiting Government Clearance</h2>
                <p className="text-xs text-slate-400 mt-0.5">Retailer-approved shipments that require official government clearance before payment release</p>
              </div>

              {clearanceQueue.length === 0 ? (
                <div className="text-center py-16 text-slate-600">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/30" />
                  <p className="font-semibold text-slate-500">No shipments pending clearance</p>
                  <p className="text-xs mt-1">All cleared — system up to date</p>
                </div>
              ) : (
                <div className="bg-[#0D1526] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800">
                          {['Shipment ID', 'Tourist Name', 'Nationality', 'Destination', 'Value', 'Retailer Status', 'Customs Ref', 'Date Submitted', 'Action'].map(h => (
                            <th key={h} className="text-left px-3 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {clearanceQueue.map(v => {
                          const cfg = STATUS_CFG[v.status] || STATUS_CFG.pending;
                          const isCleared = v.status === 'approved' && v.customs_ref?.startsWith('GCLEAR');
                          return (
                            <tr key={v.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                              <td className="px-3 py-3 font-mono text-[#8B5CF6] whitespace-nowrap">{v.shipment_id}</td>
                              <td className="px-3 py-3 text-white font-medium">{v.tourist_name || '—'}</td>
                              <td className="px-3 py-3 text-slate-400">{v.tourist_passport_country || '—'}</td>
                              <td className="px-3 py-3 text-slate-400">{v.destination_country || '—'}</td>
                              <td className="px-3 py-3 text-[#D4A855] font-bold">${(v.total_value || 0).toLocaleString()}</td>
                              <td className="px-3 py-3">
                                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full whitespace-nowrap">✓ Retailer Approved</span>
                              </td>
                              <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{v.customs_ref || 'Pending'}</td>
                              <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{v.created_date ? new Date(v.created_date).toLocaleDateString() : '—'}</td>
                              <td className="px-3 py-3">
                                {isCleared ? (
                                  <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">✅ Cleared</span>
                                ) : (
                                  <button
                                    onClick={() => setReviewingShipment(v)}
                                    className="flex items-center gap-1.5 px-3 h-8 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap"
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

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GovAnalyticsTab verifications={verifications} hotels={hotels} retailers={retailers} />
            </motion.div>
          )}

          {/* AUDIT TRAIL */}
          {tab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AuditTrailTab verifications={verifications} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Modal */}
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

function StatCard({ icon, label, value, color, border, pulse }) {
  return (
    <div className={`bg-[#0D1526] border rounded-xl p-3 ${border} ${pulse ? 'animate-pulse' : ''}`}>
      <p className="text-base">{icon}</p>
      <p className="text-xs text-slate-500 mt-1.5 leading-tight">{label}</p>
      <p className={`text-lg font-black mt-1 ${color}`}>{value}</p>
    </div>
  );
}