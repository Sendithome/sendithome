import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Plus, Trash2, ArrowLeft, Bell, Percent, Users, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

export default function RetailerSettings() {
  const [retailer, setRetailer] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');

  useEffect(() => {
    const id = sessionStorage.getItem('retailer_id');
    if (!id) return;
    base44.entities.Retailer.filter({ id }).then(rs => {
      if (rs.length > 0) {
        setRetailer(rs[0]);
        setForm(rs[0]);
      }
    });
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Retailer.update(retailer.id, {
      store_name: form.store_name,
      store_location: form.store_location,
      store_category: form.store_category,
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      notification_preference: form.notification_preference,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!retailer) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/retailer-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-primary">Settings</h1>
        </div>

        <div className="space-y-5">
          {/* Store Profile */}
          <Section icon={<Users className="w-4 h-4" />} title="Store Profile">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Store Name">
                <input value={form.store_name || ''} onChange={e => update('store_name', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Location (Mall / Area)">
                <input value={form.store_location || ''} onChange={e => update('store_location', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Store Category">
                <select value={form.store_category || ''} onChange={e => update('store_category', e.target.value)} className={inputCls}>
                  {['Fashion','Footwear','Bags & Accessories','Sportswear','Souvenirs & Gifts','Toys','Baby & Kids','Department Store','Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Contact Person">
                <input value={form.contact_name || ''} onChange={e => update('contact_name', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Contact Email">
                <input type="email" value={form.contact_email || ''} onChange={e => update('contact_email', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Contact Phone">
                <input value={form.contact_phone || ''} onChange={e => update('contact_phone', e.target.value)} className={inputCls} />
              </Field>
            </div>
          </Section>

          {/* Notifications */}
          <Section icon={<Bell className="w-4 h-4" />} title="Notification Preferences">
           <p className="text-xs text-muted-foreground mb-3">How should we notify you of new verification requests?</p>
           <div className="flex gap-3">
             {['email', 'sms', 'both'].map(opt => (
               <button key={opt} onClick={() => update('notification_preference', opt)}
                 className={`px-4 h-9 rounded-xl text-xs font-semibold border transition-colors capitalize ${form.notification_preference === opt ? 'bg-accent/15 border-accent text-accent' : 'border-border text-muted-foreground hover:border-border'}`}>
                 {opt}
               </button>
             ))}
           </div>
          </Section>

          {/* Commission Rate — view only */}
          <Section icon={<Percent className="w-4 h-4" />} title="Commission Rate">
            <div className="bg-muted/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agreed Commission Rate</p>
                <p className="text-2xl font-bold text-primary mt-1">{retailer.commission_rate || 2.5}%</p>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs text-right">Rate is set by Send It Home admin and cannot be changed here. Contact partnerships to renegotiate.</p>
            </div>
          </Section>

          {/* Support */}
          <Section icon={<HelpCircle className="w-4 h-4" />} title="Support">
            <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-xs text-muted-foreground">
              <p>For support with your retailer account, please contact:</p>
              <p className="text-accent font-semibold">retail-partnerships@senditehome.com</p>
              <p className="text-muted-foreground">Response time: within 1 business day</p>
            </div>
          </Section>

          {saved && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-semibold text-center">
              Settings saved successfully ✓
            </motion.div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full h-12 bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full h-10 bg-background border border-input rounded-xl px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors";

function Section({ icon, title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
        {icon}<span className="text-primary">{title}</span>
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      {children}
    </div>
  );
}