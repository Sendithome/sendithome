import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const MILESTONE_STATUSES = ['paid', 'packed', 'in_transit', 'delivered'];

const STATUS_CONTENT = {
  paid: {
    subject: '✅ Payment Confirmed – Your Shipment is Being Prepared',
    heading: 'Payment Confirmed!',
    message: 'Great news! We have received your payment and your items are now being prepared for packing.',
    nextStep: 'We will notify you as soon as your box is packed and ready for collection.',
    color: '#22c55e',
    emoji: '✅',
  },
  packed: {
    subject: '📦 Your Box is Packed & Ready for Pickup',
    heading: 'Your Box is Packed!',
    message: 'Your items have been carefully packed and sealed in your box. It is now awaiting courier collection.',
    nextStep: 'A courier will collect your shipment shortly. You will receive another update when it is picked up.',
    color: '#f59e0b',
    emoji: '📦',
  },
  in_transit: {
    subject: '🚀 Your Shipment is On Its Way!',
    heading: 'Your Shipment is In Transit!',
    message: 'Excellent! Your package has been picked up and is now on its way to its destination.',
    nextStep: 'Expected delivery time is 1–3 working days. Track your shipment any time using your tracking number.',
    color: '#3b82f6',
    emoji: '🚀',
  },
  delivered: {
    subject: '🎉 Your Shipment Has Been Delivered!',
    heading: 'Delivered Successfully!',
    message: 'Your package has been delivered to the destination address. We hope everything arrived safely!',
    nextStep: 'Thank you for shipping with Send It Home. We look forward to serving you again.',
    color: '#8b5cf6',
    emoji: '🎉',
  },
};

function buildEmailHtml(content, order) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1a1f2e;padding:24px 32px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:800;letter-spacing:1px;">
              SEND<span style="color:#ff0066;">IT</span>HOME
            </p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;">SHIPMENT UPDATE</p>
          </td>
        </tr>
        <!-- Status Badge -->
        <tr>
          <td style="padding:32px 32px 0;text-align:center;">
            <div style="display:inline-block;background:${content.color}18;border:2px solid ${content.color};border-radius:50px;padding:10px 24px;">
              <span style="font-size:22px;">${content.emoji}</span>
              <span style="font-size:14px;font-weight:700;color:${content.color};margin-left:8px;">${content.heading}</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:24px 32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;line-height:1.6;">${content.message}</p>
            <!-- Order Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:12px;padding:16px;margin-bottom:16px;">
              <tr>
                <td style="padding:4px 0;">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Order Number</span><br>
                  <span style="font-size:15px;font-weight:700;color:#1a1f2e;">${order.order_number || '—'}</span>
                </td>
                <td style="padding:4px 0;text-align:right;">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Destination</span><br>
                  <span style="font-size:15px;font-weight:700;color:#1a1f2e;">${[order.destination_city, order.destination_country].filter(Boolean).join(', ') || '—'}</span>
                </td>
              </tr>
              ${order.tracking_number ? `
              <tr>
                <td colspan="2" style="padding:8px 0 4px;border-top:1px solid #eee;margin-top:8px;">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tracking Number</span><br>
                  <span style="font-size:15px;font-weight:700;color:#1a1f2e;font-family:monospace;">${order.tracking_number}</span>
                </td>
              </tr>` : ''}
            </table>
            <p style="margin:0;font-size:13px;color:#666;line-height:1.6;border-left:3px solid ${content.color};padding-left:12px;">${content.nextStep}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f0f0ec;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.8;">
              Send It Home · Licensed International Courier<br>
              Powered by FedEx & DHL · 50+ Countries · 1–3 Day Delivery
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data, old_data } = payload;

    // Only handle order update events
    if (event?.type !== 'update' || !data) {
      return Response.json({ skipped: true });
    }

    const newStatus = data.status;
    const oldStatus = old_data?.status;

    // Only fire on milestone status changes
    if (!MILESTONE_STATUSES.includes(newStatus) || newStatus === oldStatus) {
      return Response.json({ skipped: true, reason: 'not a milestone status change' });
    }

    const content = STATUS_CONTENT[newStatus];
    if (!content) return Response.json({ skipped: true });

    // Get the user's email from the order's created_by field
    const recipientEmail = data.created_by;
    if (!recipientEmail) {
      return Response.json({ skipped: true, reason: 'no recipient email on order' });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: content.subject,
      body: buildEmailHtml(content, data),
    });

    console.log(`Status email sent to ${recipientEmail} for status: ${newStatus}, order: ${data.order_number}`);
    return Response.json({ success: true, status: newStatus, to: recipientEmail });

  } catch (error) {
    console.error('sendStatusEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});