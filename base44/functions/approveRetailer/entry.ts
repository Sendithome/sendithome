import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Parse body
    let retailer_id;
    try {
      const body = await req.json();
      retailer_id = body.retailer_id;
    } catch {
      return Response.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
    }

    if (!retailer_id) return Response.json({ error: 'retailer_id required' }, { status: 400 });

    // Auth: allow admin users or unauthenticated service-level calls (from admin panel)
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch retailer using service role
    const retailer = await base44.asServiceRole.entities.Retailer.get(retailer_id);
    if (!retailer) return Response.json({ error: 'Retailer not found' }, { status: 404 });

    // Generate partner code: RTL-XXXXX
    const allRetailers = await base44.asServiceRole.entities.Retailer.list('-created_date', 500);
    const maxCode = allRetailers
      .map(r => parseInt((r.partner_code || '').replace('RTL-', '')) || 0)
      .reduce((a, b) => Math.max(a, b), 0);
    const nextNum = maxCode + 1;
    const partner_code = `RTL-${String(nextNum).padStart(5, '0')}`;

    // Generate a random password
    const adjectives = ['Swift', 'Bold', 'Bright', 'Clear', 'Fresh', 'Grand', 'Prime', 'Smart', 'True', 'Vivid'];
    const nouns = ['Hawk', 'Peak', 'Link', 'Core', 'Tide', 'Wave', 'Star', 'Edge', 'Gate', 'Port'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const digits = String(Math.floor(Math.random() * 9000) + 1000);
    const login_password = `${adj}${noun}${digits}`;

    // Update retailer
    await base44.asServiceRole.entities.Retailer.update(retailer_id, {
      status: 'approved',
      partner_code,
      login_password,
    });

    // Send welcome email
    const brandLine = retailer.brand_name ? `\nBrand Name (on receipts): ${retailer.brand_name}` : '';
    await base44.integrations.Core.SendEmail({
      to: retailer.contact_email,
      subject: `Welcome to Send It Home — Your Retailer Partner Credentials`,
      body: `Dear ${retailer.contact_name || retailer.store_name},

Congratulations! Your retailer registration with Send It Home has been approved.

Here are your login credentials for the Retailer Partner Portal:

  Store Name: ${retailer.store_name}${brandLine}
  Partner Code: ${partner_code}
  Email: ${retailer.contact_email}
  Password: ${login_password}

Login at: https://sendithomedxb.base44.app/retailer-portal

Please keep these credentials secure. You can update your password from the Settings page after logging in.

Best regards,
The Send It Home Team`,
    });

    return Response.json({
      success: true,
      partner_code,
      login_password,
      message: `Retailer approved. Credentials sent to ${retailer.contact_email}`,
    });

  } catch (error) {
    console.error('[approveRetailer error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});