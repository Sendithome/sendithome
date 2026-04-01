import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Globe, QrCode, Hotel, MapPin, Phone, Mail, Hash, Save, Download, RefreshCw, CheckCircle2, Loader2, Upload, Star, Users, Package, Building2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'countries', label: 'Top 50 Countries', icon: Globe },
  { id: 'qr', label: 'QR Generator', icon: QrCode },
];

const TOP_50_COUNTRIES = [
  { name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { name: 'United States', flag: '🇺🇸', region: 'Americas' },
  { name: 'India', flag: '🇮🇳', region: 'Asia' },
  { name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { name: 'France', flag: '🇫🇷', region: 'Europe' },
  { name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { name: 'Canada', flag: '🇨🇦', region: 'Americas' },
  { name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East' },
  { name: 'Qatar', flag: '🇶🇦', region: 'Middle East' },
  { name: 'Kuwait', flag: '🇰🇼', region: 'Middle East' },
  { name: 'Bahrain', flag: '🇧🇭', region: 'Middle East' },
  { name: 'Oman', flag: '🇴🇲', region: 'Middle East' },
  { name: 'Jordan', flag: '🇯🇴', region: 'Middle East' },
  { name: 'Egypt', flag: '🇪🇬', region: 'Middle East' },
  { name: 'Lebanon', flag: '🇱🇧', region: 'Middle East' },
  { name: 'Pakistan', flag: '🇵🇰', region: 'Asia' },
  { name: 'Bangladesh', flag: '🇧🇩', region: 'Asia' },
  { name: 'Philippines', flag: '🇵🇭', region: 'Asia' },
  { name: 'China', flag: '🇨🇳', region: 'Asia' },
  { name: 'Japan', flag: '🇯🇵', region: 'Asia' },
  { name: 'South Korea', flag: '🇰🇷', region: 'Asia' },
  { name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { name: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
  { name: 'Thailand', flag: '🇹🇭', region: 'Asia' },
  { name: 'Indonesia', flag: '🇮🇩', region: 'Asia' },
  { name: 'Vietnam', flag: '🇻🇳', region: 'Asia' },
  { name: 'Italy', flag: '🇮🇹', region: 'Europe' },
  { name: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  { name: 'Sweden', flag: '🇸🇪', region: 'Europe' },
  { name: 'Norway', flag: '🇳🇴', region: 'Europe' },
  { name: 'Switzerland', flag: '🇨🇭', region: 'Europe' },
  { name: 'Belgium', flag: '🇧🇪', region: 'Europe' },
  { name: 'Portugal', flag: '🇵🇹', region: 'Europe' },
  { name: 'Poland', flag: '🇵🇱', region: 'Europe' },
  { name: 'Russia', flag: '🇷🇺', region: 'Europe' },
  { name: 'Turkey', flag: '🇹🇷', region: 'Europe' },
  { name: 'South Africa', flag: '🇿🇦', region: 'Africa' },
  { name: 'Nigeria', flag: '🇳🇬', region: 'Africa' },
  { name: 'Kenya', flag: '🇰🇪', region: 'Africa' },
  { name: 'Ghana', flag: '🇬🇭', region: 'Africa' },
  { name: 'Brazil', flag: '🇧🇷', region: 'Americas' },
  { name: 'Mexico', flag: '🇲🇽', region: 'Americas' },
  { name: 'Argentina', flag: '🇦🇷', region: 'Americas' },
  { name: 'Colombia', flag: '🇨🇴', region: 'Americas' },
  { name: 'New Zealand', flag: '🇳🇿', region: 'Oceania' },
  { name: 'Sri Lanka', flag: '🇱🇰', region: 'Asia' },
  { name: 'Nepal', flag: '🇳🇵', region: 'Asia' },
  { name: 'Ireland', flag: '🇮🇪', region: 'Europe' },
  { name: 'Greece', flag: '🇬🇷', region: 'Europe' },
];

const COUNTRY_DIAL = {
  'United Arab Emirates': '+971', 'Saudi Arabia': '+966', 'Qatar': '+974',
  'Kuwait': '+965', 'Bahrain': '+973', 'Oman': '+968', 'Jordan': '+962',
  'Egypt': '+20', 'Lebanon': '+961', 'Turkey': '+90',
  'United Kingdom': '+44', 'Germany': '+49', 'France': '+33', 'Italy': '+39',
  'Spain': '+34', 'Netherlands': '+31', 'Sweden': '+46', 'Norway': '+47',
  'Switzerland': '+41', 'Belgium': '+32', 'Portugal': '+351', 'Poland': '+48',
  'Russia': '+7', 'Greece': '+30', 'Ireland': '+353',
  'India': '+91', 'Pakistan': '+92', 'Bangladesh': '+880', 'Philippines': '+63',
  'China': '+86', 'Japan': '+81', 'South Korea': '+82', 'Singapore': '+65',
  'Malaysia': '+60', 'Thailand': '+66', 'Indonesia': '+62', 'Vietnam': '+84',
  'Sri Lanka': '+94', 'Nepal': '+977',
  'United States': '+1', 'Canada': '+1', 'Brazil': '+55', 'Mexico': '+52',
  'Argentina': '+54', 'Colombia': '+57',
  'Australia': '+61', 'New Zealand': '+64',
  'South Africa': '+27', 'Nigeria': '+234', 'Kenya': '+254', 'Ghana': '+233',
};

const REGION_COLORS = {
  'Europe': 'bg-blue-50 text-blue-700 border-blue-100',
  'Middle East': 'bg-amber-50 text-amber-700 border-amber-100',
  'Asia': 'bg-green-50 text-green-700 border-green-100',
  'Americas': 'bg-purple-50 text-purple-700 border-purple-100',
  'Africa': 'bg-orange-50 text-orange-700 border-orange-100',
  'Oceania': 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

function getQRUrl(text, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=12&format=png`;
}

export default function HotelDashboard() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [regionFilter, setRegionFilter] = useState('All');
  const [form, setForm] = useState({
    name: '', address_line1: '', address_line2: '', city: '', state: '',
    postal_code: '', country: '', contact_email: '', dial_code: '+971',
    contact_phone: '', star_rating: 5, concierge_name: '', logo_url: '', active: true,
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const me = await base44.auth.me();
    setUser(me);
    // Try to find hotel linked to this user
    const hotels = await base44.entities.Hotel.filter({ contact_email: me.email });
    if (hotels.length > 0) {
      const h = hotels[0];
      setHotel(h);
      const rawPhone = h.contact_phone || '';
      const dialMatch = rawPhone.match(/^(\+\d{1,4})\s*(.*)$/);
      setForm({
        name: h.name || '',
        address_line1: h.address || '',
        address_line2: h.address_line2 || '',
        city: h.city || '',
        state: h.state || '',
        postal_code: h.postal_code || '',
        country: h.country || '',
        contact_email: h.contact_email || me.email,
        dial_code: dialMatch ? dialMatch[1] : (COUNTRY_DIAL[h.country] || '+971'),
        contact_phone: dialMatch ? dialMatch[2] : rawPhone,
        star_rating: h.star_rating || 5,
        concierge_name: h.concierge_name || '',
        logo_url: h.logo_url || '',
        active: h.active !== false,
      });
    } else {
      setForm(prev => ({ ...prev, contact_email: me.email }));
    }
  };

  const update = (k, v) => {
    if (k === 'country') {
      const matchedKey = Object.keys(COUNTRY_DIAL).find(
        key => key.toLowerCase() === v.toLowerCase()
      );
      const dial = matchedKey ? COUNTRY_DIAL[matchedKey] : '';
      setForm(prev => ({ ...prev, [k]: v, ...(dial ? { dial_code: dial } : {}) }));
    } else {
      setForm(prev => ({ ...prev, [k]: v }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      address: form.address_line1,
      contact_phone: form.dial_code + ' ' + form.contact_phone,
    };
    if (hotel) {
      const updated = await base44.entities.Hotel.update(hotel.id, payload);
      setHotel(updated);
    } else {
      const created = await base44.entities.Hotel.create(payload);
      setHotel(created);
    }
    setSaving(false);
    setSaved(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setLogoUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('logo_url', file_url);
    setLogoUploading(false);
  };

  const generateQR = () => {
    if (!hotel) return;
    setQrLoading(true);
    const landingUrl = `${window.location.origin}/hotel/${hotel.id}`;
    setQrUrl(getQRUrl(landingUrl, 400));
    setTimeout(() => setQrLoading(false), 800);
  };

  const downloadQR = async () => {
    if (!qrUrl) return;
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name || 'hotel'}-qr-code.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const regions = ['All', ...Array.from(new Set(TOP_50_COUNTRIES.map(c => c.region)))];
  const filteredCountries = regionFilter === 'All'
    ? TOP_50_COUNTRIES
    : TOP_50_COUNTRIES.filter(c => c.region === regionFilter);

  const qrLandingUrl = hotel ? `${window.location.origin}/hotel/${hotel.id}` : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-black text-foreground leading-none">SEND<span className="text-accent">IT</span>HOME</p>
            <p className="text-[9px] text-muted-foreground">Hotel Partner Portal</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-foreground">{user.full_name || user.email}</p>
              <p className="text-[10px] text-muted-foreground">{hotel ? hotel.name : 'No hotel linked'}</p>
            </div>
            {form.logo_url ? (
              <img src={form.logo_url} className="w-8 h-8 rounded-full object-cover border border-border" alt="logo" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Hotel className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </header>

      {/* Tab Navigation */}
      <nav className="bg-card border-b border-border px-4">
        <div className="flex gap-1 max-w-3xl mx-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── HOME TAB ── */}
          {tab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

              {/* Hotel Profile Form — FIRST */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-foreground">Hotel Profile</h2>
                  {hotel && <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Profile saved</span>}
                </div>
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  {/* Logo */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {form.logo_url ? (
                        <img src={form.logo_url} className="w-full h-full object-cover" alt="logo" />
                      ) : (
                        <Hotel className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Hotel Logo</p>
                      <label className="mt-1 cursor-pointer inline-flex items-center gap-1.5 text-xs text-accent font-medium hover:underline">
                        {logoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {logoUploading ? 'Uploading…' : 'Upload logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Hotel Name *</Label>
                      <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Grand Hyatt Dubai" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Concierge Name</Label>
                      <Input value={form.concierge_name} onChange={e => update('concierge_name', e.target.value)} placeholder="John Smith" className="mt-1 h-10 text-sm" />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Address Line 1 *</Label>
                      <Input value={form.address_line1} onChange={e => update('address_line1', e.target.value)} placeholder="Building number & street name" className="mt-1 h-10 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Address Line 2</Label>
                      <Input value={form.address_line2} onChange={e => update('address_line2', e.target.value)} placeholder="Area, district, landmark (optional)" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">City *</Label>
                      <Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Dubai" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">State / Emirate</Label>
                      <Input value={form.state} onChange={e => update('state', e.target.value)} placeholder="Dubai" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Postal / ZIP Code</Label>
                      <Input value={form.postal_code} onChange={e => update('postal_code', e.target.value)} placeholder="00000" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Country *</Label>
                      <Input value={form.country} onChange={e => update('country', e.target.value)} placeholder="United Arab Emirates" className="mt-1 h-10 text-sm" />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Contact Email</Label>
                      <Input value={form.contact_email} onChange={e => update('contact_email', e.target.value)} placeholder="info@hotel.com" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Contact Phone</Label>
                      <div className="flex gap-1.5 mt-1">
                        <div className="flex items-center gap-1 bg-muted border border-input rounded-md px-2 shrink-0">
                          <span className="text-xs font-mono text-foreground whitespace-nowrap">{form.dial_code || '+?'}</span>
                        </div>
                        <Input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} placeholder="50 000 0000" className="h-10 text-sm flex-1" />
                      </div>
                      {form.country && COUNTRY_DIAL[form.country] && (
                        <p className="text-[10px] text-muted-foreground mt-1">Country code auto-set for {form.country}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Star Rating</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => update('star_rating', n)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${form.star_rating >= n ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!saved ? (
                    <Button
                      onClick={handleSave}
                      disabled={saving || !form.name || !form.city || !form.country}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-10"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {saving ? 'Saving…' : hotel ? 'Update Hotel Profile' : 'Save Hotel Profile'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl py-2.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Hotel profile saved successfully!</span>
                      </div>
                      <Button
                        onClick={() => { setTab('qr'); setSaved(false); }}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl h-11 text-sm"
                      >
                        <QrCode className="w-4 h-4 mr-2" /> Generate Your QR Code →
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Welcome banner */}
              <div className="relative overflow-hidden bg-primary rounded-2xl p-6 text-primary-foreground">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute right-12 bottom-0 w-20 h-20 bg-accent/20 rounded-full translate-y-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Hotel Partner Portal</p>
                <h1 className="text-xl font-black">Welcome to Send It Home</h1>
                <p className="text-sm opacity-80 mt-1 max-w-md">Enable your hotel guests to ship their purchases directly home. Generate your unique QR code and place it at concierge.</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      if (!hotel) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        setTab('qr');
                      }
                    }}
                    className="bg-accent text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-accent/90 transition-colors flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" /> {hotel ? 'Generate QR Code' : 'Complete Hotel Profile'}
                  </button>
                  <button onClick={() => setTab('countries')} className="bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> View Destinations
                  </button>
                </div>
              </div>

              {/* Benefits grid */}
              <div>
                <h2 className="text-sm font-bold text-foreground mb-3">Why Partner With Us?</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: '🌍', title: '50+ Countries', desc: 'Ship anywhere in the world' },
                    { icon: '⚡', title: '1–3 Day Delivery', desc: 'Fast international courier' },
                    { icon: '📦', title: 'No Hassle', desc: 'We handle all logistics' },
                    { icon: '💳', title: 'Online Payment', desc: 'Guests pay securely online' },
                    { icon: '🤖', title: 'AI-Powered', desc: 'Smart receipt processing' },
                    { icon: '🔒', title: 'Fully Secure', desc: 'End-to-end encrypted' },
                  ].map(b => (
                    <div key={b.title} className="bg-card border border-border rounded-xl p-3">
                      <p className="text-xl mb-1">{b.icon}</p>
                      <p className="text-xs font-semibold text-foreground">{b.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div>
                <h2 className="text-sm font-bold text-foreground mb-3">How It Works for Your Guests</h2>
                <div className="space-y-2">
                  {[
                    { step: '1', title: 'Guest scans your QR code', desc: 'Place the QR code at the concierge desk or in rooms' },
                    { step: '2', title: 'Register & upload receipts', desc: 'Our AI scans receipts and checks item eligibility' },
                    { step: '3', title: 'Pay & confirm shipment', desc: 'Flat-rate pricing, no hidden fees' },
                    { step: '4', title: 'Delivered to their home', desc: 'We collect from your hotel within 24 hours' },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3">
                      <div className="w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-black flex items-center justify-center shrink-0">{s.step}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* ── COUNTRIES TAB ── */}
          {tab === 'countries' && (
            <motion.div key="countries" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Top 50 Shipping Destinations</h2>
                <p className="text-sm text-muted-foreground mt-1">Your guests can ship their purchases to any of these countries directly from your hotel.</p>
              </div>

              {/* Region filter */}
              <div className="flex flex-wrap gap-2">
                {regions.map(r => (
                  <button
                    key={r}
                    onClick={() => setRegionFilter(r)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                      regionFilter === r ? 'bg-accent text-accent-foreground border-accent' : 'bg-background border-border text-muted-foreground hover:border-accent/50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Countries grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCountries.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-3 py-2.5 hover:border-accent/30 transition-colors"
                  >
                    <span className="text-2xl shrink-0">{c.flag}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${REGION_COLORS[c.region] || 'bg-muted text-muted-foreground'}`}>
                        {c.region}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground pb-4">Showing {filteredCountries.length} of 50 destinations · More countries available on request</p>
            </motion.div>
          )}

          {/* ── QR TAB ── */}
          {tab === 'qr' && (
            <motion.div key="qr" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">QR Code Generator</h2>
                <p className="text-sm text-muted-foreground mt-1">Generate a unique QR code for your hotel. Place it at the concierge desk or in guest rooms.</p>
              </div>

              {!hotel ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                  <p className="text-sm font-semibold text-amber-800 mb-2">Complete Your Hotel Profile First</p>
                  <p className="text-xs text-amber-700 mb-3">You need to save your hotel details before generating a QR code.</p>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setTab('home')}>
                    <Hotel className="w-3.5 h-3.5 mr-1.5" /> Fill in Hotel Registration Form
                  </Button>
                </div>
              ) : (
                <>
                  {/* Hotel info card */}
                  <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                    {form.logo_url ? (
                      <img src={form.logo_url} className="w-14 h-14 rounded-xl object-cover border border-border" alt="logo" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                        <Hotel className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">{hotel.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{[hotel.address, hotel.city, hotel.country].filter(Boolean).join(', ')}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-60">ID: {hotel.id}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: hotel.star_rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>

                  {/* QR display */}
                  <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-5">
                    {!qrUrl ? (
                      <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">Click below to generate your unique QR code</p>
                        <Button onClick={generateQR} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl px-8">
                          <QrCode className="w-4 h-4 mr-2" /> Generate QR Code
                        </Button>
                      </div>
                    ) : (
                      <>
                        {qrLoading ? (
                          <div className="flex flex-col items-center gap-3 py-12">
                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                            <p className="text-sm text-muted-foreground">Generating your QR code…</p>
                          </div>
                        ) : (
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                            {/* QR with branding frame */}
                            <div className="bg-white rounded-2xl p-4 shadow-lg border border-border">
                              <div className="text-center mb-2">
                                <p className="text-[9px] font-black tracking-widest text-primary">SEND<span className="text-accent">IT</span>HOME</p>
                              </div>
                              <img src={qrUrl} alt="QR Code" className="w-56 h-56 rounded-xl" onError={() => setQrUrl(null)} />
                              <div className="text-center mt-2">
                                <p className="text-[9px] font-bold text-muted-foreground">{hotel.name}</p>
                                <p className="text-[8px] text-muted-foreground">{hotel.city}, {hotel.country}</p>
                              </div>
                            </div>

                            {/* Scan URL */}
                            <div className="bg-muted/50 rounded-xl px-4 py-2 text-center max-w-xs">
                              <p className="text-[10px] text-muted-foreground">QR code links to:</p>
                              <p className="text-xs font-mono text-accent break-all mt-0.5">{qrLandingUrl}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <Button onClick={downloadQR} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold">
                                <Download className="w-4 h-4 mr-2" /> Download PNG
                              </Button>
                              <Button variant="outline" onClick={generateQR} className="rounded-xl">
                                <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                              </Button>
                            </div>

                            {/* Instructions */}
                            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 w-full">
                              <p className="text-xs font-semibold text-green-800 mb-1">✅ QR Code Ready to Use</p>
                              <ul className="text-[10px] text-green-700 space-y-0.5 list-disc pl-3">
                                <li>Print and place at your concierge desk</li>
                                <li>Add to in-room information folders</li>
                                <li>Share digitally on your hotel app or TV screens</li>
                                <li>Guests scan → register → ship in under 3 minutes</li>
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}