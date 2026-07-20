// Checkout & Activation pricing model
// US$150 paid online at checkout — includes the current shipment,
// Premium Global Membership (valid through Dec 31, 2029), and US$3,000 shipping insurance.
// A separate US$20 concierge fee is charged to the hotel room bill.
// Returning members ship any 10kg/20kg box for US$75 at participating destinations.
export const CHECKOUT_TOTAL = 150;
export const HOTEL_CONCIERGE_FEE = 20;
export const FUTURE_MEMBER_RATE = 75;
export const INSURANCE_COVERAGE = 3000;
export const MEMBERSHIP_VALID_UNTIL = 'Dec 31, 2029';

// Legacy aliases (kept for any existing imports)
export const PLATFORM_FEE_TOTAL = CHECKOUT_TOTAL;
export const PLATFORM_FEE_ONLINE = CHECKOUT_TOTAL;
export const PLATFORM_FEE_HOTEL = HOTEL_CONCIERGE_FEE;

export function getShippingPrice() {
  return CHECKOUT_TOTAL;
}

export function getPricingTierLabel() {
  return 'All Countries';
}