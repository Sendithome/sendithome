import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2, Lock, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const inputCls = "w-full h-11 bg-[#060D1F] border border-[#8B5CF6]/30 rounded-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#8B5CF6] transition-colors";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-medium block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// Mock departments
const DEPARTMENTS = [
  { code: 'UAE-CUST-001', name: 'UAE Federal Customs Authority', email: 'officer@customs.gov.ae' },
  { code: 'UAE-TCA-002', name: 'Tourism & Commerce Authority', email: 'officer@tca.gov.ae' },
  { code: 'UAE-MOF-003', name: 'Ministry of Finance', email: 'officer@mof.gov.ae' },
];

export default function GovernmentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ dept_code: '', email: '', password: '', tfa: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState(1); // 1 = credentials, 2 = 2FA
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
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.12),transparent_60%)] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-2xl mb-5">
            <Shield className="w-8 h-8 text-[#8B5CF6]" />
          </div>
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">Send It Home</p>
          <h1 className="text-2xl font-black text-white">Government Oversight Portal</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">Tourism Retail Export — Clearing House & Verification Authority</p>
        </div>

        {/* Classification Banner */}
        <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl px-4 py-2.5 flex items-center gap-2 mb-5">
          <Lock className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
          <p className="text-[10px] font-bold text-[#8B5CF6] tracking-widest uppercase">Classified — Government Use Only</p>
        </div>

        <div className="bg-[#0D1526] border border-slate-700/50 rounded-2xl p-6 space-y-4">
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
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleCredentials}
                disabled={!form.dept_code || !form.email || !form.password || loading}
                className="w-full h-12 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Verifying…' : 'Continue to 2FA'}
              </button>

              <div className="text-center">
                <p className="text-[10px] text-slate-600 mt-2">Demo: Code <span className="text-slate-400 font-mono">UAE-CUST-001</span> · Email <span className="text-slate-400 font-mono">officer@customs.gov.ae</span> · Any password</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400 mt-1">Enter the 6-digit code from your authenticator app</p>
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
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleTFA}
                disabled={form.tfa.length < 6 || loading}
                className="w-full h-12 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Authenticating…' : 'Secure Sign In'}
              </button>

              <p className="text-center text-[10px] text-slate-600">Demo code: <span className="text-slate-400 font-mono">123456</span></p>

              <button onClick={() => setStep(1)} className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back</button>
            </>
          )}
        </div>

        <div className="mt-5 flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-400/70">This portal contains classified economic data. Unauthorised access is a criminal offence under UAE Federal Cybercrime Law No. 5 of 2012.</p>
        </div>
      </motion.div>
    </div>
  );
}