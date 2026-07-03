import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Download, FileText, FileSpreadsheet, Loader2, Store, Package, User, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { getCommissionAmount, getCommissionRate } from '@/utils/commissionTiers';

// Tiered commission is computed per retailer line using the tourist's passport
// country and the transaction value (see utils/commissionTiers.js).

// Groups verifications by order/shipment — one "declaration" per tourist per shipment
function buildDeclarations(verifications, retailers) {
  const retailerMap = {};
  retailers.forEach(r => { retailerMap[r.id] = r; });

  // Group by shipment_id + tourist
  const shipmentMap = {};
  for (const v of verifications) {
    const key = v.shipment_id || v.id;
    if (!shipmentMap[key]) {
      shipmentMap[key] = {
        shipment_id: v.shipment_id,
        order_id: v.order_id,
        tourist_name: v.tourist_name,
        tourist_passport_country: v.tourist_passport_country,
        hotel_name: v.hotel_name,
        destination_country: v.destination_country,
        created_date: v.created_date,
        retailer_verifications: [],
      };
    }
    shipmentMap[key].retailer_verifications.push({ ...v, retailer: retailerMap[v.retailer_id] });
  }
  return Object.values(shipmentMap).sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
}

const lineReceivable = (v, country) => getCommissionAmount(v.total_value || 0, country);
const lineRatePct = (v, country) => (getCommissionRate(v.total_value || 0, country) * 100).toFixed(2);
const sumReceivable = (declarations) =>
  declarations.reduce((s, d) => s + d.retailer_verifications.reduce((ss, v) => ss + lineReceivable(v, d.tourist_passport_country), 0), 0);

export default function DeclarationBreakdownTab({ verifications, retailers }) {
  const [search, setSearch] = useState('');
  const [expandedKey, setExpandedKey] = useState(null);
  const [expandedRetailer, setExpandedRetailer] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  const [hotelFilter, setHotelFilter] = useState('all');
  const [retailerFilter, setRetailerFilter] = useState('all');

  const declarations = useMemo(() => buildDeclarations(verifications, retailers), [verifications, retailers]);

  const nationalities = useMemo(() => [...new Set(declarations.map(d => d.tourist_passport_country).filter(Boolean))].sort(), [declarations]);
  const destinations = useMemo(() => [...new Set(declarations.map(d => d.destination_country).filter(Boolean))].sort(), [declarations]);
  const hotels = useMemo(() => [...new Set(declarations.map(d => d.hotel_name).filter(Boolean))].sort(), [declarations]);
  const allRetailers = useMemo(() => [...new Set(declarations.flatMap(d => d.retailer_verifications.map(v => v.store_name)).filter(Boolean))].sort(), [declarations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return declarations.filter(d => {
      const matchSearch = !q ||
        d.tourist_name?.toLowerCase().includes(q) ||
        d.shipment_id?.toLowerCase().includes(q) ||
        d.tourist_passport_country?.toLowerCase().includes(q) ||
        d.destination_country?.toLowerCase().includes(q);
      const matchNat = nationalityFilter === 'all' || d.tourist_passport_country === nationalityFilter;
      const matchDest = destFilter === 'all' || d.destination_country === destFilter;
      const matchHotel = hotelFilter === 'all' || d.hotel_name === hotelFilter;
      const matchRetailer = retailerFilter === 'all' || d.retailer_verifications.some(v => v.store_name === retailerFilter);
      const matchDateFrom = !dateFrom || new Date(d.created_date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(d.created_date) <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchNat && matchDest && matchHotel && matchRetailer && matchDateFrom && matchDateTo;
    });
  }, [declarations, search, nationalityFilter, destFilter, hotelFilter, retailerFilter, dateFrom, dateTo]);

  const exportCSV = () => {
    const rows = [
      ['Declaration ID', 'Tourist Name', 'Nationality', 'Destination', 'Hotel', 'Date', 'Retailer Name', 'Retailer ID', 'Items Count', 'Purchase Value', 'Commission (Tiered)', 'Receivable Amount', 'Receipt Ref'],
    ];
    for (const d of declarations) {
      for (const v of d.retailer_verifications) {
        const selectedItems = (v.items || []).filter(i => i.selected !== false);
        rows.push([
          d.shipment_id,
          d.tourist_name,
          d.tourist_passport_country,
          d.destination_country,
          d.hotel_name,
          d.created_date ? new Date(d.created_date).toLocaleDateString() : '',
          v.store_name,
          v.retailer_id,
          selectedItems.length,
          (v.total_value || 0).toFixed(2),
          lineRatePct(v, d.tourist_passport_country) + '%',
          lineReceivable(v, d.tourist_passport_country).toFixed(2),
          v.shipment_id,
        ]);
      }
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIH-Declaration-Report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    // Build simple HTML table — opens correctly in Excel
    const rows = declarations.flatMap(d =>
      d.retailer_verifications.map(v => {
        const selectedItems = (v.items || []).filter(i => i.selected !== false);
        return [
          d.shipment_id, d.tourist_name, d.tourist_passport_country, d.destination_country, d.hotel_name,
          d.created_date ? new Date(d.created_date).toLocaleDateString() : '',
          v.store_name, v.retailer_id, selectedItems.length,
          (v.total_value || 0).toFixed(2),
          lineReceivable(v, d.tourist_passport_country).toFixed(2),
          v.shipment_id,
        ];
      })
    );
    const headers = ['Declaration ID', 'Tourist', 'Nationality', 'Destination', 'Hotel', 'Date', 'Retailer', 'Retailer ID', 'Items', 'Purchase Value', 'Receivable (Tiered)', 'Receipt Ref'];
    const tableHtml = `<table><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
    const blob = new Blob([`<html><body>${tableHtml}</body></html>`], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIH-Declaration-Report-${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const W = 297; const margin = 12; const cW = W - margin * 2;
      let y = margin;

      // Header
      doc.setFillColor(20, 20, 20); doc.rect(margin, y, cW, 14, 'F');
      doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
      doc.text('SEND IT HOME — GOVERNMENT DECLARATION BREAKDOWN REPORT', margin + cW / 2, y + 6, { align: 'center' });
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 200, 200);
      doc.text(`Generated: ${new Date().toLocaleString()} — CONFIDENTIAL — Government Use Only`, margin + cW / 2, y + 11, { align: 'center' });
      y += 17;

      // Summary
      const totalDecl = declarations.length;
      const totalRetailers = declarations.reduce((s, d) => s + d.retailer_verifications.length, 0);
      const totalVal = declarations.reduce((s, d) => s + d.retailer_verifications.reduce((ss, v) => ss + (v.total_value || 0), 0), 0);
      const totalReceivable = sumReceivable(declarations);

      doc.setFillColor(248, 248, 248); doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, cW, 12, 'FD');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
      const sumCols = [`Total Declarations: ${totalDecl}`, `Total Retailer Lines: ${totalRetailers}`, `Total Purchase Value: $${totalVal.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `Total Govt. Receivable (Tiered): $${totalReceivable.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`];
      sumCols.forEach((s, i) => doc.text(s, margin + 4 + i * (cW / 4), y + 7.5));
      y += 15;

      // Table headers
      const cols = [
        { label: 'Declaration ID', w: 32 },
        { label: 'Tourist', w: 34 },
        { label: 'Nationality', w: 22 },
        { label: 'Destination', w: 24 },
        { label: 'Hotel', w: 30 },
        { label: 'Retailer', w: 34 },
        { label: 'Items', w: 12 },
        { label: 'Purchase Value', w: 26 },
        { label: 'Receivable (Tiered)', w: 26 },
        { label: 'Date', w: 24 },
      ];

      doc.setFillColor(40, 40, 40); doc.rect(margin, y, cW, 6, 'F');
      let cx = margin;
      cols.forEach(c => {
        doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text(c.label.toUpperCase(), cx + 1.5, y + 4.2);
        cx += c.w;
      });
      y += 6;

      const rowData = declarations.flatMap(d =>
        d.retailer_verifications.map(v => {
          const selectedItems = (v.items || []).filter(i => i.selected !== false);
          return [
            d.shipment_id || '—',
            (d.tourist_name || '—').substring(0, 18),
            (d.tourist_passport_country || '—').substring(0, 10),
            (d.destination_country || '—').substring(0, 12),
            (d.hotel_name || '—').substring(0, 16),
            (v.store_name || '—').substring(0, 18),
            String(selectedItems.length),
            `$${(v.total_value || 0).toFixed(2)}`,
            `$${lineReceivable(v, d.tourist_passport_country).toFixed(2)}`,
            d.created_date ? new Date(d.created_date).toLocaleDateString('en-GB') : '—',
          ];
        })
      );

      rowData.forEach((row, ri) => {
        if (y > 175) { doc.addPage(); y = margin; }
        doc.setFillColor(ri % 2 === 0 ? 255 : 248, ri % 2 === 0 ? 255 : 248, ri % 2 === 0 ? 255 : 252);
        doc.rect(margin, y, cW, 5.5, 'F');
        doc.setDrawColor(230, 230, 230); doc.rect(margin, y, cW, 5.5, 'D');
        let rx = margin;
        row.forEach((cell, ci) => {
          doc.setFontSize(6.5); doc.setFont('helvetica', ci === 7 || ci === 8 ? 'bold' : 'normal');
          doc.setTextColor(ci === 8 ? 180 : ci === 7 ? 120 : 40, ci === 8 ? 100 : ci === 7 ? 80 : 40, ci === 8 ? 0 : 40);
          doc.text(cell, rx + 1.5, y + 4);
          rx += cols[ci].w;
        });
        y += 5.5;
      });

      // Footer
      doc.setFillColor(20, 20, 20); doc.rect(margin, y + 4, cW, 8, 'F');
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 180);
      doc.text('Send It Home — Vacation Logistics DMCC, Dubai | support@sendithomedxb.com | GOVERNMENT CONFIDENTIAL', margin + cW / 2, y + 10, { align: 'center' });

      doc.save(`SIH-Declaration-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
    }
    setExporting(false);
  };

  return (
    <div className="space-y-5">
      {/* Header + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Tourist Declaration Breakdown</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Drill-down: Tourist → Retailers → Receipts → Items · Tiered commission receivable per retailer</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={exportPDF} disabled={exporting} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm">
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} PDF
          </button>
        </div>
      </div>

      {/* Summary Totals */}
      <TotalsBar declarations={filtered} />

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tourist, shipment ID, nationality, destination…"
            className="w-full h-9 pl-9 pr-3 bg-card border border-input rounded-xl text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <select value={nationalityFilter} onChange={e => setNationalityFilter(e.target.value)} className="h-9 bg-card border border-input rounded-xl px-2 text-xs text-foreground focus:outline-none focus:border-accent">
          <option value="all">All Nationalities</option>
          {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={destFilter} onChange={e => setDestFilter(e.target.value)} className="h-9 bg-card border border-input rounded-xl px-2 text-xs text-foreground focus:outline-none focus:border-accent">
          <option value="all">All Destinations</option>
          {destinations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={hotelFilter} onChange={e => setHotelFilter(e.target.value)} className="h-9 bg-card border border-input rounded-xl px-2 text-xs text-foreground focus:outline-none focus:border-accent">
          <option value="all">All Hotels</option>
          {hotels.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select value={retailerFilter} onChange={e => setRetailerFilter(e.target.value)} className="h-9 bg-card border border-input rounded-xl px-2 text-xs text-foreground focus:outline-none focus:border-accent">
          <option value="all">All Retailers</option>
          {allRetailers.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 bg-card border border-input rounded-xl px-2 text-xs text-foreground focus:outline-none focus:border-accent" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 bg-card border border-input rounded-xl px-2 text-xs text-foreground focus:outline-none focus:border-accent" />
      </div>

      {/* Declaration Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No declarations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <DeclarationCard
              key={d.shipment_id}
              declaration={d}
              isExpanded={expandedKey === d.shipment_id}
              onToggle={() => setExpandedKey(expandedKey === d.shipment_id ? null : d.shipment_id)}
              expandedRetailer={expandedRetailer}
              setExpandedRetailer={setExpandedRetailer}
            />
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground italic text-center">* Commission is tiered (1%–10%) based on tourist origin country & transaction value. VAT excluded. Min spend US$1,500 · Max US$20,000.</p>
    </div>
  );
}

function TotalsBar({ declarations }) {
  const totalDecl = declarations.length;
  const totalValue = declarations.reduce((s, d) => s + d.retailer_verifications.reduce((ss, v) => ss + (v.total_value || 0), 0), 0);
  const totalReceivable = sumReceivable(declarations);
  const totalRetailerLines = declarations.reduce((s, d) => s + d.retailer_verifications.length, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Total Declarations', value: totalDecl.toLocaleString(), color: 'text-primary' },
        { label: 'Retailer Records', value: totalRetailerLines.toLocaleString(), color: 'text-blue-600' },
        { label: 'Total Purchase Value', value: `$${totalValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-amber-600' },
        { label: 'Total Govt. Receivable (Tiered)', value: `$${totalReceivable.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-green-600' },
      ].map(s => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-3 shadow-sm">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
          <p className={`text-lg font-black mt-1 ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function DeclarationCard({ declaration: d, isExpanded, onToggle, expandedRetailer, setExpandedRetailer }) {
  const totalValue = d.retailer_verifications.reduce((s, v) => s + (v.total_value || 0), 0);
  const totalReceivable = d.retailer_verifications.reduce((s, v) => s + lineReceivable(v, d.tourist_passport_country), 0);
  const totalItems = d.retailer_verifications.reduce((s, v) => s + (v.items || []).filter(i => i.selected !== false).length, 0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Tourist Header — Level 1 */}
      <div
        className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-foreground">{d.tourist_name || '—'}</p>
              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{d.tourist_passport_country || '—'}</span>
              <span className="text-[10px] font-mono text-accent">{d.shipment_id}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
              <span>→ {d.destination_country}</span>
              {d.hotel_name && <span>🏨 {d.hotel_name}</span>}
              <span>{d.created_date ? new Date(d.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
              <span className="text-foreground font-semibold">{d.retailer_verifications.length} retailer{d.retailer_verifications.length !== 1 ? 's' : ''} · {totalItems} items</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <div className="hidden md:block text-right">
            <p className="text-[10px] text-muted-foreground">Total Purchase Value</p>
            <p className="text-sm font-bold text-amber-600">${totalValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] text-muted-foreground">Govt. Receivable (Tiered)</p>
            <p className="text-sm font-bold text-green-600">${totalReceivable.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded — Retailer Level (Level 2) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-muted/10">

              {/* Tourist Info Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-1">
                {[
                  { label: 'Tourist Name', value: d.tourist_name },
                  { label: 'Nationality', value: d.tourist_passport_country },
                  { label: 'Declaration ID', value: d.shipment_id },
                  { label: 'Declaration Date', value: d.created_date ? new Date(d.created_date).toLocaleDateString('en-GB') : '—' },
                ].map(f => (
                  <div key={f.label} className="bg-card border border-border rounded-xl p-2.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">{f.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Retailer Summary Table (Level 2) */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground">Retailer-wise Purchase Breakdown</p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      {['Retailer', 'Reg. ID', 'Items', 'Purchase Value', `Comm. Rate`, 'Receivable Amount', 'Receipt Ref', ''].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {d.retailer_verifications.map(v => {
                      const selectedItems = (v.items || []).filter(i => i.selected !== false);
                      const retailerKey = `${d.shipment_id}-${v.id}`;
                      const isRetailerExpanded = expandedRetailer === retailerKey;
                      const rate = getCommissionRate(v.total_value || 0, d.tourist_passport_country);
                      return (
                        <React.Fragment key={v.id}>
                          <tr
                            className="hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => setExpandedRetailer(isRetailerExpanded ? null : retailerKey)}
                          >
                            <td className="px-3 py-2.5 font-bold text-foreground">{v.store_name || '—'}</td>
                            <td className="px-3 py-2.5 font-mono text-muted-foreground text-[10px]">{v.retailer_id !== 'unmatched' ? v.retailer_id?.slice(0, 12) + '…' : '—'}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="bg-muted text-foreground font-bold px-2 py-0.5 rounded-full text-[10px]">{selectedItems.length}</span>
                            </td>
                            <td className="px-3 py-2.5 font-bold text-amber-600">${(v.total_value || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{(rate * 100).toFixed(2)}%</td>
                            <td className="px-3 py-2.5 font-bold text-green-600">${lineReceivable(v, d.tourist_passport_country).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 font-mono text-muted-foreground text-[10px]">{v.shipment_id}</td>
                            <td className="px-3 py-2.5">
                              <button className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
                                {isRetailerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Items
                              </button>
                            </td>
                          </tr>
                          {/* Level 3 — Item Drill-Down */}
                          {isRetailerExpanded && (
                            <tr key={`items-${v.id}`}>
                              <td colSpan={8} className="bg-muted/30 px-6 py-3">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                  <Receipt className="w-3 h-3" /> {v.store_name} — Item Detail (Selected for Shipment)
                                </p>
                                {selectedItems.length === 0 ? (
                                  <p className="text-xs text-muted-foreground italic">No items selected for shipment.</p>
                                ) : (
                                  <table className="w-full text-xs rounded-xl overflow-hidden border border-border">
                                    <thead>
                                      <tr className="bg-muted text-muted-foreground">
                                        <th className="text-left px-3 py-1.5 font-semibold">#</th>
                                        <th className="text-left px-3 py-1.5 font-semibold">Item Description</th>
                                        <th className="text-left px-3 py-1.5 font-semibold">Category</th>
                                        <th className="text-center px-3 py-1.5 font-semibold">Qty</th>
                                        <th className="text-right px-3 py-1.5 font-semibold">Item Value</th>
                                        <th className="text-right px-3 py-1.5 font-semibold">Receivable (Tiered)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-border">
                                      {selectedItems.map((item, idx) => (
                                        <tr key={idx}>
                                          <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                                          <td className="px-3 py-2 font-medium text-foreground">{item.description || '—'}</td>
                                          <td className="px-3 py-2 text-muted-foreground">{item.category || '—'}</td>
                                          <td className="px-3 py-2 text-center">1</td>
                                          <td className="px-3 py-2 text-right font-semibold text-foreground">${(item.price || 0).toFixed(2)}</td>
                                          <td className="px-3 py-2 text-right font-bold text-green-600">${((item.price || 0) * rate).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                      <tr className="bg-muted/50 font-bold">
                                        <td colSpan={3} className="px-3 py-2 text-foreground">TOTAL ({selectedItems.length} items)</td>
                                        <td className="px-3 py-2 text-center">{selectedItems.length}</td>
                                        <td className="px-3 py-2 text-right text-amber-600">${(v.total_value || 0).toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right text-green-600">${lineReceivable(v, d.tourist_passport_country).toFixed(2)}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                )}
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {v.receipt_url && (
                                    <a href={v.receipt_url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline">
                                      <Receipt className="w-3 h-3" /> View Original Receipt
                                    </a>
                                  )}
                                  {v.passport_url && (
                                    <a href={v.passport_url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline">
                                      <FileText className="w-3 h-3" /> View Passport Copy
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  {/* Summary Totals Row */}
                  <tfoot>
                    <tr className="bg-muted/60 border-t-2 border-border font-bold">
                      <td className="px-3 py-2.5 text-foreground" colSpan={2}>DECLARATION TOTAL</td>
                      <td className="px-3 py-2.5 text-center text-foreground">{totalItems}</td>
                      <td className="px-3 py-2.5 font-black text-amber-600">${totalValue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2.5"></td>
                      <td className="px-3 py-2.5 font-black text-green-600">${totalReceivable.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}