import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { passport_number, nationality, expiry_date, first_name, last_name } = await req.json();

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a passport validation expert. Validate the following passport details:

- Passport Number: ${passport_number}
- Country / Nationality: ${nationality}
- Expiry Date: ${expiry_date}
- First Name: ${first_name}
- Last Name: ${last_name}
- Today's Date: ${new Date().toISOString().split('T')[0]}

Perform the following checks:
1. Is the passport number format valid for the given nationality/country? (e.g., UK passports: 9 digits, US: 9 alphanumeric, UAE: 8-9 alphanumeric, Indian: 1 letter + 7 digits, etc.)
2. Is the expiry date in the future (not expired)?
3. Does the name contain valid characters (letters, hyphens, spaces only)?
4. Is the nationality a real recognized country?

Return a JSON with:
- verified: boolean (true only if ALL checks pass)
- checks: object with each check result (passport_format, not_expired, valid_name, valid_country) as booleans
- message: short human-readable summary (max 15 words)
- passport_country_format: string describing expected format for that country`,
      response_json_schema: {
        type: "object",
        properties: {
          verified: { type: "boolean" },
          checks: {
            type: "object",
            properties: {
              passport_format: { type: "boolean" },
              not_expired: { type: "boolean" },
              valid_name: { type: "boolean" },
              valid_country: { type: "boolean" },
            }
          },
          message: { type: "string" },
          passport_country_format: { type: "string" },
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});