import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

export default function HotelSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await base44.users.inviteUser(form.email, 'user');
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">Account Created!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We've sent a verification link to <strong>{form.email}</strong>. Please check your inbox to activate your account, then log in to complete your hotel registration.
          </p>
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl h-11"
            onClick={() => base44.auth.redirectToLogin('/hotel-dashboard')}
          >
            Go to Login
          </Button>
          <p className="text-xs text-muted-foreground mt-4">Didn't receive the email? Check your spam folder.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/hotel-partner" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm text-white">SEND<span className="text-accent">IT</span>HOME</span>
          </Link>
          <Link to="/hotel-partner" className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-accent" />
              </div>
              <h1 className="text-2xl font-black text-foreground">Create Hotel Account</h1>
              <p className="text-sm text-muted-foreground mt-2">Enter your details to begin the hotel partner registration.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hotel Email Address *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="manager@yourhotel.com"
                  className={`mt-1.5 h-11 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={`h-11 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm Password *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={e => update('confirm_password', e.target.value)}
                    placeholder="Re-enter password"
                    className={`h-11 pr-10 ${errors.confirm_password ? 'border-destructive' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-xs text-destructive mt-1">{errors.confirm_password}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl mt-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                {submitting ? 'Creating Account…' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Already have an account?{' '}
              <button
                onClick={() => base44.auth.redirectToLogin('/hotel-dashboard')}
                className="text-accent font-semibold hover:underline"
              >
                Log In
              </button>
            </p>
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-6">
            Powered by FedEx & DHL · 50+ Countries · 1–3 Day Delivery
          </p>
        </motion.div>
      </div>
    </div>
  );
}