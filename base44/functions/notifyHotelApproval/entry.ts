import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Logistics partner email to notify on hotel approval
const LOGISTICS_PARTNER_EMAIL = 'logistics@sendithomedxb.com';

function buildPartnerEmailHtml(hotel, application) {
  const hotelName = hotel?.name || 'Unknown Hotel';
  const hotelCity = [hotel?.city, hotel?.country].filter(Boolean).join(', ') || '—';
  const hotelEmail = hotel?.official_email || application?.user_email || '—';
  const hotelPhone = hotel?.official_phone || '—';
  const gmName = hotel?.gm_name || '—';
  const gmPhone = hotel?.gm_phone || hotel?.gm_whatsapp || '—';
  const qrUrl = hotel?.id ? `${Deno.env.get('APP_URL') || 'https://app.sendithomedxb.com'}/hotel/${hotel.id}` : '—';
  const approvedAt = application?.reviewed_at ? new Date(application.reviewed_at).toLocaleString('en-AE', { timeZone: 'Asia/Dubai' }) : new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1a1f2e;padding:24px 32px;text-align:center;">
            <p style="margin:0;color:#ffffff;font-size:18px;font-weight:800;letter-spacing:1px;">
              SEND<span style="color:#ff0066;">IT</span>HOME
            </p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;">LOGISTICS PARTNER ALERT</p>
          </td>
        </tr>
        <!-- Status Badge -->
        <tr>
          <td style="padding:32px 32px 0;text-align:center;">
            <div style="display:inline-block;background:#22c55e18;border:2px solid #22c55e;border-radius:50px;padding:10px 24px;">
              <span style="font-size:22px;">🏨</span>
              <span style="font-size:14px;font-weight:700;color:#22c55e;margin-left:8px;">New Hotel Onboarded & Live!</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:24px 32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#333;line-height:1.6;">
              A new hotel partner has been approved and their QR code is now active. Please coordinate pickup logistics accordingly.
            </p>

            <!-- Hotel Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:12px;padding:20px;margin-bottom:20px;">
              <tr>
                <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #eee;">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Hotel</span><br>
                  <span style="font-size:18px;font-weight:800;color:#1a1f2e;">${hotelName}</span><br>
                  <span style="font-size:13px;color:#666;">${hotelCity}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0 4px;">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Official Email</span><br>
                  <span style="font-size:13px;font-weight:600;color:#1a1f2e;">${hotelEmail}</span>
                </td>
                <td style="padding:10px 0 4px;text-align:right;">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Phone</span><br>
                  <span style="font-size:13px;font-weight:600;color:#1a1f2e;">${hotelPhone}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0;" colspan="2">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">General Manager</span><br>
                  <span style="font-size:13px;font-weight:600;color:#1a1f2e;">${gmName}</span>
                  ${gmPhone !== '—' ? `<span style="font-size:12px;color:#666;"> · ${gmPhone}</span>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0 4px;border-top:1px solid #eee;" colspan="2">
                  <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">QR Landing URL</span><br>
                  <a href="${qrUrl}" style="font-size:12px;font-weight:600;color:#ff0066;font-family:monospace;">${qrUrl}</a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#666;line-height:1.6;border-left:3px solid #22c55e;padding-left:12px;">
              Approved on <strong>${approvedAt}</strong>. Please update your logistics schedule and reach out to the hotel's GM to arrange the first pickup briefing.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f0f0ec;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;line-height:1.8;">
              Send It Home · Operations Team · This is an automated logistics alert.
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

    // Only handle HotelApplication update events where status changes to 'approved'
    if (event?.type !== 'update' || data?.status !== 'approved' || old_data?.status === 'approved') {
      return Response.json({ skipped: true, reason: 'not a new approval' });
    }

    // Fetch the associated hotel record
    let hotel = null;
    if (data.hotel_id) {
      hotel = await base44.asServiceRole.entities.Hotel.get(data.hotel_id);
    }

    const emailHtml = buildPartnerEmailHtml(hotel, data);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: LOGISTICS_PARTNER_EMAIL,
      subject: `🏨 New Hotel Live: ${hotel?.name || data.user_email} — QR Code Active`,
      body: emailHtml,
    });

    console.log(`Hotel approval notification sent to logistics partner for hotel: ${hotel?.name || data.user_email}`);
    return Response.json({ success: true, hotel: hotel?.name, notified: LOGISTICS_PARTNER_EMAIL });

  } catch (error) {
    console.error('notifyHotelApproval error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});