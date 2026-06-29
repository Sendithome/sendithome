import { useState, useEffect } from 'react';
import { User, BookOpen, Phone, Mail, Globe, Camera, Loader2, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import CountrySelect from '../components/CountrySelect';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [form, setForm] = useState({
    nationality: '',
    passport_number: '',
    passport_expiry: '',
    phone_number: '',
    whatsapp_number: '',
    home_country: '',
    home_address: '',
    home_city: '',
    home_postal_code: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    let me;
    try {
      me = await base44.auth.me();
    } catch {
      base44.auth.redirectToLogin('/profile');
      return;
    }
    setUser(me);
    setForm({
      nationality: me.nationality || '',
      passport_number: me.passport_number || '',
      passport_expiry: me.passport_expiry || '',
      phone_number: me.phone_number || '',
      whatsapp_number: me.whatsapp_number || '',
      home_country: me.home_country || '',
      home_address: me.home_address || '',
      home_city: me.home_city || '',
      home_postal_code: me.home_postal_code || '',
    });
    setLoading(false);
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setSaving(false);
  };

  const handlePassportScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract passport details from this passport image. Extract: first name, last name, nationality, passport number, and expiry date (in YYYY-MM-DD format).`,
      response_json_schema: {
        type: "object",
        properties: {
          first_name: { type: "string" },
          last_name: { type: "string" },
          nationality: { type: "string" },
          passport_number: { type: "string" },
          expiry_date: { type: "string" },
        },
      },
      file_urls: [file_url],
    });

    setForm(prev => ({
      ...prev,
      nationality: result.nationality || prev.nationality,
      passport_number: result.passport_number || prev.passport_number,
      passport_expiry: result.expiry_date || prev.passport_expiry,
    }));
    setScanning(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-foreground mb-1">Profile</h1>
      <p className="text-xs text-muted-foreground mb-8">{user?.email}</p>

      {/* Passport scan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-5 mb-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Passport Details</span>
        </div>

        <label className="block cursor-pointer mb-4">
          <div className="border-2 border-dashed border-accent/30 rounded-xl p-4 text-center hover:border-accent/60 transition-all">
            {scanning ? (
              <Loader2 className="w-5 h-5 text-accent mx-auto mb-2 animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-accent mx-auto mb-2" />
            )}
            <p className="text-xs font-medium">{scanning ? 'Scanning passport...' : 'Scan or upload your passport'}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">AI will auto-fill your details</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handlePassportScan} />
        </label>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nationality</Label>
            <Input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} placeholder="e.g. British" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Passport Number</Label>
              <Input value={form.passport_number} onChange={(e) => update('passport_number', e.target.value)} placeholder="AB1234567" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Expiry Date</Label>
              <Input type="date" value={form.passport_expiry} onChange={(e) => update('passport_expiry', e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Contact</span>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Phone Number</Label>
          <Input value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} placeholder="+971 50 123 4567" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">WhatsApp Number</Label>
          <Input value={form.whatsapp_number} onChange={(e) => update('whatsapp_number', e.target.value)} placeholder="+971 50 123 4567" className="mt-1" />
        </div>
      </div>

      {/* Home address */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Home Address</span>
        </div>
        <CountrySelect value={form.home_country} onChange={(v) => update('home_country', v)} />
        <div>
          <Label className="text-xs text-muted-foreground">Street Address</Label>
          <Input value={form.home_address} onChange={(e) => update('home_address', e.target.value)} placeholder="123 Main Street" className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">City</Label>
            <Input value={form.home_city} onChange={(e) => update('home_city', e.target.value)} placeholder="City" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Postal Code</Label>
            <Input value={form.home_postal_code} onChange={(e) => update('home_postal_code', e.target.value)} placeholder="12345" className="mt-1" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-12"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}