import { useState, useMemo } from 'react';
import {
  Eye, Search, Filter, Globe, Calendar, DollarSign, Store,
  CheckCircle2, AlertTriangle, Clock, ChevronUp, ChevronDown, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const HIGH_VALUE_THRESHOLD = 10000;

function ageInDays(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function isOverdue(v) {
  return v.status === 'pending' && v.deadline_at && new Date(v.deadline_at) < new Date();
}

const STATUS_CFG = {
  pending: { label: 'Awaiting Clearance', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  approved: { label: 'Cleared', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  queried: { label: 'On Hold', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  overdue: { label: 'Overdue', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
  cancelled: { label: 'Rejected', color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
};

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'value_desc', label: 'Value: High → Low' },
  { value: 'value_asc', label: 'Value: Low → High' },
  { value: 'dest_asc', label: 'Destination A-Z' },
  { value: 'age_desc', label: 'Longest Waiting' },
];

export default function ClearanceQueueTab({ clearanceQueue, onReview, onAction }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destFilter, setDestFilter] = useState('all');
  const [retailerFilter, setRetailerFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minValue, setMinValue] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);

  const destinations = useMemo(() =>
    [...new Set(clearanceQueue.map(v => v.destination_country).filter(Boolean))].sort(),
  [clearanceQueue]);

  const retailers = useMemo(() =>
    [...new Set(clearanceQueue.map(v => v.store_name).filter(Boolean))].sort(),
  [clearanceQueue]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = clearanceQueue.filter(v => {
      const matchSearch = !q ||
        v.shipment_id?.toLowerCase().includes(q) ||
        v.tourist_name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || v.status === statusFilter ||
        (statusFilter === 'overdue' && isOverdue(v));
      const matchDest = destFilter === 'all' || v.destination_country === destFilter;
      const matchRetailer = retailerFilter === 'all' || v.store_name === retailerFilter;
      const matchDateFrom = !dateFrom || new Date(v.created_date) >= new Date(dateFrom);
      const matchDateTo = !dateTo || new Date(v.created_date) <= new Date(dateTo + 'T23:59:59');
      const matchMinValue = !minValue || (v.total_value || 0) >= parseFloat(minValue);
      return matchSearch && matchStatus && matchDest && matchRetailer && matchDateFrom && matchDateTo && matchMinValue;
    });

    // Sort
    const sorters = {
      date_desc: (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0),
      date_asc: (a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0),
      value_desc: (a, b) => (b.total_value || 0) - (a.total_value || 0),
      value_asc: (a, b) => (a.total_value || 0) - (b.total_value || 0),
      dest_asc: (a, b) => (a.destination_country || '').localeCompare(b.destination_country || ''),
      age_desc: (a, b) => ageInDays(a.created_date) - ageInDays(b.created_date),
    };
    result = [...result].sort(sorters[sort] || sorters.date_desc);
    return result;
  }, [clearanceQueue, search, statusFilter, destFilter, retailerFilter, dateFrom, dateTo, minValue, sort]);

  const pendingOnly = filtered.filter(v => v.status === 'pending' && !v.customs_ref?.startsWith('GCLEAR'));
  const highValueCount = filtered.filter(v => (v.total_value || 0) >= HIGH_VALUE_THRESHOLD).length;
  const overdueCount = filtered.filter(v => isOverdue(v)).length;
  const passCount = filtered.filter(v => v.status === 'approved').length;
  const failCount = filtered.filter(v => v.status === 'cancelled' || v.status === 'queried').length;

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === pendingOnly.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingOnly.map(v => v.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Confirm bulk clearance of ${selected.size} shipment(s)? This will approve and clear all selected shipments.`)) return;
    setBulkApproving(true);
    const now = new Date().toISOString();
    const officer = sessionStorage.getItem('gov_email') || 'gov-officer';
    for (const v of clearanceQueue.filter(x => selected.has(x.id))) {
      const update = {
        status: 'approved',
        approved_at: now,
        approved_by: officer,
        customs_ref: `GCLEAR-${Date.now()}-${v.id.slice(-4)}`,
      };
      await base44.entities.RetailerVerification.update(v.id, update);
      onAction?.(v.id, 'approve', update);
    }
    setSelected(new Set());
    setBulkApproving(false);
  };

  const inputCls = "h-9 bg-card border border-input rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-foreground">Shipments Awaiting Government Clearance</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Retailer-approved shipments requiring official government clearance before payment release</p>
      </div>

      {/* Pass / Fail Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-black text-foreground">{pendingOnly.length}</p>
            <p className="text-[10px] text-muted-foreground">Awaiting Clearance</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-black text-emerald-600">{passCount}</p>
            <p className="text-[10px] text-muted-foreground">Cleared (Pass)</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-black text-amber-600">{highValueCount}</p>
            <p className="text-[10px] text-muted-foreground">High-Value (≥$10K)</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${overdueCount > 0 ? 'bg-red-50' : 'bg-muted'}`}>
            <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className={`text-lg font-black ${overdueCount > 0 ? 'text-red-600' : 'text-foreground'}`}>{overdueCount}</p>
            <p className="text-[10px] text-muted-foreground">Overdue</p>
          </div>
        </div>
      </div>

      {/* Search + Sort + Filter Toggle */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shipment ID or tourist name…"
            className={inputCls + ' w-full pl-9'}
          />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className={inputCls}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border transition-colors ${showFilters ? 'bg-accent/10 border-accent text-accent' : 'bg-card border-input text-muted-foreground hover:text-foreground'}`}
        >
          <Filter className="w-3.5 h-3.5" /> Filters
          {(statusFilter !== 'all' || destFilter !== 'all' || retailerFilter !== 'all' || dateFrom || dateTo || minValue) && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls + ' w-full'}>
              <option value="all">All Statuses</option>
              <option value="pending">Awaiting Clearance</option>
              <option value="approved">Cleared</option>
              <option value="queried">On Hold</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Rejected</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Destination</label>
            <select value={destFilter} onChange={e => setDestFilter(e.target.value)} className={inputCls + ' w-full'}>
              <option value="all">All Destinations</option>
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Retailer</label>
            <select value={retailerFilter} onChange={e => setRetailerFilter(e.target.value)} className={inputCls + ' w-full'}>
              <option value="all">All Retailers</option>
              {retailers.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Min Value (US$)</label>
            <input type="number" value={minValue} onChange={e => setMinValue(e.target.value)} placeholder="0" className={inputCls + ' w-full'} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls + ' w-full'} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls + ' w-full'} />
          </div>
          <div className="col-span-2 md:col-span-2 flex items-end">
            <button
              onClick={() => { setStatusFilter('all'); setDestFilter('all'); setRetailerFilter('all'); setDateFrom(''); setDateTo(''); setMinValue(''); }}
              className="h-9 px-3 text-xs font-semibold text-muted-foreground border border-input rounded-xl hover:text-foreground bg-card transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {pendingOnly.length > 0 && (
        <div className="flex items-center justify-between bg-muted/30 border border-border rounded-xl px-4 py-2.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <input type="checkbox" checked={selected.size === pendingOnly.length && pendingOnly.length > 0}
              onChange={toggleSelectAll} className="w-3.5 h-3.5 accent-accent" />
            Select All Pending ({pendingOnly.length})
          </label>
          {selected.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-accent">{selected.size} selected</span>
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {bulkApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {bulkApproving ? 'Processing…' : 'Bulk Approve & Clear'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl text-center py-16 text-muted-foreground">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-500/60" />
          </div>
          <p className="font-semibold text-foreground">No shipments matching your filters</p>
          <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-3 w-8"></th>
                  {['Shipment ID', 'Tourist', 'Nationality', 'Destination', 'Value', 'Retailer', 'Age', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, idx) => {
                  const isCleared = v.status === 'approved' && v.customs_ref?.startsWith('GCLEAR');
                  const overdue = isOverdue(v);
                  const highValue = (v.total_value || 0) >= HIGH_VALUE_THRESHOLD;
                  const age = ageInDays(v.created_date);
                  const isPending = v.status === 'pending' && !isCleared;
                  const rowHighlight = overdue ? 'bg-red-50/40' : highValue && isPending ? 'bg-amber-50/30' : idx % 2 === 1 ? 'bg-muted/5' : '';
                  return (
                    <tr key={v.id} className={`border-b border-border transition-colors hover:bg-muted/20 ${rowHighlight}`}>
                      <td className="px-3 py-3">
                        {isPending && (
                          <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)}
                            className="w-3.5 h-3.5 accent-accent" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-accent whitespace-nowrap font-semibold">
                        <div className="flex items-center gap-1.5">
                          {v.shipment_id}
                          {overdue && <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />}
                          {highValue && isPending && <DollarSign className="w-3 h-3 text-amber-600 shrink-0" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">{v.tourist_name || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.tourist_passport_country || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{v.destination_country || '—'}</td>
                      <td className="px-4 py-3 text-amber-600 font-bold whitespace-nowrap">
                        ${(v.total_value || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{v.store_name || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {age === 0 ? 'Today' : age === 1 ? '1 day' : `${age} days`}
                        {overdue && <span className="block text-[9px] font-bold text-red-600">⚠ OVERDUE</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${STATUS_CFG[v.status]?.bg || STATUS_CFG.pending.bg} ${STATUS_CFG[v.status]?.color || STATUS_CFG.pending.color}`}>
                          {overdue ? '⚠ Overdue' : STATUS_CFG[v.status]?.label || v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isCleared ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">✅ Cleared</span>
                        ) : (
                          <button
                            onClick={() => onReview(v)}
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
    </div>
  );
}