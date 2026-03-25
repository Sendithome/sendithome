// Country-specific shipping restrictions for all 50 countries
export const COUNTRY_RESTRICTIONS = {
  // ── GCC / Middle East ──────────────────────────────────────
  'Saudi Arabia': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'whiskey', 'vodka', 'pork', 'pig skin', 'gambling', 'lottery', 'adult content', 'nude', 'lingerie', 'bible', 'torah', 'cross', 'religious figurine', 'idol', 'drugs', 'narcotics'],
    note: 'Saudi Arabia bans alcohol, pork products, non-Islamic religious items, gambling items, adult/obscene content, and narcotics.',
  },
  'United Arab Emirates': {
    banned_keywords: ['alcohol', 'pork', 'gambling', 'adult content', 'nude', 'drugs', 'narcotics', 'counterfeit'],
    note: 'UAE bans alcohol (without permit), pork, gambling items, adult/obscene content, narcotics, and counterfeit goods.',
  },
  'Kuwait': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult content', 'nude', 'drugs'],
    note: 'Kuwait bans alcohol, pork, gambling items, adult/obscene content, and narcotics.',
  },
  'Qatar': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult content', 'nude', 'drugs'],
    note: 'Qatar bans alcohol, pork, gambling items, adult/obscene content, and narcotics.',
  },
  'Bahrain': {
    banned_keywords: ['pork', 'gambling', 'adult content', 'nude', 'drugs', 'narcotics'],
    note: 'Bahrain bans pork, gambling items, adult/obscene content, and narcotics.',
  },
  'Oman': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult content', 'drugs'],
    note: 'Oman bans alcohol, pork, gambling items, adult/obscene content, and narcotics.',
  },
  'Jordan': {
    banned_keywords: ['drugs', 'narcotics', 'adult content', 'counterfeit', 'gambling'],
    note: 'Jordan bans narcotics, adult/obscene content, counterfeit goods, and gambling items.',
  },
  'Lebanon': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'gambling', 'adult content'],
    note: 'Lebanon bans narcotics, counterfeit goods, gambling items, and adult/obscene content.',
  },
  'Egypt': {
    banned_keywords: ['drugs', 'narcotics', 'adult content', 'gambling', 'counterfeit', 'alcohol', 'pork'],
    note: 'Egypt bans narcotics, adult content, gambling items, counterfeit goods, and restricts alcohol and pork.',
  },
  'Turkey': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'gambling', 'adult content'],
    note: 'Turkey bans narcotics, counterfeit goods, gambling items, and adult content.',
  },

  // ── South & Southeast Asia ────────────────────────────────
  'India': {
    banned_keywords: ['beef', 'cow leather', 'cow products', 'drugs', 'narcotics', 'satellite phone', 'gambling', 'counterfeit', 'adult content'],
    note: 'India restricts beef and cow-derived products, narcotics, satellite phones, gambling items, counterfeit goods, and adult content.',
  },
  'Pakistan': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult content', 'nude', 'drugs', 'narcotics', 'religious figurine'],
    note: 'Pakistan bans alcohol, pork, gambling items, adult/obscene content, narcotics, and items offensive to Islamic faith.',
  },
  'Bangladesh': {
    banned_keywords: ['alcohol', 'wine', 'beer', 'spirits', 'pork', 'gambling', 'adult content', 'drugs'],
    note: 'Bangladesh bans alcohol, pork, gambling items, adult content, and narcotics.',
  },
  'Sri Lanka': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit'],
    note: 'Sri Lanka bans narcotics, gambling items, adult content, and counterfeit goods.',
  },
  'Nepal': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'beef'],
    note: 'Nepal (Hindu kingdom) restricts beef products, narcotics, gambling items, and adult content.',
  },
  'Malaysia': {
    banned_keywords: ['alcohol', 'pork', 'gambling', 'adult content', 'drugs', 'narcotics', 'counterfeit'],
    note: 'Malaysia restricts alcohol, pork, gambling items, adult content, narcotics, and counterfeit goods.',
  },
  'Indonesia': {
    banned_keywords: ['alcohol', 'pork', 'gambling', 'adult content', 'drugs', 'narcotics', 'counterfeit'],
    note: 'Indonesia bans alcohol, pork, gambling items, adult content, narcotics, and counterfeit goods.',
  },
  'Philippines': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'firearms'],
    note: 'Philippines bans narcotics, gambling items, adult content, counterfeit goods, and firearms.',
  },
  'Thailand': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'buddha image', 'sacred image'],
    note: 'Thailand bans narcotics, gambling items, adult content, counterfeit goods, and reproduction of sacred Buddhist images.',
  },
  'Vietnam': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'political material'],
    note: 'Vietnam bans narcotics, gambling items, adult content, counterfeit goods, and politically sensitive materials.',
  },
  'Singapore': {
    banned_keywords: ['drugs', 'narcotics', 'chewing gum', 'gambling', 'adult content', 'counterfeit', 'fireworks'],
    note: 'Singapore bans narcotics, chewing gum, gambling items, adult content, counterfeit goods, and fireworks.',
  },
  'Myanmar': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'political material'],
    note: 'Myanmar bans narcotics, gambling items, adult content, counterfeit goods, and politically sensitive materials.',
  },
  'Cambodia': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'antiques'],
    note: 'Cambodia bans narcotics, gambling items, adult content, counterfeit goods, and cultural antiques.',
  },

  // ── East Asia ─────────────────────────────────────────────
  'China': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'political material', 'drone', 'satellite phone', 'encrypted device'],
    note: 'China bans narcotics, gambling items, adult content, counterfeit goods, politically sensitive materials, and restricts certain electronics like drones and satellite phones.',
  },
  'Japan': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'firearms', 'stimulants'],
    note: 'Japan bans narcotics, stimulants, gambling items, adult content, counterfeit goods, and firearms.',
  },
  'South Korea': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'firearms'],
    note: 'South Korea bans narcotics, gambling items, adult content, counterfeit goods, and firearms.',
  },
  'Taiwan': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'firearms'],
    note: 'Taiwan bans narcotics, gambling items, adult content, counterfeit goods, and firearms.',
  },
  'Hong Kong': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'adult content', 'counterfeit', 'firearms', 'endangered species'],
    note: 'Hong Kong bans narcotics, gambling items, adult content, counterfeit goods, firearms, and products from endangered species.',
  },

  // ── Europe ────────────────────────────────────────────────
  'United Kingdom': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'ivory', 'fur', 'offensive weapon'],
    note: 'UK bans narcotics, counterfeit goods, firearms, products from endangered species (ivory, fur), and offensive weapons.',
  },
  'Germany': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'nazi symbols', 'hate speech', 'endangered species'],
    note: 'Germany bans narcotics, counterfeit goods, firearms, Nazi symbols/hate speech items, and products from endangered species.',
  },
  'France': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'ivory', 'fur'],
    note: 'France bans narcotics, counterfeit goods, firearms, and products from endangered species (ivory, fur).',
  },
  'Italy': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'ivory'],
    note: 'Italy bans narcotics, counterfeit goods, firearms, and products from endangered species.',
  },
  'Spain': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species'],
    note: 'Spain bans narcotics, counterfeit goods, firearms, and products from endangered species.',
  },
  'Netherlands': {
    banned_keywords: ['narcotics', 'hard drugs', 'counterfeit', 'firearms', 'endangered species'],
    note: 'Netherlands bans hard narcotics, counterfeit goods, firearms, and products from endangered species.',
  },
  'Sweden': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species'],
    note: 'Sweden bans narcotics, counterfeit goods, firearms, and products from endangered species.',
  },
  'Norway': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'alcohol in excess'],
    note: 'Norway bans narcotics, counterfeit goods, firearms, products from endangered species, and restricts alcohol quantities.',
  },
  'Switzerland': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species'],
    note: 'Switzerland bans narcotics, counterfeit goods, firearms, and products from endangered species.',
  },
  'Russia': {
    banned_keywords: ['drugs', 'narcotics', 'gambling', 'counterfeit', 'firearms', 'political material', 'encrypted device'],
    note: 'Russia bans narcotics, gambling items, counterfeit goods, firearms, politically sensitive materials, and certain encrypted devices.',
  },

  // ── Americas ──────────────────────────────────────────────
  'United States': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'ivory', 'fur', 'cuban cigars', 'soil', 'plant'],
    note: 'USA bans narcotics, counterfeit goods, firearms, products from endangered species (ivory, fur), Cuban cigars, and agricultural items (soil, live plants).',
  },
  'Canada': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'ivory', 'fur', 'soil', 'plant'],
    note: 'Canada bans narcotics, counterfeit goods, firearms, products from endangered species, and certain agricultural items.',
  },
  'Brazil': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'drone without registration'],
    note: 'Brazil bans narcotics, counterfeit goods, firearms, products from endangered species, and unregistered drones.',
  },
  'Mexico': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species'],
    note: 'Mexico bans narcotics, counterfeit goods, firearms, and products from endangered species.',
  },
  'Argentina': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species'],
    note: 'Argentina bans narcotics, counterfeit goods, firearms, and products from endangered species.',
  },

  // ── Africa ────────────────────────────────────────────────
  'South Africa': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'endangered species', 'ivory', 'rhino horn'],
    note: 'South Africa bans narcotics, counterfeit goods, firearms, and products from endangered species (especially ivory and rhino horn).',
  },
  'Nigeria': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'gambling', 'adult content'],
    note: 'Nigeria bans narcotics, counterfeit goods, firearms, gambling items, and adult content.',
  },
  'Kenya': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'gambling', 'ivory', 'wildlife products'],
    note: 'Kenya bans narcotics, counterfeit goods, firearms, gambling items, ivory, and wildlife products.',
  },
  'Ethiopia': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'gambling', 'adult content'],
    note: 'Ethiopia bans narcotics, counterfeit goods, firearms, gambling items, and adult content.',
  },

  // ── Oceania ───────────────────────────────────────────────
  'Australia': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'ivory', 'fur', 'wildlife products', 'animal skin', 'feather', 'horn', 'seed', 'plant', 'soil', 'food without declaration'],
    note: 'Australia has extremely strict biosecurity laws — bans narcotics, counterfeit goods, firearms, wildlife products (ivory, fur, skins, feathers, horns), and all plant/food materials without declaration.',
  },
  'New Zealand': {
    banned_keywords: ['drugs', 'narcotics', 'counterfeit', 'firearms', 'ivory', 'fur', 'wildlife products', 'animal skin', 'feather', 'horn', 'seed', 'plant', 'soil', 'food'],
    note: 'New Zealand has extremely strict biosecurity laws — bans narcotics, counterfeit goods, firearms, all wildlife products, and plant/food materials.',
  },
};

export function getCountryRestrictions(country) {
  if (!country) return null;
  return (
    COUNTRY_RESTRICTIONS[country] ||
    Object.entries(COUNTRY_RESTRICTIONS).find(
      ([k]) => k.toLowerCase() === country?.toLowerCase()
    )?.[1] ||
    null
  );
}

export function buildRestrictionPrompt(country) {
  const r = getCountryRestrictions(country);
  if (!r) return '';
  return `\n\nCRITICAL — DESTINATION COUNTRY RESTRICTIONS for ${country}: ${r.note}\nIf ANY item's name, description, or material matches these banned keywords [${r.banned_keywords.join(', ')}], you MUST mark it eligible: false and set ineligible_reason to clearly explain it is RESTRICTED/BANNED for shipment to ${country} by customs law.`;
}