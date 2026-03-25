import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const COUNTRIES_LANGUAGES = [
  { country: 'United States', flag: '🇺🇸', lang: 'en', langName: 'English', code: 'US' },
  { country: 'United Kingdom', flag: '🇬🇧', lang: 'en', langName: 'English', code: 'GB' },
  { country: 'Canada', flag: '🇨🇦', lang: 'en', langName: 'English', code: 'CA' },
  { country: 'Australia', flag: '🇦🇺', lang: 'en', langName: 'English', code: 'AU' },
  { country: 'New Zealand', flag: '🇳🇿', lang: 'en', langName: 'English', code: 'NZ' },
  { country: 'Ireland', flag: '🇮🇪', lang: 'en', langName: 'English', code: 'IE' },
  { country: 'Bahamas', flag: '🇧🇸', lang: 'en', langName: 'English', code: 'BS' },
  { country: 'Singapore', flag: '🇸🇬', lang: 'en', langName: 'English', code: 'SG' },
  { country: 'Malta', flag: '🇲🇹', lang: 'mt', langName: 'Maltese', code: 'MT' },
  { country: 'France', flag: '🇫🇷', lang: 'fr', langName: 'French', code: 'FR' },
  { country: 'Belgium', flag: '🇧🇪', lang: 'fr', langName: 'French', code: 'BE' },
  { country: 'Luxembourg', flag: '🇱🇺', lang: 'fr', langName: 'French', code: 'LU' },
  { country: 'Germany', flag: '🇩🇪', lang: 'de', langName: 'German', code: 'DE' },
  { country: 'Austria', flag: '🇦🇹', lang: 'de', langName: 'German', code: 'AT' },
  { country: 'Switzerland', flag: '🇨🇭', lang: 'de', langName: 'German', code: 'CH' },
  { country: 'Liechtenstein', flag: '🇱🇮', lang: 'de', langName: 'German', code: 'LI' },
  { country: 'Spain', flag: '🇪🇸', lang: 'es', langName: 'Spanish', code: 'ES' },
  { country: 'Mexico', flag: '🇲🇽', lang: 'es', langName: 'Spanish', code: 'MX' },
  { country: 'Argentina', flag: '🇦🇷', lang: 'es', langName: 'Spanish', code: 'AR' },
  { country: 'Dominican Republic', flag: '🇩🇴', lang: 'es', langName: 'Spanish', code: 'DO' },
  { country: 'Panama', flag: '🇵🇦', lang: 'es', langName: 'Spanish', code: 'PA' },
  { country: 'Puerto Rico', flag: '🇵🇷', lang: 'es', langName: 'Spanish', code: 'PR' },
  { country: 'Italy', flag: '🇮🇹', lang: 'it', langName: 'Italian', code: 'IT' },
  { country: 'Portugal', flag: '🇵🇹', lang: 'pt', langName: 'Portuguese', code: 'PT' },
  { country: 'Turkey', flag: '🇹🇷', lang: 'tr', langName: 'Turkish', code: 'TR' },
  { country: 'Japan', flag: '🇯🇵', lang: 'ja', langName: 'Japanese', code: 'JP' },
  { country: 'China', flag: '🇨🇳', lang: 'zh-CN', langName: 'Chinese', code: 'CN' },
  { country: 'South Korea', flag: '🇰🇷', lang: 'ko', langName: 'Korean', code: 'KR' },
  { country: 'Thailand', flag: '🇹🇭', lang: 'th', langName: 'Thai', code: 'TH' },
  { country: 'Vietnam', flag: '🇻🇳', lang: 'vi', langName: 'Vietnamese', code: 'VN' },
  { country: 'Malaysia', flag: '🇲🇾', lang: 'ms', langName: 'Malay', code: 'MY' },
  { country: 'Indonesia', flag: '🇮🇩', lang: 'id', langName: 'Indonesian', code: 'ID' },
  { country: 'Philippines', flag: '🇵🇭', lang: 'tl', langName: 'Filipino', code: 'PH' },
  { country: 'India', flag: '🇮🇳', lang: 'hi', langName: 'Hindi', code: 'IN' },
  { country: 'Saudi Arabia', flag: '🇸🇦', lang: 'ar', langName: 'Arabic', code: 'SA' },
  { country: 'UAE', flag: '🇦🇪', lang: 'ar', langName: 'Arabic', code: 'AE' },
  { country: 'Kuwait', flag: '🇰🇼', lang: 'ar', langName: 'Arabic', code: 'KW' },
  { country: 'Qatar', flag: '🇶🇦', lang: 'ar', langName: 'Arabic', code: 'QA' },
  { country: 'Bahrain', flag: '🇧🇭', lang: 'ar', langName: 'Arabic', code: 'BH' },
  { country: 'Oman', flag: '🇴🇲', lang: 'ar', langName: 'Arabic', code: 'OM' },
  { country: 'Jordan', flag: '🇯🇴', lang: 'ar', langName: 'Arabic', code: 'JO' },
  { country: 'Egypt', flag: '🇪🇬', lang: 'ar', langName: 'Arabic', code: 'EG' },
  { country: 'Morocco', flag: '🇲🇦', lang: 'ar', langName: 'Arabic', code: 'MA' },
  { country: 'Greece', flag: '🇬🇷', lang: 'el', langName: 'Greek', code: 'GR' },
  { country: 'Cyprus', flag: '🇨🇾', lang: 'el', langName: 'Greek', code: 'CY' },
  { country: 'Netherlands', flag: '🇳🇱', lang: 'nl', langName: 'Dutch', code: 'NL' },
  { country: 'Denmark', flag: '🇩🇰', lang: 'da', langName: 'Danish', code: 'DK' },
  { country: 'Sweden', flag: '🇸🇪', lang: 'sv', langName: 'Swedish', code: 'SE' },
  { country: 'Norway', flag: '🇳🇴', lang: 'no', langName: 'Norwegian', code: 'NO' },
  { country: 'Iceland', flag: '🇮🇸', lang: 'is', langName: 'Icelandic', code: 'IS' },
  { country: 'Finland', flag: '🇫🇮', lang: 'fi', langName: 'Finnish', code: 'FI' },
  { country: 'Poland', flag: '🇵🇱', lang: 'pl', langName: 'Polish', code: 'PL' },
  { country: 'Czech Republic', flag: '🇨🇿', lang: 'cs', langName: 'Czech', code: 'CZ' },
  { country: 'Slovakia', flag: '🇸🇰', lang: 'sk', langName: 'Slovak', code: 'SK' },
  { country: 'Hungary', flag: '🇭🇺', lang: 'hu', langName: 'Hungarian', code: 'HU' },
  { country: 'Croatia', flag: '🇭🇷', lang: 'hr', langName: 'Croatian', code: 'HR' },
  { country: 'Slovenia', flag: '🇸🇮', lang: 'sl', langName: 'Slovenian', code: 'SI' },
  { country: 'Romania', flag: '🇷🇴', lang: 'ro', langName: 'Romanian', code: 'RO' },
  { country: 'Bulgaria', flag: '🇧🇬', lang: 'bg', langName: 'Bulgarian', code: 'BG' },
  { country: 'Estonia', flag: '🇪🇪', lang: 'et', langName: 'Estonian', code: 'EE' },
  { country: 'Latvia', flag: '🇱🇻', lang: 'lv', langName: 'Latvian', code: 'LV' },
  { country: 'Lithuania', flag: '🇱🇹', lang: 'lt', langName: 'Lithuanian', code: 'LT' },
  { country: 'Kazakhstan', flag: '🇰🇿', lang: 'kk', langName: 'Kazakh', code: 'KZ' },
];

// Deduplicate languages for the language list
const UNIQUE_LANGUAGES = [...new Map(COUNTRIES_LANGUAGES.map(c => [c.lang, { lang: c.lang, langName: c.langName, flag: c.flag }])).values()];

function triggerGoogleTranslate(langCode) {
  if (langCode === 'en') {
    // Reset to English
    const iframe = document.querySelector('.goog-te-banner-frame');
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const btn = doc.querySelector('.goog-te-button button');
      if (btn) btn.click();
    }
    // Try cookie approach
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
    window.location.reload();
    return;
  }
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  }
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({ lang: 'en', langName: 'English', flag: '🇬🇧' });
  const [tab, setTab] = useState('language'); // 'language' or 'country'
  const ref = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sih_lang');
    if (saved) {
      const found = UNIQUE_LANGUAGES.find(l => l.lang === saved);
      if (found) setSelected(found);
    }
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item) => {
    const langObj = { lang: item.lang, langName: item.langName, flag: item.flag };
    setSelected(langObj);
    localStorage.setItem('sih_lang', item.lang);
    triggerGoogleTranslate(item.lang);
    setOpen(false);
    setSearch('');
  };

  const filteredCountries = COUNTRIES_LANGUAGES.filter(c =>
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.langName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLanguages = UNIQUE_LANGUAGES.filter(l =>
    l.langName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-2.5 py-1.5 text-xs text-white/90"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-medium hidden sm:block">{selected.langName}</span>
        <Globe className="w-3.5 h-3.5 opacity-70" />
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-2xl shadow-xl w-72 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab('language')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === 'language' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'}`}
            >
              By Language
            </button>
            <button
              onClick={() => setTab('country')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === 'country' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'}`}
            >
              By Country
            </button>
          </div>

          {/* Search */}
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'language' ? 'Search language...' : 'Search country...'}
              className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-transparent outline-none"
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-64">
            {tab === 'language' ? (
              filteredLanguages.map(l => (
                <button
                  key={l.lang}
                  onClick={() => handleSelect(l)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="flex-1 text-foreground font-medium">{l.langName}</span>
                  {selected.lang === l.lang && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              ))
            ) : (
              filteredCountries.map(c => (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                >
                  <span className="text-lg">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-xs">{c.country}</p>
                    <p className="text-muted-foreground text-[10px]">{c.langName}</p>
                  </div>
                  {selected.lang === c.lang && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}