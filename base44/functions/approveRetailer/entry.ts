import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Admin-only: Approve a retailer registration.
 * - Generates a unique partner_code (RTL-XXXXX)
 * - Generates a random login_password
 * - Sets status to 'approved'
 * - Sends a welcome email with credentials
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { retailer_id } = await req.json();
  if (!retailer_id) return Response.json({ error: 'retailer_id required' }, { status: 400 });

  const retailer = await base44.entities.Retailer.get(retailer_id);
  if (!retailer) return Response.json({ error: 'Retailer not found' }, { status: 404 });

  // Generate partner code: RTL-XXXXX (5 digit padded number)
  const allRetailers = await base44.asServiceRole.entities.Retailer.list('-created_date', 500);
  const maxCode = allRetailers
    .map(r => parseInt((r.partner_code || '').replace('RTL-', '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  const nextNum = maxCode + 1;
  const partner_code = `RTL-${String(nextNum).padStart(5, '0')}`;

  // Generate a random password: 2 words + 4 digits
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

  // Send welcome email with credentials
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

If you have any questions, please contact our support team.

Best regards,
The Send It Home Team`,
  });

  return Response.json({
    success: true,
    partner_code,
    message: `Retailer approved and credentials sent to ${retailer.contact_email}`,
  });
});