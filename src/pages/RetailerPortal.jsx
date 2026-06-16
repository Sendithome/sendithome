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
    if (retailer.login_password && retailer.login_password !== form.password) {
      setError('Incorrect password. Please check the credentials sent to your email.');
      setLoading(false);
      return;
    }
    sessionStorage.setItem('retailer_id', retailer.id);
    sessionStorage.setItem('retailer_name', retailer.store_name);
    setLoading(false);
    navigate('/retailer-dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-5">
            <img src="https://media.base44.com/images/public/69c10418ed4e1fe65d094ced/5db7bf76e_images.png" alt="SendItHome" className="h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-3">Retailer Verification Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Where tourism meets luxury retail mobility</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
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
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-accent-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Signing In…' : 'Sign In'}
          </button>

          <button
            onClick={() => { navigate('/retailer-dashboard'); }}
            className="w-full h-10 border border-accent/40 text-accent hover:bg-accent/5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            🚀 Enter Demo (Skip Login)
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Not a partner yet?{' '}
            <Link to="/retailer-registration" className="text-accent hover:underline font-medium">Register here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

const inputCls = "w-full h-10 bg-background border border-input rounded-xl px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium block mb-1">{label}</label>
      {children}
    </div>
  );
}