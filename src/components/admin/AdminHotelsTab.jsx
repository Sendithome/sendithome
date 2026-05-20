import { useState } from 'react';
import { Search, Star, ExternalLink } from 'lucide-react';

export default function AdminHotelsTab({ hotels }) {
  const [search, setSearch] = useState('');

  const filtered = hotels.filter(h =>
    !search ||
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase()) ||
    h.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotels…"
            className="h-9 pl-7 pr-3 bg-card border border-border rounded-xl text-xs focus:outline-none focus:border-accent w-52" />
        </div>
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
                {h.star_rating && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: h.star_rating }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
                {h.gm_name && <p className="text-xs text-muted-foreground mt-1">GM: {h.gm_name}</p>}
                {h.official_email && <p className="text-xs text-muted-foreground">{h.official_email}</p>}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${h.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {h.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-muted-foreground text-sm py-10">No hotels found.</p>
        )}
      </div>
    </div>
  );
}