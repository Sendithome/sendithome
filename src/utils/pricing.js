const GCC_MIDDLE_EAST = [
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait',
  'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Egypt', 'Turkey',
  'Iraq', 'Syria', 'Yemen', 'Palestine', 'Israel', 'Iran',
];

export function getShippingPrice(country) {
  if (!country) return null;
  return GCC_MIDDLE_EAST.includes(country) ? 60 : 90;
}

export function getPricingTierLabel(price) {
  return price === 60 ? 'Middle East & GCC' : 'International';
}