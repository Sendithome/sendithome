import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Package, Camera, Upload, Loader2, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import BoxCard from '../components/BoxCard';
import CountrySelect from '../components/CountrySelect';

const STEPS = ['Box Size', 'Your Details', 'Destination', 'Confirm'];

export default function NewOrder() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('hotelId');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanningPassport, setScanningPassport] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    box_size: '',
    destination_country: '',
    destination_address: '',
    destination_city: '',
    destination_postal_code: '',
    recipient_name: '',
    recipient_phone: '',
    hotel_name: '',
    hotel_room: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    nationality: '',
    passport_number: '',
    passport_expiry: '',
    email: '',
    phone_number: '',
    whatsapp_number: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => {
    prefill();
  }, []);

  const prefill = async () => {
    const me = await base44.auth.me();
    const updates = {};
    if (me?.home_country) updates.destination_country = me.home_country;
    if (me?.home_address) updates.destination_address = me.home_address;
    if (me?.home_city) updates.destination_city = me.home_city;
    if (me?.home_postal_code) updates.destination_postal_code = me.home_postal_code;
    if (me?.first_name) updates.first_name = me.first_name;
    if (me?.last_name) updates.last_name = me.last_name;
    if (me?.middle_name) updates.middle_name = me.middle_name;
    if (me?.nationality) updates.nationality = me.nationality;
    if (me?.passport_number) updates.passport_number = me.passport_number;
    if (me?.passport_expiry) updates.passport_expiry = me.passport_expiry;
    if (me?.phone_number) updates.phone_number = me.phone_number;
    if (me?.whatsapp_number) updates.whatsapp_number = me.whatsapp_number;
    if (me?.email) updates.email = me.email;
    const fullName = [me?.first_name, me?.last_name].filter(Boolean).join(' ');
    if (fullName) updates.recipient_name = fullName;
    if (hotelId) {
      const hotels = await base44.entities.Hotel.filter({ id: hotelId });
      if (hotels.length > 0) updates.hotel_name = hotels[0].name;
    } else if (me?.hotel_name) {
      updates.hotel_name = me.hotel_name;
    }
    if (Object.keys(updates).length > 0) {
      setForm(prev => ({ ...prev, ...updates }));
    }
  };

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

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 0) return !!form.box_size;
    if (step === 1) return form.first_name && form.last_name && form.nationality && form.passport_number && form.phone_number;
    if (step === 2) return form.destination_country && form.destination_address && form.destination_city && form.recipient_name;
    return true;
  };

  const handleCreate = async () => {
    setLoading(true);
    // Save profile info
    await base44.auth.updateMe({
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      nationality: form.nationality,
      passport_number: form.passport_number,
      passport_expiry: form.passport_expiry,
      phone_number: form.phone_number,
      whatsapp_number: form.whatsapp_number,
    });
    const orderNum = 'SIH-' + Date.now().toString(36).toUpperCase();
    const order = await base44.entities.Order.create({
      ...form,
      order_number: orderNum,
      status: 'pending',
      price: 60,
      currency: 'USD',
      payment_status: 'unpaid',
    });
    navigate(`/order/${order.id}/receipts`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
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

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-muted-foreground mb-6">
              Choose your box size. Both options are $60 — flat rate, no surprises.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BoxCard size="10kg" selected={form.box_size === '10kg'} onSelect={(s) => update('box_size', s)} />
              <BoxCard size="20kg" selected={form.box_size === '20kg'} onSelect={(s) => update('box_size', s)} />
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {/* Passport scan */}
            <div className="border-2 border-dashed border-border rounded-2xl p-5 text-center">
              {scanningPassport ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  <p className="text-sm font-medium">AI is reading your passport...</p>
                  <p className="text-xs text-muted-foreground">This takes a few seconds</p>
                </div>
              ) : (
                <>
                  <Camera className="w-9 h-9 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Scan Your Passport</p>
                  <p className="text-xs text-muted-foreground mt-1">Our AI will automatically extract your details.</p>
                  <div className="flex gap-3 justify-center mt-4">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl">
                        <Camera className="w-3.5 h-3.5" /> Scan Passport
                      </span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePassportScan} />
                    </label>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-1.5 border border-border text-foreground text-xs font-medium px-4 py-2 rounded-xl">
                        <Upload className="w-3.5 h-3.5" /> Upload Photo
                      </span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={handlePassportScan} />
                    </label>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3">Or fill in the details manually below</p>
                </>
              )}
            </div>

            {/* Name row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">First Name *</Label>
                <Input value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder="John" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Middle Name</Label>
                <Input value={form.middle_name} onChange={e => update('middle_name', e.target.value)} placeholder="William" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Last Name *</Label>
                <Input value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder="Smith" className="mt-1" />
              </div>
            </div>

            {/* Passport row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Nationality *</Label>
                <Input value={form.nationality} onChange={e => update('nationality', e.target.value)} placeholder="United Kingdom" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Passport Number *</Label>
                <Input value={form.passport_number} onChange={e => update('passport_number', e.target.value)} placeholder="AB1234567" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date of Expiry</Label>
                <Input type="date" value={form.passport_expiry} onChange={e => update('passport_expiry', e.target.value)} className="mt-1" />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Phone Number *</Label>
                <Input value={form.phone_number} onChange={e => update('phone_number', e.target.value)} placeholder="+971 50 123 4567" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">WhatsApp Number</Label>
                <Input value={form.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} placeholder="+971 50 123 4567" className="mt-1" />
              </div>
            </div>
            <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              <MessageCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-green-700 leading-relaxed">
                We use WhatsApp for real-time shipment tracking & updates.
              </p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">Delivery Address</span>
              </div>
              <CountrySelect value={form.destination_country} onChange={(v) => update('destination_country', v)} />
              <div>
                <Label className="text-xs text-muted-foreground">Recipient Name *</Label>
                <Input value={form.recipient_name} onChange={(e) => update('recipient_name', e.target.value)} placeholder="Full name" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                <Input value={form.recipient_phone} onChange={(e) => update('recipient_phone', e.target.value)} placeholder="+1 234 567 890" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Street Address *</Label>
                <Input value={form.destination_address} onChange={(e) => update('destination_address', e.target.value)} placeholder="123 Main Street" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">City *</Label>
                  <Input value={form.destination_city} onChange={(e) => update('destination_city', e.target.value)} placeholder="City" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Postal Code</Label>
                  <Input value={form.destination_postal_code} onChange={(e) => update('destination_postal_code', e.target.value)} placeholder="12345" className="mt-1" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">Hotel Details</span>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Hotel Name</Label>
                <Input value={form.hotel_name} onChange={(e) => update('hotel_name', e.target.value)} placeholder="Hotel name" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Room Number</Label>
                <Input value={form.hotel_room} onChange={(e) => update('hotel_room', e.target.value)} placeholder="Room 301" className="mt-1" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <h3 className="font-semibold text-foreground">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Box Size</span>
                  <span className="font-medium">{form.box_size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-medium">{form.destination_country}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-medium">{form.recipient_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-right">{form.destination_address}, {form.destination_city}</span>
                </div>
                {form.first_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Guest</span>
                    <span className="font-medium">{form.first_name} {form.last_name}</span>
                  </div>
                )}
                {form.hotel_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hotel</span>
                    <span className="font-medium">{form.hotel_name} {form.hotel_room && `· ${form.hotel_room}`}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-accent">$60</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Next: Upload your shopping receipts for customs clearance
            </p>
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