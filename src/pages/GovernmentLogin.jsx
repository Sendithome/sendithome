import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2, Lock, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const inputCls = "w-full h-11 bg-background border border-input rounded-xl px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const DEPARTMENTS = [
  { code: 'UAE-CUST-001', name: 'UAE Federal Customs Authority', email: 'officer@customs.gov.ae' },
  { code: 'UAE-TCA-002', name: 'Tourism & Commerce Authority', email: 'officer@tca.gov.ae' },
  { code: 'UAE-MOF-003', name: 'Ministry of Finance', email: 'officer@mof.gov.ae' },
];

export default function GovernmentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ dept_code: '', email: '', password: '', tfa: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentials = async () => {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const dept = DEPARTMENTS.find(d => d.code === form.dept_code && d.email === form.email);
    if (!dept || !form.password) {
      setError('Invalid Department Code or Email. Access denied.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep(2);
  };

  const handleTFA = async () => {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (form.tfa !== '123456') {
      setError('Invalid authentication code. Please try again.');
      setLoading(false);
      return;
    }
    const dept = DEPARTMENTS.find(d => d.code === form.dept_code);
    sessionStorage.setItem('gov_dept_code', form.dept_code);
    sessionStorage.setItem('gov_dept_name', dept.name);
    sessionStorage.setItem('gov_email', form.email);
    setLoading(false);
    navigate('/government-dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-center mb-5">
            <img src="https://media.base44.com/images/public/69c10418ed4e1fe65d094ced/5db7bf76e_images.png" alt="SendItHome" className="h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Government Oversight Portal</h1>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Tourism Retail Export — Clearing House & Verification Authority</p>
        </div>

        {/* Classification Banner */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-2.5 flex items-center gap-2 mb-5">
          <Lock className="w-3.5 h-3.5 text-accent shrink-0" />
          <p className="text-[10px] font-bold text-accent tracking-widest uppercase">Authorised Government Access Only</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          {step === 1 ? (
            <>
              <Field label="Department Code">
                <input
                  value={form.dept_code}
                  onChange={e => setForm(p => ({ ...p, dept_code: e.target.value }))}
                  placeholder="UAE-CUST-001"
                  className={inputCls}
                />
              </Field>
              <Field label="Authorised Officer Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="officer@ministry.gov.ae"
                  className={inputCls}
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••••••"
                    className={inputCls + ' pr-10'}
                    onKeyDown={e => e.key === 'Enter' && handleCredentials()}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleCredentials}
                disabled={!form.dept_code || !form.email || !form.password || loading}
                className="w-full h-12 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-accent-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Verifying…' : 'Continue to 2FA'}
              </button>

              <button
                onClick={() => {
                  sessionStorage.setItem('gov_dept_code', 'UAE-CUST-001');
                  sessionStorage.setItem('gov_dept_name', 'UAE Federal Customs Authority');
                  sessionStorage.setItem('gov_email', 'officer@customs.gov.ae');
                  navigate('/government-dashboard');
                }}
                className="w-full h-10 border border-accent/40 text-accent hover:bg-accent/5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                🚀 Enter Demo (Skip Login)
              </button>

              <p className="text-center text-[10px] text-muted-foreground mt-2">
                Demo: Code <span className="text-foreground font-mono">UAE-CUST-001</span> · Email <span className="text-foreground font-mono">officer@customs.gov.ae</span> · Any password
              </p>
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-bold text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground mt-1">Enter the 6-digit code from your authenticator app</p>
              </div>

              <Field label="Authentication Code">
                <input
                  value={form.tfa}
                  onChange={e => setForm(p => ({ ...p, tfa: e.target.value }))}
                  placeholder="000000"
                  maxLength={6}
                  className={inputCls + ' text-center text-xl tracking-[0.5em] font-mono'}
                  onKeyDown={e => e.key === 'Enter' && handleTFA()}
                />
              </Field>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleTFA}
                disabled={form.tfa.length < 6 || loading}
                className="w-full h-12 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-accent-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Authenticating…' : 'Secure Sign In'}
              </button>

              <p className="text-center text-[10px] text-muted-foreground">Demo code: <span className="text-foreground font-mono">123456</span></p>
              <button onClick={() => setStep(1)} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
            </>
          )}
        </div>

        <div className="mt-5 flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
          <p className="text-[10px] text-destructive/70">This portal contains classified economic data. Unauthorised access is a criminal offence under UAE Federal Cybercrime Law No. 5 of 2012.</p>
        </div>
      </motion.div>
    </div>
  );
}