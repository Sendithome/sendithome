import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, Eye, EyeOff, Loader2, Package, MapPin, Star, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import PhoneInput from '../components/PhoneInput';
import PassportVerification from '../components/PassportVerification';
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
  const [errors, setErrors] = useState({});
  const [passportVerification, setPassportVerification] = useState(null); // null=pending, object=result

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

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Passport: 1-2 letters followed by 6-9 digits (covers most international formats)
  const validatePassport = (num) => /^[A-Z0-9]{6,12}$/i.test(num.trim());

  const validate = () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!form.passport_number.trim()) {
      newErrors.passport_number = 'Passport number is required';
    } else if (!validatePassport(form.passport_number)) {
      newErrors.passport_number = 'Invalid passport number (6–12 alphanumeric characters)';
    }
    if (!form.passport_expiry) newErrors.passport_expiry = 'Expiry date is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.phone_number.split('|')[1]) newErrors.phone_number = 'Phone number is required';
    if (!form.home_country) newErrors.home_country = 'Country is required';
    if (!form.home_address.trim()) newErrors.home_address = 'Address is required';
    if (!form.home_city.trim()) newErrors.home_city = 'City is required';
    if (!form.home_postal_code.trim()) newErrors.home_postal_code = 'Postal code is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!form.confirm_password) newErrors.confirm_password = 'Please confirm your password';
    else if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!validate()) return;
    // Block if passport fields are filled but verification failed or still pending
    const passportFilled = form.passport_number?.trim() && form.nationality?.trim() && form.passport_expiry && form.first_name?.trim() && form.last_name?.trim();
    if (passportFilled && (!passportVerification || !passportVerification.verified)) {
      setErrors(prev => ({ ...prev, passport_verification: passportVerification === null ? 'Please wait for passport verification to complete.' : 'Passport verification failed. Please check your details.' }));
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

  const isFormValid = true; // validation handled in validate()

  return (
    <div className="min-h-screen flex flex-col">
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
                  <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    Scan Passport
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePassportScan} />
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium border border-input bg-background hover:bg-muted transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
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
                <Input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} placeholder="John" className={`mt-1.5 h-11 ${errors.first_name ? 'border-destructive' : ''}`} />
                {errors.first_name && <p className="text-xs text-destructive mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Middle Name</Label>
                <Input value={form.middle_name} onChange={(e) => update('middle_name', e.target.value)} placeholder="William" className="mt-1.5 h-11" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Name *</Label>
                <Input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} placeholder="Smith" className={`mt-1.5 h-11 ${errors.last_name ? 'border-destructive' : ''}`} />
                {errors.last_name && <p className="text-xs text-destructive mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nationality *</Label>
                <Input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} placeholder="United Kingdom" className={`mt-1.5 h-11 ${errors.nationality ? 'border-destructive' : ''}`} />
                {errors.nationality && <p className="text-xs text-destructive mt-1">{errors.nationality}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Passport Number *</Label>
                <Input value={form.passport_number} onChange={(e) => update('passport_number', e.target.value.toUpperCase())} placeholder="AB1234567" className={`mt-1.5 h-11 ${errors.passport_number ? 'border-destructive' : ''}`} />
                {errors.passport_number && <p className="text-xs text-destructive mt-1">{errors.passport_number}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date of Expiry *</Label>
                <Input type="date" value={form.passport_expiry} onChange={(e) => update('passport_expiry', e.target.value)} className={`mt-1.5 h-11 ${errors.passport_expiry ? 'border-destructive' : ''}`} />
                {errors.passport_expiry && <p className="text-xs text-destructive mt-1">{errors.passport_expiry}</p>}
              </div>
            </div>

            <PassportVerification
              passportNumber={form.passport_number}
              nationality={form.nationality}
              expiryDate={form.passport_expiry}
              firstName={form.first_name}
              lastName={form.last_name}
              onResult={(r) => { setPassportVerification(r); setErrors(prev => ({ ...prev, passport_verification: '' })); }}
            />
            {errors.passport_verification && (
              <p className="text-xs text-destructive">{errors.passport_verification}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address *</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="john@example.com" className={`mt-1.5 h-11 ${errors.email ? 'border-destructive' : ''}`} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number *</Label>
                <PhoneInput value={form.phone_number} onChange={(v) => update('phone_number', v)} />
                {errors.phone_number && <p className="text-xs text-destructive mt-1">{errors.phone_number}</p>}
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
                {errors.home_country && <p className="text-xs text-destructive mt-1">{errors.home_country}</p>}
                {form.home_country && (
                  <p className="text-xs text-accent font-semibold mt-1.5">
                    🚚 Shipping to {form.home_country}: <span className="font-bold">${getShippingPrice(form.home_country)} per box</span>
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address Line 1 *</Label>
                <Input value={form.home_address} onChange={(e) => update('home_address', e.target.value)} placeholder="House number & street name" className={`mt-1.5 h-11 ${errors.home_address ? 'border-destructive' : ''}`} />
                {errors.home_address && <p className="text-xs text-destructive mt-1">{errors.home_address}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address Line 2</Label>
                <Input value={form.home_address2} onChange={(e) => update('home_address2', e.target.value)} placeholder="Apartment, suite, floor (optional)" className="mt-1.5 h-11" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">City *</Label>
                  <Input value={form.home_city} onChange={(e) => update('home_city', e.target.value)} placeholder="City" className={`mt-1.5 h-11 ${errors.home_city ? 'border-destructive' : ''}`} />
                  {errors.home_city && <p className="text-xs text-destructive mt-1">{errors.home_city}</p>}
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Postal Code *</Label>
                  <Input value={form.home_postal_code} onChange={(e) => update('home_postal_code', e.target.value)} placeholder="12345" className={`mt-1.5 h-11 ${errors.home_postal_code ? 'border-destructive' : ''}`} />
                  {errors.home_postal_code && <p className="text-xs text-destructive mt-1">{errors.home_postal_code}</p>}
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
                    onChange={(e) => update('confirm_password', e.target.value)}
                    placeholder="Re-enter password"
                    className={`h-11 pr-10 ${errors.confirm_password ? 'border-destructive' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-xs text-destructive mt-1">{errors.confirm_password}</p>}
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

    </div>
  );
}