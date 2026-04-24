import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, QrCode, Hotel, MapPin, Save, Download, RefreshCw, CheckCircle2, Loader2, Upload, Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'qr', label: 'QR Generator', icon: QrCode },
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

function getQRUrl(text, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=12&format=png`;
}

export default function HotelDashboard() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', address_line1: '', address_line2: '', area: '', city: '', state: '',
    postal_code: '', country: '', floor_tower_complex: '',
    official_email: '', official_phone: '', official_landline: '', registered_email: '',
    dial_code: '+971', contact_phone: '',
    star_rating: 5, concierge_name: '', logo_url: '', active: true,
    gm_name: '', gm_email: '', gm_phone: '', gm_whatsapp: '',
    agm_name: '', agm_email: '', agm_phone: '', agm_whatsapp: '',
    hoc_name: '', hoc_email: '', hoc_phone: '', hoc_whatsapp: '',
    fdm_name: '', fdm_email: '', fdm_phone: '', fdm_whatsapp: '',
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
        area: h.area || '',
        city: h.city || '',
        state: h.state || '',
        postal_code: h.postal_code || '',
        country: h.country || '',
        floor_tower_complex: h.floor_tower_complex || '',
        official_email: h.official_email || '',
        official_phone: h.official_phone || '',
        official_landline: h.official_landline || '',
        registered_email: h.registered_email || '',
        dial_code: dialMatch ? dialMatch[1] : (COUNTRY_DIAL[h.country] || '+971'),
        contact_phone: dialMatch ? dialMatch[2] : rawPhone,
        star_rating: h.star_rating || 5,
        concierge_name: h.concierge_name || '',
        logo_url: h.logo_url || '',
        active: h.active !== false,
        gm_name: h.gm_name || '',
        gm_email: h.gm_email || '',
        gm_phone: h.gm_phone || '',
        gm_whatsapp: h.gm_whatsapp || '',
        agm_name: h.agm_name || '',
        agm_email: h.agm_email || '',
        agm_phone: h.agm_phone || '',
        agm_whatsapp: h.agm_whatsapp || '',
        hoc_name: h.hoc_name || '',
        hoc_email: h.hoc_email || '',
        hoc_phone: h.hoc_phone || '',
        hoc_whatsapp: h.hoc_whatsapp || '',
        fdm_name: h.fdm_name || '',
        fdm_email: h.fdm_email || '',
        fdm_phone: h.fdm_phone || '',
        fdm_whatsapp: h.fdm_whatsapp || '',
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
      area: form.area,
      floor_tower_complex: form.floor_tower_complex,
      contact_phone: form.dial_code + ' ' + form.contact_phone,
      contact_email: form.official_email,
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
    setShowSummary(true);
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
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Hotel Name *</Label>
                      <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Grand Hyatt Dubai" className="mt-1 h-10 text-sm" />
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Building / Street Number + Street Name *</Label>
                      <Input value={form.address_line1} onChange={e => update('address_line1', e.target.value)} placeholder="e.g. 15 Sheikh Zayed Road" className="mt-1 h-10 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Area / District / Suburb *</Label>
                      <Input value={form.area} onChange={e => update('area', e.target.value)} placeholder="e.g. Downtown Dubai" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">City / Town *</Label>
                      <Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Dubai" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">State / Province / Region / Territory *</Label>
                      <Input value={form.state} onChange={e => update('state', e.target.value)} placeholder="Dubai" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Postal Code / ZIP Code *</Label>
                      <Input value={form.postal_code} onChange={e => update('postal_code', e.target.value)} placeholder="00000" className="mt-1 h-10 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Country *</Label>
                      <Input value={form.country} onChange={e => update('country', e.target.value)} placeholder="United Arab Emirates" className="mt-1 h-10 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Floor / Tower / Complex Name <span className="text-muted-foreground/60">(optional)</span></Label>
                      <Input value={form.floor_tower_complex} onChange={e => update('floor_tower_complex', e.target.value)} placeholder="e.g. Tower A, Floor 12 or Emirates Towers Complex" className="mt-1 h-10 text-sm" />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Direct Hotel Phone Number</Label>
                      <div className="flex gap-1.5 mt-1">
                        <div className="flex items-center gap-1 bg-muted border border-input rounded-md px-2 shrink-0">
                          <span className="text-xs font-mono text-foreground whitespace-nowrap">{form.dial_code || '+?'}</span>
                        </div>
                        <Input value={form.official_phone} onChange={e => update('official_phone', e.target.value)} placeholder="04 000 0000" className="h-10 text-sm flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Registered Email <span className="text-accent">(for shipment paperwork)</span></Label>
                      <Input value={form.registered_email} onChange={e => update('registered_email', e.target.value)} placeholder="shipments@hotel.com" className="mt-1 h-10 text-sm" />
                      <p className="text-[10px] text-muted-foreground mt-1">Shipment details will be sent to this email for printing.</p>
                    </div>


                    <div>
                      <Label className="text-xs text-muted-foreground">Star Rating</Label>
                      <div className="flex gap-1 mt-2">
                        {[4, 5].map(n => (
                          <button type="button" key={n} onClick={() => update('star_rating', n)}
                            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-colors ${form.star_rating === n ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                            <Star className="w-3.5 h-3.5 fill-current" /> {n} Star
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Contacts Section */}
                  <div className="border-t border-border pt-4 space-y-4">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">Key Contacts</p>

                    {/* General Manager */}
                    <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">General Manager</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><Label className="text-xs text-muted-foreground">Full Name *</Label><Input value={form.gm_name} onChange={e => update('gm_name', e.target.value)} placeholder="Jane Doe" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Official Email *</Label><Input value={form.gm_email} onChange={e => update('gm_email', e.target.value)} placeholder="gm@hotel.com" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Phone Number *</Label><Input value={form.gm_phone} onChange={e => update('gm_phone', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">WhatsApp Number *</Label><Input value={form.gm_whatsapp} onChange={e => update('gm_whatsapp', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                      </div>
                    </div>

                    {/* Assistant General Manager */}
                    <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Assistant General Manager</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><Label className="text-xs text-muted-foreground">Full Name *</Label><Input value={form.agm_name} onChange={e => update('agm_name', e.target.value)} placeholder="Jane Doe" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Official Email *</Label><Input value={form.agm_email} onChange={e => update('agm_email', e.target.value)} placeholder="agm@hotel.com" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Phone Number *</Label><Input value={form.agm_phone} onChange={e => update('agm_phone', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">WhatsApp Number *</Label><Input value={form.agm_whatsapp} onChange={e => update('agm_whatsapp', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                      </div>
                    </div>

                    {/* Front Desk Manager */}
                    <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Front Desk Manager</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><Label className="text-xs text-muted-foreground">Full Name *</Label><Input value={form.fdm_name} onChange={e => update('fdm_name', e.target.value)} placeholder="Sarah Johnson" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Official Email *</Label><Input value={form.fdm_email} onChange={e => update('fdm_email', e.target.value)} placeholder="frontdesk@hotel.com" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Phone Number *</Label><Input value={form.fdm_phone} onChange={e => update('fdm_phone', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">WhatsApp Number *</Label><Input value={form.fdm_whatsapp} onChange={e => update('fdm_whatsapp', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                      </div>
                    </div>

                    {/* Head of Concierge / Bell Captain */}
                    <div className="bg-muted/40 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Head of Concierge / Bell Captain</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><Label className="text-xs text-muted-foreground">Full Name</Label><Input value={form.hoc_name} onChange={e => update('hoc_name', e.target.value)} placeholder="John Smith" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Official Email</Label><Input value={form.hoc_email} onChange={e => update('hoc_email', e.target.value)} placeholder="concierge@hotel.com" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Phone Number</Label><Input value={form.hoc_phone} onChange={e => update('hoc_phone', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">WhatsApp Number</Label><Input value={form.hoc_whatsapp} onChange={e => update('hoc_whatsapp', e.target.value)} placeholder="+971 50 000 0000" className="mt-1 h-9 text-sm" /></div>
                      </div>
                    </div>
                  </div>

                  {!saved ? (
                    <Button
                      onClick={handleSave}
                      disabled={saving || !form.name || !form.address_line1 || !form.area || !form.city || !form.state || !form.postal_code || !form.country || !form.gm_name || !form.gm_email || !form.gm_phone || !form.gm_whatsapp || !form.agm_name || !form.agm_email || !form.agm_phone || !form.agm_whatsapp  || !form.fdm_name || !form.fdm_email || !form.fdm_phone || !form.fdm_whatsapp}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-10"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {saving ? 'Saving…' : hotel ? 'Update Hotel Profile' : 'Save Hotel Profile'}
                    </Button>
                  ) : showSummary ? (
                    <div className="space-y-4">
                      {/* Success banner */}
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-semibold">Hotel profile saved! Please review your details below.</span>
                      </div>

                      {/* Summary card */}
                      <div className="border border-border rounded-xl overflow-hidden text-sm">
                        <div className="bg-muted/50 px-4 py-2 border-b border-border">
                          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Hotel Details</p>
                        </div>
                        <div className="divide-y divide-border">
                          {[
                            { label: 'Hotel Name', value: form.name },
                            { label: 'Star Rating', value: '★'.repeat(form.star_rating || 0) },
                            { label: 'Address', value: [form.address_line1, form.area, form.city, form.state, form.postal_code, form.country, form.floor_tower_complex].filter(Boolean).join(', ') },
                            { label: 'Direct Hotel Phone', value: form.official_phone ? `${form.dial_code} ${form.official_phone}` : '' },
                            { label: 'Registered Email (Shipments)', value: form.registered_email },
                          ].filter(r => r.value).map(row => (
                            <div key={row.label} className="flex justify-between gap-4 px-4 py-2">
                              <span className="text-muted-foreground shrink-0">{row.label}</span>
                              <span className="font-medium text-foreground text-right">{row.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Key Contacts Summary */}
                        {[{ title: 'General Manager', name: form.gm_name, email: form.gm_email, phone: form.gm_phone, whatsapp: form.gm_whatsapp },
                          { title: 'Assistant General Manager', name: form.agm_name, email: form.agm_email, phone: form.agm_phone, whatsapp: form.agm_whatsapp },
                          { title: 'Head of Concierge', name: form.hoc_name, email: form.hoc_email, phone: form.hoc_phone, whatsapp: form.hoc_whatsapp },
                          { title: 'Front Desk Manager', name: form.fdm_name, email: form.fdm_email, phone: form.fdm_phone, whatsapp: form.fdm_whatsapp },
                        ].filter(c => c.name || c.email).map(contact => (
                          <div key={contact.title}>
                            <div className="bg-muted/30 px-4 py-1.5 border-t border-border">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{contact.title}</p>
                            </div>
                            {[{ label: 'Name', value: contact.name }, { label: 'Email', value: contact.email }, { label: 'Phone', value: contact.phone }, { label: 'WhatsApp', value: contact.whatsapp }].filter(r => r.value).map(row => (
                              <div key={row.label} className="flex justify-between gap-4 px-4 py-2 border-t border-border">
                                <span className="text-muted-foreground shrink-0 text-xs">{row.label}</span>
                                <span className="font-medium text-foreground text-right text-xs">{row.value}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setSaved(false); setShowSummary(false); }} className="flex-1 rounded-xl h-10 text-sm">
                          Edit Details
                        </Button>
                        <Button onClick={() => { setTab('qr'); setSaved(false); setShowSummary(false); }} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl h-10 text-sm">
                          <QrCode className="w-4 h-4 mr-1.5" /> Generate QR Code →
                        </Button>
                      </div>
                    </div>
                  ) : null}
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