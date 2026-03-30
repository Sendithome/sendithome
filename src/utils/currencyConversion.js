// Country → ISO currency code mapping
const COUNTRY_CURRENCY = {
  // Middle East & GCC
  'United Arab Emirates': { code: 'AED', symbol: 'AED' },
  'Saudi Arabia': { code: 'SAR', symbol: 'SAR' },
  'Qatar': { code: 'QAR', symbol: 'QAR' },
  'Kuwait': { code: 'KWD', symbol: 'KWD' },
  'Bahrain': { code: 'BHD', symbol: 'BHD' },
  'Oman': { code: 'OMR', symbol: 'OMR' },
  'Jordan': { code: 'JOD', symbol: 'JOD' },
  'Lebanon': { code: 'LBP', symbol: 'LBP' },
  'Egypt': { code: 'EGP', symbol: 'EGP' },
  'Turkey': { code: 'TRY', symbol: '₺' },
  'Iraq': { code: 'IQD', symbol: 'IQD' },
  'Israel': { code: 'ILS', symbol: '₪' },
  // Asia
  'India': { code: 'INR', symbol: '₹' },
  'Pakistan': { code: 'PKR', symbol: '₨' },
  'Bangladesh': { code: 'BDT', symbol: '৳' },
  'Philippines': { code: 'PHP', symbol: '₱' },
  'China': { code: 'CNY', symbol: '¥' },
  'Japan': { code: 'JPY', symbol: '¥' },
  'Singapore': { code: 'SGD', symbol: 'S$' },
  'Malaysia': { code: 'MYR', symbol: 'RM' },
  'Thailand': { code: 'THB', symbol: '฿' },
  'Indonesia': { code: 'IDR', symbol: 'Rp' },
  'South Korea': { code: 'KRW', symbol: '₩' },
  'Sri Lanka': { code: 'LKR', symbol: 'LKR' },
  'Nepal': { code: 'NPR', symbol: 'NPR' },
  // Europe
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'Germany': { code: 'EUR', symbol: '€' },
  'France': { code: 'EUR', symbol: '€' },
  'Italy': { code: 'EUR', symbol: '€' },
  'Spain': { code: 'EUR', symbol: '€' },
  'Netherlands': { code: 'EUR', symbol: '€' },
  'Sweden': { code: 'SEK', symbol: 'kr' },
  'Norway': { code: 'NOK', symbol: 'kr' },
  'Switzerland': { code: 'CHF', symbol: 'CHF' },
  'Russia': { code: 'RUB', symbol: '₽' },
  'Poland': { code: 'PLN', symbol: 'zł' },
  'Ukraine': { code: 'UAH', symbol: '₴' },
  // Americas
  'United States': { code: 'USD', symbol: '$' },
  'Canada': { code: 'CAD', symbol: 'CA$' },
  'Brazil': { code: 'BRL', symbol: 'R$' },
  'Mexico': { code: 'MXN', symbol: 'MX$' },
  'Argentina': { code: 'ARS', symbol: 'ARS' },
  'Colombia': { code: 'COP', symbol: 'COP' },
  // Africa
  'South Africa': { code: 'ZAR', symbol: 'R' },
  'Nigeria': { code: 'NGN', symbol: '₦' },
  'Kenya': { code: 'KES', symbol: 'KSh' },
  'Ghana': { code: 'GHS', symbol: 'GH₵' },
  'Ethiopia': { code: 'ETB', symbol: 'ETB' },
  // Oceania
  'Australia': { code: 'AUD', symbol: 'A$' },
  'New Zealand': { code: 'NZD', symbol: 'NZ$' },
};

// Module-level cache for live rates (USD base)
let cachedRates = null;
let fetchPromise = null;

export async function initCurrencyRates() {
  if (cachedRates) return cachedRates;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('https://open.er-api.com/v6/latest/USD')
    .then(r => r.json())
    .then(data => {
      if (data && data.rates) {
        cachedRates = data.rates;
      }
      return cachedRates;
    })
    .catch(() => null);

  return fetchPromise;
}

export function convertToLocalCurrency(usdAmount, country) {
  if (!usdAmount || !country) return null;
  const currencyInfo = COUNTRY_CURRENCY[country];
  if (!currencyInfo) return null;
  if (currencyInfo.code === 'USD') return null;

  // Use live rates if available, else return null (will show once loaded)
  const rate = cachedRates?.[currencyInfo.code];
  if (!rate) return null;

  const converted = usdAmount * rate;
  const formatted = converted >= 1000
    ? converted.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : converted.toFixed(2);

  return `${currencyInfo.symbol} ${formatted}`;
}