import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Called when a tourist confirms their items to ship.
 * Groups confirmed items by store (from their receipt's store_name),
 * fuzzy-matches each store to a registered Retailer,
 * and creates one RetailerVerification per matched store.
 * Also assigns a SIH shipment ID and updates the Order.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { order_id } = await req.json();
  if (!order_id) return Response.json({ error: 'order_id required' }, { status: 400 });

  // Load order, items, receipts, and all approved retailers in parallel
  const [order, allItems, receipts, allRetailers] = await Promise.all([
    base44.entities.Order.get(order_id),
    base44.entities.OrderItem.filter({ order_id }),
    base44.entities.Receipt.filter({ order_id }),
    base44.entities.Retailer.filter({ status: 'approved' }),
  ]);

  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  // Only process eligible items
  const eligibleItems = allItems.filter(i => i.eligible !== false);
  if (eligibleItems.length === 0) {
    return Response.json({ error: 'No eligible items to verify' }, { status: 400 });
  }

  // Build a map: receipt_url → store_name (from Receipt records)
  const receiptStoreMap = {};
  for (const r of receipts) {
    if (r.file_url && r.store_name) {
      receiptStoreMap[r.file_url] = { store_name: r.store_name, receipt_url: r.file_url };
    }
  }

  // Group items by store_name (from their receipt)
  const storeGroups = {};
  for (const item of eligibleItems) {
    const receiptInfo = receiptStoreMap[item.receipt_url];
    const storeName = receiptInfo?.store_name || 'Unknown Store';
    if (!storeGroups[storeName]) {
      storeGroups[storeName] = {
        store_name: storeName,
        receipt_url: receiptInfo?.receipt_url || item.receipt_url || '',
        items: [],
      };
    }
    storeGroups[storeName].items.push(item);
  }

  // Fuzzy match store/brand name from receipt to a registered Retailer.
  // Priority: brand_name (printed on receipt) → store_name (legal name)
  function fuzzyMatch(receiptStoreName, retailers) {
    const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = normalize(receiptStoreName);

    // 1. Exact brand_name match
    let match = retailers.find(r => r.brand_name && normalize(r.brand_name) === target);
    if (match) return match;

    // 2. Brand name contains / contained-in match
    match = retailers.find(r => {
      if (!r.brand_name) return false;
      const bn = normalize(r.brand_name);
      return bn.includes(target) || target.includes(bn);
    });
    if (match) return match;

    // 3. Exact store_name match
    match = retailers.find(r => normalize(r.store_name) === target);
    if (match) return match;

    // 4. Store name contains / contained-in match
    match = retailers.find(r => {
      const sn = normalize(r.store_name);
      return sn.includes(target) || target.includes(sn);
    });
    return match || null;
  }

  // Generate shipment ID if not already set
  const shipmentId = order.shipment_id || `SIH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const deadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const verificationsToCreate = [];
  const unmatchedStores = [];

  for (const [storeName, group] of Object.entries(storeGroups)) {
    const retailer = fuzzyMatch(storeName, allRetailers);
    const totalValue = group.items.reduce((s, i) => s + (i.price || 0), 0);
    const commissionRate = retailer?.commission_rate || 2.5;
    const commissionAmount = (totalValue * commissionRate) / 100;

    // Get ALL items from this receipt (not just eligible/selected) for full receipt visibility
    const receiptUrl = group.receipt_url;
    const allReceiptItems = allItems.filter(i => i.receipt_url === receiptUrl);

    verificationsToCreate.push({
      shipment_id: shipmentId,
      order_id: order_id,
      retailer_id: retailer?.id || 'unmatched',
      retailer_email: retailer?.contact_email || '',
      // Use the retailer's brand_name if matched, otherwise use what the AI extracted from the receipt
      store_name: retailer?.brand_name || retailer?.store_name || storeName,
      tourist_name: order.recipient_name || user.full_name || '',
      tourist_passport_country: user.nationality || '',
      hotel_name: order.hotel_name || '',
      receipt_url: group.receipt_url,
      // ALL items from this store's receipt — selected=true means tourist chose to ship it
      items: allReceiptItems.map(i => ({
        description: i.item_name,
        category: i.category,
        price: i.price || 0,
        eligible: i.eligible !== false,
        selected: group.items.some(si => si.id === i.id), // true = selected for shipment
      })),
      total_value: totalValue,
      commission_amount: commissionAmount,
      destination_country: order.destination_country || '',
      shipment_date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      deadline_at: deadline,
    });

    if (!retailer) unmatchedStores.push(storeName);
  }

  // Create all verifications in parallel
  const created = await Promise.all(
    verificationsToCreate.map(v => base44.entities.RetailerVerification.create(v))
  );

  // Update the Order with shipment ID and multi-retailer status
  await base44.entities.Order.update(order_id, {
    shipment_id: shipmentId,
    multi_retailer_status: 'pending_retailer_approvals',
    retailer_verifications_count: created.length,
    retailer_verifications_approved: 0,
  });

  return Response.json({
    success: true,
    shipment_id: shipmentId,
    verifications_created: created.length,
    stores: Object.keys(storeGroups),
    unmatched_stores: unmatchedStores,
  });
});