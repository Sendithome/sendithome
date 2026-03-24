// Shipping price tiers based on destination region
const PRICING_TIERS = {
  // Tier 1 — $60 (GCC / Middle East)
  'United Arab Emirates': 60,
  'Saudi Arabia': 60,
  'Qatar': 60,
  'Kuwait': 60,
  'Bahrain': 60,
  'Oman': 60,
  'Jordan': 65,
  'Lebanon': 65,
  'Egypt': 65,
  'Turkey': 65,

  // Tier 2 — $70 (Europe)
  'United Kingdom': 70,
  'Germany': 70,
  'France': 70,
  'Italy': 70,
  'Spain': 70,
  'Netherlands': 70,
  'Belgium': 70,
  'Switzerland': 70,
  'Austria': 70,
  'Sweden': 70,
  'Norway': 70,
  'Denmark': 70,
  'Finland': 70,
  'Poland': 70,
  'Portugal': 70,
  'Greece': 70,
  'Czech Republic': 70,
  'Hungary': 70,
  'Romania': 70,
  'Ireland': 70,
  'Luxembourg': 70,

  // Tier 3 — $80 (Asia-Pacific)
  'India': 75,
  'Pakistan': 75,
  'Bangladesh': 75,
  'Sri Lanka': 75,
  'Nepal': 75,
  'China': 80,
  'Japan': 80,
  'South Korea': 80,
  'Singapore': 75,
  'Malaysia': 75,
  'Thailand': 75,
  'Indonesia': 80,
  'Philippines': 80,
  'Vietnam': 80,
  'Hong Kong': 75,
  'Taiwan': 80,
  'Australia': 80,
  'New Zealand': 85,

  // Tier 4 — $85-90 (Americas & Africa)
  'United States': 85,
  'Canada': 85,
  'Mexico': 85,
  'Brazil': 90,
  'Argentina': 90,
  'Colombia': 90,
  'Chile': 90,
  'South Africa': 85,
  'Nigeria': 85,
  'Kenya': 85,
  'Ghana': 85,
  'Ethiopia': 90,
  'Tanzania': 90,
};

export function getShippingPrice(country) {
  if (!country) return null;
  return PRICING_TIERS[country] || 85; // Default $85 for unlisted countries
}

export function getPricingTierLabel(price) {
  if (price <= 65) return 'Middle East & North Africa';
  if (price <= 70) return 'Europe';
  if (price <= 80) return 'Asia-Pacific';
  return 'Americas & Africa';
}