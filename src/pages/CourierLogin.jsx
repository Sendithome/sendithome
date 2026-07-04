import { useState } from 'react';
import { Truck, Lock, Mail, Loader2, Eye, EyeOff, Package, Info, Headphones } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import BrandName from '@/components/BrandName';

export default function CourierLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const couriers = await base44.entities.CourierPartner.filter({ email, password, status: 'active' });
    if (couriers.length > 0) {
      const courier = couriers[0];
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('courier_id', courier.id);
      storage.setItem('courier_company', courier.company_name);
      storage.setItem('courier_email', courier.email);
      navigate('/courier-dashboard');
    } else {
      setError('Invalid email or password. Please contact your administrator.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-sm font-black text-foreground">SEND<span className="text-accent">IT</span>HOME</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mt-2">Courier Partner Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Logistics Partner Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Partner Email</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="courier@company.com"
                required
                className="w-full h-11 pl-9 pr-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 pl-9 pr-9 bg-background border border-input rounded-xl text-sm focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-me"
                checked={remember}
                onCheckedChange={setRemember}
              />
              <label htmlFor="remember-me" className="text-xs text-muted-foreground cursor-pointer">Remember me</label>
            </div>
            <button
              type="button"
              onClick={() => setShowForgot(!showForgot)}
              className="text-xs text-blue-600 font-medium hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {showForgot && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-3 space-y-1">
              <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Password Reset
              </p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Please contact the <BrandName /> admin team to reset your courier portal password:
              </p>
              <div className="text-[11px] text-blue-700 space-y-0.5 mt-1">
                <p>📧 admin@sendithome.com</p>
                <p>📞 +971 4 000 0000</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2.5">
              <p className="text-xs text-destructive font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            {loading ? 'Signing in…' : 'Access Courier Portal'}
          </button>
        </form>

        <button
          onClick={() => navigate('/courier-dashboard')}
          className="w-full mt-3 h-10 border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          🚀 Enter Demo (Skip Login)
        </button>

        {/* Admin Support Contact */}
        <div className="mt-4 bg-muted/50 border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-xs font-bold text-foreground">Need Help?</p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            For login credentials, password resets, or technical support, contact the <BrandName /> admin team:
          </p>
          <div className="text-[11px] text-muted-foreground mt-1.5 space-y-0.5">
            <p>📧 admin@sendithome.com</p>
            <p>📞 +971 4 000 0000</p>
            <p>🕐 Sun–Thu, 9:00 AM – 6:00 PM (GST)</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Logistics partners only · Contact admin for credentials
        </p>
      </div>
    </div>
  );
}