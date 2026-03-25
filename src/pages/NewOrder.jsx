import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Package, Camera, Upload, Loader2, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import CountrySelect from '../components/CountrySelect';
import PhoneInput from '../components/PhoneInput';
import BoxCard from '../components/BoxCard';
import { getShippingPrice } from '../utils/pricing';

const STEPS = ['Your Details', 'Destination', 'Box & Price', 'Confirm'];

export default function NewOrder() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('hotelId');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanningPassport, setScanningPassport] = useState(false);
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
    box_size: '',
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

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePassportScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setScanningPassport(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract the following details from this passport image: first name, middle name (if any), last name, nationality (as a country name), passport number, and expiry date (in YYYY-MM-DD format). If a field is not visible or unclear, return an empty string.`,
      response_json_schema: {
        type: 'object',
        properties: {
          first_name: { type: 'string' },
          middle_name: { type: 'string' },
          last_name: { type: 'string' },
          nationality: { type: 'string' },
          passport_number: { type: 'string' },
          expiry_date: { type: 'string' },
        },
      },
      file_urls: [file_url],
    });
    setForm(prev => ({
      ...prev,
      first_name: result.first_name || prev.first_name,
      middle_name: result.middle_name || prev.middle_name,
      last_name: result.last_name || prev.last_name,
      nationality: result.nationality || prev.nationality,
      passport_number: result.passport_number || prev.passport_number,
      passport_expiry: result.expiry_date || prev.passport_expiry,
    }));
    setScanningPassport(false);
  };

  const shippingPrice = getShippingPrice(form.destination_country);

  const canNext = () => {
    if (step === 0) return form.first_name && form.last_name && form.phone_number;
    if (step === 1) return form.destination_country && form.destination_address && form.destination_city && form.recipient_name;
    if (step === 2) return !!form.box_size;
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
    });
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

      {/* Hotel badge if coming from QR */}
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

            {/* Read-only identity summary */}
            <div className="bg-muted/50 rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Account Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><span className="text-muted-foreground text-xs">Name</span><p className="font-medium text-foreground">{[form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ') || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Nationality</span><p className="font-medium text-foreground">{form.nationality || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Passport No.</span><p className="font-medium text-foreground">{form.passport_number || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Expiry</span><p className="font-medium text-foreground">{form.passport_expiry || '—'}</p></div>
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-xs text-muted-foreground">Email Address *</Label>
              <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@example.com" className="mt-1" />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Phone Number *</Label>
                <PhoneInput value={form.phone_number} onChange={(v) => update('phone_number', v)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">WhatsApp Number</Label>
                <PhoneInput value={form.whatsapp_number} onChange={(v) => update('whatsapp_number', v)} />
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              <MessageCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-green-700 leading-relaxed">
                We use WhatsApp for real-time shipment tracking & updates.{' '}
                <a href="https://www.whatsapp.com/download" target="_blank" rel="noopener noreferrer" className="underline font-medium">Download WhatsApp</a>
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

        {/* STEP 1: Destination */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Delivery Address</h2>
              <p className="text-sm text-muted-foreground mt-1">Pre-filled from your account. Update in Profile if needed.</p>
            </div>

            {/* Shipping price banner */}
            {form.destination_country && (
              <div className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-xl px-4 py-3">
                <Package className="w-4 h-4 text-accent shrink-0" />
                <p className="text-sm text-foreground">
                  Shipping to <strong>{form.destination_country}</strong>:{' '}
                  <span className="text-accent font-bold">${getShippingPrice(form.destination_country)}</span> per box
                </p>
              </div>
            )}

            {/* Read-only delivery deck */}
            <div className="bg-muted/50 rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Delivery Details</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Recipient Name</span>
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
                  <span className="text-muted-foreground text-xs">Recipient Phone</span>
                  <p className="font-medium text-foreground">{form.recipient_phone || '—'}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Need to change your delivery address?{' '}
              <a href="/profile" className="text-accent font-medium hover:underline">Edit in Profile</a>
            </p>
          </motion.div>
        )}

        {/* STEP 2: Box Size + Price */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Choose Your Box</h2>
              <p className="text-sm text-muted-foreground mt-1">Both sizes ship to <strong>{form.destination_country}</strong> for the same price.</p>
            </div>

            {/* Price banner */}
            <div className="bg-primary rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-wide">Shipping to {form.destination_country}</p>
                <p className="text-3xl font-bold text-white mt-0.5">${shippingPrice} <span className="text-base font-normal text-white/60">per box</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-accent font-semibold">1–3 working days</p>
                <p className="text-[10px] text-white/50 mt-0.5">via FedEx / DHL</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BoxCard size="10kg" selected={form.box_size === '10kg'} onSelect={(s) => update('box_size', s)} />
              <BoxCard size="20kg" selected={form.box_size === '20kg'} onSelect={(s) => update('box_size', s)} />
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Price is the same regardless of box size. Overweight boxes may incur additional charges.
            </p>
          </motion.div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Confirm Order</h2>
              <p className="text-sm text-muted-foreground mt-1">Review your shipment details before continuing.</p>
            </div>

            <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
              <SummaryRow label="Guest" value={`${form.first_name} ${form.last_name}`} />
              {form.hotel_name && <SummaryRow label="Hotel" value={`${form.hotel_name}${form.hotel_room ? ` · ${form.hotel_room}` : ''}`} />}
              <SummaryRow label="Box Size" value={form.box_size} />
              <SummaryRow label="Destination" value={form.destination_country} />
              <SummaryRow label="Recipient" value={form.recipient_name} />
              <SummaryRow label="Address" value={`${form.destination_address}, ${form.destination_city}${form.destination_postal_code ? ` ${form.destination_postal_code}` : ''}`} />
              <div className="px-5 py-4 flex justify-between items-center bg-accent/5">
                <span className="font-bold text-foreground">Shipping Total</span>
                <span className="text-2xl font-bold text-accent">${shippingPrice}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-muted rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                After creating your order, you'll upload shopping receipts. Payment is collected at pickup.
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
          onClick={() => step < 3 ? setStep(step + 1) : handleCreate()}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
          ) : step < 3 ? (
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