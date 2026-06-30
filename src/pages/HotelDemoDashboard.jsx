import { useState, useMemo } from 'react';
import { getCountryById, getMonthlyChartData } from '@/lib/pilotCountryData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, QrCode, TrendingUp, Users, DollarSign, Truck,
  CheckCircle2, Clock, AlertCircle, BarChart3, Star, MapPin,
  ArrowUpRight, ArrowDownRight, Box, Globe, Activity,
  RefreshCw, Download, ChevronRight, Zap, Shield, Calendar, Printer, Mail,
  Package2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DemoShipmentsTab from '@/components/hotel/DemoShipmentsTab';
import DemoInventoryTab from '@/components/hotel/DemoInventoryTab';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';

// ── DEMO DATA ──────────────────────────────────────────────────────────────
const HOTEL = {
  name: 'Atlantis The Palm, Dubai',
  location: 'Crescent Road, The Palm, Dubai',
  stars: 5,
  rooms: 1544,
  logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop&crop=center',
  cover: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=300&fit=crop',
};

const UAE = getCountryById('uae');
const UAE_MONTHLY = getMonthlyChartData(UAE);

const STATS = [
  { label: 'Total Shipments', value: '284,000', change: '+18%', up: true, icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
  { label: 'Corridor Revenue', value: '$22.4B', change: '+22%', up: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Boxes Remaining', value: '38 / 60', change: '-12', up: false, icon: Box, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Countries Served', value: '34', change: '+5', up: true, icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const SHIPMENT_TREND = UAE_MONTHLY.map(m => ({ month: m.month, shipments: Math.round(m.shipments / 60), revenue: Math.round(m.revenue / 60000) }));

const TOP_DESTINATIONS = UAE.touristNationalities.slice(0, 7).map((n, i) => ({
  country: n.country,
  count: Math.round(UAE.totalShipments * n.pct / 100),
  pct: n.pct,
}));

const BOX_SPLIT = [
  { name: '10 kg', value: 812, color: '#6366f1' },
  { name: '20 kg', value: 472, color: '#ec4899' },
];

const RECENT_SHIPMENTS = [
  { id: 'SIH-2026-01284', guest: 'Mei Lin Zhao', dest: '🇬🇧 London', boxes: 1, value: '$1,240', status: 'in_transit', time: '2h ago' },
  { id: 'SIH-2026-01283', guest: 'James Harrington', dest: '🇺🇸 New York', boxes: 2, value: '$2,890', status: 'packed', time: '4h ago' },
  { id: 'SIH-2026-01282', guest: 'Yuki Tanaka', dest: '🇯🇵 Tokyo', boxes: 1, value: '$3,120', status: 'delivered', time: '8h ago' },
  { id: 'SIH-2026-01281', guest: 'Sophie Müller', dest: '🇩🇪 Berlin', boxes: 1, value: '$980', status: 'in_transit', time: '11h ago' },
  { id: 'SIH-2026-01280', guest: 'Raj Patel', dest: '🇦🇺 Sydney', boxes: 2, value: '$2,340', status: 'delivered', time: '1d ago' },
  { id: 'SIH-2026-01279', guest: 'Isabelle Moreau', dest: '🇫🇷 Paris', boxes: 1, value: '$4,560', status: 'delivered', time: '1d ago' },
];

const INVENTORY = [
  { type: '10 kg', allocated: 60, current: 38, reorder: 50, status: 'ok' },
  { type: '20 kg', allocated: 60, current: 47, reorder: 50, status: 'ok' },
];

const REPLENISHMENTS = [
  { date: '2026-05-28', type: '10 kg', qty: 40, status: 'delivered' },
  { date: '2026-04-14', type: '20 kg', qty: 20, status: 'delivered' },
  { date: '2026-03-02', type: '10 kg', qty: 40, status: 'delivered' },
];

const STATUS_CONFIG = {
  in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: Truck },
  packed: { label: 'Packed', color: 'bg-amber-100 text-amber-700', icon: Package },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'shipments', label: 'Shipments', icon: Package },
  { id: 'inventory', label: 'Box Inventory', icon: Box },
  { id: 'qr', label: 'QR Code', icon: QrCode },
];

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
        <Icon className={`w-5 h-5 ${stat.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
        <p className="text-xl font-black text-foreground mt-0.5">{stat.value}</p>
        <div className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
          {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {stat.change} this month
        </div>
      </div>
    </motion.div>
  );
}

export default function HotelDemoDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [qrVisible, setQrVisible] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent('https://sendit.home/guest-onboarding/atlantis-the-palm-demo')}&margin=12&format=png`;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-accent-foreground" />
        </div>
        <span className="text-xs font-black text-foreground">SEND<span className="text-accent">IT</span>HOME</span>
        <div className="flex items-center gap-1.5 ml-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-700">DEMO MODE</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-right">
            <div>
              <p className="text-xs font-bold text-foreground">{HOTEL.name}</p>
              <p className="text-[10px] text-muted-foreground">Hotel Partner</p>
            </div>
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border bg-muted">
              <img src={HOTEL.logo} alt="hotel" className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="hidden sm:inline text-[10px] text-muted-foreground">Demo Preview</span>
        </div>
      </header>

      {/* Hotel Hero Banner */}
      <div className="relative h-28 overflow-hidden">
        <img src={HOTEL.cover} alt="hotel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center px-5 gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/10 shrink-0">
            <img src={HOTEL.logo} alt="logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-[10px] text-amber-300 font-bold">★ 5-star luxury resort</span>
            </div>
            <h1 className="text-white font-black text-lg leading-tight">{HOTEL.name}</h1>
            <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {HOTEL.location}
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-green-500/20 border border-green-400/40 rounded-full px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[11px] font-bold text-green-300">Fully Onboarded · 1,544 Keys</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="bg-white border-b border-border px-4">
        <div className="flex gap-0 max-w-4xl mx-auto overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Demo disclaimer */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Demo Data Only.</strong> All figures, shipments, and revenue shown on this dashboard are illustrative examples for demonstration purposes. They do not represent real transactions.
                </p>
              </div>

              {/* Revenue highlight tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Revenue Earned This Month</p>
                  </div>
                  <p className="text-3xl font-black text-green-700">$12,760</p>
                  <p className="text-xs text-green-600 mt-1">Based on 638 shipments × US$20 hotel revenue per shipment</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Projected Annual Revenue (estimated)</p>
                  </div>
                  <p className="text-3xl font-black text-blue-700">$153,120</p>
                  <p className="text-xs text-blue-600 mt-1">Estimate — current monthly run rate ($12,760) × 12 months</p>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STATS.map(s => <StatCard key={s.label} stat={s} />)}
              </div>

              {/* Shipments trend chart */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Shipments & Revenue</h3>
                    <p className="text-xs text-muted-foreground">Monthly overview — 2026</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> Shipments</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Revenue ($)</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={SHIPMENT_TREND}>
                    <defs>
                      <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(330,100%,50%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(330,100%,50%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Area type="monotone" dataKey="shipments" stroke="hsl(330,100%,50%)" strokeWidth={2} fill="url(#gShip)" name="Shipments" />
                    <Area type="monotone" dataKey="revenue" stroke="#60a5fa" strokeWidth={2} fill="url(#gRev)" name="Revenue ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Destinations + Box Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top destinations */}
                <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent" /> Top Destinations
                  </h3>
                  <div className="space-y-3">
                    {TOP_DESTINATIONS.map((d) => (
                      <div key={d.country}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{d.country}</span>
                          <span className="text-xs font-bold text-muted-foreground">{d.count}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Box split */}
                <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent" /> Box Usage Split
                  </h3>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie data={BOX_SPLIT} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3}>
                          {BOX_SPLIT.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                      {BOX_SPLIT.map(b => (
                        <div key={b.name}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.color }} />
                            <span className="text-xs font-semibold text-foreground">{b.name} Box</span>
                          </div>
                          <p className="text-lg font-black text-foreground ml-4.5 pl-4">{b.value} <span className="text-xs font-normal text-muted-foreground">shipments</span></p>
                        </div>
                      ))}
                      <div className="bg-muted/40 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-muted-foreground">Tier 5 · 800+ Keys · 60 boxes allocated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent shipments preview */}
              <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Recent Shipments</h3>
                  <button onClick={() => setTab('shipments')} className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {RECENT_SHIPMENTS.slice(0, 4).map(s => {
                    const cfg = STATUS_CONFIG[s.status];
                    const SIcon = cfg.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{s.guest}</p>
                          <p className="text-[10px] text-muted-foreground">{s.id} · {s.dest}</p>
                        </div>
                        <p className="text-xs font-bold text-foreground hidden sm:block">{s.value}</p>
                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <SIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <p className="text-[10px] text-muted-foreground hidden sm:block whitespace-nowrap">{s.time}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {/* ── SHIPMENTS ── */}
          {tab === 'shipments' && (
            <motion.div key="shipments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <DemoShipmentsTab />
            </motion.div>
          )}

          {/* ── INVENTORY ── */}
          {tab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <DemoInventoryTab />
            </motion.div>
          )}

          {/* ── QR CODE ── */}
          {tab === 'qr' && (
            <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Hotel QR Code</h2>
                <p className="text-sm text-muted-foreground">Guests scan this QR code to start their SendITHome shipment</p>
              </div>

              {/* QR Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'QR Scans (30d)', value: '2,841', icon: QrCode, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Conversion Rate', value: '45%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Avg. per Day', value: '94', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="bg-white border border-border rounded-2xl p-4 text-center shadow-sm">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.bg}`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <p className="text-xl font-black text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-muted-foreground">Conversion rate measures the percentage of QR scans that result in a completed shipment registration — i.e. guests who scanned and went on to ship.</p>

              {/* QR Code display */}
              <div className="bg-white border border-border rounded-2xl p-6 flex flex-col items-center gap-5 shadow-sm">
                {!qrVisible ? (
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <QrCode className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">Click below to reveal your hotel's QR code</p>
                    <button
                      onClick={() => setQrVisible(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      <QrCode className="w-4 h-4" /> Generate QR Code
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-border">
                      <p className="text-[9px] font-black tracking-widest text-center text-primary mb-3">
                        SEND<span className="text-accent">IT</span>HOME
                      </p>
                      <img src={qrUrl} alt="QR Code" className="w-60 h-60 rounded-xl" />
                      <div className="text-center mt-3">
                        <p className="text-xs font-bold text-foreground">{HOTEL.name}</p>
                        <p className="text-[9px] text-muted-foreground">Dubai, United Arab Emirates</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center">
                      <button onClick={async () => { const r = await fetch(qrUrl); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'atlantis-the-palm-qr.png'; a.click(); URL.revokeObjectURL(u); }} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-xl transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download PNG
                      </button>
                      <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-semibold rounded-xl hover:bg-muted transition-colors">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent('SendItHome QR Code')}&body=${encodeURIComponent('Guests can scan this QR code to start their SendItHome shipment: ' + qrUrl)}`} className="flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-semibold rounded-xl hover:bg-muted transition-colors">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </button>
                      <button onClick={() => setQrVisible(false)} className="flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-semibold rounded-xl hover:bg-muted transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Reset
                      </button>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 w-full max-w-sm">
                      <p className="text-xs font-semibold text-green-800 mb-1.5">✅ Placement Guide</p>
                      <ul className="text-[10px] text-green-700 space-y-1 list-disc pl-3">
                        <li>Print A4 · place at concierge & front desk</li>
                        <li>Add to in-room information folders</li>
                        <li>Feature on hotel app & in-room TV screens</li>
                        <li>Share on social media & digital signage</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Confidentiality Footer */}
      <footer className="border-t border-border bg-white mt-4 py-3 px-4 text-center">
        <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
          © {new Date().getFullYear()} SendItHome · Proprietary and Confidential · Authorised Partner Access Only · Unauthorised use is strictly prohibited
        </p>
      </footer>

      {/* Minimal CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-8 pt-2 text-center">
        <p className="text-xs text-muted-foreground">Ready to partner with SendItHome? <button onClick={() => navigate('/hotel-onboarding')} className="text-accent font-semibold hover:underline">Register your hotel</button> — go live in as few as 7 working days.</p>
      </div>
    </div>
  );
}