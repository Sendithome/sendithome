import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DIAL_CODES = [
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'USA' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'UK' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: 'KW', dial: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: 'BH', dial: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: 'OM', dial: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'PK', dial: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: 'EG', dial: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: 'JO', dial: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: 'LB', dial: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'RU', dial: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: 'CN', dial: '+86', flag: '🇨🇳', name: 'China' },
  { code: 'JP', dial: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: 'ZA', dial: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: 'PH', dial: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: 'NL', dial: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'SE', dial: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: 'NO', dial: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: 'CH', dial: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: 'SG', dial: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: 'MY', dial: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: 'TH', dial: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: 'TR', dial: '+90', flag: '🇹🇷', name: 'Turkey' },
];

export default function PhoneInput({ value, onChange, placeholder = '50 123 4567' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Parse stored value: "dialCode|number" format
  const parts = (value || '').split('|');
  const dialCode = parts[0] || '+971';
  const number = parts[1] || '';

  const selected = DIAL_CODES.find(c => c.dial === dialCode) || DIAL_CODES[0];
  const filtered = DIAL_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDialSelect = (dial) => {
    onChange(`${dial}|${number}`);
    setOpen(false);
    setSearch('');
  };

  const handleNumberChange = (e) => {
    onChange(`${dialCode}|${e.target.value}`);
  };

  return (
    <div className="flex gap-2 mt-1" ref={ref}>
      {/* Country code selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-transparent text-sm hover:bg-muted/50 transition-colors whitespace-nowrap"
        >
          <span>{selected.flag}</span>
          <span className="text-muted-foreground">{selected.dial}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg w-56 max-h-60 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-border">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full text-xs px-2 py-1.5 rounded-md border border-input bg-transparent outline-none"
              />
            </div>
            <div className="overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleDialSelect(c.dial)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                >
                  <span>{c.flag}</span>
                  <span className="flex-1 text-foreground">{c.name}</span>
                  <span className="text-muted-foreground text-xs">{c.dial}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Number input */}
      <Input
        type="tel"
        value={number}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  );
}