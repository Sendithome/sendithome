import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Eye, EyeOff, Loader2, Package, MapPin, Star, CheckCircle2, MessageCircle, ScanLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import PhoneInput from '../components/PhoneInput';
import PassportVerification from '../components/PassportVerification';
import CountrySelect from '../components/CountrySelect';

export default function Register() {
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get('hotelId');

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const rescanInputRef = useRef(null);

  const [hotel, setHotel] = useState(null);
  const [scanningPassport, setScanningPassport] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [passportVerification, setPassportVerification] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);

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

  const NATIONALITY_TO_COUNTRY = {
    'united arab emirates': 'United Arab Emirates', 'uae': 'United Arab Emirates',
    'emirati': 'United Arab Emirates',
    'united states': 'United States', 'usa': 'United States', 'american': 'United States',
    'united kingdom': 'United Kingdom', 'uk': 'United Kingdom', 'british': 'United Kingdom',
    'saudi arabia': 'Saudi Arabia', 'saudi': 'Saudi Arabia',
    'qatar': 'Qatar', 'qatari': 'Qatar',
    'kuwait': 'Kuwait', 'kuwaiti': 'Kuwait',
    'bahrain': 'Bahrain', 'bahraini': 'Bahrain',
    'oman': 'Oman', 'omani': 'Oman',
    'india': 'India', 'indian': 'India',
    'pakistan': 'Pakistan', 'pakistani': 'Pakistan',
    'egypt': 'Egypt', 'egyptian': 'Egypt',
    'jordan': 'Jordan', 'jordanian': 'Jordan',
    'lebanon': 'Lebanon', 'lebanese': 'Lebanon',
    'germany': 'Germany', 'german': 'Germany',
    'france': 'France', 'french': 'France',
    'italy': 'Italy', 'italian': 'Italy',
    'spain': 'Spain', 'spanish': 'Spain',
    'russia': 'Russia', 'russian': 'Russia',
    'china': 'China', 'chinese': 'China',
    'japan': 'Japan', 'japanese': 'Japan',
    'australia': 'Australia', 'australian': 'Australia',
    'canada': 'Canada', 'canadian': 'Canada',
    'brazil': 'Brazil', 'brazilian': 'Brazil',
    'south africa': 'South Africa',
    'nigeria': 'Nigeria', 'nigerian': 'Nigeria',
    'kenya': 'Kenya', 'kenyan': 'Kenya',
    'philippines': 'Philippines', 'filipino': 'Philippines',
    'bangladesh': 'Bangladesh', 'bangladeshi': 'Bangladesh',
    'netherlands': 'Netherlands', 'dutch': 'Netherlands',
    'sweden': 'Sweden', 'swedish': 'Sweden',
    'norway': 'Norway', 'norwegian': 'Norway',
    'switzerland': 'Switzerland', 'swiss': 'Switzerland',
    'singapore': 'Singapore', 'singaporean': 'Singapore',
    'malaysia': 'Malaysia', 'malaysian': 'Malaysia',
    'thailand': 'Thailand', 'thai': 'Thailand',
    'turkey': 'Turkey', 'turkish': 'Turkey',
  };

  const NATIONALITY_TO_DIAL = {
    'united arab emirates': '+971', 'uae': '+971',
    'united states': '+1', 'usa': '+1', 'american': '+1',
    'united kingdom': '+44', 'uk': '+44', 'british': '+44',
    'saudi arabia': '+966', 'saudi': '+966',
    'qatar': '+974', 'qatari': '+974',
    'kuwait': '+965', 'kuwaiti': '+965',
    'bahrain': '+973', 'bahraini': '+973',
    'oman': '+968', 'omani': '+968',
    'india': '+91', 'indian': '+91',
    'pakistan': '+92', 'pakistani': '+92',
    'egypt': '+20', 'egyptian': '+20',
    'jordan': '+962', 'jordanian': '+962',
    'lebanon': '+961', 'lebanese': '+961',
    'germany': '+49', 'german': '+49',
    'france': '+33', 'french': '+33',
    'italy': '+39', 'italian': '+39',
    'spain': '+34', 'spanish': '+34',
    'russia': '+7', 'russian': '+7',
    'china': '+86', 'chinese': '+86',
    'japan': '+81', 'japanese': '+81',
    'australia': '+61', 'australian': '+61',
    'canada': '+1', 'canadian': '+1',
    'brazil': '+55', 'brazilian': '+55',
    'south africa': '+27',
    'nigeria': '+234', 'nigerian': '+234',
    'kenya': '+254', 'kenyan': '+254',
    'philippines': '+63', 'filipino': '+63',
    'bangladesh': '+880', 'bangladeshi': '+880',
    'netherlands': '+31', 'dutch': '+31',
    'sweden': '+46', 'swedish': '+46',
    'norway': '+47', 'norwegian': '+47',
    'switzerland': '+41', 'swiss': '+41',
    'singapore': '+65', 'singaporean': '+65',
    'malaysia': '+60', 'malaysian': '+60',
    'thailand': '+66', 'thai': '+66',
    'turkey': '+90', 'turkish': '+90',
  };

  useEffect(() => {
    if (!form.nationality) return;
    const key = form.nationality.toLowerCase().trim();
    const country = NATIONALITY_TO_COUNTRY[key];
    if (country && !form.home_country) {
      setForm(prev => ({ ...prev, home_country: country }));
    }
  }, [form.nationality]);

  useEffect(() => {
    if (!form.nationality) return;
    const dial = NATIONALITY_TO_DIAL[form.nationality.toLowerCase().trim()];
    if (dial) {
      setForm(prev => ({
        ...prev,
        phone_number: `${dial}|${prev.phone_number.split('|')[1] || ''}`,
        whatsapp_number: `${dial}|${prev.whatsapp_number.split('|')[1] || ''}`,
      }));
    }
  }, [form.nationality]);

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

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPassportPreview(ev.target.result);
    reader.readAsDataURL(file);

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

  const formatPhone = (v) => { const p = (v || '').split('|'); return p.length === 2 ? `${p[0]}${p[1]}` : v; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      await base44.auth.register({ email: form.email, password: form.password });
      await base44.auth.loginViaEmailPassword(form.email, form.password);
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
      window.location.href = hotelId ? `/new-order?hotelId=${hotelId}` : '/new-order';
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF5]">
      {/* ── WELCOME HERO CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Package className="w-5 h-5 text-accent-foreground" />
            </div>
            <p className="text-lg font-black tracking-widest text-white">
              SEND<span className="text-accent">IT</span>HOME
            </p>
          </div>

          {/* Welcome headline */}
          <h1 className="font-bold text-white mb-4" style={{ fontSize: 'clamp(22px, 5vw, 34px)', lineHeight: 1.2 }}>
            Welcome to Send It Home!
          </h1>

          {/* Hotel contextual greeting */}
          {hotel ? (
            <div className="mb-4">
              <p className="text-white/70 mb-1" style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
                We see you're enjoying your stay at
              </p>
              <p className="font-bold tracking-wide mb-1" style={{ color: '#E5A93B', fontSize: 'clamp(17px, 4.5vw, 26px)' }}>
                {hotel.name.toUpperCase()}
              </p>
              {hotel.city && (
                <p className="text-white/60 text-sm mb-2">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</p>
              )}
              <p className="text-white/70" style={{ fontSize: 'clamp(13px, 3vw, 17px)' }}>
                We trust you've had an incredible holiday in {hotel.city || 'Dubai'}!
              </p>
            </div>
          ) : (
            <p className="text-white/70 mb-4" style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
              The smart way to send your holiday purchases back home.
            </p>
          )}

          {/* Stars if available */}
          {hotel?.star_rating && (
            <div className="flex items-center justify-center gap-1 mb-5">
              {Array.from({ length: hotel.star_rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#E5A93B' }} />
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="w-16 h-px mx-auto mb-5" style={{ background: 'linear-gradient(to right, transparent, #E5A93B, transparent)' }} />

          {/* Subtext */}
          <p className="text-white/80 leading-relaxed mb-2" style={{ fontSize: 'clamp(13px, 3vw, 16px)' }}>
            Create your account below to get started in just a few clicks.
          </p>
          <p className="text-white/60 leading-relaxed mb-5" style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
            Our unique international courier service makes sending packages back home safe, simple, reliable and with total peace of mind.
          </p>

          {/* Tagline */}
          <p className="font-semibold tracking-wide" style={{ color: '#E5A93B', fontSize: 'clamp(13px, 3vw, 15px)' }}>
            ✈️ Travel light. We've got the rest covered.
          </p>
        </div>

        {/* Bottom shadow divider */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(to right, #D4AF37, #E5A93B, #D4AF37)' }} />
      </motion.div>

      {/* ── FORM SECTION ── */}
      <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">Create Your Account</h2>
          <p className="text-sm text-muted-foreground">Fill in your details below — it only takes a few minutes.</p>
        </div>

        {/* Hidden file inputs — outside form flow for reliable mobile camera access */}
        <input ref={cameraInputRef} type="file" accept="image/*" capture className="hidden" onChange={handlePassportScan} />
        <input ref={galleryInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handlePassportScan} />
        <input ref={rescanInputRef} type="file" accept="image/*" capture className="hidden" onChange={handlePassportScan} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Passport scan section */}
          <div className="rounded-2xl overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-primary/95 to-primary">
            {scanningPassport ? (
              <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
                {passportPreview && (
                  <div className="relative w-48 h-28 rounded-xl overflow-hidden border-2 border-white/20 mb-2">
                    <img src={passportPreview} alt="Passport" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
                      <ScanLine className="w-10 h-10 text-accent animate-pulse" />
                    </div>
                  </div>
                )}
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm font-bold text-white">AI is reading your passport…</p>
                <p className="text-xs text-white/60">Extracting your details automatically</p>
              </div>
            ) : passportPreview && form.first_name ? (
              <div className="flex items-center gap-4 p-4">
                <div className="w-16 h-10 rounded-lg overflow-hidden border-2 border-white/20 shrink-0">
                  <img src={passportPreview} alt="Passport" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    <p className="text-sm font-bold text-white">Passport scanned successfully</p>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">Details auto-filled below. Review and confirm.</p>
                </div>
                <button type="button" onClick={() => rescanInputRef.current?.click()} className="text-xs text-accent font-semibold hover:underline shrink-0">
                  Rescan
                </button>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center mx-auto mb-4">
                  <ScanLine className="w-8 h-8 text-accent" />
                </div>
                <p className="text-base font-bold text-white mb-1">Scan Your Passport</p>
                <p className="text-xs text-white/60 mb-5 max-w-xs mx-auto">
                  Point your camera at the photo page. Our AI instantly reads and fills all your details.
                </p>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 h-12 rounded-2xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera & Scan
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="mt-3 w-full max-w-xs mx-auto flex items-center justify-center gap-2 h-10 rounded-2xl border border-white/20 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload from Gallery / Files
                </button>
                <p className="text-sm text-white/60 mt-4">Or fill in the details manually below</p>
              </div>
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

            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <span className="text-blue-500 text-base shrink-0">🔒</span>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Passport details are required for <strong>international shipping and customs clearance</strong> only. Your information is stored securely and protected in accordance with international data privacy regulations.
              </p>
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
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alternate Contact / WhatsApp</Label>
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
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-accent font-semibold">
                      🚚 Shipping to {form.home_country}: <span className="font-bold">US$50 total</span>
                      <span className="text-muted-foreground font-normal"> (US$30 paid now + US$20 hotel bill)</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">You can choose your box size after uploading your receipts.</p>
                  </div>
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

          {errors.submit && (
            <p className="text-sm text-destructive text-center bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">{errors.submit}</p>
          )}

          <Button
            type="submit"
            className="w-full h-13 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-base py-4"
            disabled={submitting}
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
            <button
              type="button"
              onClick={() => base44.auth.redirectToLogin(hotelId ? `/hotel/${hotelId}` : '/')}
              className="text-accent font-medium hover:underline"
            >
              Log In
            </button>
          </p>
        </form>

        <p className="text-center text-[10px] text-muted-foreground mt-8 pb-4">
          Powered by SendITHome AI · Proprietary Intelligent Logistics Platform
        </p>
      </div>
    </div>
  );
}