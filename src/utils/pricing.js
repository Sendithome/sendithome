const GCC_MIDDLE_EAST = [
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait',
  'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Egypt', 'Turkey',
  'Iraq', 'Syria', 'Yemen', 'Palestine', 'Israel', 'Iran',
];

// India is $60, GCC/Middle East is $60, all others are $90
export function getShippingPrice(country) {
  if (!country) return null;
  if (country === 'India') return 60;
  return GCC_MIDDLE_EAST.includes(country) ? 60 : 90;
}

export function getPricingTierLabel(price) {
  return price === 60 ? 'Middle East, GCC & India' : 'International';
}