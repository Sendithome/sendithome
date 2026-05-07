export default function OxfordNav({ sections, active, setActive }) {
  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setActive(s.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-3.5 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                active === s.id
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="text-[9px] font-black text-gray-300 w-4">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}