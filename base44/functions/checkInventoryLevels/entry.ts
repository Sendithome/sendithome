import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Inline tier logic (no local imports allowed)
function getInventoryTier(rooms) {
  const r = parseInt(rooms) || 0;
  if (r <= 299) return { tier: 1, allocated: 20, reorderAt: 15, replenishQty: 5 };
  if (r <= 399) return { tier: 2, allocated: 30, reorderAt: 25, replenishQty: 5 };
  if (r <= 499) return { tier: 3, allocated: 40, reorderAt: 35, replenishQty: 5 };
  if (r <= 799) return { tier: 4, allocated: 50, reorderAt: 45, replenishQty: 5 };
  return { tier: 5, allocated: 60, reorderAt: 50, replenishQty: 10 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled job — use service role
    const inventories = await base44.asServiceRole.entities.HotelInventory.list('-created_date', 1000);

    const triggered = [];
    const now = new Date().toISOString();

    for (const inv of inventories) {
      const tier = getInventoryTier(inv.number_of_rooms);
      const reorderAt = tier.reorderAt;
      const replenishQty = tier.replenishQty;
      const updates = {};

      // Check 10kg
      if ((inv.current_10kg ?? 0) <= reorderAt && inv.status_10kg !== 'replenishment_in_progress') {
        await base44.asServiceRole.entities.ReplenishmentOrder.create({
          hotel_id: inv.hotel_id,
          hotel_name: inv.hotel_name,
          box_type: '10kg',
          quantity_requested: replenishQty,
          status: 'pending',
          triggered_at: now,
          trigger_level_at_time: reorderAt,
          stock_at_trigger: inv.current_10kg ?? 0,
        });
        updates.status_10kg = 'replenishment_in_progress';
        triggered.push({ hotel: inv.hotel_name, type: '10kg', stock: inv.current_10kg ?? 0 });
      }

      // Check 20kg
      if ((inv.current_20kg ?? 0) <= reorderAt && inv.status_20kg !== 'replenishment_in_progress') {
        await base44.asServiceRole.entities.ReplenishmentOrder.create({
          hotel_id: inv.hotel_id,
          hotel_name: inv.hotel_name,
          box_type: '20kg',
          quantity_requested: replenishQty,
          status: 'pending',
          triggered_at: now,
          trigger_level_at_time: reorderAt,
          stock_at_trigger: inv.current_20kg ?? 0,
        });
        updates.status_20kg = 'replenishment_in_progress';
        triggered.push({ hotel: inv.hotel_name, type: '20kg', stock: inv.current_20kg ?? 0 });
      }

      if (Object.keys(updates).length > 0) {
        updates.last_updated = now;
        await base44.asServiceRole.entities.HotelInventory.update(inv.id, updates);
      }
    }

    return Response.json({
      checked: inventories.length,
      triggered: triggered.length,
      details: triggered,
      timestamp: now,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});