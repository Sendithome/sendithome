import { useState } from 'react';
import { ShieldCheck, ShieldX, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PassportVerification({ passportNumber, nationality, expiryDate, firstName, lastName, onVerified }) {
  const [status, setStatus] = useState('idle'); // idle | loading | verified | failed
  const [result, setResult] = useState(null);

  const canVerify = passportNumber?.trim() && nationality?.trim() && expiryDate && firstName?.trim() && lastName?.trim();

  const handleVerify = async () => {
    setStatus('loading');
    setResult(null);
    const res = await base44.functions.invoke('verifyPassport', {
      passport_number: passportNumber,
      nationality,
      expiry_date: expiryDate,
      first_name: firstName,
      last_name: lastName,
    });
    const data = res.data;
    setResult(data);
    setStatus(data.verified ? 'verified' : 'failed');
    if (data.verified && onVerified) onVerified(true);
  };

  return (
    <div className="mt-4 rounded-2xl border overflow-hidden" style={{ borderColor: status === 'verified' ? '#22c55e33' : status === 'failed' ? '#ef444433' : '#e5e7eb' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: status === 'verified' ? '#f0fdf4' : status === 'failed' ? '#fef2f2' : '#f9fafb' }}>
        <div className="flex items-center gap-2">
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {status === 'verified' && <ShieldCheck className="w-4 h-4 text-green-600" />}
          {status === 'failed' && <ShieldX className="w-4 h-4 text-red-500" />}
          {status === 'idle' && <ShieldCheck className="w-4 h-4 text-muted-foreground" />}
          <span className="text-xs font-semibold" style={{
            color: status === 'verified' ? '#16a34a' : status === 'failed' ? '#dc2626' : '#6b7280'
          }}>
            {status === 'idle' && 'Passport Verification'}
            {status === 'loading' && 'Verifying your passport details...'}
            {status === 'verified' && 'Passport Verified ✓'}
            {status === 'failed' && 'Verification Issues Found'}
          </span>
        </div>
        {(status === 'idle' || status === 'failed') && (
          <Button
            type="button"
            size="sm"
            disabled={!canVerify || status === 'loading'}
            onClick={handleVerify}
            className="rounded-xl text-xs h-7 px-3"
            style={{ background: '#FF007F', color: '#fff' }}
          >
            {status === 'failed' ? 'Retry' : 'Verify Now'}
          </Button>
        )}
        {status === 'verified' && (
          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">VERIFIED</span>
        )}
      </div>

      {/* Checks breakdown */}
      {result && (
        <div className="px-4 py-3 space-y-2 border-t border-border bg-white">
          <CheckRow label="Passport number format" passed={result.checks?.passport_format} />
          <CheckRow label="Not expired" passed={result.checks?.not_expired} />
          <CheckRow label="Valid name" passed={result.checks?.valid_name} />
          <CheckRow label="Recognized country" passed={result.checks?.valid_country} />
          {result.message && (
            <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">{result.message}</p>
          )}
          {result.passport_country_format && !result.checks?.passport_format && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              Expected format: {result.passport_country_format}
            </p>
          )}
        </div>
      )}

      {status === 'idle' && !canVerify && (
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Fill in passport number, nationality, expiry date, first & last name to verify
          </p>
        </div>
      )}
    </div>
  );
}

function CheckRow({ label, passed }) {
  return (
    <div className="flex items-center gap-2">
      {passed
        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
      <span className={`text-xs ${passed ? 'text-foreground' : 'text-red-500'}`}>{label}</span>
    </div>
  );
}