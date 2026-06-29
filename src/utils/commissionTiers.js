// ─── SEND IT HOME — TIERED COMMISSION STRUCTURE ──────────────────────────────
// Commission is paid by retailers to the government, calculated per store
// transaction/receipt based on the tourist's origin country group and the
// transaction value.
//
// Rules:
//   • Minimum spend: US$1,500 across one or more retailers
//   • Maximum spend: US$20,000 per tourist
//   • 10kg or 20kg box per tourist
//   • Personal shopping only, 3 items per HS code (and/or sub code)
//   • Platform fee is separate ($30 online + $20 hotel bill)

// ─── COUNTRY GROUPS ───────────────────────────────────────────────────────────

// GCC + India, Egypt, Jordan, Russia — preferential tier structure
const PREFERRED_COUNTRIES = [
  // GCC
  'saudi arabia', 'ksa', 'saudi',
  'bahrain',
  'kuwait',
  'qatar',
  'oman',
  'uae', 'united arab emirates', 'emirates',
  // South Asia
  'india', 'indian',
  // North Africa
  'egypt', 'egyptian',
  // Levant
  'jordan', 'jordanian',
  // CIS
  'russia', 'russian federation',
];

// ─── TIER TABLES ──────────────────────────────────────────────────────────────

// Preferred group: GCC, India, Egypt, Jordan, Russia
export const PREFERRED_TIERS = [
  { tier: 1, min: 1,      max: 1999,    rate: 0.10,  label: '10%' },
  { tier: 2, min: 2000,   max: 2999,    rate: 0.075, label: '7.5%' },
  { tier: 3, min: 3000,   max: 3999,    rate: 0.05,  label: '5%' },
  { tier: 4, min: 4000,   max: 4999,    rate: 0.04,  label: '4%' },
  { tier: 5, min: 5000,   max: 5999,    rate: 0.03,  label: '3%' },
  { tier: 6, min: 6000,   max: 7999,    rate: 0.025, label: '2.5%' },
  { tier: 7, min: 8000,   max: 14999,   rate: 0.02,  label: '2%' },
  { tier: 8, min: 15000,  max: 20000,   rate: 0.01,  label: '1%' },
];

// Rest of the World (ROW)
export const ROW_TIERS = [
  { tier: 1, min: 1,      max: 2999,    rate: 0.10,  label: '10%' },
  { tier: 2, min: 3000,   max: 4999,    rate: 0.075, label: '7.5%' },
  { tier: 3, min: 5000,   max: 5999,    rate: 0.05,  label: '5%' },
  { tier: 4, min: 6000,   max: 7999,    rate: 0.04,  label: '4%' },
  { tier: 5, min: 8000,   max: 9999,    rate: 0.03,  label: '3%' },
  { tier: 6, min: 10000,  max: 11999,   rate: 0.025, label: '2.5%' },
  { tier: 7, min: 12000,  max: 20000,   rate: 0.02,  label: '2%' },
];

export const MIN_SPEND = 1500;
export const MAX_SPEND = 20000;

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export function isPreferredCountry(country) {
  if (!country) return false;
  const normalized = country.toLowerCase().trim();
  // Strip flag emojis and common prefixes
  const cleaned = normalized.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim();
  return PREFERRED_COUNTRIES.some(c => cleaned === c || cleaned.includes(c));
}

export function getCountryGroup(country) {
  return isPreferredCountry(country) ? 'preferred' : 'row';
}

export function getCommissionTiers(country) {
  return isPreferredCountry(country) ? PREFERRED_TIERS : ROW_TIERS;
}

export function getCommissionTier(value, country) {
  const tiers = getCommissionTiers(country);
  const v = Math.max(0, value || 0);
  return tiers.find(t => v >= t.min && v <= t.max) || tiers[0];
}

export function getCommissionRate(value, country) {
  return getCommissionTier(value, country).rate;
}

export function getCommissionAmount(value, country) {
  return (value || 0) * getCommissionRate(value, country);
}

export function getCountryGroupLabel(country) {
  return isPreferredCountry(country)
    ? 'Preferred (GCC, India, Egypt, Jordan, Russia)'
    : 'Rest of the World (ROW)';
}