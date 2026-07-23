import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft,
  Building2, KeyRound, Box, ChevronRight, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { getInventoryTier } from '../utils/inventoryTiers';
import BrandName from '@/components/BrandName';

const STEPS = ['Account', 'Hotel Details'];

export default function HotelSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1
  const [form, setForm] = useState({ email: '', password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2
  const [hotelName, setHotelName] = useState('');
  const [numberOfRooms, setNumberOfRooms] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const update = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.password || form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!hotelName.trim()) errs.hotelName = 'Hotel name is required';
    if (!numberOfRooms || parseInt(numberOfRooms) < 1) errs.numberOfRooms = 'Please enter a valid number of rooms/keys';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setSubmitting(true);

    // Invite the user
    await base44.users.inviteUser(form.email, 'user');

    // Pre-create the Hotel record with name + room count so inventory can be allocated on approval
    await base44.entities.Hotel.create({
      name: hotelName.trim(),
      number_of_rooms: parseInt(numberOfRooms),
      contact_email: form.email,
      city: '',
      country: '',
      active: false,
    });

    setDone(true);
    setSubmitting(false);
  };

  // Tier preview based on rooms input
  const roomsInt = parseInt(numberOfRooms) || 0;
  const tier = roomsInt > 0 ? getInventoryTier(roomsInt) : null;

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
          <p className="text-sm text-muted-foreground mb-2">
            We've sent a verification link to <strong>{form.email}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Please check your inbox, verify your email, then log in to sign your NDA and complete onboarding.
          </p>
          {tier && (
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-accent uppercase tracking-wide mb-2">Your Inventory Allocation</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-xl p-2.5 border border-border text-center">
                  <p className="text-lg font-black text-foreground">{tier.allocated}</p>
                  <p className="text-[10px] text-muted-foreground">10 kg Boxes</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-border text-center">
                  <p className="text-lg font-black text-foreground">{Math.round(tier.allocated * 0.5)}</p>
                  <p className="text-[10px] text-muted-foreground">20 kg Boxes</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Tier {tier.tier} — {tier.label}</p>
            </div>
          )}
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl h-11"
            onClick={() => base44.auth.redirectToLogin('/nda-signing')}
          >
            Log In & Sign NDA
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
          <button
            onClick={() => step > 0 ? setStep(0) : navigate('/hotel-onboarding')}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Onboarding overview */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[
              { step: '1', label: 'Create Account' },
              { step: '2', label: 'Add Hotel Details' },
              { step: '3', label: 'Ready to Launch' },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">{s.step}</div>
                  <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="w-8 h-px bg-border mb-3" />}
              </div>
            ))}
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-green-300' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Account ── */}
              {step === 0 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <KeyRound className="w-7 h-7 text-accent" />
                    </div>
                    <h1 className="text-2xl font-black text-foreground">Create your Hotel Partner Account</h1>
                    <p className="text-sm text-muted-foreground mt-2">Create your account to start offering <BrandName /> to your guests.</p>
                    <p className="text-[10px] text-muted-foreground mt-2">Fields marked with <span className="text-accent font-bold">*</span> are required.</p>
                  </div>

                  <div className="space-y-4">
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
                      <ul className="text-[10px] text-muted-foreground mt-1.5 space-y-0.5">
                        <li>Minimum 8 characters</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character (e.g. ! @ # $ %)</li>
                      </ul>
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

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="mt-0.5 accent-accent" />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        I accept the <span className="text-accent font-semibold">Terms &amp; Conditions</span> and <span className="text-accent font-semibold">Privacy Policy</span>.
                      </span>
                    </label>

                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!agreedTerms}
                      className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl mt-2 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Hotel Details ── */}
              {step === 1 && (
                <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit}>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-7 h-7 text-accent" />
                    </div>
                    <h1 className="text-2xl font-black text-foreground">Hotel Details</h1>
                    <p className="text-sm text-muted-foreground mt-2">Tell us about your property so we can allocate the right box inventory.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Hotel Name */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hotel Name *</Label>
                      <Input
                        value={hotelName}
                        onChange={e => { setHotelName(e.target.value); setErrors(p => ({ ...p, hotelName: '' })); }}
                        placeholder="Atlantis The Palm, Dubai"
                        className={`mt-1.5 h-11 ${errors.hotelName ? 'border-destructive' : ''}`}
                      />
                      {errors.hotelName && <p className="text-xs text-destructive mt-1">{errors.hotelName}</p>}
                    </div>

                    {/* Number of Rooms */}
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Number of Keys / Rooms *
                      </Label>
                      <div className="relative mt-1.5">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="1"
                          value={numberOfRooms}
                          onChange={e => { setNumberOfRooms(e.target.value); setErrors(p => ({ ...p, numberOfRooms: '' })); }}
                          placeholder="e.g. 350"
                          className={`h-11 pl-9 ${errors.numberOfRooms ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.numberOfRooms && <p className="text-xs text-destructive mt-1">{errors.numberOfRooms}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> This determines your box inventory tier and allocation
                      </p>
                    </div>

                    {/* Live Tier Preview */}
                    <AnimatePresence>
                      {tier && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Box className="w-4 h-4 text-accent" />
                              <p className="text-xs font-bold text-accent">Inventory Tier {tier.tier} — {tier.label}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white rounded-xl p-3 border border-border text-center">
                                <p className="text-2xl font-black text-foreground">{tier.allocated}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">10 kg Boxes</p>
                                <p className="text-[9px] text-muted-foreground mt-0.5">Reorder at {tier.reorderAt}</p>
                              </div>
                              <div className="bg-white rounded-xl p-3 border border-border text-center">
                                <p className="text-2xl font-black text-foreground">{Math.round(tier.allocated * 0.5)}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">20 kg Boxes</p>
                                <p className="text-[9px] text-muted-foreground mt-0.5">Reorder at {Math.round(tier.reorderAt * 0.5)}</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 text-center">
                              All boxes are provided at <strong className="text-foreground">zero cost</strong> to your property
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl mt-2 gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {submitting ? 'Creating Account…' : 'Create Account'}
                    </Button>
                  </div>
                </motion.form>
              )}

            </AnimatePresence>

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