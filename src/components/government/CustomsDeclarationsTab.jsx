import { useState, useMemo } from 'react';
import { Search, Filter, Eye, Download, Globe, User, FileText, Package, Loader2, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_CFG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved:  { label: 'Approved',  color: 'bg-green-50 text-green-700 border-green-200' },
  queried:   { label: 'Queried',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
  overdue:   { label: 'Overdue',   color: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Rejected',  color: 'bg-red-50 text-red-700 border-red-200' },
};

// One declaration per unique shipment
function buildDeclarations(verifications) {
  const map = {};
  for (const v of verifications) {
    const key = v.shipment_id || v.id;
    if (!map[key]) {
      map[key] = {
        shipment_id: v.shipment_id,
        order_id: v.order_id,
        tourist_name: v.tourist_name,
        tourist_passport_country: v.tourist_passport_country,
        hotel_name: v.hotel_name,
        destination_country: v.destination_country,
        status: v.status,
        created_date: v.created_date,
        customs_ref: v.customs_ref,
        verifications: [],
      };
    }
    map[key].verifications.push(v);
    // Prefer approved status
    if (v.status === 'approved') map[key].status = 'approved';
  }
  return Object.values(map).sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
}

export default function CustomsDeclarationsTab({ verifications }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  const [selectedDecl, setSelectedDecl] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const declarations = useMemo(() => buildDeclarations(verifications), [verifications]);

  const destinations = useMemo(() => {
    return [...new Set(declarations.map(d => d.destination_country).filter(Boolean))].sort();
  }, [declarations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return declarations.filter(d => {
      const matchSearch = !q ||
        d.tourist_name?.toLowerCase().includes(q) ||
        d.shipment_id?.toLowerCase().includes(q) ||
        d.customs_ref?.toLowerCase().includes(q) ||
        d.tourist_passport_country?.toLowerCase().includes(q) ||
        d.destination_country?.toLowerCase().includes(q) ||
        d.hotel_name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchDest = destFilter === 'all' || d.destination_country === destFilter;
      return matchSearch && matchStatus && matchDest;
    });
  }, [declarations, search, statusFilter, destFilter]);

  const totalValue = filtered.reduce((s, d) => s + d.verifications.reduce((ss, v) => ss + (v.total_value || 0), 0), 0);
  const approvedCount = filtered.filter(d => d.status === 'approved').length;

  const handleDownloadPDF = async (decl) => {
    setDownloading(decl.shipment_id);
    const items = decl.verifications.flatMap(v => (v.items || []).map(i => ({
      item_name: i.description,
      category: i.category,
      price: i.price,
      hs_code: i.hs_code,
      quantity: 1,
      currency: 'AED',
      eligible: i.eligible !== false,
    })));
    const order = {
      order_number: decl.shipment_id,
      destination_country: decl.destination_country,
      hotel_name: decl.hotel_name,
      hotel_room: '',
      recipient_name: decl.tourist_name,
    };
    const response = await base44.functions.invoke('generateDeclarationPDF', { order, items, signature: null }, { responseType: 'arraybuffer' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customs-declaration-${decl.shipment_id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Customs Declaration Forms</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            All tourist customs declarations — {filtered.length} declaration{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">{approvedCount} cleared</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
            ${totalValue.toLocaleString('en', { maximumFractionDigits: 0 })} total declared value
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tourist, shipment ID, customs ref, destination…"
            className="w-full h-9 pl-9 pr-3 bg-card border border-input rounded-xl text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-input rounded-xl px-2.5 h-9">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Cleared</option>
            <option value="queried">Queried</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Rejected</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-input rounded-xl px-2.5 h-9">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={destFilter} onChange={e => setDestFilter(e.target.value)}
            className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer max-w-36">
            <option value="all">All Destinations</option>
            {destinations.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No declarations found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Shipment ID', 'Tourist Name', 'Nationality', 'Destination', 'Hotel', 'Retailers', 'Declared Value', 'Customs Ref', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(d => {
                  const sc = STATUS_CFG[d.status] || STATUS_CFG.pending;
                  const totalVal = d.verifications.reduce((s, v) => s + (v.total_value || 0), 0);
                  const isDownloading = downloading === d.shipment_id;
                  return (
                    <tr key={d.shipment_id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-3 font-mono text-accent text-[10px] whitespace-nowrap">{d.shipment_id}</td>
                      <td className="px-3 py-3 font-bold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {d.tourist_name || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{d.tourist_passport_country || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground">{d.destination_country || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground max-w-32 truncate">{d.hotel_name || '—'}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-muted text-foreground font-bold px-2 py-0.5 rounded-full text-[10px]">{d.verifications.length}</span>
                      </td>
                      <td className="px-3 py-3 font-bold text-amber-600 whitespace-nowrap">
                        ${totalVal.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 font-mono text-muted-foreground text-[10px]">{d.customs_ref || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                        {d.created_date ? new Date(d.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedDecl(d)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button onClick={() => handleDownloadPDF(d)} disabled={isDownloading}
                            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50">
                            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Declaration Detail Modal */}
      {selectedDecl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedDecl(null)}>
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-bold text-foreground">Customs Declaration — {selectedDecl.shipment_id}</p>
                <p className="text-[11px] text-muted-foreground">{selectedDecl.tourist_name} · {selectedDecl.tourist_passport_country} → {selectedDecl.destination_country}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownloadPDF(selectedDecl)} disabled={downloading === selectedDecl.shipment_id}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
                  {downloading === selectedDecl.shipment_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Download PDF
                </button>
                <button onClick={() => setSelectedDecl(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none font-bold px-2">×</button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  { label: 'Tourist', value: selectedDecl.tourist_name },
                  { label: 'Nationality', value: selectedDecl.tourist_passport_country },
                  { label: 'Hotel', value: selectedDecl.hotel_name },
                  { label: 'Destination', value: selectedDecl.destination_country },
                  { label: 'Customs Ref', value: selectedDecl.customs_ref || 'Pending' },
                  { label: 'Status', value: STATUS_CFG[selectedDecl.status]?.label || selectedDecl.status },
                ].map(f => (
                  <div key={f.label} className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                    <p className="font-bold text-foreground mt-0.5">{f.value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Retailer Breakdown */}
              {selectedDecl.verifications.map((v, i) => {
                const items = (v.items || []).filter(item => item.eligible !== false);
                const total = v.total_value || items.reduce((s, item) => s + (item.price || 0), 0);
                return (
                  <div key={i} className="border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
                      <p className="text-xs font-bold text-foreground">{v.store_name || 'Unknown Retailer'}</p>
                      <p className="text-xs font-bold text-amber-600">${total.toFixed(2)}</p>
                    </div>
                    {items.length > 0 ? (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/10">
                            <th className="text-left px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase">Item</th>
                            <th className="text-left px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase">Category</th>
                            <th className="text-left px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase">HS Code</th>
                            <th className="text-right px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {items.map((item, j) => (
                            <tr key={j} className="hover:bg-muted/10">
                              <td className="px-3 py-2 text-foreground">{item.description || '—'}</td>
                              <td className="px-3 py-2 text-muted-foreground">{item.category || '—'}</td>
                              <td className="px-3 py-2 font-mono text-blue-700 text-[10px]">{item.hs_code || '—'}</td>
                              <td className="px-3 py-2 text-right font-semibold text-foreground">${(item.price || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-muted-foreground italic px-4 py-3">No eligible items found.</p>
                    )}
                  </div>
                );
              })}

              {/* Total */}
              <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3 border border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Total Declared Value</span>
                </div>
                <span className="text-lg font-black text-amber-600">
                  ${selectedDecl.verifications.reduce((s, v) => s + (v.total_value || 0), 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}