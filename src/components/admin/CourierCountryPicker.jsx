import { useMemo, useState } from 'react';
import COUNTRIES from '@/lib/countries';
import { Search, Check } from 'lucide-react';

export default function CourierCountryPicker({ selected = [], onChange }) {
  const [query, setQuery] = useState('');
  const selectedSet = new Set(selected);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = COUNTRIES.filter(c => !q || c.name.toLowerCase().includes(q));
    const byRegion = {};
    filtered.forEach(c => { (byRegion[c.region] ||= []).push(c); });
    return byRegion;
  }, [query]);

  const toggle = (code) => {
    if (selectedSet.has(code)) onChange(selected.filter(c => c !== code));
    else onChange([...selected, code]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search countries…"
          className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-border rounded-lg focus:outline-none focus:border-accent"
        />
      </div>
      {Object.keys(grouped).sort().map(region => (
        <div key={region}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-2 mb-1">{region}</p>
          <div className="flex flex-wrap gap-1.5">
            {grouped[region].map(c => {
              const active = selectedSet.has(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggle(c.code)}
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border transition-colors ${
                    active ? 'bg-accent text-accent-foreground border-accent' : 'bg-white text-muted-foreground border-border hover:border-accent'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  {active && <Check className="w-2.5 h-2.5" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {selected.length === 0 && <p className="text-[10px] text-muted-foreground italic">No countries assigned yet.</p>}
    </div>
  );
}