import { useState } from 'react';
import ShipmentDeclarationForm from '../components/ShipmentDeclarationForm';
import { base44 } from '@/api/base44Client';
import { Loader2, Globe } from 'lucide-react';

const SAMPLE_ORDER = {
  order_number: 'SIH-2026-00847',
  recipient_name: 'Alexandra Müller',
  hotel_name: 'Atlantis The Palm, Dubai',
  hotel_room: '1204',
  hotel_city: 'Dubai',
  hotel_country: 'United Arab Emirates',
  destination_country: 'Germany',
  destination_address: 'Kurfürstendamm 12',
  destination_city: 'Berlin',
  destination_postal_code: '10719',
  recipient_phone: '+49 30 1234 5678',
  passport_number: 'C3X7K2198',
  nationality: 'German',
  box_size: '20kg',
};

const SAMPLE_ITEMS = [
  { id: '1', item_name: 'Leather Handbag', category: "Women's Fashion", quantity: 1, price: 1250.00, currency: 'AED', eligible: true, hs_code: '4202.21', hs_code_verified: true },
  { id: '2', item_name: 'Silk Scarf', category: 'Accessories', quantity: 2, price: 320.00, currency: 'AED', eligible: true, hs_code: '6214.10', hs_code_verified: true },
  { id: '3', item_name: "Men's Dress Shirt", category: "Men's Fashion", quantity: 3, price: 185.00, currency: 'AED', eligible: true, hs_code: '6205.20', hs_code_verified: true },
  { id: '4', item_name: 'Kids Sneakers', category: 'Footwear', quantity: 1, price: 295.00, currency: 'AED', eligible: true, hs_code: '6404.11', hs_code_verified: false, hs_code_flagged: true },
  { id: '5', item_name: 'Camel Plush Toy', category: 'Souvenirs & Gifts', quantity: 2, price: 89.00, currency: 'AED', eligible: true, hs_code: '9503.00', hs_code_verified: true },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

// UI strings that get translated
const EN_STRINGS = {
  title: 'Review Your Customs Declaration',
  subtitle: 'Sample CN22/CN23 — as presented to the tourist for e-signature',
  langNote: 'Select your preferred language to read this form.',
};

export default function DeclarationPreview() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState({});

  const handleLanguageChange = async (langCode) => {
    setSelectedLang(langCode);
    if (langCode === 'en' || translations[langCode]) return;

    setTranslating(true);
    const langLabel = LANGUAGES.find(l => l.code === langCode)?.label || langCode;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following JSON object values into ${langLabel}. Return only valid JSON with the same keys. Do not translate proper nouns, brand names, or codes.\n\n${JSON.stringify(EN_STRINGS)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
          langNote: { type: 'string' },
        },
      },
    });
    setTranslations(prev => ({ ...prev, [langCode]: result }));
    setTranslating(false);
  };

  const t = selectedLang === 'en' ? EN_STRINGS : (translations[selectedLang] || EN_STRINGS);
  const isRTL = selectedLang === 'ar';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Language Selector */}
        <div className="mb-5 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <Globe className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-semibold text-gray-600">{translating ? '…' : t.langNote}</p>
            {translating && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin ml-1" />}
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                  selectedLang === lang.code
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
          <h1 className="text-lg font-bold text-gray-800">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <ShipmentDeclarationForm order={SAMPLE_ORDER} items={SAMPLE_ITEMS} />
      </div>
    </div>
  );
}