import { useState } from 'react';
import { Truck, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function CourierLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const couriers = await base44.entities.CourierPartner.filter({ email, password, status: 'active' });
    if (couriers.length > 0) {
      const courier = couriers[0];
      sessionStorage.setItem('courier_id', courier.id);
      sessionStorage.setItem('courier_company', courier.company_name);
      sessionStorage.setItem('courier_email', courier.email);
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
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-xs font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
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

        <p className="text-center text-xs text-muted-foreground mt-4">
          Logistics partners only · Contact admin for credentials
        </p>
      </div>
    </div>
  );
}