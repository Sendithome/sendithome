import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Package, Loader2, MessageCircle, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import PhoneInput from '../components/PhoneInput';
import { getShippingPrice } from '../utils/pricing';
import { convertToLocalCurrency } from '../utils/currencyConversion';

const STEPS = ['Your Details', 'Home Address', 'Confirm'];

export default function NewOrder() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('hotelId');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hotel, setHotel] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    nationality: '',
    passport_number: '',
    passport_expiry: '',
    email: '',
    phone_number: '+971|',
    whatsapp_number: '+971|',
    hotel_name: '',
    hotel_address: '',
    hotel_city: '',
    hotel_country: '',
    hotel_room: '',
    destination_country: '',
    destination_address: '',
    destination_city: '',
    destination_postal_code: '',
    recipient_name: '',
    recipient_phone: '',
    recipient_email: '',
    recipient_nationality: '',
    recipient_passport_number: '',
    recipient_alternate_phone: '',
  });

  useEffect(() => { prefill(); }, []);

  const prefill = async () => {
    const me = await base44.auth.me();
    const updates = {};
    if (me?.first_name) updates.first_name = me.first_name;
    if (me?.last_name) updates.last_name = me.last_name;
    if (me?.middle_name) updates.middle_name = me.middle_name;
    if (me?.nationality) updates.nationality = me.nationality;
    if (me?.passport_number) updates.passport_number = me.passport_number;
    if (me?.passport_expiry) updates.passport_expiry = me.passport_expiry;
    if (me?.phone_number) updates.phone_number = me.phone_number.includes('|') ? me.phone_number : `+971|${me.phone_number}`;
    if (me?.whatsapp_number) updates.whatsapp_number = me.whatsapp_number.includes('|') ? me.whatsapp_number : `+971|${me.whatsapp_number}`;
    if (me?.email) updates.email = me.email;
    if (me?.home_country) updates.destination_country = me.home_country;
    if (me?.home_address) updates.destination_address = me.home_address;
    if (me?.home_city) updates.destination_city = me.home_city;
    if (me?.home_postal_code) updates.destination_postal_code = me.home_postal_code;
    if (me?.phone_number) updates.recipient_phone = me.phone_number.includes('|') ? me.phone_number.split('|').join('') : me.phone_number;
    if (me?.email) updates.recipient_email = me.email;
    if (me?.nationality) updates.recipient_nationality = me.nationality;
    if (me?.whatsapp_number) updates.recipient_alternate_phone = me.whatsapp_number.includes('|') ? me.whatsapp_number.split('|').join('') : me.whatsapp_number;
    const fullName = [me?.first_name, me?.last_name].filter(Boolean).join(' ');
    if (fullName) updates.recipient_name = fullName;

    if (hotelId) {
      const h = await base44.entities.Hotel.get(hotelId);
      if (h) {
        setHotel(h);
        updates.hotel_name = h.name;
        updates.hotel_address = h.address || '';
        updates.hotel_city = h.city || '';
        updates.hotel_country = h.country || '';
      }
    } else if (me?.hotel_name) {
      updates.hotel_name = me.hotel_name;
    }
    if (Object.keys(updates).length > 0) setForm(prev => ({ ...prev, ...updates }));
  };

  const NATIONALITY_TO_DIAL = {
    'united arab emirates': '+971', 'uae': '+971',
    'united states': '+1', 'usa': '+1',
    'united kingdom': '+44', 'uk': '+44',
    'saudi arabia': '+966', 'qatar': '+974', 'kuwait': '+965',
    'bahrain': '+973', 'oman': '+968', 'jordan': '+962',
    'lebanon': '+961', 'egypt': '+20', 'turkey': '+90',
    'india': '+91', 'pakistan': '+92', 'bangladesh': '+880',
    'germany': '+49', 'france': '+33', 'italy': '+39',
    'spain': '+34', 'netherlands': '+31', 'sweden': '+46',
    'norway': '+47', 'switzerland': '+41', 'australia': '+61',
    'canada': '+1', 'brazil': '+55', 'south africa': '+27',
    'nigeria': '+234', 'kenya': '+254', 'philippines': '+63',
    'singapore': '+65', 'malaysia': '+60', 'thailand': '+66',
    'china': '+86', 'japan': '+81', 'south korea': '+82',
    'russia': '+7', 'indonesia': '+62', 'vietnam': '+84',
  };

  useEffect(() => {
    if (!form.destination_country) return;
    const dial = NATIONALITY_TO_DIAL[form.destination_country.toLowerCase().trim()];
    if (dial) {
      setForm(prev => ({
        ...prev,
        recipient_phone: dial + (prev.recipient_phone.replace(/^\+\d+/, '') || ''),
      }));
    }
  }, [form.destination_country]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const shippingPrice = getShippingPrice(form.destination_country);

  const canNext = () => {
    if (step === 0) return form.first_name && form.last_name && form.phone_number.split('|')[1];
    if (step === 1) return !!form.destination_country;
    return true;
  };

  const handleCreate = async () => {
    setLoading(true);
    const formatPhone = (v) => { const p = (v || '').split('|'); return p.length === 2 ? `${p[0]}${p[1]}` : v; };
    await base44.auth.updateMe({
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      nationality: form.nationality,
      passport_number: form.passport_number,
      passport_expiry: form.passport_expiry,
      phone_number: formatPhone(form.phone_number),
      whatsapp_number: formatPhone(form.whatsapp_number),
    });
    const orderNum = 'SIH-' + Date.now().toString(36).toUpperCase();
    const order = await base44.entities.Order.create({
      ...form,
      phone_number: formatPhone(form.phone_number),
      whatsapp_number: formatPhone(form.whatsapp_number),
      order_number: orderNum,
      status: 'pending',
      price: shippingPrice,
      currency: 'USD',
      payment_status: 'unpaid',
      sender_email: form.email,
      sender_phone: formatPhone(form.phone_number),
      sender_alternate_phone: formatPhone(form.whatsapp_number),
    });
    setLoading(false);
    navigate(`/order/${order.id}/receipts`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">New Shipment</h1>
          <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-muted'}`} />
        ))}
      </div>

      {/* Hotel badge */}
      {hotel && (
        <div className="flex items-center gap-3 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 mb-6">
          <MapPin className="w-4 h-4 text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">{hotel.name}</p>
            <p className="text-[10px] text-muted-foreground">{hotel.city}, {hotel.country}</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* STEP 0: Your Details */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Details</h2>
              <p className="text-sm text-muted-foreground mt-1">Your personal details are pre-filled from your account.</p>
            </div>

            {/* Read-only account summary */}
            <div className="bg-muted/50 rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Account Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium text-foreground">{[form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ') || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Nationality</span><p className="font-medium text-foreground">{form.nationality || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Passport No.</span><p className="font-medium text-foreground">{form.passport_number || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Expiry</span><p className="font-medium text-foreground">{form.passport_expiry || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Email</span><p className="font-medium text-foreground">{form.email || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Phone</span><p className="font-medium text-foreground">{form.phone_number ? form.phone_number.replace('|', ' ') : '—'}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground text-xs">WhatsApp</span><p className="font-medium text-foreground">{form.whatsapp_number ? form.whatsapp_number.replace('|', ' ') : '—'}</p></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                Need to update your details?{' '}
                <a href="/profile" className="text-accent font-medium hover:underline">Edit in Profile</a>
              </p>
            </div>

            {/* Hotel */}
            {hotel ? (
              <div className="bg-muted/50 rounded-2xl border border-border p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hotel (from QR scan)</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium text-foreground">{form.hotel_name}</p></div>
                  {form.hotel_address && <div><span className="text-muted-foreground text-xs">Address</span><p className="font-medium text-foreground">{form.hotel_address}</p></div>}
                  <div><span className="text-muted-foreground text-xs">City</span><p className="font-medium text-foreground">{form.hotel_city}</p></div>
                  <div><span className="text-muted-foreground text-xs">Country</span><p className="font-medium text-foreground">{form.hotel_country}</p></div>
                </div>
                <div className="pt-2 border-t border-border">
                  <Label className="text-xs text-muted-foreground">Room Number *</Label>
                  <Input value={form.hotel_room} onChange={e => update('hotel_room', e.target.value)} placeholder="e.g. 301" className="mt-1" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Hotel Name</Label>
                  <Input value={form.hotel_name} onChange={e => update('hotel_name', e.target.value)} placeholder="Hotel name" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Room Number</Label>
                  <Input value={form.hotel_room} onChange={e => update('hotel_room', e.target.value)} placeholder="Room 301" className="mt-1" />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 1: Home Address */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Home Address</h2>
              <p className="text-sm text-muted-foreground mt-1">Your home address is automatically fetched from your account.</p>
            </div>

            {form.destination_country && (
              <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
                <Package className="w-4 h-4 text-accent shrink-0" />
                <p className="text-sm text-foreground">
                  Shipping to <strong>{form.destination_country}</strong> · <span className="text-accent font-bold">$50 platform fee</span>
                </p>
              </div>
            )}

            {/* Receiver Address (read-only from profile) */}
            <div className="bg-muted/50 rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Delivery Address</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Full Name</span>
                  <p className="font-medium text-foreground">{form.recipient_name || '—'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Street Address</span>
                  <p className="font-medium text-foreground">{form.destination_address || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">City</span>
                  <p className="font-medium text-foreground">{form.destination_city || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Postal Code</span>
                  <p className="font-medium text-foreground">{form.destination_postal_code || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Country</span>
                  <p className="font-medium text-foreground">{form.destination_country || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Primary Phone</span>
                  <p className="font-medium text-foreground">{form.recipient_phone || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Email</span>
                  <p className="font-medium text-foreground">{form.recipient_email || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Nationality</span>
                  <p className="font-medium text-foreground">{form.recipient_nationality || '—'}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                Need to update?{' '}
                <a href="/profile" className="text-accent font-medium hover:underline">Edit in Profile</a>
              </p>
            </div>

            {/* Additional receiver fields that may differ from sender */}
            <div className="border border-border rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Additional Receiver Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Alternate Phone</Label>
                  <Input value={form.recipient_alternate_phone} onChange={e => update('recipient_alternate_phone', e.target.value)} placeholder="+44 7xxx xxxxxx" className="mt-1 h-10" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Passport No. (if different)</Label>
                  <Input value={form.recipient_passport_number} onChange={e => update('recipient_passport_number', e.target.value.toUpperCase())} placeholder="AB1234567" className="mt-1 h-10" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Confirm */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Confirm Order</h2>
              <p className="text-sm text-muted-foreground mt-1">Review your shipment details before continuing.</p>
            </div>

            <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
              <SummaryRow label="Guest" value={[form.first_name, form.last_name].filter(Boolean).join(' ')} />
              {form.hotel_name && <SummaryRow label="Hotel" value={`${form.hotel_name}${form.hotel_room ? ` · Room ${form.hotel_room}` : ''}`} />}
              <SummaryRow label="Ships To" value={form.destination_country} />
              <SummaryRow label="Recipient" value={form.recipient_name} />
              <SummaryRow label="Address" value={[form.destination_address, form.destination_city, form.destination_postal_code].filter(Boolean).join(', ')} />
              <div className="px-5 py-4 flex justify-between items-center bg-accent/5">
                <span className="font-bold text-foreground">Platform Fee</span>
                <span className="text-xl font-bold text-accent">$50 USD</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-muted rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Next: upload your shopping receipts, select your box size, and pay online. Your parcel will be picked up within 24 working hours.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-xl">
            Back
          </Button>
        )}
        <Button
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-12"
          disabled={!canNext() || loading}
          onClick={() => step < 2 ? setStep(step + 1) : handleCreate()}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
          ) : step < 2 ? (
            <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
          ) : (
            'Create Order & Upload Receipts'
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="px-5 py-3 flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}