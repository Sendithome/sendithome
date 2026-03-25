// Country-specific shipping restrictions
// Items/categories that cannot be shipped TO these countries even if generally eligible
export const COUNTRY_RESTRICTIONS = {
  'Saudi Arabia': {
    banned_categories: [],
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'pig', 'religious figurine', 'cross', 'bible', 'torah', 'idol', 'gambling', 'lottery', 'adult', 'lingerie', 'nude'],
    note: 'Saudi Arabia prohibits alcohol, pork products, religious items of non-Islamic nature, gambling items, and adult content.',
  },
  'Kuwait': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'lottery', 'adult', 'nude'],
    note: 'Kuwait prohibits alcohol, pork, gambling items, and adult content.',
  },
  'Qatar': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult', 'nude'],
    note: 'Qatar prohibits alcohol, pork, gambling items, and adult content.',
  },
  'Bahrain': {
    banned_keywords: ['pork', 'gambling', 'adult', 'nude'],
    note: 'Bahrain prohibits pork, gambling items, and adult content.',
  },
  'Oman': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult'],
    note: 'Oman prohibits alcohol, pork, gambling items, and adult content.',
  },
  'United Arab Emirates': {
    banned_keywords: ['alcohol', 'pork', 'gambling', 'adult', 'nude', 'drugs'],
    note: 'UAE prohibits alcohol (without permit), pork, gambling items, adult content, and narcotics.',
  },
  'India': {
    banned_keywords: ['beef', 'cow leather', 'satellite phone', 'drone'],
    note: 'India restricts beef products and certain electronics like satellite phones.',
  },
  'China': {
    banned_keywords: ['political', 'taiwan independence', 'tibet independence', 'drone', 'satellite'],
    note: 'China restricts politically sensitive materials and certain electronics.',
  },
  'Indonesia': {
    banned_keywords: ['alcohol', 'pork', 'adult', 'gambling'],
    note: 'Indonesia restricts alcohol, pork, adult content, and gambling items.',
  },
  'Pakistan': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult', 'nude', 'religious figurine'],
    note: 'Pakistan prohibits alcohol, pork, gambling items, adult content, and items offensive to Islam.',
  },
  'Bangladesh': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult'],
    note: 'Bangladesh prohibits alcohol, pork, gambling items, and adult content.',
  },
  'Malaysia': {
    banned_keywords: ['alcohol', 'pork', 'gambling', 'adult'],
    note: 'Malaysia restricts alcohol, pork, gambling items, and adult content for Muslim-majority regions.',
  },
  'Brazil': {
    banned_keywords: ['drone', 'satellite phone'],
    note: 'Brazil restricts certain electronics including drones without registration.',
  },
  'Australia': {
    banned_keywords: ['animal skin', 'ivory', 'horn', 'feather', 'fur', 'wildlife'],
    note: 'Australia strictly prohibits wildlife products, ivory, and certain animal-derived items.',
  },
  'New Zealand': {
    banned_keywords: ['animal skin', 'ivory', 'horn', 'feather', 'fur', 'wildlife', 'seed', 'plant'],
    note: 'New Zealand has strict biosecurity — prohibits wildlife products and plant materials.',
  },
};

export function getCountryRestrictions(country) {
  if (!country) return null;
  // Try exact match first, then case-insensitive
  return COUNTRY_RESTRICTIONS[country] ||
    Object.entries(COUNTRY_RESTRICTIONS).find(
      ([k]) => k.toLowerCase() === country.toLowerCase()
    )?.[1] || null;
}

export function buildRestrictionPrompt(country) {
  const r = getCountryRestrictions(country);
  if (!r) return '';
  return `\nIMPORTANT — DESTINATION COUNTRY RESTRICTIONS for ${country}: ${r.note} If any item matches these banned keywords [${r.banned_keywords?.join(', ')}], mark it as eligible: false with ineligible_reason explaining it is restricted for shipment to ${country}.`;
}