import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, Eye, EyeOff, Loader2, Package, MapPin, Star, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import PhoneInput from '../components/PhoneInput';
import CountrySelect from '../components/CountrySelect';
import { getShippingPrice } from '../utils/pricing';

export default function Register() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('hotelId');

  const [hotel, setHotel] = useState(null);
  const [scanningPassport, setScanningPassport] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    home_address: '',
    home_address2: '',
    home_city: '',
    home_postal_code: '',
    home_country: '',
    password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (hotelId) loadHotel();
  }, [hotelId]);

  const loadHotel = async () => {
    try {
      const hotel = await base44.entities.Hotel.get(hotelId);
      setHotel(hotel);
    } catch {}
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
        type: "object",
        properties: {
          first_name: { type: "string" },
          middle_name: { type: "string" },
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
      first_name: result.first_name || prev.first_name,
      middle_name: result.middle_name || prev.middle_name,
      last_name: result.last_name || prev.last_name,
      nationality: result.nationality || prev.nationality,
      passport_number: result.passport_number || prev.passport_number,
      passport_expiry: result.expiry_date || prev.passport_expiry,
    }));
    setScanningPassport(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      alert('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);

    const formatPhone = (v) => { const p = (v || '').split('|'); return p.length === 2 ? `${p[0]}${p[1]}` : v; };

    await base44.auth.updateMe({
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      nationality: form.nationality,
      passport_number: form.passport_number,
      passport_expiry: form.passport_expiry,
      email: form.email,
      phone_number: formatPhone(form.phone_number),
      whatsapp_number: formatPhone(form.whatsapp_number),
      home_address: form.home_address,
      home_address2: form.home_address2,
      home_city: form.home_city,
      home_postal_code: form.home_postal_code,
      home_country: form.home_country,
      hotel_id: hotelId || '',
      hotel_name: hotel?.name || '',
      hotel_city: hotel?.city || '',
      hotel_country: hotel?.country || '',
    });

    if (hotelId) {
      navigate(`/new-order?hotelId=${hotelId}`);
    } else {
      navigate('/new-order');
    }
    setSubmitting(false);
  };

  const isFormValid = form.first_name && form.last_name && form.nationality &&
    form.passport_number && form.email && form.phone_number.includes('|') && form.phone_number.split('|')[1] &&
    form.home_address && form.home_city && form.home_country &&
    form.password && form.confirm_password;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Send It Home</p>
            <p className="text-[9px] text-muted-foreground">Convenience Delivered Seamlessly</p>
          </div>
        </div>

        {/* Hotel badge */}
        {hotel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-accent/5 border border-accent/20 rounded-2xl px-4 py-3 mt-4 mb-6"
          >
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{hotel.name}</p>
              <p className="text-[10px] text-muted-foreground">{hotel.city}, {hotel.country}</p>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: hotel.star_rating || 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 text-accent fill-accent" />
              ))}
            </div>
          </motion.div>
        )}

        <div className="mb-2">
          <span className="text-xs font-semibold bg-muted text-muted-foreground px-3 py-1 rounded-full">WELCOME</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mt-2 mb-1">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Fill out your details so you can <strong className="text-foreground">SENDITHOME</strong>, with our unique international courier service.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Passport scan section */}
          <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center">
            {scanningPassport ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm font-medium">AI is reading your passport...</p>
                <p className="text-xs text-muted-foreground">This takes a few seconds</p>
              </div>
            ) : (
              <>
                <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground">Scan Your Passport</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Take a photo or upload your passport. Our AI will automatically extract your details.
                </p>
                <div className="flex gap-3 justify-center mt-4">
                  <label className="cursor-pointer">
                    <Button type="button" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl pointer-events-none">
                      <Camera className="w-3.5 h-3.5 mr-1.5" />
                      Scan Passport
                    </Button>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePassportScan} />
                  </label>
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" className="rounded-xl pointer-events-none">
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Upload Photo
                    </Button>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handlePassportScan} />
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">Or fill in the details manually below</p>
              </>
            )}
          </div>

          {/* Personal details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">First Name *</Label>
                <Input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} placeholder="John" className="mt-1.5 h-11" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Middle Name</Label>
                <Input value={form.middle_name} onChange={(e) => update('middle_name', e.target.value)} placeholder="William" className="mt-1.5 h-11" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name *</Label>
                <Input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} placeholder="Smith" className="mt-1.5 h-11" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nationality *</Label>
                <Input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} placeholder="United Kingdom" className="mt-1.5 h-11" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Passport Number *</Label>
                <Input value={form.passport_number} onChange={(e) => update('passport_number', e.target.value)} placeholder="AB1234567" className="mt-1.5 h-11" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date of Expiry *</Label>
                <Input type="date" value={form.passport_expiry} onChange={(e) => update('passport_expiry', e.target.value)} className="mt-1.5 h-11" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address *</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="john@example.com" className="mt-1.5 h-11" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number *</Label>
                <PhoneInput value={form.phone_number} onChange={(v) => update('phone_number', v)} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">WhatsApp Number</Label>
              <PhoneInput value={form.whatsapp_number} onChange={(v) => update('whatsapp_number', v)} />
              <div className="flex items-start gap-2 mt-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <MessageCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-green-700 leading-relaxed">
                  If you don't have WhatsApp, please{' '}
                  <a href="https://www.whatsapp.com/download" target="_blank" rel="noopener noreferrer" className="underline font-medium">download it here</a>
                  {' '}— we use WhatsApp for real-time shipment tracking & updates.
                </p>
              </div>
            </div>

            {/* Home / Delivery Address */}
            <div className="border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-accent text-xs">🏠</span>
                </div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Home Delivery Address</p>
              </div>
              <p className="text-[10px] text-muted-foreground -mt-1">This is where your shipment will be delivered. Must match your passport details.</p>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Country *</Label>
                <div className="mt-1.5">
                  <CountrySelect value={form.home_country} onChange={(v) => update('home_country', v)} />
                </div>
                {form.home_country && (
                  <p className="text-xs text-accent font-semibold mt-1.5">
                    🚚 Shipping to {form.home_country}: <span className="font-bold">${getShippingPrice(form.home_country)} per box</span>
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address Line 1 *</Label>
                <Input value={form.home_address} onChange={(e) => update('home_address', e.target.value)} placeholder="House number & street name" className="mt-1.5 h-11" required />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address Line 2</Label>
                <Input value={form.home_address2} onChange={(e) => update('home_address2', e.target.value)} placeholder="Apartment, suite, floor (optional)" className="mt-1.5 h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">City *</Label>
                  <Input value={form.home_city} onChange={(e) => update('home_city', e.target.value)} placeholder="City" className="mt-1.5 h-11" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Postal Code</Label>
                  <Input value={form.home_postal_code} onChange={(e) => update('home_postal_code', e.target.value)} placeholder="12345" className="mt-1.5 h-11" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Min 8 characters"
                    className="h-11 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm Password *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={(e) => update('confirm_password', e.target.value)}
                    placeholder="Re-enter password"
                    className="h-11 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-13 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-base py-4"
            disabled={submitting || !isFormValid}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            )}
            Submit & Continue
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link to={hotelId ? `/login?hotelId=${hotelId}` : '/login'} className="text-accent font-medium hover:underline">
              Log In
            </Link>
          </p>
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-8 pb-4">
          Hotel 2 Home is Send It Home · Powered by FedEx & DHL · 50+ Countries · 1–3 Day Delivery
        </p>
      </div>

      {/* Right: Luxury visual (desktop only) */}
      <div className="hidden md:flex flex-col items-center justify-center w-96 bg-gradient-to-b from-[#f5f0e8] to-[#e8dfc8] p-8 sticky top-0 h-screen">
        <div className="text-center">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'LUXURY BRAND', price: '$2,400', bg: 'bg-gray-900 text-white' },
              { label: 'DESIGNER', price: '$8,500', bg: 'bg-gray-900 text-white' },
              { label: 'DUBAI MALL', price: null, bg: 'bg-white border border-gray-200' },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} ${i === 2 ? 'col-span-2' : ''} rounded-2xl p-4 text-center`}>
                <p className={`text-xs font-bold tracking-widest ${item.bg.includes('gray-900') ? 'text-white' : 'text-gray-800'}`}>{item.label}</p>
                {item.price && (
                  <div className="mt-2 inline-block bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">{item.price}</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">Shop Without Limits.</p>
          <p className="text-lg font-bold text-gray-800">Travel Without Luggage.</p>
          <p className="text-sm text-gray-500 mt-3">Send your purchases home from any partner hotel</p>
        </div>
      </div>
    </div>
  );
}