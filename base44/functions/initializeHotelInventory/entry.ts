import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function getInventoryTier(rooms) {
  const r = parseInt(rooms) || 0;
  if (r <= 299) return { tier: 1, allocated: 20, reorderAt: 10 };
  if (r <= 399) return { tier: 2, allocated: 30, reorderAt: 20 };
  if (r <= 499) return { tier: 3, allocated: 40, reorderAt: 30 };
  if (r <= 799) return { tier: 4, allocated: 50, reorderAt: 40 };
  return { tier: 5, allocated: 60, reorderAt: 50 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Triggered by entity automation on HotelOnboardingStatus update
    const statusData = body.data;
    if (!statusData || statusData.logistics_stage !== 'fully_onboarded') {
      return Response.json({ skipped: true, reason: 'not fully_onboarded' });
    }

    const hotel_id = statusData.hotel_id;
    if (!hotel_id) {
      return Response.json({ skipped: true, reason: 'no hotel_id' });
    }

    // Check if inventory already initialized
    const existing = await base44.asServiceRole.entities.HotelInventory.filter({ hotel_id });
    if (existing.length > 0) {
      return Response.json({ skipped: true, reason: 'inventory already exists' });
    }

    // Get hotel details for room count
    let number_of_rooms = 0;
    let hotel_name = statusData.hotel_name || '';
    try {
      const hotelRecords = await base44.asServiceRole.entities.Hotel.filter({ id: hotel_id });
      if (hotelRecords.length > 0) {
        number_of_rooms = hotelRecords[0].number_of_rooms || 0;
        hotel_name = hotelRecords[0].name || hotel_name;
      }
    } catch (e) {
      // Use defaults
    }

    const tier = getInventoryTier(number_of_rooms);

    await base44.asServiceRole.entities.HotelInventory.create({
      hotel_id,
      hotel_name,
      number_of_rooms,
      tier: tier.tier,
      allocated_10kg: tier.allocated,
      allocated_20kg: tier.allocated,
      current_10kg: tier.allocated,
      current_20kg: tier.allocated,
      reorder_trigger_level: tier.reorderAt,
      status_10kg: 'ok',
      status_20kg: 'ok',
      last_updated: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      hotel: hotel_name,
      tier: tier.tier,
      allocated: tier.allocated,
      reorderAt: tier.reorderAt,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});