const COUNTRIES = [
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", currencySymbol: "€", language: "French", languageCode: "fr", region: "Europe" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", language: "Spanish", languageCode: "es", region: "Europe" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", currencySymbol: "$", language: "English", languageCode: "en", region: "Americas" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", currency: "TRY", currencySymbol: "₺", language: "Turkish", languageCode: "tr", region: "Europe" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR", currencySymbol: "€", language: "Italian", languageCode: "it", region: "Europe" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", currency: "MXN", currencySymbol: "MX$", language: "Spanish", languageCode: "es", region: "Americas" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", language: "English", languageCode: "en", region: "Europe" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", currencySymbol: "€", language: "German", languageCode: "de", region: "Europe" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", currency: "THB", currencySymbol: "฿", language: "Thai", languageCode: "th", region: "Asia" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", currencySymbol: "¥", language: "Japanese", languageCode: "ja", region: "Asia" },
  { code: "GR", name: "Greece", flag: "🇬🇷", currency: "EUR", currencySymbol: "€", language: "Greek", languageCode: "el", region: "Europe" },
  { code: "AT", name: "Austria", flag: "🇦🇹", currency: "EUR", currencySymbol: "€", language: "German", languageCode: "de", region: "Europe" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", currencySymbol: "AED", language: "Arabic", languageCode: "ar", region: "Middle East" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", currencySymbol: "CA$", language: "English", languageCode: "en", region: "Americas" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", currencySymbol: "SAR", language: "Arabic", languageCode: "ar", region: "Middle East" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "EUR", currencySymbol: "€", language: "Portuguese", languageCode: "pt", region: "Europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR", currencySymbol: "€", language: "Dutch", languageCode: "nl", region: "Europe" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", currency: "MAD", currencySymbol: "MAD", language: "Arabic", languageCode: "ar", region: "Africa" },
  { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY", currencySymbol: "¥", language: "Chinese", languageCode: "zh", region: "Asia" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", currency: "EUR", currencySymbol: "€", language: "Croatian", languageCode: "hr", region: "Europe" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", currency: "HUF", currencySymbol: "Ft", language: "Hungarian", languageCode: "hu", region: "Europe" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currency: "DKK", currencySymbol: "kr", language: "Danish", languageCode: "da", region: "Europe" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", currency: "CZK", currencySymbol: "Kč", language: "Czech", languageCode: "cs", region: "Europe" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", currency: "EUR", currencySymbol: "€", language: "French", languageCode: "fr", region: "Europe" },
  { code: "PL", name: "Poland", flag: "🇵🇱", currency: "PLN", currencySymbol: "zł", language: "Polish", languageCode: "pl", region: "Europe" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW", currencySymbol: "₩", language: "Korean", languageCode: "ko", region: "Asia" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", currencySymbol: "₹", language: "Hindi", languageCode: "hi", region: "Asia" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "CHF", currencySymbol: "CHF", language: "German", languageCode: "de", region: "Europe" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", currencySymbol: "S$", language: "English", languageCode: "en", region: "Asia" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", currency: "MYR", currencySymbol: "RM", language: "Malay", languageCode: "ms", region: "Asia" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", currency: "VND", currencySymbol: "₫", language: "Vietnamese", languageCode: "vi", region: "Asia" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", currency: "IDR", currencySymbol: "Rp", language: "Indonesian", languageCode: "id", region: "Asia" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currency: "EUR", currencySymbol: "€", language: "English", languageCode: "en", region: "Europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK", currencySymbol: "kr", language: "Swedish", languageCode: "sv", region: "Europe" },
  { code: "NO", name: "Norway", flag: "🇳🇴", currency: "NOK", currencySymbol: "kr", language: "Norwegian", languageCode: "no", region: "Europe" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$", language: "English", languageCode: "en", region: "Oceania" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", currency: "EGP", currencySymbol: "E£", language: "Arabic", languageCode: "ar", region: "Africa" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", currency: "ARS", currencySymbol: "AR$", language: "Spanish", languageCode: "es", region: "Americas" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", currency: "QAR", currencySymbol: "QR", language: "Arabic", languageCode: "ar", region: "Middle East" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "PHP", currencySymbol: "₱", language: "Filipino", languageCode: "fil", region: "Asia" },
  { code: "RO", name: "Romania", flag: "🇷🇴", currency: "RON", currencySymbol: "lei", language: "Romanian", languageCode: "ro", region: "Europe" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", currency: "BGN", currencySymbol: "лв", language: "Bulgarian", languageCode: "bg", region: "Europe" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", currency: "JOD", currencySymbol: "JD", language: "Arabic", languageCode: "ar", region: "Middle East" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", currency: "BHD", currencySymbol: "BD", language: "Arabic", languageCode: "ar", region: "Middle East" },
  { code: "OM", name: "Oman", flag: "🇴🇲", currency: "OMR", currencySymbol: "OMR", language: "Arabic", languageCode: "ar", region: "Middle East" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", currency: "NZD", currencySymbol: "NZ$", language: "English", languageCode: "en", region: "Oceania" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", currency: "KWD", currencySymbol: "KD", language: "Arabic", languageCode: "ar", region: "Middle East" },
  { code: "FI", name: "Finland", flag: "🇫🇮", currency: "EUR", currencySymbol: "€", language: "Finnish", languageCode: "fi", region: "Europe" },
  { code: "IS", name: "Iceland", flag: "🇮🇸", currency: "ISK", currencySymbol: "kr", language: "Icelandic", languageCode: "is", region: "Europe" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", currency: "EUR", currencySymbol: "€", language: "French", languageCode: "fr", region: "Europe" },
];

export default COUNTRIES;

export function getCountryByCode(code) {
  return COUNTRIES.find(c => c.code === code);
}

export function getUniqueLanguages() {
  const langs = [...new Set(COUNTRIES.map(c => JSON.stringify({ name: c.language, code: c.languageCode })))];
  return langs.map(l => JSON.parse(l));
}

export function getUniqueCurrencies() {
  const currencies = [...new Set(COUNTRIES.map(c => JSON.stringify({ code: c.currency, symbol: c.currencySymbol })))];
  return currencies.map(c => JSON.parse(c));
}