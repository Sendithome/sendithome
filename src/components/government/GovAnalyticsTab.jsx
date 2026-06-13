import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Package, DollarSign,
  Building2, Store, MapPin
} from 'lucide-react';
import {
  getCountryById, getMonthlyChartData, MONTHS_SHORT
} from '@/lib/pilotCountryData';

const CHART_COLORS = ['#FF007F', '#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const tooltipStyle = {
  background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
  borderRadius: 8, fontSize: 11, color: 'hsl(var(--foreground))',
};

function fmt(n) { return n?.toLocaleString() || '0'; }
function fmtM(n) { return n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${(n / 1e6).toFixed(0)}M`; }

function KpiCard({ icon: IconComp, label, value, sub, color = 'text-foreground', bg = 'bg-accent/10' }) {
  const Icon = IconComp;
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-accent font-semibold mt-1">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function GovAnalyticsTab({ verifications, hotels, retailers }) {
  const country = getCountryById('uae');
  const monthlyData = getMonthlyChartData(country);

  const realMetrics = useMemo(() => {
    const approved = verifications.filter(v => v.status === 'approved');
    return {
      totalRevenue: approved.reduce((s, v) => s + (v.total_value || 0), 0),
      approvedCount: approved.length,
      totalCount: verifications.length,
    };
  }, [verifications]);

  const annualShipments = country.monthlyShipments.reduce((s, v) => s + v, 0);
  const annualRevenue = country.monthlyRevenue.reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-foreground">Economic Impact & Analytics Dashboard</h3>
        <p className="text-xs text-muted-foreground mt-0.5">UAE (Dubai) · Primary Showcase Market</p>
      </div>

      {/* ── COUNTRY VIEW ── */}
      {true && (
        <>
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <p className="text-lg font-black">{country.name}</p>
                    <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {country.primaryCity} · {country.region}
                      {country.isPrimary && <span className="ml-2 bg-accent text-accent-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full">PRIMARY MARKET</span>}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-primary-foreground/80 max-w-xl mt-2">{country.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Annual Tourists', value: `${(country.annualTourists / 1_000_000).toFixed(1)}M` },
                  { label: 'Avg Spend/Tourist', value: `$${country.avgSpendPerTourist.toLocaleString()}` },
                  { label: 'VAT Rate', value: `${country.vatRate}%` },
                  { label: 'Tourism → GDP', value: `${country.gdpContributionPct}%` },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3">
                    <p className="text-lg font-black">{s.value}</p>
                    <p className="text-[10px] text-primary-foreground/70 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={Package} label="Annual Shipments" value={fmt(annualShipments)} sub={`${fmt(country.totalShipments)} total platform`} color="text-accent" />
            <KpiCard icon={DollarSign} label="Annual SIH Revenue" value={fmtM(annualRevenue)} sub="From this market" color="text-green-600" />
            <KpiCard icon={Building2} label="Partner Hotels" value={fmt(country.activeHotels)} sub="Active & onboarded" color="text-blue-600" />
            <KpiCard icon={Store} label="Partner Retailers" value={fmt(country.activeRetailers)} sub="Approved stores" color="text-purple-600" />
          </div>

          <ChartCard title={`Monthly Shipments & Revenue — ${country.name}`} subtitle="12-month seasonal performance">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gShip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => fmt(v)} width={55} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={55} />
                <Tooltip formatter={(v, name) => name === 'Shipments' ? [fmt(v), name] : [`$${(v/1000).toFixed(0)}k`, name]} contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area yAxisId="left" type="monotone" dataKey="shipments" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#gShip)" name="Shipments" />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#60a5fa" strokeWidth={2} fill="url(#gRev)" name="Revenue (USD)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ChartCard title="Tourist Nationalities" subtitle={`Inbound visitor profile — ${country.primaryCity}`}>
              <div className="space-y-2.5 mt-1">
                {country.touristNationalities.map((n, i) => (
                  <div key={n.country}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground">{n.country}</span>
                      <span className="text-xs font-bold text-muted-foreground">{n.pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${n.pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Top Retail Categories" subtitle="Purchase breakdown by category">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={country.topCategories} layout="vertical" barSize={16}>
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={115} />
                  <Tooltip formatter={(v, name) => name === 'pct' ? [`${v}%`, 'Share'] : [`$${v.toLocaleString()}`, 'Avg Value']} contentStyle={tooltipStyle} />
                  <Bar dataKey="pct" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="pct" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {country.topCategories.slice(0, 4).map(c => (
                  <div key={c.name} className="bg-muted/40 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">{c.name}</p>
                    <p className="text-sm font-bold text-foreground">${c.avgValueUSD.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">avg</span></p>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Economic Impact & GDP Contribution" subtitle="Send It Home addressable opportunity">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Tourism Revenue', value: fmtM(country.economicImpact.directRevenue), color: 'text-blue-600' },
                { label: 'Multiplier Effect (1.5×)', value: fmtM(country.economicImpact.directRevenue * 1.5), color: 'text-green-600' },
                { label: 'Jobs Supported', value: `${(country.economicImpact.jobsSupported / 1000).toFixed(0)}K`, color: 'text-purple-600' },
                { label: 'Govt. Commission Est.', value: fmtM(country.economicImpact.govtCommissionEstimate), color: 'text-accent' },
              ].map(s => (
                <div key={s.label} className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { pct: '10% participation', shipments: Math.round(country.totalShipments * 0.1), revenue: country.economicImpact.sihProjectedAnnualRevenue * 0.5 },
                { pct: '20% participation', shipments: Math.round(country.totalShipments * 0.2), revenue: country.economicImpact.sihProjectedAnnualRevenue },
                { pct: '30% participation', shipments: Math.round(country.totalShipments * 0.3), revenue: country.economicImpact.sihProjectedAnnualRevenue * 2 },
              ].map(p => (
                <div key={p.pct} className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                  <p className="text-xs font-black text-accent">{p.pct}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">Shipments</p>
                  <p className="text-sm font-bold text-foreground">{fmt(p.shipments)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">SIH Revenue</p>
                  <p className="text-xs font-semibold text-green-600">{fmtM(p.revenue)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">
                {country.name}: Addressable market <span className="text-amber-600 font-bold">{fmtM(country.sihAddressableMarket)}</span> ·
                Current penetration <span className="text-accent font-bold">{country.sihCurrentPenetration}%</span> ·
                Projected annual government commission <span className="text-green-600 font-bold">{fmtM(country.economicImpact.govtCommissionEstimate)}</span>
              </p>
            </div>
          </ChartCard>

          {country.keyPartners?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Key Hotel Partners — {country.primaryCity}</p>
              <div className="flex flex-wrap gap-2">
                {country.keyPartners.map(p => (
                  <span key={p} className="text-xs bg-muted text-foreground font-medium px-3 py-1.5 rounded-xl border border-border">🏨 {p}</span>
                ))}
              </div>
            </div>
          )}

          {realMetrics.totalCount > 0 && (
            <ChartCard title="Live System Compliance" subtitle="Sourced from real-time platform data">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Submissions', value: realMetrics.totalCount, color: 'text-primary' },
                  { label: 'Approved', value: realMetrics.approvedCount, color: 'text-green-600' },
                  { label: 'Live Export Value', value: `$${(realMetrics.totalRevenue / 1000).toFixed(1)}k`, color: 'text-amber-600' },
                ].map(m => (
                  <div key={m.label} className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </>
      )}

    </div>
  );
}