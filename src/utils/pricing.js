// Flat $50 total platform fee (split: $30 paid online + $20 charged to hotel bill)
export const PLATFORM_FEE_TOTAL = 50;
export const PLATFORM_FEE_ONLINE = 30;
export const PLATFORM_FEE_HOTEL = 20;

export function getShippingPrice() {
  return PLATFORM_FEE_TOTAL;
}

export function getPricingTierLabel() {
  return 'All Countries';
}