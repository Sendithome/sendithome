import { useState, useMemo } from 'react';
import { Download, Loader2, Clock, CheckCircle2, AlertTriangle, Search, FileText, Package, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ShipmentDetailModal from './ShipmentDetailModal';
import { getCommissionAmount, getCommissionTier } from '@/utils/commissionTiers';

const STATUS_CONFIG = {
  pending:   { label: 'Awaiting Approval',  color: 'text-yellow-600',  bg: 'bg-yellow-50 border-yellow-200' },
  overdue:   { label: 'Overdue',            color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
  queried:   { label: 'Queried',            color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
  approved:  { label: 'Approved',           color: 'text-green-600',   bg: 'bg-green-50 border-green-200' },
  cancelled: { label: 'Cancelled',          color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200' },
};

function StatusBadge({ status, deadline_at }) {
  const isOverdue = status === 'pending' && deadline_at && new Date(deadline_at) < new Date();
  const s = STATUS_CONFIG[isOverdue ? 'overdue' : status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>
      {s.label}
    </span>
  );
}

function CountdownBadge({ deadline_at }) {
  if (!deadline_at) return null;
  const diff = new Date(deadline_at) - new Date();
  if (diff <= 0) return <span className="text-[10px] text-red-500 font-bold">⏱ OVERDUE</span>;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return (
    <span className="text-[10px] text-yellow-600 font-medium flex items-center gap-0.5">
      <Clock className="w-3 h-3" />{hours}h {mins}m left
    </span>
  );
}

export default function ShipmentsTab({ verifications, retailer }) {
  const [view, setView] = useState('ongoing'); // 'ongoing' | 'history'
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [ongoingSearch, setOngoingSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);

  const exportCSV = () => {
    const header = ['Shipment ID', 'Tourist Name', 'Destination', 'Items', 'Value (US$)', 'Commission (US$)', 'Date Created', 'Status'];
    const rows = verifications.map(v => [
      v.shipment_id, v.tourist_name, v.destination_country,
      v.items?.length || 0,
      (v.total_value || 0).toFixed(2),
      ((v.total_value || 0) * 0.10).toFixed(2),
      v.created_date ? new Date(v.created_date).toLocaleDateString() : '',
      v.status
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `shipments-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const ongoing = useMemo(() =>
    verifications.filter(v => v.status === 'pending' || v.status === 'queried' || v.status === 'overdue'),
    [verifications]
  );

  const history = useMemo(() => {
    return verifications
      .filter(v => {
        const matchSearch = !search ||
          v.shipment_id?.toLowerCase().includes(search.toLowerCase()) ||
          v.tourist_name?.toLowerCase().includes(search.toLowerCase()) ||
          v.destination_country?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || v.status === filterStatus;
        const matchFrom = !filterFrom || (v.created_date && v.created_date >= filterFrom);
        const matchTo = !filterTo || (v.created_date && v.created_date <= filterTo + 'T23:59:59');
        return matchSearch && matchStatus && matchFrom && matchTo;
      })
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
  }, [verifications, search, filterStatus, filterFrom, filterTo]);

  const generateAccountingPDF = async () => {
    setGeneratingPDF(true);
    const approved = verifications.filter(v => v.status === 'approved');
    const totalValue = approved.reduce((s, v) => s + (v.total_value || 0), 0);
    const totalCommission = approved.reduce((s, v) => s + getCommissionAmount(v.total_value || 0, v.tourist_passport_country), 0);

    const lines = [
      `SEND IT HOME — RETAILER COMMISSION REPORT`,
      `Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      ``,
      `RETAILER: ${retailer?.store_name || ''}`,
      `Brand: ${retailer?.brand_name || ''}`,
      `Partner Code: ${retailer?.partner_code || ''}`,
      `Contact: ${retailer?.contact_email || ''}`,
      ``,
      `SUMMARY`,
      `─────────────────────────────────────────`,
      `Total Shipments Approved:   ${approved.length}`,
      `Total Declared Value (USD): $${totalValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `Govt. Commission:         $${totalCommission.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ``,
      `* Commission is tiered based on tourist origin country and transaction value.`,
      `  Preferred group (GCC, India, Egypt, Jordan, Russia): 1%-10% across 8 tiers.`,
      `  Rest of World (ROW): 2%-10% across 7 tiers. Higher spend = lower rate.`,
      `  Min spend US$1,500 · Max US$20,000. VAT excluded.`,
      ``,
      `SHIPMENT DETAILS`,
      `─────────────────────────────────────────`,
      ...approved.map((v, i) =>
        `${String(i + 1).padStart(3, '0')}. ${v.shipment_id}  |  ${v.tourist_name || '—'}  |  ${v.destination_country || '—'}  |  $${(v.total_value || 0).toFixed(2)}  |  Approved: ${v.approved_at ? new Date(v.approved_at).toLocaleDateString('en-GB') : '—'}`
      ),
      ``,
      `─────────────────────────────────────────`,
      `This document is generated by the Send It Home Retailer Portal.`,
      `For queries: support@sendithomedxb.com`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIH-Commission-Report-${retailer?.partner_code || 'retailer'}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    // Use LLM to generate a more detailed summary, then produce PDF via jsPDF
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const approved2 = approved;
      const W = 210; const margin = 18;
      let y = margin;

      // Header bar
      doc.setFillColor(26, 27, 38);
      doc.rect(0, 0, W, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('SEND IT HOME', margin, 13);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text('Retailer Commission & Shipment Report', margin, 20);
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, W - margin - 60, 20);

      y = 38;

      // Retailer info box
      doc.setFillColor(249, 249, 249);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(margin, y, W - margin * 2, 30, 2, 2, 'FD');
      doc.setTextColor(80, 80, 80); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
      doc.text('RETAILER', margin + 4, y + 7);
      doc.text('PARTNER CODE', margin + 60, y + 7);
      doc.text('CONTACT EMAIL', margin + 120, y + 7);
      doc.setTextColor(20, 20, 20); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(`${retailer?.store_name || '—'}`, margin + 4, y + 15);
      doc.text(`${retailer?.brand_name ? '(' + retailer.brand_name + ')' : ''}`, margin + 4, y + 22);
      doc.text(`${retailer?.partner_code || '—'}`, margin + 60, y + 15);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(`${retailer?.contact_email || '—'}`, margin + 120, y + 15);

      y += 38;

      // Summary cards
      const cards = [
        { label: 'Total Shipments', value: String(approved2.length) },
        { label: 'Total Value (USD)', value: `$${totalValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: 'Govt. Commission (Tiered)', value: `$${totalCommission.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      ];
      const cardW = (W - margin * 2 - 8) / 3;
      cards.forEach((c, i) => {
        const cx = margin + i * (cardW + 4);
        doc.setFillColor(i === 2 ? 212 : i === 1 ? 240 : 250, i === 2 ? 168 : i === 1 ? 248 : 250, i === 2 ? 85 : i === 1 ? 235 : 250);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(cx, y, cardW, 20, 2, 2, 'FD');
        doc.setTextColor(100, 100, 100); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.text(c.label, cx + 4, y + 7);
        doc.setTextColor(20, 20, 20); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text(c.value, cx + 4, y + 16);
      });

      y += 28;

      // Disclaimer
      doc.setTextColor(130, 130, 130); doc.setFontSize(6.5); doc.setFont('helvetica', 'italic');
      doc.text('* Commission is tiered (1%-10%) based on tourist origin country & transaction value. VAT excluded.', margin, y);
      y += 8;

      // Table header
      doc.setFillColor(26, 27, 38);
      doc.rect(margin, y, W - margin * 2, 8, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      const cols = [
        { label: '#', x: margin + 2, w: 8 },
        { label: 'Shipment ID', x: margin + 10, w: 28 },
        { label: 'Tourist', x: margin + 40, w: 36 },
        { label: 'Destination', x: margin + 78, w: 28 },
        { label: 'Items', x: margin + 108, w: 14 },
        { label: 'Value (USD)', x: margin + 124, w: 26 },
        { label: 'Commission', x: margin + 152, w: 26 },
        { label: 'Date Approved', x: margin + 150, w: 32 },
      ];
      // simplified 6-col table
      const hcols = [
        { label: '#', x: margin + 2 },
        { label: 'Shipment ID', x: margin + 10 },
        { label: 'Tourist', x: margin + 42 },
        { label: 'Destination', x: margin + 88 },
        { label: 'Value', x: margin + 122 },
        { label: 'Commission', x: margin + 143 },
        { label: 'Date Approved', x: margin + 163 },
      ];
      hcols.forEach(c => doc.text(c.label, c.x, y + 5.5));
      y += 8;

      // Table rows
      approved2.forEach((v, i) => {
        if (y > 265) {
          doc.addPage();
          y = margin;
        }
        const isEven = i % 2 === 0;
        doc.setFillColor(isEven ? 252 : 245, isEven ? 252 : 245, isEven ? 252 : 248);
        doc.rect(margin, y, W - margin * 2, 7, 'F');
        doc.setTextColor(40, 40, 40); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        const commission = getCommissionAmount(v.total_value || 0, v.tourist_passport_country);
        const row = [
          String(i + 1),
          v.shipment_id || '—',
          (v.tourist_name || '—').substring(0, 18),
          (v.destination_country || '—').substring(0, 14),
          `$${(v.total_value || 0).toFixed(2)}`,
          `$${commission.toFixed(2)}`,
          v.approved_at ? new Date(v.approved_at).toLocaleDateString('en-GB') : '—',
        ];
        hcols.forEach((c, ci) => doc.text(row[ci], c.x, y + 5));
        y += 7;
      });

      // Footer
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 282, W, 15, 'F');
      doc.setTextColor(120, 120, 120); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
      doc.text('Send It Home Retailer Portal  |  support@sendithomedxb.com  |  sendithomedxb.com', margin, 291);

      doc.save(`SIH-Commission-Report-${retailer?.partner_code || 'retailer'}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation error', err);
    }
    setGeneratingPDF(false);
  };

  const approved = verifications.filter(v => v.status === 'approved');
  const totalValue = approved.reduce((s, v) => s + (v.total_value || 0), 0);
  const totalCommission = approved.reduce((s, v) => s + getCommissionAmount(v.total_value || 0, v.tourist_passport_country), 0);

  return (
    <div className="space-y-5">
      {/* View Toggle + PDF Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden bg-card">
          {[['ongoing', 'Ongoing'], ['history', 'All History']].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${view === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={verifications.length === 0}
            className="flex items-center gap-2 text-xs font-semibold border border-border text-foreground disabled:opacity-40 px-4 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={generateAccountingPDF}
            disabled={generatingPDF || approved.length === 0}
            className="flex items-center gap-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            {generatingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            Download Accounting Report (PDF)
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={<Package className="w-4 h-4" />} label="Total Shipments" value={verifications.length} color="text-primary" />
        <SummaryCard icon={<CheckCircle2 className="w-4 h-4" />} label="Approved" value={approved.length} color="text-green-600" />
        <SummaryCard icon={<TrendingUp className="w-4 h-4" />} label="Govt. Commission (Tiered)" value={`$${totalCommission.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="text-amber-600" footnote="tiered — based on tourist origin & spend" />
      </div>

      {view === 'ongoing' && (
        <OngoingView
          verifications={verifications.filter(v => v.status === 'pending' || v.status === 'queried').filter(v => {
            if (!ongoingSearch) return true;
            const q = ongoingSearch.toLowerCase();
            return v.shipment_id?.toLowerCase().includes(q) ||
              v.tourist_name?.toLowerCase().includes(q) ||
              v.destination_country?.toLowerCase().includes(q);
          })}
          search={ongoingSearch} setSearch={setOngoingSearch}
          onSelect={setSelectedShipment}
        />
      )}

      {view === 'history' && (
        <HistoryView
          verifications={history}
          allVerifications={verifications}
          search={search} setSearch={setSearch}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterFrom={filterFrom} setFilterFrom={setFilterFrom}
          filterTo={filterTo} setFilterTo={setFilterTo}
          onSelect={setSelectedShipment}
        />
      )}

      {selectedShipment && (
        <ShipmentDetailModal verification={selectedShipment} onClose={() => setSelectedShipment(null)} />
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, color, footnote }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm">
      <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className={`text-base font-bold ${color}`}>{value}</p>
        {footnote && <p className="text-[9px] text-muted-foreground/60 italic">{footnote}</p>}
      </div>
    </div>
  );
}

function OngoingView({ verifications, search, setSearch, onSelect }) {
  const inputCls = "h-8 bg-background border border-input rounded-lg px-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors";

  if (verifications.length === 0) {
    return (
      <div className="text-center py-14 text-muted-foreground">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400/30" />
        <p className="font-semibold text-sm">No ongoing shipments</p>
        <p className="text-xs mt-1">All verifications have been processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground font-medium">{verifications.length} shipment{verifications.length !== 1 ? 's' : ''} awaiting action</p>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className={`${inputCls} pl-7 w-36`} />
        </div>
      </div>
      {verifications.map(v => {
        const isOverdue = v.deadline_at && new Date(v.deadline_at) < new Date();
        return (
          <div key={v.id} className={`bg-card border rounded-2xl p-4 shadow-sm ${isOverdue ? 'border-destructive/40' : v.status === 'queried' ? 'border-orange-200' : 'border-yellow-200'}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <button onClick={() => onSelect && onSelect(v)} className="text-sm font-bold text-foreground font-mono hover:text-accent hover:underline transition-colors">{v.shipment_id}</button>
                <p className="text-xs text-muted-foreground mt-0.5">{v.tourist_name} · {v.destination_country}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StatusBadge status={v.status} deadline_at={v.deadline_at} />
                  {v.status === 'pending' && <CountdownBadge deadline_at={v.deadline_at} />}
                </div>
                {v.status === 'queried' && v.query_reason && (
                  <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
                    <span className="font-semibold">Query reason: </span>{v.query_reason}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Declared Value</p>
                <p className="text-base font-bold text-foreground">${(v.total_value || 0).toFixed(2)}</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Tiered Govt: ${getCommissionAmount(v.total_value || 0, v.tourist_passport_country).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{v.items?.length || 0} item{(v.items?.length || 0) !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Created</span>
                <span>Verified</span>
                <span>Approved</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${v.status === 'approved' ? 'w-full bg-green-500' : v.status === 'queried' ? 'w-2/3 bg-orange-400' : 'w-1/3 bg-yellow-400'}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryView({ verifications, search, setSearch, filterStatus, setFilterStatus, filterFrom, setFilterFrom, filterTo, setFilterTo, onSelect }) {
  const inputCls = "h-8 bg-background border border-input rounded-lg px-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shipments…"
            className={`${inputCls} pl-7 w-44`} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`${inputCls} w-36`}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="queried">Queried</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className={inputCls} />
        <span className="text-xs text-muted-foreground">→</span>
        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className={inputCls} />
        {(search || filterStatus !== 'all' || filterFrom || filterTo) && (
          <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterFrom(''); setFilterTo(''); }}
            className="text-xs text-accent hover:underline">Clear filters</button>
        )}
      </div>

      {verifications.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-10">No shipments match your filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-muted-foreground">
                {['Shipment ID', 'Tourist', 'Destination', 'Items', 'Value', 'Commission (Tiered)', 'Date Created', 'Status'].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {verifications.map(v => (
                <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-3">
                    <button onClick={() => onSelect && onSelect(v)} className="font-mono text-accent font-semibold hover:underline">{v.shipment_id}</button>
                  </td>
                  <td className="py-2.5 px-3 text-foreground">{v.tourist_name || '—'}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{v.destination_country || '—'}</td>
                  <td className="py-2.5 px-3 text-center">{v.items?.length || 0}</td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">${(v.total_value || 0).toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-600">${getCommissionAmount(v.total_value || 0, v.tourist_passport_country).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {v.created_date ? new Date(v.created_date).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={v.status} deadline_at={v.deadline_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground italic text-center">* Commission is tiered (1%-10%) based on tourist origin country & transaction value. VAT excluded. Min spend US$1,500 · Max US$20,000.</p>
    </div>
  );
}