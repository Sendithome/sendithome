import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';

export default function RetailerPortal() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ partner_code: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    // Verify partner code + email against Retailer entity
    const retailers = await base44.entities.Retailer.filter({ partner_code: form.partner_code, contact_email: form.email });
    if (retailers.length === 0) {
      setError('Invalid Partner Code or Email. Please check your credentials.');
      setLoading(false);
      return;
    }
    const retailer = retailers[0];
    if (retailer.status !== 'approved') {
      setError('Your account is not yet approved. Please wait for confirmation.');
      setLoading(false);
      return;
    }
    // Store retailer id in sessionStorage and navigate to dashboard
    sessionStorage.setItem('retailer_id', retailer.id);
    sessionStorage.setItem('retailer_name', retailer.store_name);
    setLoading(false);
    navigate('/retailer-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShieldCheck className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs font-black tracking-widest text-white">SEND<span className="text-[#FF007F]">IT</span>HOME</p>
          <h1 className="text-2xl font-bold text-[#D4A855] mt-3">Retailer Verification Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Where tourism meets luxury retail mobility</p>
        </div>

        <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 space-y-4">
          <Field label="Retailer Partner Code">
            <input
              value={form.partner_code}
              onChange={e => setForm(p => ({ ...p, partner_code: e.target.value }))}
              placeholder="RTL-00123"
              className={inputCls}
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="email@store.com"
              className={inputCls}
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className={inputCls + ' pr-10'}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={!form.partner_code || !form.email || !form.password || loading}
            className="w-full h-12 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Signing In…' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Not a partner yet?{' '}
            <Link to="/retailer-registration" className="text-green-400 hover:underline">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const inputCls = "w-full h-10 bg-[#0B1120] border border-slate-700 rounded-xl px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-green-500 transition-colors";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-medium block mb-1">{label}</label>
      {children}
    </div>
  );
}