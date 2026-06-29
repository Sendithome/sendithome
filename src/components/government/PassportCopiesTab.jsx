import { useState, useMemo } from 'react';
import { Search, User, Filter, Eye, Download, Globe, Calendar, MapPin, Hotel, FileText } from 'lucide-react';

const STATUS_CFG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved:  { label: 'Approved',  color: 'bg-green-50 text-green-700 border-green-200' },
  queried:   { label: 'Queried',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
  overdue:   { label: 'Overdue',   color: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Rejected',  color: 'bg-red-50 text-red-700 border-red-200' },
};

function buildTouristRows(verifications) {
  const seen = new Set();
  const rows = [];
  for (const v of verifications) {
    const key = `${v.shipment_id}-${v.tourist_name}-${v.tourist_passport_country}`;
    if (!seen.has(key)) {
      seen.add(key);
      rows.push(v);
    }
  }
  return rows.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
}

export default function PassportCopiesTab({ verifications }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState(null);

  const touristRows = useMemo(() => buildTouristRows(verifications), [verifications]);

  const countries = useMemo(() => {
    const unique = [...new Set(touristRows.map(r => r.tourist_passport_country).filter(Boolean))].sort();
    return unique;
  }, [touristRows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return touristRows.filter(r => {
      const matchSearch = !q ||
        r.tourist_name?.toLowerCase().includes(q) ||
        r.shipment_id?.toLowerCase().includes(q) ||
        r.tourist_passport_country?.toLowerCase().includes(q) ||
        r.hotel_name?.toLowerCase().includes(q) ||
        r.destination_country?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCountry = countryFilter === 'all' || r.tourist_passport_country === countryFilter;
      const matchMissing = !showMissingOnly || !r.passport_url;
      return matchSearch && matchStatus && matchCountry && matchMissing;
    });
  }, [touristRows, search, statusFilter, countryFilter, showMissingOnly]);

  const withPassport = filtered.filter(r => r.passport_url).length;
  const withoutPassport = filtered.filter(r => !r.passport_url).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Tourist Passport Copies</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Passport documents submitted per shipment — {filtered.length} tourist{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">Passport Uploaded: {withPassport}</span>
          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">Missing: {withoutPassport}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tourist name, shipment ID, nationality…"
            className="w-full h-9 pl-9 pr-3 bg-card border border-input rounded-xl text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-input rounded-xl px-2.5 h-9">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="queried">Queried</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Rejected</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-input rounded-xl px-2.5 h-9">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
            className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer max-w-36">
            <option value="all">All Nationalities</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button
          onClick={() => setShowMissingOnly(!showMissingOnly)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border transition-colors ${showMissingOnly ? 'bg-red-50 border-red-300 text-red-700' : 'bg-card border-input text-muted-foreground hover:text-foreground'}`}
        >
          <Filter className="w-3.5 h-3.5" /> Missing Only
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No passport records found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Tourist Name', 'Nationality', 'Shipment ID', 'Hotel', 'Destination', 'Date', 'Status', 'Passport Copy'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r, i) => {
                  const sc = STATUS_CFG[r.status] || STATUS_CFG.pending;
                  return (
                    <tr key={`${r.shipment_id}-${i}`} className="hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-3 font-bold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          {r.tourist_name || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{r.tourist_passport_country || '—'}</td>
                      <td className="px-3 py-3 font-mono text-accent text-[10px]">{r.shipment_id}</td>
                      <td className="px-3 py-3 text-muted-foreground max-w-32 truncate">{r.hotel_name || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground">{r.destination_country || '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                        {r.created_date ? new Date(r.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                      </td>
                      <td className="px-3 py-3">
                        {r.passport_url ? (
                          <button
                            onClick={() => setSelectedPassport(r)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Passport
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Not Uploaded</span>
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

      {/* Passport Lightbox Modal */}
      {selectedPassport && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedPassport(null)}>
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-bold text-foreground">{selectedPassport.tourist_name}</p>
                <p className="text-[11px] text-muted-foreground">{selectedPassport.tourist_passport_country} · {selectedPassport.shipment_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={selectedPassport.passport_url} download target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button onClick={() => setSelectedPassport(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none font-bold px-2">×</button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-xs mb-3">
              {[
                { icon: User, label: 'Name', value: selectedPassport.tourist_name },
                { icon: Globe, label: 'Nationality', value: selectedPassport.tourist_passport_country },
                { icon: Hotel, label: 'Hotel', value: selectedPassport.hotel_name },
                { icon: MapPin, label: 'Destination', value: selectedPassport.destination_country },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="bg-muted/40 rounded-xl p-3 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                      <p className="font-bold text-foreground">{f.value || '—'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 pb-5">
              <div className="border border-border rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center min-h-48">
                {selectedPassport.passport_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                  <img src={selectedPassport.passport_url} alt="Passport copy" className="w-full object-contain max-h-96" />
                ) : selectedPassport.passport_url.match(/\.pdf$/i) ? (
                  <iframe src={selectedPassport.passport_url} title="Passport PDF" className="w-full h-96 rounded-xl" />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-xs text-muted-foreground">Document preview not available</p>
                    <a href={selectedPassport.passport_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-accent hover:underline">
                      <Eye className="w-3 h-3" /> Open in new tab
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}