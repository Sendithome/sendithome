import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

/**
 * Generates a retailer-specific customs declaration PDF.
 * Shows ONLY that retailer's selected shipment items.
 * Other retailers' items are shown as REDACTED for privacy.
 * Called from the VerificationCard in the retailer portal.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { verification_id } = await req.json();
    if (!verification_id) return Response.json({ error: 'verification_id required' }, { status: 400 });

    // Load the verification record
    const verification = await base44.asServiceRole.entities.RetailerVerification.get(verification_id);
    if (!verification) return Response.json({ error: 'Verification not found' }, { status: 404 });

    // Load the order to get tourist/shipment info
    const order = verification.order_id
      ? await base44.asServiceRole.entities.Order.get(verification.order_id)
      : null;

    // Load ALL verifications for this shipment (to know how many other retailers are redacted)
    // Prefer order_id lookup, fall back to shipment_id for records without an order_id
    let allVerificationsForShipment = [verification];
    if (verification.order_id) {
      allVerificationsForShipment = await base44.asServiceRole.entities.RetailerVerification.filter({ order_id: verification.order_id });
    } else if (verification.shipment_id) {
      allVerificationsForShipment = await base44.asServiceRole.entities.RetailerVerification.filter({ shipment_id: verification.shipment_id });
    }

    const otherRetailers = allVerificationsForShipment.filter(v => v.id !== verification_id);

    // Items for THIS retailer that are selected for shipment
    const myItems = (verification.items || []).filter(i => i.selected !== false && i.eligible !== false);
    const totalValue = myItems.reduce((s, i) => s + (i.price || 0), 0);
    const currency = 'USD';
    const shippingDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 12;
    const contentW = pageW - margin * 2;

    const label = (text, x, y) => {
      doc.setFontSize(6); doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'normal');
      doc.text(text.toUpperCase(), x, y);
    };
    const value = (text, x, y, bold = true) => {
      doc.setFontSize(8); doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(String(text || '—'), x, y);
    };
    const subHeader = (text, x, y, w) => {
      doc.setFillColor(40, 40, 40); doc.rect(x, y, w, 5, 'F');
      doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
      doc.text(text.toUpperCase(), x + 2, y + 3.5);
    };

    let y = margin;

    // ── HEADER ──
    doc.setFillColor(20, 20, 20);
    doc.rect(margin, y, contentW, 14, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('RETAILER CUSTOMS DECLARATION', margin + contentW / 2, y + 5.5, { align: 'center' });
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 200, 200);
    doc.text('Retailer-Specific View  ·  Confidential  ·  CN22 / CN23', margin + contentW / 2, y + 10, { align: 'center' });
    y += 16;

    // ── RETAILER BANNER ──
    doc.setFillColor(212, 168, 85, 0.15);
    doc.setFillColor(255, 248, 220);
    doc.rect(margin, y, contentW, 10, 'F');
    doc.setDrawColor(212, 168, 85);
    doc.rect(margin, y, contentW, 10, 'D');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(120, 80, 0);
    doc.text(`RETAILER: ${verification.store_name || '—'}`, margin + 3, y + 4);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(150, 110, 30);
    doc.text(`This document shows ONLY your store's items. Other retailers' data is confidential and not disclosed.`, margin + 3, y + 8.5);
    y += 13;

    // ── SHIPMENT REFERENCE ──
    const halfW = contentW / 2;
    doc.setDrawColor(80, 80, 80);
    doc.rect(margin, y, halfW, 10, 'D');
    doc.rect(margin + halfW, y, halfW, 10, 'D');
    label('Shipment Reference No.', margin + 2, y + 3.5);
    value(verification.shipment_id, margin + 2, y + 7.5);
    label('Date of Shipment', margin + halfW + 2, y + 3.5);
    value(shippingDate, margin + halfW + 2, y + 7.5);
    y += 11;

    // ── TOURIST INFO ──
    subHeader('Tourist / Sender Information', margin, y, contentW);
    y += 5;
    const third = contentW / 3;
    doc.rect(margin, y, third, 12, 'D');
    doc.rect(margin + third, y, third, 12, 'D');
    doc.rect(margin + third * 2, y, third, 12, 'D');
    label('Tourist Name', margin + 2, y + 3.5);
    value(verification.tourist_name, margin + 2, y + 7.5);
    label('Passport Country', margin + third + 2, y + 3.5);
    value(verification.tourist_passport_country, margin + third + 2, y + 7.5);
    label('Hotel', margin + third * 2 + 2, y + 3.5);
    value(verification.hotel_name, margin + third * 2 + 2, y + 7.5);
    y += 13;

    // ── DESTINATION ──
    doc.rect(margin, y, halfW, 10, 'D');
    doc.rect(margin + halfW, y, halfW, 10, 'D');
    label('Destination Country', margin + 2, y + 3.5);
    value(verification.destination_country, margin + 2, y + 7.5);
    label('Customs Reference', margin + halfW + 2, y + 3.5);
    value(verification.customs_ref || order?.shipment_id || '—', margin + halfW + 2, y + 7.5);
    y += 12;

    // ── YOUR ITEMS TABLE ──
    subHeader(`Section D — Your Store's Items (${verification.store_name}) — Cleared for Export`, margin, y, contentW);
    y += 5;

    const colWidths = [contentW - 60 - 20 - 28 - 28, 60, 20, 28, 28];
    const headers = ['Description of Goods', 'Category', 'Qty', 'Unit Value', 'Total'];
    const rowH = 4.5;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentW, rowH, 'F');
    doc.setDrawColor(80, 80, 80); doc.rect(margin, y, contentW, rowH, 'D');
    let tx = margin;
    headers.forEach((h, i) => {
      doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
      doc.text(h.toUpperCase(), tx + 1.5, y + 3.2);
      if (i < headers.length - 1) { doc.setDrawColor(150, 150, 150); doc.line(tx + colWidths[i], y, tx + colWidths[i], y + rowH); }
      tx += colWidths[i];
    });
    y += rowH;

    myItems.forEach((item, idx) => {
      const rh = 5;
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 252, idx % 2 === 0 ? 255 : 248);
      doc.rect(margin, y, contentW, rh, 'F');
      doc.setDrawColor(200, 200, 200); doc.rect(margin, y, contentW, rh, 'D');
      let ix = margin;
      const rowData = [
        item.description,
        item.category || '',
        '1',
        `${currency} ${(item.price || 0).toFixed(2)}`,
        `${currency} ${(item.price || 0).toFixed(2)}`,
      ];
      rowData.forEach((d, i) => {
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20);
        const alignRight = i >= 2;
        if (alignRight) {
          doc.text(d, ix + colWidths[i] - 1.5, y + 3.5, { align: 'right' });
        } else {
          const truncated = doc.getTextWidth(d) > colWidths[i] - 3
            ? d.substring(0, Math.floor((colWidths[i] - 3) / (doc.getTextWidth(d) / d.length))) + '…'
            : d;
          doc.text(truncated, ix + 1.5, y + 3.5);
        }
        if (i < rowData.length - 1) { doc.setDrawColor(200, 200, 200); doc.line(ix + colWidths[i], y, ix + colWidths[i], y + rh); }
        ix += colWidths[i];
      });
      y += rh;
    });

    // Totals row
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y, contentW, 6, 'F');
    doc.setDrawColor(80, 80, 80); doc.rect(margin, y, contentW, 6, 'D');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
    doc.text(`YOUR ITEMS: ${myItems.length}`, margin + 2, y + 4);
    doc.text(`${currency} ${totalValue.toFixed(2)}`, margin + contentW - 1.5, y + 4, { align: 'right' });
    y += 8;

    // ── COMMISSION SUMMARY ──
    doc.setFillColor(255, 248, 220);
    doc.setDrawColor(212, 168, 85);
    doc.rect(margin, y, contentW, 14, 'FD');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(120, 80, 0);
    doc.text(`Declared Shipment Value (your store only):  ${currency} ${totalValue.toFixed(2)}`, margin + 3, y + 5);
    doc.text(`Govt. Commission (10%* on shipped items only):  ${currency} ${(totalValue * 0.10).toFixed(2)}`, margin + 3, y + 10);
    doc.setFontSize(5.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(150, 110, 30);
    doc.text('* 10% reference rate on declared shipped items only. VAT excluded. Subject to regulatory approval.', margin + 3, y + 13.5);
    y += 17;

    // ── OTHER RETAILERS — REDACTED ──
    if (otherRetailers.length > 0) {
      subHeader(`Other Retailers in This Shipment — CONFIDENTIAL / REDACTED`, margin, y, contentW);
      y += 5;
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(180, 180, 180);
      doc.rect(margin, y, contentW, otherRetailers.length * 9 + 4, 'FD');

      otherRetailers.forEach((other, idx) => {
        const ry = y + 4 + idx * 9;
        // Store name shown, but item details redacted
        doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
        doc.text(`Store ${idx + 1}:`, margin + 3, ry);
        // Redact name with ████
        doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
        doc.text('[RETAILER IDENTITY CONFIDENTIAL]', margin + 20, ry);
        doc.setFontSize(6.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(150, 150, 150);
        doc.text(`Item details, prices, and product descriptions are not disclosed to other retailers.`, margin + 3, ry + 5.5);
      });
      y += otherRetailers.length * 9 + 8;
    }

    // ── SIGNATURE BLOCK ──
    subHeader("Sender's Declaration", margin, y, contentW);
    y += 5;
    doc.setDrawColor(80, 80, 80); doc.rect(margin, y, contentW, 18, 'D');
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
    const declText = `Tourist/sender has certified that these items were genuinely purchased and selected for international shipping. This declaration has been signed by the sender. Commission applies only on the items listed above belonging to ${verification.store_name}.`;
    const splitDecl = doc.splitTextToSize(declText, contentW - 6);
    doc.text(splitDecl, margin + 2, y + 4);
    label('Declarant Name', margin + 2, y + 11);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20, 20, 20);
    doc.text(verification.tourist_name || order?.recipient_name || '—', margin + 2, y + 15);
    label('Date', margin + contentW / 2 + 2, y + 11);
    doc.text(shippingDate, margin + contentW / 2 + 2, y + 15);
    y += 21;

    // ── FOOTER ──
    doc.setFillColor(20, 20, 20);
    doc.rect(margin, y, contentW, 10, 'F');
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('Vacation Logistics DMCC, Dubai — Operating as SENDITHOME', margin + contentW / 2, y + 4.5, { align: 'center' });
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 180);
    doc.text(`RETAILER COPY — ${verification.store_name}  ·  Shipment ${verification.shipment_id}  ·  CONFIDENTIAL`, margin + contentW / 2, y + 8.5, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="declaration-${verification.store_name?.replace(/\s+/g, '-')}-${verification.shipment_id}.pdf"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});