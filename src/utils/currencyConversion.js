// Fixed exchange rates against USD (approximate, updated periodically)
// Format: { currency_code, symbol, rate (1 USD = X local) }
export const COUNTRY_CURRENCY = {
  // GCC / Middle East
  'Saudi Arabia':        { code: 'SAR', symbol: 'SAR', rate: 3.75 },
  'United Arab Emirates':{ code: 'AED', symbol: 'AED', rate: 3.67 },
  'Kuwait':              { code: 'KWD', symbol: 'KWD', rate: 0.31 },
  'Qatar':               { code: 'QAR', symbol: 'QAR', rate: 3.64 },
  'Bahrain':             { code: 'BHD', symbol: 'BHD', rate: 0.38 },
  'Oman':                { code: 'OMR', symbol: 'OMR', rate: 0.38 },
  'Jordan':              { code: 'JOD', symbol: 'JOD', rate: 0.71 },
  'Lebanon':             { code: 'LBP', symbol: 'LBP', rate: 89500 },
  'Egypt':               { code: 'EGP', symbol: 'EGP', rate: 49.0 },
  'Turkey':              { code: 'TRY', symbol: '₺',   rate: 32.5 },

  // South & Southeast Asia
  'India':               { code: 'INR', symbol: '₹',   rate: 83.5 },
  'Pakistan':            { code: 'PKR', symbol: '₨',   rate: 278.0 },
  'Bangladesh':          { code: 'BDT', symbol: '৳',   rate: 110.0 },
  'Sri Lanka':           { code: 'LKR', symbol: 'Rs',  rate: 300.0 },
  'Nepal':               { code: 'NPR', symbol: '₨',   rate: 133.0 },
  'Malaysia':            { code: 'MYR', symbol: 'RM',  rate: 4.72 },
  'Indonesia':           { code: 'IDR', symbol: 'Rp',  rate: 15800.0 },
  'Philippines':         { code: 'PHP', symbol: '₱',   rate: 57.5 },
  'Thailand':            { code: 'THB', symbol: '฿',   rate: 35.5 },
  'Vietnam':             { code: 'VND', symbol: '₫',   rate: 24500.0 },
  'Singapore':           { code: 'SGD', symbol: 'S$',  rate: 1.35 },
  'Myanmar':             { code: 'MMK', symbol: 'K',   rate: 2100.0 },
  'Cambodia':            { code: 'KHR', symbol: '៛',   rate: 4100.0 },

  // East Asia
  'China':               { code: 'CNY', symbol: '¥',   rate: 7.25 },
  'Japan':               { code: 'JPY', symbol: '¥',   rate: 150.0 },
  'South Korea':         { code: 'KRW', symbol: '₩',   rate: 1340.0 },
  'Taiwan':              { code: 'TWD', symbol: 'NT$', rate: 32.0 },
  'Hong Kong':           { code: 'HKD', symbol: 'HK$', rate: 7.82 },

  // Europe
  'United Kingdom':      { code: 'GBP', symbol: '£',   rate: 0.79 },
  'Germany':             { code: 'EUR', symbol: '€',   rate: 0.92 },
  'France':              { code: 'EUR', symbol: '€',   rate: 0.92 },
  'Italy':               { code: 'EUR', symbol: '€',   rate: 0.92 },
  'Spain':               { code: 'EUR', symbol: '€',   rate: 0.92 },
  'Netherlands':         { code: 'EUR', symbol: '€',   rate: 0.92 },
  'Sweden':              { code: 'SEK', symbol: 'kr',  rate: 10.5 },
  'Norway':              { code: 'NOK', symbol: 'kr',  rate: 10.7 },
  'Switzerland':         { code: 'CHF', symbol: 'CHF', rate: 0.90 },
  'Russia':              { code: 'RUB', symbol: '₽',   rate: 92.0 },

  // Americas
  'United States':       { code: 'USD', symbol: '$',   rate: 1.0 },
  'Canada':              { code: 'CAD', symbol: 'C$',  rate: 1.37 },
  'Brazil':              { code: 'BRL', symbol: 'R$',  rate: 5.05 },
  'Mexico':              { code: 'MXN', symbol: 'MX$', rate: 17.2 },
  'Argentina':           { code: 'ARS', symbol: '$',   rate: 870.0 },

  // Africa
  'South Africa':        { code: 'ZAR', symbol: 'R',   rate: 18.8 },
  'Nigeria':             { code: 'NGN', symbol: '₦',   rate: 1500.0 },
  'Kenya':               { code: 'KES', symbol: 'KSh', rate: 129.0 },
  'Ethiopia':            { code: 'ETB', symbol: 'Br',  rate: 57.0 },

  // Oceania
  'Australia':           { code: 'AUD', symbol: 'A$',  rate: 1.55 },
  'New Zealand':         { code: 'NZD', symbol: 'NZ$', rate: 1.63 },
};

/**
 * Convert a USD amount to the local currency of a country.
 * Returns a formatted string like "AED 183" or null if unknown.
 */
export function convertToLocalCurrency(usdAmount, country) {
  const curr = COUNTRY_CURRENCY[country];
  if (!curr || curr.code === 'USD') return null;
  const converted = usdAmount * curr.rate;
  // Format nicely based on magnitude
  const formatted = converted >= 1000
    ? Math.round(converted).toLocaleString()
    : converted < 10
    ? converted.toFixed(2)
    : Math.round(converted).toString();
  return `${curr.symbol} ${formatted}`;
}