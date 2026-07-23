import { useState, useMemo } from 'react';
import { Search, Star, ExternalLink, Download, BedDouble, ArrowUpDown, ArrowUp, ArrowDown, User, BarChart3, Eye } from 'lucide-react';
import HotelProfileDrawer from './HotelProfileDrawer';

const SORT_OPTIONS = [
  { key: 'name', label: 'Hotel Name' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'star', label: 'Star Rating' },
];

export default function AdminHotelsTab({ hotels, orders = [] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedHotel, setSelectedHotel] = useState(null);

  const stats = useMemo(() => ({
    total: hotels.length,
    active: hotels.filter(h => h.active).length,
    countries: new Set(hotels.map(h => h.country).filter(Boolean)).size,
    rooms: hotels.reduce((s, h) => s + (h.number_of_rooms || 0), 0),
  }), [hotels]);

  const filtered = useMemo(() => {
    const matched = hotels.filter(h => {
      const matchSearch = !search ||
        h.name?.toLowerCase().includes(search.toLowerCase()) ||
        h.city?.toLowerCase().includes(search.toLowerCase()) ||
        h.country?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' ||
        (filterStatus === 'active' ? h.active : !h.active);
      return matchSearch && matchStatus;
    });
    const val = (h) => {
      switch (sortKey) {
        case 'city': return (h.city || '').toLowerCase();
        case 'country': return (h.country || '').toLowerCase();
        case 'rooms': return h.number_of_rooms || 0;
        case 'star': return h.star_rating || 0;
        default: return (h.name || '').toLowerCase();
      }
    };
    return matched.sort((a, b) => {
      const av = val(a), bv = val(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [hotels, search, filterStatus, sortKey, sortDir]);

  const handleExport = () => {
    const rows = [['Name', 'City', 'Country', 'Star Rating', 'Rooms', 'GM', 'Official Email', 'Status']];
    filtered.forEach(h => rows.push([
      h.name || '', h.city || '', h.country || '', h.star_rating || '', h.number_of_rooms || '',
      h.gm_name || '', h.official_email || '', h.active ? 'Active' : 'Inactive',
    ]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `hotels_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSortDir = () => setSortDir(d => d === 'asc' ? 'desc' : 'asc');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryChip label="Total Hotels" value={stats.total} />
        <SummaryChip label="Active" value={stats.active} color="text-green-700" />
        <SummaryChip label="Countries" value={stats.countries} />
        <SummaryChip label="Total Rooms" value={stats.rooms.toLocaleString('en')} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotels…"
            className="h-9 pl-7 pr-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent w-52" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex items-center gap-1">
          <select value={sortKey} onChange={e => setSortKey(e.target.value)}
            className="h-9 px-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent">
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>Sort: {o.label}</option>)}
          </select>
          <button onClick={toggleSortDir} title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            className="h-9 w-9 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            {sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          </button>
        </div>
        <button onClick={handleExport} className="flex items-center gap-1.5 h-9 px-3 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:border-accent transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
        <a href="/hotel-dashboard" target="_blank" className="ml-auto text-xs text-accent hover:underline flex items-center gap-1">
          Hotel Admin <ExternalLink className="w-3 h-3" />
        </a>
        <span className="text-xs text-muted-foreground">{filtered.length} hotels</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(h => (
          <div key={h.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {h.logo_url ? (
                <img src={h.logo_url} alt={h.name} className="w-10 h-10 rounded-xl object-cover border border-border" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">
                  {(h.name || '?')[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.city}, {h.country}</p>
                <div className="flex items-center gap-3 mt-1">
                  {h.star_rating && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: h.star_rating }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )}
                  {h.number_of_rooms != null && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BedDouble className="w-3 h-3" /> {h.number_of_rooms.toLocaleString('en')} rooms
                    </span>
                  )}
                </div>
                {h.gm_name && <p className="text-xs text-muted-foreground mt-1">GM: {h.gm_name}</p>}
                {h.official_email && <p className="text-xs text-muted-foreground">{h.official_email}</p>}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${h.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {h.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {/* Quick actions */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
              <button onClick={() => setSelectedHotel(h)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-muted/40 hover:bg-accent/10 hover:text-accent border border-border rounded-lg px-2.5 py-1.5 transition-colors">
                <Eye className="w-3 h-3" /> Hotel Profile
              </button>
              <button onClick={() => setSelectedHotel(h)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-muted/40 hover:bg-accent/10 hover:text-accent border border-border rounded-lg px-2.5 py-1.5 transition-colors">
                <BarChart3 className="w-3 h-3" /> View Performance
              </button>
              <a href="/hotel-dashboard" target="_blank"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-muted/40 hover:bg-accent/10 hover:text-accent border border-border rounded-lg px-2.5 py-1.5 transition-colors">
                <User className="w-3 h-3" /> User Management
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-muted-foreground text-sm py-10">No hotels found.</p>
        )}
      </div>

      <HotelProfileDrawer
        hotel={selectedHotel}
        orders={orders}
        onClose={() => setSelectedHotel(null)}
      />
    </div>
  );
}

function SummaryChip({ label, value, color = 'text-foreground' }) {
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}