import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let retailer_id;
    try {
      const body = await req.json();
      retailer_id = body.retailer_id;
    } catch {
      return Response.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
    }

    if (!retailer_id) return Response.json({ error: 'retailer_id required' }, { status: 400 });

    // Auth: allow admin users or service-level calls from the admin panel
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const retailer = await base44.asServiceRole.entities.Retailer.get(retailer_id);
    if (!retailer) return Response.json({ error: 'Retailer not found' }, { status: 404 });

    if (retailer.status !== 'approved' || !retailer.partner_code || !retailer.login_password) {
      return Response.json({ error: 'Retailer must be approved with existing credentials before resending' }, { status: 400 });
    }

    const brandLine = retailer.brand_name ? `\n  Brand Name (on receipts): ${retailer.brand_name}` : '';
    await base44.integrations.Core.SendEmail({
      to: retailer.contact_email,
      subject: `Send It Home — Your Retailer Partner Credentials (Resent)`,
      body: `Dear ${retailer.contact_name || retailer.store_name},

As requested, here are your login credentials for the Retailer Partner Portal:

  Store Name: ${retailer.store_name}${brandLine}
  Partner Code: ${retailer.partner_code}
  Email: ${retailer.contact_email}
  Password: ${retailer.login_password}

Login at: https://sendithomedxb.base44.app/retailer-portal

Please keep these credentials secure. You can update your password from the Settings page after logging in.

Best regards,
The Send It Home Team`,
    });

    await base44.asServiceRole.entities.Retailer.update(retailer_id, {
      credentials_resent_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: `Credentials resent to ${retailer.contact_email}`,
    });

  } catch (error) {
    console.error('[resendRetailerCredentials error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});