import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Upload, CheckCircle2, Loader2, ChevronRight, Package } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Fashion', 'Footwear', 'Bags & Accessories', 'Sportswear',
  'Souvenirs & Gifts', 'Toys', 'Baby & Kids', 'Department Store', 'Other'
];

export default function RetailerRegistration() {
  const [form, setForm] = useState({
    store_name: '', brand_name: '', store_location: '', trade_license_number: '',
    contact_name: '', contact_email: '', contact_phone: '',
    store_category: '', branches_count: 1
  });
  const [agreed, setAgreed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));



  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Retailer.create({ ...form, status: 'pending' });
    setSubmitting(false);
    setSubmitted(true);
  };

  const canSubmit = form.store_name && form.brand_name && form.contact_email && form.trade_license_number && form.store_category && agreed;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Registration Submitted!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Thank you! Your registration is under review. You will receive your <strong className="text-accent">Retailer Partner Code</strong> within 2 business days.
          </p>
          <Link to="/retailer-portal" className="mt-6 inline-block text-sm text-accent hover:underline">
            → Back to Retailer Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-xs font-black tracking-widest text-foreground">SEND<span className="text-accent">IT</span>HOME</p>
          </div>
          <h1 className="text-2xl font-bold text-primary mt-4">Retailer Partner Registration</h1>
          <p className="text-muted-foreground text-sm mt-1">Join the Send It Home certified retail network</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">

          <p className="text-[10px] text-muted-foreground">Fields marked with <span className="text-accent font-bold">*</span> are required.</p>

          {/* Store Name vs Brand Name explanation */}
          <div className="bg-secondary/60 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground leading-relaxed space-y-0.5">
            <p className="font-semibold text-foreground">📋 Two name fields — why?</p>
            <p><span className="font-semibold text-foreground">Store Name</span> — Your legal business name (as shown on your trade license).</p>
            <p><span className="font-semibold text-foreground">Brand Name</span> — The name shown on customer receipts (e.g. Gucci, Prada, Nike), used to auto-match receipts to your store.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Legal Store Name *" hint="As on your trade license">
              <input value={form.store_name} onChange={e => update('store_name', e.target.value)} placeholder="e.g. Al Tayer Retail LLC" className={inputCls} />
            </Field>
            <Field label="Brand Name on Receipts *" hint="As printed on customer receipts">
              <input value={form.brand_name} onChange={e => update('brand_name', e.target.value)} placeholder="e.g. Gucci" className={inputCls} />
            </Field>
          </div>
          <Field label="Store Location (Mall / Area) *">
            <input value={form.store_location} onChange={e => update('store_location', e.target.value)} placeholder="e.g. Dubai Mall, Downtown" className={inputCls} />
          </Field>
          <div>
            <Field label="Trade License Number *">
              <input value={form.trade_license_number} onChange={e => update('trade_license_number', e.target.value)} placeholder="e.g. TL-12345678" className={inputCls} />
            </Field>
            <p className="text-[10px] text-muted-foreground mt-1">Required to verify your legal authorisation to operate and comply with government regulations.</p>
          </div>
          <Field label="Contact Person Name *">
            <input value={form.contact_name} onChange={e => update('contact_name', e.target.value)} placeholder="Full Name" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Email *">
              <input type="email" value={form.contact_email} onChange={e => update('contact_email', e.target.value)} placeholder="email@store.com" className={inputCls} />
            </Field>
            <Field label="Contact Phone *">
              <input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} placeholder="+971 50 000 0000" className={inputCls} />
            </Field>
          </div>
          <Field label="Store Category *">
            <select value={form.store_category} onChange={e => update('store_category', e.target.value)} className={inputCls}>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Number of Branches in Dubai">
            <input type="number" min="1" value={form.branches_count} onChange={e => update('branches_count', parseInt(e.target.value) || 1)} className={inputCls} />
          </Field>



          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 accent-accent" />
            <span className="text-xs text-muted-foreground leading-relaxed">
              I agree to the <span className="text-accent font-semibold">Send It Home Retailer Partnership Terms</span> including 24-hour verification SLA and commission structure.
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full h-12 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-accent-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Already registered?{' '}
            <Link to="/retailer-portal" className="text-accent hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full h-10 bg-background border border-input rounded-xl px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium block mb-1">
        {label}
        {hint && <span className="text-[10px] text-muted-foreground/70 ml-1 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}