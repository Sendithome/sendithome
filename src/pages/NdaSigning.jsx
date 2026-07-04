import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, CheckCircle2, Loader2, PenLine, RotateCcw, ArrowRight, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import BrandName from '@/components/BrandName';

const TODAY = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function NdaSigning() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [user, setUser] = useState(null);
  const [nda, setNda] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState('');

  const [form, setForm] = useState({
    hotel_name: '',
    hotel_address: '',
    hotel_phone: '',
    authorized_signatory_name: '',
    authorized_signatory_title: '',
    official_email: '',
  });

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const me = await base44.auth.me();
      if (!me) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      setUser(me);
      setForm(prev => ({ ...prev, official_email: me.email }));

      // Load existing hotel
      const hotels = await base44.entities.Hotel.filter({ contact_email: me.email });
      if (hotels.length > 0) {
        const h = hotels[0];
        setHotel(h);
        setForm(prev => ({
          ...prev,
          hotel_name: h.name || '',
          hotel_address: [h.address, h.area, h.city, h.country].filter(Boolean).join(', '),
          hotel_phone: h.official_phone || '',
          authorized_signatory_name: h.gm_name || '',
          authorized_signatory_title: 'General Manager',
          official_email: h.official_email || me.email,
        }));
      }

      // Check for existing NDA
      const ndas = await base44.entities.NDA.filter({ user_email: me.email });
      if (ndas.length > 0) {
        const existing = ndas[0];
        setNda(existing);
        if (existing.status === 'signed') {
          setDone(true);
        }
      }
    } catch (err) {
      // Not logged in — redirect to login
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    setLoading(false);
  };

  // ── Canvas drawing ──
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSig(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearSig = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const handleSubmit = async () => {
    if (!hasSig) { setErrors('Please provide your signature to proceed.'); return; }
    if (!agreed) { setErrors('Please confirm you have read and agree to the NDA.'); return; }
    if (!form.authorized_signatory_name.trim()) { setErrors('Authorized signatory name is required.'); return; }
    setErrors('');
    setSubmitting(true);

    const canvas = canvasRef.current;
    const sigData = canvas.toDataURL('image/png');

    const payload = {
      user_email: user.email,
      hotel_id: hotel?.id || '',
      ...form,
      status: 'signed',
      signature_data: sigData,
      signed_at: new Date().toISOString(),
    };

    try {
      let savedNda;
      if (nda) {
        savedNda = await base44.entities.NDA.update(nda.id, payload);
      } else {
        savedNda = await base44.entities.NDA.create(payload);
      }
      setNda(savedNda);

      // Also create/update HotelApplication to record NDA signed
      const apps = await base44.entities.HotelApplication.filter({ user_email: user.email });
      if (apps.length > 0) {
        await base44.entities.HotelApplication.update(apps[0].id, { nda_signed: true, nda_id: savedNda.id });
      } else {
        await base44.entities.HotelApplication.create({
          user_email: user.email,
          hotel_id: hotel?.id || '',
          status: 'draft',
          nda_signed: true,
          nda_id: savedNda.id,
        });
      }

      setDone(true);
    } catch (err) {
      setErrors('Something went wrong: ' + err.message);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">NDA Signed Successfully</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Your Non-Disclosure Agreement has been recorded and sent to the Sandit team.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Your account is now <strong className="text-green-700">active</strong>. Please proceed to complete your hotel profile and upload the required documents.
          </p>
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl h-11"
            onClick={() => navigate('/hotel-dashboard')}
          >
            Continue to Hotel Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary border-b border-white/10">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm text-white">SEND<span className="text-accent">IT</span>HOME</span>
          </div>
          <span className="text-xs text-white/50 font-medium">Step 2 of 4 — NDA Signing</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Progress */}
        <div className="flex items-center gap-2 text-xs">
          {['Registration', 'NDA Signing', 'Hotel Profile', 'QR Approval'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${i === 1 ? 'bg-accent text-white' : i < 1 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {i < 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={i === 1 ? 'font-bold text-foreground' : 'text-muted-foreground hidden sm:inline'}>{s}</span>
              {i < 3 && <div className="w-4 h-px bg-border hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Intro */}
        <div>
          <h1 className="text-2xl font-black text-foreground">Non-Disclosure Agreement</h1>
          <p className="text-sm text-muted-foreground mt-1">Please review the NDA below, fill in your details, and sign electronically to activate your account.</p>
        </div>

        {/* Hotel Info Form */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground">Your Information (auto-filled where possible)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Hotel Name *</Label>
              <Input value={form.hotel_name} onChange={e => setForm(p => ({ ...p, hotel_name: e.target.value }))} placeholder="Atlantis The Palm, Dubai" className="mt-1 h-10 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Official Email *</Label>
              <Input value={form.official_email} onChange={e => setForm(p => ({ ...p, official_email: e.target.value }))} placeholder="gm@hotel.com" className="mt-1 h-10 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Hotel Address *</Label>
              <Input value={form.hotel_address} onChange={e => setForm(p => ({ ...p, hotel_address: e.target.value }))} placeholder="15 Sheikh Zayed Road, Downtown Dubai, UAE" className="mt-1 h-10 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone Number *</Label>
              <Input value={form.hotel_phone} onChange={e => setForm(p => ({ ...p, hotel_phone: e.target.value }))} placeholder="+971 4 000 0000" className="mt-1 h-10 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Authorized Signatory Name *</Label>
              <Input value={form.authorized_signatory_name} onChange={e => setForm(p => ({ ...p, authorized_signatory_name: e.target.value }))} placeholder="Full Legal Name" className="mt-1 h-10 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Title / Position *</Label>
              <Input value={form.authorized_signatory_title} onChange={e => setForm(p => ({ ...p, authorized_signatory_title: e.target.value }))} placeholder="General Manager" className="mt-1 h-10 text-sm" />
            </div>
          </div>
        </div>

        {/* NDA Document */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-primary px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Sandit — Hotel Partner Programme</p>
              <h2 className="text-base font-black text-white mt-0.5">Non-Disclosure Agreement</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40">Ref: NDA-HP-2025</p>
              <p className="text-[10px] text-white/40 mt-0.5">{TODAY}</p>
            </div>
          </div>

          <div className="p-6 space-y-5 text-sm text-foreground leading-relaxed max-h-[500px] overflow-y-auto">

            <p className="text-xs text-muted-foreground">This Non-Disclosure Agreement ("Agreement") is entered into as of <strong>{TODAY}</strong>, between:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-xs font-bold text-accent mb-2">DISCLOSING PARTY</p>
                <p className="text-sm font-bold"><BrandName /> (Sandit)</p>
                <p className="text-xs text-muted-foreground mt-1">International Logistics & Hotel Partner Programme</p>
                <p className="text-xs text-muted-foreground">Dubai, United Arab Emirates</p>
                <p className="text-xs text-muted-foreground mt-1">Authorized Signature: _______________</p>
                <p className="text-xs text-muted-foreground">Position: Director of Partnerships</p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <p className="text-xs font-bold text-accent mb-2">RECEIVING PARTY</p>
                <p className="text-sm font-bold">{form.hotel_name || '[Hotel Name]'}</p>
                <p className="text-xs text-muted-foreground mt-1">{form.hotel_address || '[Hotel Address]'}</p>
                <p className="text-xs text-muted-foreground">Tel: {form.hotel_phone || '[Phone]'}</p>
                <p className="text-xs text-muted-foreground">Email: {form.official_email || '[Email]'}</p>
                <p className="text-xs text-muted-foreground mt-1">Authorized: {form.authorized_signatory_name || '[Name]'}</p>
                <p className="text-xs text-muted-foreground">Title: {form.authorized_signatory_title || '[Title]'}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div>
                <p className="font-bold mb-1">1. Purpose</p>
                <p className="text-sm text-muted-foreground">Both parties wish to explore a business relationship concerning the <BrandName /> Hotel Partner Programme, whereby the hotel will provide guest access to international courier and shipment services ("the Purpose"). In connection with this Purpose, each party may disclose certain confidential information to the other party.</p>
              </div>
              <div>
                <p className="font-bold mb-1">2. Definition of Confidential Information</p>
                <p className="text-sm text-muted-foreground">"Confidential Information" means all information disclosed by one party ("Disclosing Party") to the other ("Receiving Party"), whether orally, in writing, or otherwise, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information. This includes, but is not limited to: business plans, pricing models, technical data, customer lists, partner hotel data, operational procedures, software, and marketing strategies.</p>
              </div>
              <div>
                <p className="font-bold mb-1">3. Obligations of Receiving Party</p>
                <p className="text-sm text-muted-foreground">The Receiving Party agrees to: (a) hold the Confidential Information in strict confidence; (b) not disclose the Confidential Information to any third party without prior written consent; (c) use the Confidential Information solely for the Purpose stated herein; (d) protect the Confidential Information using at least the same degree of care used to protect its own confidential information, but no less than reasonable care.</p>
              </div>
              <div>
                <p className="font-bold mb-1">4. Exclusions</p>
                <p className="text-sm text-muted-foreground">Confidential Information does not include information that: (a) is or becomes publicly known through no breach of this Agreement; (b) was rightfully known before disclosure; (c) is independently developed without use of Confidential Information; (d) is required to be disclosed by law or court order, provided the Receiving Party gives prior written notice.</p>
              </div>
              <div>
                <p className="font-bold mb-1">5. Term</p>
                <p className="text-sm text-muted-foreground">This Agreement shall remain in effect for a period of three (3) years from the date of signing, unless earlier terminated by mutual written agreement. Obligations of confidentiality shall survive termination.</p>
              </div>
              <div>
                <p className="font-bold mb-1">6. No License</p>
                <p className="text-sm text-muted-foreground">Nothing in this Agreement grants either party any rights in or to the other party's intellectual property except as expressly set forth herein.</p>
              </div>
              <div>
                <p className="font-bold mb-1">7. Return of Information</p>
                <p className="text-sm text-muted-foreground">Upon request or upon termination of this Agreement, the Receiving Party shall promptly return or destroy all Confidential Information in its possession.</p>
              </div>
              <div>
                <p className="font-bold mb-1">8. Governing Law</p>
                <p className="text-sm text-muted-foreground">This Agreement shall be governed by the laws of the United Arab Emirates. Any dispute arising out of or related to this Agreement shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.</p>
              </div>
              <div>
                <p className="font-bold mb-1">9. Entire Agreement</p>
                <p className="text-sm text-muted-foreground">This Agreement constitutes the entire agreement between the parties concerning confidentiality and supersedes all prior discussions, representations, or agreements relating to the subject matter hereof.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-accent" />
            <h2 className="text-sm font-bold text-foreground">Electronic Signature</h2>
          </div>
          <p className="text-xs text-muted-foreground">Draw your signature below. By signing, you confirm that you are an authorized representative of <strong>{form.hotel_name || 'your hotel'}</strong> and agree to the terms above.</p>

          <div className="relative border-2 border-border rounded-xl overflow-hidden bg-white touch-none select-none">
            <p className="absolute top-2 left-3 text-[10px] text-muted-foreground/40 pointer-events-none font-medium">Sign here ↓</p>
            <canvas
              ref={canvasRef}
              width={600}
              height={160}
              className="w-full cursor-crosshair block"
              style={{ touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {!hasSig && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground/30 font-medium select-none">Draw your signature here</p>
              </div>
            )}
          </div>

          {hasSig && (
            <button onClick={clearSig} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Clear and redraw
            </button>
          )}

          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Signatory details will be recorded as:</p>
            <div className="bg-muted/40 rounded-xl px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-foreground">{form.authorized_signatory_name || '—'}</p>
              <p className="text-xs text-muted-foreground">{form.authorized_signatory_title || '—'} · {form.hotel_name || '—'}</p>
              <p className="text-xs text-muted-foreground">{form.official_email}</p>
              <p className="text-xs text-muted-foreground">Date: {TODAY}</p>
            </div>
          </div>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${agreed ? 'bg-accent border-accent' : 'border-border'}`}
          >
            {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            I confirm that I have read, understood, and agree to the Non-Disclosure Agreement above. I am an authorised representative of <strong className="text-foreground">{form.hotel_name || 'my hotel'}</strong> and have authority to sign on its behalf.
          </p>
        </label>

        {errors && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || !hasSig || !agreed}
          className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl text-sm gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {submitting ? 'Signing & Activating Account…' : 'Sign NDA & Activate Account'}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground pb-6">
          This is a legally binding electronic signature. Your IP address and timestamp are recorded.
        </p>
      </div>
    </div>
  );
}