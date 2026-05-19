import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Called by automation when a RetailerVerification is approved.
 * Checks if ALL verifications for the order are approved.
 * If yes — consolidates all items, generates a unified customs ref,
 * and updates the Order to multi_retailer_status: "consolidated".
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // This can be called by automation (no user auth) or admin
  const body = await req.json();
  // Support both direct call ({ order_id }) and automation payload ({ data: { order_id } })
  const order_id = body.order_id || body.data?.order_id;
  const verification_id = body.verification_id || body.event?.entity_id;

  if (!order_id) return Response.json({ error: 'order_id required' }, { status: 400 });

  const [order, allVerifications] = await Promise.all([
    base44.asServiceRole.entities.Order.get(order_id),
    base44.asServiceRole.entities.RetailerVerification.filter({ order_id }),
  ]);

  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
  if (allVerifications.length === 0) return Response.json({ skipped: true, reason: 'No verifications found' });

  const approvedVerifications = allVerifications.filter(v => v.status === 'approved');
  const pendingVerifications = allVerifications.filter(v => v.status === 'pending' || v.status === 'queried');

  // Update the approved count on the order
  await base44.asServiceRole.entities.Order.update(order_id, {
    retailer_verifications_approved: approvedVerifications.length,
  });

  // Not all approved yet — just update count and return
  if (pendingVerifications.length > 0) {
    return Response.json({
      skipped: true,
      reason: `${pendingVerifications.length} verification(s) still pending`,
      approved: approvedVerifications.length,
      total: allVerifications.length,
    });
  }

  // All approved — consolidate!
  const consolidatedItems = [];
  let totalValue = 0;

  for (const v of approvedVerifications) {
    for (const item of (v.items || [])) {
      consolidatedItems.push({
        description: item.description,
        category: item.category,
        store_name: v.store_name || '',
        retailer_id: v.retailer_id,
        price: item.price || 0,
        eligible: true,
      });
      totalValue += item.price || 0;
    }
  }

  const customsRef = `GCLEAR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;

  await base44.asServiceRole.entities.Order.update(order_id, {
    multi_retailer_status: 'consolidated',
    consolidated_at: new Date().toISOString(),
    consolidated_items: consolidatedItems,
    consolidated_total_value: totalValue,
    consolidated_customs_ref: customsRef,
    retailer_verifications_approved: approvedVerifications.length,
  });

  return Response.json({
    success: true,
    consolidated: true,
    shipment_id: order.shipment_id,
    customs_ref: customsRef,
    total_items: consolidatedItems.length,
    total_value: totalValue,
    retailers_count: approvedVerifications.length,
  });
});