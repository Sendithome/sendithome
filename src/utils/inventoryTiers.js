/**
 * Hotel Inventory Tier System
 * Allocates box quantities and reorder levels based on hotel room count
 */

export function getInventoryTier(rooms) {
  const r = parseInt(rooms) || 0;
  if (r <= 299) return { tier: 1, allocated: 20, reorderAt: 15, replenishQty: 5,  label: '0–299 Rooms' };
  if (r <= 399) return { tier: 2, allocated: 30, reorderAt: 25, replenishQty: 5,  label: '300–399 Rooms' };
  if (r <= 499) return { tier: 3, allocated: 40, reorderAt: 35, replenishQty: 5,  label: '400–499 Rooms' };
  if (r <= 799) return { tier: 4, allocated: 50, reorderAt: 45, replenishQty: 5,  label: '500–799 Rooms' };
  return            { tier: 5, allocated: 60, reorderAt: 50, replenishQty: 10, label: '800+ Rooms' };
}

export const TIER_LABELS = {
  1: '0–299 Rooms',
  2: '300–399 Rooms',
  3: '400–499 Rooms',
  4: '500–799 Rooms',
  5: '800+ Rooms',
};

export function getStockStatusColor(current, reorderAt) {
  if (current <= Math.floor(reorderAt * 0.5)) return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-destructive', label: 'Critical' };
  if (current <= reorderAt) return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', label: 'Low Stock' };
  return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'OK' };
}