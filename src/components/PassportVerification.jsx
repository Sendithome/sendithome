import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldX, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PassportVerification({ passportNumber, nationality, expiryDate, firstName, lastName, onResult }) {
  const [status, setStatus] = useState('idle'); // idle | loading | verified | failed
  const [result, setResult] = useState(null);
  const debounceRef = useRef(null);
  const lastVerifiedRef = useRef('');

  const allFilled = passportNumber?.trim() && nationality?.trim() && expiryDate && firstName?.trim() && lastName?.trim();
  const key = `${passportNumber}|${nationality}|${expiryDate}|${firstName}|${lastName}`;

  useEffect(() => {
    if (!allFilled) {
      setStatus('idle');
      setResult(null);
      if (onResult) onResult(null);
      return;
    }

    if (key === lastVerifiedRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setStatus('loading');
      setResult(null);
      if (onResult) onResult(null);

      const res = await base44.functions.invoke('verifyPassport', {
        passport_number: passportNumber,
        nationality,
        expiry_date: expiryDate,
        first_name: firstName,
        last_name: lastName,
      });

      const data = res.data;
      lastVerifiedRef.current = key;
      setResult(data);
      setStatus(data.verified ? 'verified' : 'failed');
      if (onResult) onResult(data);
    }, 1200);

    return () => clearTimeout(debounceRef.current);
  }, [key]);

  if (!allFilled) return null;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      status === 'verified' ? 'border-green-300 bg-green-50' :
      status === 'failed' ? 'border-red-200 bg-red-50' :
      'border-border bg-muted/30'
    }`}>
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />}
        {status === 'verified' && <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />}
        {status === 'failed' && <ShieldX className="w-4 h-4 text-red-500 shrink-0" />}

        <span className={`text-xs font-semibold flex-1 ${
          status === 'verified' ? 'text-green-700' :
          status === 'failed' ? 'text-red-600' :
          'text-muted-foreground'
        }`}>
          {status === 'loading' && 'Verifying passport details...'}
          {status === 'verified' && 'Passport Verified'}
          {status === 'failed' && 'Verification Failed'}
        </span>

        {status === 'verified' && (
          <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
            ✓ VERIFIED
          </span>
        )}
      </div>

      {/* Check breakdown */}
      {result && status !== 'loading' && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-border/50">
          <div className="pt-2 space-y-1.5">
            <CheckRow label="Passport number format is valid" passed={result.checks?.passport_format} />
            <CheckRow label="Passport is not expired" passed={result.checks?.not_expired} />
            <CheckRow label="Name is valid" passed={result.checks?.valid_name} />
            <CheckRow label="Nationality is recognized" passed={result.checks?.valid_country} />
          </div>
          {result.message && (
            <p className={`text-xs mt-2 pt-2 border-t border-border/40 ${status === 'verified' ? 'text-green-700' : 'text-red-600'}`}>
              {result.message}
            </p>
          )}
          {result.passport_country_format && !result.checks?.passport_format && (
            <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-1">
              Expected format for {nationality}: {result.passport_country_format}
            </p>
          )}
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
      <span className={`text-xs ${passed ? 'text-green-700' : 'text-red-500'}`}>{label}</span>
    </div>
  );
}