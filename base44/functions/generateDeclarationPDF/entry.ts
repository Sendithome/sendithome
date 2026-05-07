import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order, items, signature } = await req.json();

    const eligibleItems = (items || []).filter(i => i.eligible !== false);
    const totalDeclaredValue = eligibleItems.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
    const currency = eligibleItems[0]?.currency || 'USD';
    const shippingDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const SHIPPING_PRICES = {
      'United Kingdom': 60, 'Germany': 60, 'France': 60, 'Italy': 60, 'Spain': 60,
      'Netherlands': 60, 'Sweden': 60, 'Norway': 60, 'Switzerland': 60, 'Belgium': 60,
      'Portugal': 60, 'Poland': 60, 'Greece': 60, 'Ireland': 60, 'Denmark': 60,
      'Austria': 60, 'Finland': 60, 'Czech Republic': 60, 'Hungary': 60, 'Romania': 60,
      'United States': 70, 'Canada': 70, 'Australia': 70, 'New Zealand': 70,
      'Brazil': 80, 'Mexico': 75, 'Argentina': 80, 'Colombia': 80,
      'India': 50, 'Pakistan': 50, 'Bangladesh': 50, 'Sri Lanka': 50, 'Nepal': 55,
      'China': 55, 'Japan': 60, 'South Korea': 60, 'Singapore': 55, 'Malaysia': 55,
      'Thailand': 55, 'Indonesia': 60, 'Vietnam': 55, 'Philippines': 60,
      'South Africa': 65, 'Nigeria': 70, 'Kenya': 65, 'Ghana': 70,
      'United Arab Emirates': 30, 'Saudi Arabia': 35, 'Qatar': 35,
      'Kuwait': 35, 'Bahrain': 35, 'Oman': 35, 'Jordan': 45, 'Egypt': 45,
      'Lebanon': 50, 'Turkey': 50,
      'Russia': 65,
    };
    const shippingCost = SHIPPING_PRICES[order?.destination_country] || 60;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 12;
    const contentW = pageW - margin * 2;

    // ── Helpers ──
    const drawRect = (x, y, w, h, fill) => {
      if (fill) { doc.setFillColor(...fill); doc.rect(x, y, w, h, 'F'); }
      doc.setDrawColor(80, 80, 80);
      doc.rect(x, y, w, h, fill ? 'FD' : 'D');
    };
    const label = (text, x, y) => {
      doc.setFontSize(6); doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'normal');
      doc.text(text.toUpperCase(), x, y);
    };
    const value = (text, x, y, bold = true) => {
      doc.setFontSize(8); doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(String(text || '—'), x, y);
    };
    const sectionHeader = (text, x, y, w) => {
      doc.setFillColor(40, 40, 40); doc.rect(x, y, w, 5, 'F');
      doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
      doc.text(text.toUpperCase(), x + 2, y + 3.5);
    };
    const subHeader = (text, x, y, w) => {
      doc.setFillColor(230, 230, 230); doc.rect(x, y, w, 4.5, 'F');
      doc.setDrawColor(80, 80, 80); doc.rect(x, y, w, 4.5, 'D');
      doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(50, 50, 50);
      doc.text(text.toUpperCase(), x + 2, y + 3.2);
    };

    let y = margin;

    // ── HEADER BANNER ──
    doc.setFillColor(20, 20, 20);
    doc.rect(margin, y, contentW, 12, 'F');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('INTERNATIONAL SHIPMENT DECLARATION', margin + contentW / 2, y + 5, { align: 'center' });
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 200, 200);
    doc.text('Customs & Courier Declaration Form  ·  CN22 / CN23', margin + contentW / 2, y + 9.5, { align: 'center' });
    y += 14;

    // ── REFERENCE ROW ──
    const halfW = contentW / 2;
    drawRect(margin, y, halfW, 10);
    drawRect(margin + halfW, y, halfW, 10);
    label('Shipment Reference No.', margin + 2, y + 3.5);
    value(order?.order_number, margin + 2, y + 7.5);
    label('Date of Shipment', margin + halfW + 2, y + 3.5);
    value(shippingDate, margin + halfW + 2, y + 7.5);
    y += 10;

    // ── SECTION A: SENDER ──
    subHeader('Section A — Sender / Shipper', margin, y, contentW);
    y += 4.5;
    const colA = halfW;
    drawRect(margin, y, colA, 24);
    drawRect(margin + colA, y, colA, 24);
    label('Full Name', margin + 2, y + 3.5);
    value([order?.recipient_name], margin + 2, y + 7);
    label('Hotel / Collection Point', margin + 2, y + 10.5);
    value(order?.hotel_name, margin + 2, y + 14);
    label('Room No.', margin + 2, y + 17.5);
    value(order?.hotel_room, margin + 2, y + 21);
    label('City / Country of Origin', margin + colA + 2, y + 3.5);
    value([order?.hotel_city, order?.hotel_country].filter(Boolean).join(', ') || 'United Arab Emirates', margin + colA + 2, y + 7);
    label('Passport / ID No.', margin + colA + 2, y + 10.5);
    value(order?.passport_number, margin + colA + 2, y + 14);
    label('Nationality', margin + colA + 2, y + 17.5);
    value(order?.nationality, margin + colA + 2, y + 21);
    y += 24;

    // ── SECTION B: RECIPIENT ──
    subHeader('Section B — Consignee / Recipient (Home Address)', margin, y, contentW);
    y += 4.5;
    drawRect(margin, y, colA, 24);
    drawRect(margin + colA, y, colA, 24);
    label('Full Name', margin + 2, y + 3.5);
    value(order?.recipient_name, margin + 2, y + 7);
    label('Street Address', margin + 2, y + 10.5);
    value(order?.destination_address, margin + 2, y + 14);
    label('City', margin + 2, y + 17.5);
    value(order?.destination_city, margin + 2, y + 21);
    label('Postal / ZIP Code', margin + colA + 2, y + 3.5);
    value(order?.destination_postal_code, margin + colA + 2, y + 7);
    label('Country of Destination', margin + colA + 2, y + 10.5);
    value(order?.destination_country, margin + colA + 2, y + 14);
    label('Phone / Contact', margin + colA + 2, y + 17.5);
    value(order?.recipient_phone, margin + colA + 2, y + 21);
    y += 24;

    // ── SECTION C: NATURE OF CONTENTS ──
    subHeader('Section C — Nature of Contents', margin, y, contentW);
    y += 4.5;
    drawRect(margin, y, contentW, 8);
    const contentTypes = ['Gift', 'Commercial Sample', 'Documents', 'Personal Effects / Shopping', 'Other'];
    const checkedType = 'Personal Effects / Shopping';
    let cx = margin + 3;
    doc.setFontSize(7);
    contentTypes.forEach(ct => {
      const isChecked = ct === checkedType;
      doc.setDrawColor(60, 60, 60);
      doc.rect(cx, y + 2.5, 3.5, 3.5);
      if (isChecked) {
        doc.setFillColor(20, 20, 20);
        doc.rect(cx, y + 2.5, 3.5, 3.5, 'F');
        doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('✓', cx + 0.8, y + 5.3);
      }
      doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(7);
      doc.text(ct, cx + 5, y + 5.5);
      cx += doc.getTextWidth(ct) + 12;
    });
    y += 8;

    // ── SECTION D: ITEMS TABLE ──
    subHeader('Section D — Description of Contents (Customs Declaration)', margin, y, contentW);
    y += 4.5;
    const colWidths = [contentW - 80 - 20 - 28 - 28, 80, 20, 28, 28];
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

    // Item rows
    eligibleItems.forEach((item, idx) => {
      const rh = 5;
      if (idx % 2 === 0) { doc.setFillColor(255, 255, 255); } else { doc.setFillColor(248, 248, 248); }
      doc.rect(margin, y, contentW, rh, 'F');
      doc.setDrawColor(200, 200, 200); doc.rect(margin, y, contentW, rh, 'D');
      let ix = margin;
      const rowData = [
        item.item_name,
        item.category || '',
        String(item.quantity || 1),
        `${currency} ${(item.price || 0).toFixed(2)}`,
        `${currency} ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`,
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
    doc.text(`TOTAL ITEMS: ${eligibleItems.length}`, margin + 2, y + 4);
    doc.text('TOTAL VALUE', margin + contentW - colWidths[4] - colWidths[3] - 1.5, y + 4, { align: 'right' });
    doc.text(`${currency} ${totalDeclaredValue.toFixed(2)}`, margin + contentW - 1.5, y + 4, { align: 'right' });
    y += 6;

    // ── SECTION E: SHIPPING ──
    subHeader('Section E — Shipping & Service Details', margin, y, contentW);
    y += 4.5;
    const third = contentW / 3;
    drawRect(margin, y, third, 12);
    drawRect(margin + third, y, third, 12);
    drawRect(margin + third * 2, y, third, 12);
    label('Service Provider', margin + 2, y + 3.5);
    value('Send It Home · FedEx / DHL', margin + 2, y + 7);
    label('Shipping Fee', margin + third + 2, y + 3.5);
    value(`$${shippingCost}.00 USD per box`, margin + third + 2, y + 7);
    label('Est. Transit Time', margin + third * 2 + 2, y + 3.5);
    value('1–3 Working Days', margin + third * 2 + 2, y + 7);
    y += 12;

    // ── SECTION F: DECLARATION ──
    subHeader("Section F — Sender's Declaration", margin, y, contentW);
    y += 4.5;
    const declH = signature ? 36 : 28;
    drawRect(margin, y, contentW, declH);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
    const declText = `I/We hereby certify that the particulars given in this declaration are correct and that this consignment does not contain any dangerous or prohibited article(s). The goods are of ${order?.destination_country || ''} bound origin for personal use only. I accept liability for any Customs duty or taxes applicable in the country of destination.`;
    const splitDecl = doc.splitTextToSize(declText, contentW - 6);
    doc.text(splitDecl, margin + 2, y + 4);
    const sigY = y + 4 + splitDecl.length * 4;

    // Declarant name & date
    const sigColW = contentW / 2 - 3;
    label('Declarant Name', margin + 2, sigY + 2);
    doc.setDrawColor(80, 80, 80);
    doc.line(margin + 2, sigY + 7, margin + 2 + sigColW, sigY + 7);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
    doc.text(order?.recipient_name || '—', margin + 2, sigY + 6.2);

    label('Date', margin + contentW / 2 + 2, sigY + 2);
    doc.line(margin + contentW / 2 + 2, sigY + 7, margin + contentW - 2, sigY + 7);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(shippingDate, margin + contentW / 2 + 2, sigY + 6.2);

    // Signature image
    if (signature && signature.startsWith('data:image')) {
      try {
        label('E-Signature', margin + 2, sigY + 10);
        doc.addImage(signature, 'PNG', margin + 2, sigY + 11, 55, 14);
        doc.setDrawColor(80, 80, 80);
        doc.rect(margin + 2, sigY + 11, 55, 14, 'D');
        doc.setFontSize(6.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(100, 200, 100);
        doc.text('✓ Digitally Signed', margin + 2, sigY + 27.5);
      } catch(e) {
        // skip signature if image fails
      }
    }
    y += declH;

    // ── FOOTER ──
    doc.setFillColor(20, 20, 20);
    doc.rect(margin, y, contentW, 10, 'F');
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text('Vacation Logistics DMCC, Dubai — Operating as Send It Home', margin + contentW / 2, y + 4.5, { align: 'center' });
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 180);
    doc.text('Licensed International Courier  ·  Powered by FedEx & DHL  ·  50+ Countries', margin + contentW / 2, y + 8.5, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="customs-declaration-${order?.order_number || 'SIH'}.pdf"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});