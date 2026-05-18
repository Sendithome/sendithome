import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, QrCode, Hotel, MapPin, Save, Download, RefreshCw,
  CheckCircle2, Loader2, Upload, Star, Building2, Clock,
  FileText, Shield, AlertCircle, ChevronRight, Users, X, PenLine,
  Truck, Activity
} from 'lucide-react';
import OnboardingPipeline from '@/components/hotel/OnboardingPipeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'profile', label: 'Hotel Profile', icon: Hotel },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'status', label: 'Onboarding Status', icon: Activity },
];

const FLOW_STEPS = [
  { n: 1, label: 'Registration' },
  { n: 2, label: 'NDA Signing' },
  { n: 3, label: 'Hotel Profile' },
  { n: 4, label: 'QR Approval' },
];

const COUNTRY_DIAL = {
  'United Arab Emirates': '+971', 'Saudi Arabia': '+966', 'Qatar': '+974',
  'Kuwait': '+965', 'Bahrain': '+973', 'Oman': '+968', 'Jordan': '+962',
  'Egypt': '+20', 'Lebanon': '+961', 'Turkey': '+90',
  'United Kingdom': '+44', 'Germany': '+49', 'France': '+33', 'Italy': '+39',
  'Spain': '+34', 'Netherlands': '+31', 'Sweden': '+46',
  'India': '+91', 'Pakistan': '+92', 'Philippines': '+63',
  'China': '+86', 'Japan': '+81', 'Singapore': '+65',
  'United States': '+1', 'Canada': '+1', 'Australia': '+61',
};

function getQRUrl(text, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&margin=12&format=png`;
}

function StatusBadge({ status }) {
  const map = {
    draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
    pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    rejected: { label: 'Rejected — Revise & Resubmit', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  };
  const cfg = map[status] || map.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function UploadField({ label, value, onChange, uploading, note }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5 flex items-center gap-3">
        {value ? (
          <div className="flex items-center gap-2 flex-1 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 font-medium underline truncate">View document</a>
          </div>
        ) : (
          <div className="flex-1 h-9 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-xs text-muted-foreground bg-muted/30">
            No document uploaded
          </div>
        )}
        <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={onChange} disabled={uploading} />
        </label>
      </div>
      {note && <p className="text-[10px] text-muted-foreground mt-1">{note}</p>}
    </div>
  );
}

export default function HotelDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [application, setApplication] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [uploading, setUploading] = useState({});

  const [nda, setNda] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  // Admin
  const [allApplications, setAllApplications] = useState([]);
  const [allOnboardingStatuses, setAllOnboardingStatuses] = useState([]);
  const [adminView, setAdminView] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [logisticsStageUpdating, setLogisticsStageUpdating] = useState(null);

  const [form, setForm] = useState({
    name: '', address_line1: '', address_line2: '', area: '', city: '', state: '',
    postal_code: '', country: '', floor_tower_complex: '',
    official_email: '', official_phone: '', official_landline: '', registered_email: '',
    dial_code: '+971', star_rating: 5, logo_url: '', active: true,
    gm_name: '', gm_email: '', gm_phone: '', gm_whatsapp: '',
    agm_name: '', agm_email: '', agm_phone: '', agm_whatsapp: '',
    hoc_name: '', hoc_email: '', hoc_phone: '', hoc_whatsapp: '',
    fdm_name: '', fdm_email: '', fdm_phone: '', fdm_whatsapp: '',
  });

  const [docs, setDocs] = useState({
    trade_license_url: '', trade_license_number: '', trade_license_expiry: '',
    gm_employment_card_url: '', agm_employment_card_url: '',
    fdm_employment_card_url: '', hoc_employment_card_url: '',
  });

  useEffect(() => { init(); }, []);

  const init = async () => {
    const me = await base44.auth.me();
    setUser(me);

    // Admin: load all applications + onboarding statuses
    if (me.role === 'admin') {
      const apps = await base44.entities.HotelApplication.list('-created_date', 100);
      setAllApplications(apps);
      const statuses = await base44.entities.HotelOnboardingStatus.list('-created_date', 100);
      setAllOnboardingStatuses(statuses);
    }

    // Load this user's hotel
    const hotels = await base44.entities.Hotel.filter({ contact_email: me.email });
    if (hotels.length > 0) {
      const h = hotels[0];
      setHotel(h);
      const rawPhone = h.contact_phone || '';
      const dialMatch = rawPhone.match(/^(\+\d{1,4})\s*(.*)$/);
      setForm({
        name: h.name || '', address_line1: h.address || '', address_line2: h.address_line2 || '',
        area: h.area || '', city: h.city || '', state: h.state || '',
        postal_code: h.postal_code || '', country: h.country || '',
        floor_tower_complex: h.floor_tower_complex || '', official_email: h.official_email || '',
        official_phone: h.official_phone || '', official_landline: h.official_landline || '',
        registered_email: h.registered_email || '',
        dial_code: dialMatch ? dialMatch[1] : (COUNTRY_DIAL[h.country] || '+971'),
        star_rating: h.star_rating || 5, logo_url: h.logo_url || '', active: h.active !== false,
        gm_name: h.gm_name || '', gm_email: h.gm_email || '', gm_phone: h.gm_phone || '', gm_whatsapp: h.gm_whatsapp || '',
        agm_name: h.agm_name || '', agm_email: h.agm_email || '', agm_phone: h.agm_phone || '', agm_whatsapp: h.agm_whatsapp || '',
        hoc_name: h.hoc_name || '', hoc_email: h.hoc_email || '', hoc_phone: h.hoc_phone || '', hoc_whatsapp: h.hoc_whatsapp || '',
        fdm_name: h.fdm_name || '', fdm_email: h.fdm_email || '', fdm_phone: h.fdm_phone || '', fdm_whatsapp: h.fdm_whatsapp || '',
      });
    }

    // Load NDA
    const ndas = await base44.entities.NDA.filter({ user_email: me.email });
    if (ndas.length > 0) setNda(ndas[0]);

    // Load onboarding status
    const statuses = await base44.entities.HotelOnboardingStatus.filter({ user_email: me.email });
    if (statuses.length > 0) setOnboardingStatus(statuses[0]);

    // Load application for this user
    const apps = await base44.entities.HotelApplication.filter({ user_email: me.email });
    if (apps.length > 0) {
      const app = apps[0];
      setApplication(app);
      setDocs({
        trade_license_url: app.trade_license_url || '',
        trade_license_number: app.trade_license_number || '',
        trade_license_expiry: app.trade_license_expiry || '',
        gm_employment_card_url: app.gm_employment_card_url || '',
        agm_employment_card_url: app.agm_employment_card_url || '',
        fdm_employment_card_url: app.fdm_employment_card_url || '',
        hoc_employment_card_url: app.hoc_employment_card_url || '',
      });
    }
  };

  const update = (k, v) => {
    if (k === 'country') {
      const matchedKey = Object.keys(COUNTRY_DIAL).find(key => key.toLowerCase() === v.toLowerCase());
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
      contact_phone: form.dial_code + ' ' + form.official_phone,
      contact_email: form.official_email,
    };
    let savedHotel;
    if (hotel) {
      savedHotel = await base44.entities.Hotel.update(hotel.id, payload);
    } else {
      savedHotel = await base44.entities.Hotel.create(payload);
    }
    setHotel(savedHotel);

    // Keep application in sync with hotel_id
    if (application) {
      await base44.entities.HotelApplication.update(application.id, { hotel_id: savedHotel.id });
    }
    setSaving(false);
  };

  const handleUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setUploading(p => ({ ...p, [field]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newDocs = { ...docs, [field]: file_url };
    setDocs(newDocs);

    // Save to application
    const user = await base44.auth.me();
    if (application) {
      await base44.entities.HotelApplication.update(application.id, { [field]: file_url });
    } else {
      const app = await base44.entities.HotelApplication.create({
        user_email: user.email,
        hotel_id: hotel?.id || '',
        status: 'draft',
        [field]: file_url,
      });
      setApplication(app);
    }
    setUploading(p => ({ ...p, [field]: false }));
  };

  const handleSendForApproval = async () => {
    setSubmitting(true);
    // Save hotel profile first
    await handleSave();
    const docsPayload = {
      ...docs,
      status: 'pending_approval',
      submitted_at: new Date().toISOString(),
      hotel_id: hotel?.id || '',
    };
    let app;
    if (application) {
      app = await base44.entities.HotelApplication.update(application.id, docsPayload);
    } else {
      app = await base44.entities.HotelApplication.create({ user_email: user.email, ...docsPayload });
    }
    setApplication(app);
    setSubmitting(false);
  };

  const handleAdminAction = async (appId, action, hotelId, appUserEmail, appHotelName) => {
    const updateData = {
      status: action,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.email,
      admin_notes: adminNotes,
    };
    if (action === 'approved' && hotelId) {
      await base44.entities.Hotel.update(hotelId, { active: true });
    }
    await base44.entities.HotelApplication.update(appId, updateData);

    // On approval, create an onboarding status record if it doesn't exist
    if (action === 'approved') {
      const existing = await base44.entities.HotelOnboardingStatus.filter({ application_id: appId });
      if (existing.length === 0) {
        await base44.entities.HotelOnboardingStatus.create({
          hotel_id: hotelId || '',
          application_id: appId,
          user_email: appUserEmail,
          hotel_name: appHotelName || '',
          logistics_stage: 'pending_dispatch',
          qr_approved_at: new Date().toISOString(),
        });
      }
    }

    const apps = await base44.entities.HotelApplication.list('-created_date', 100);
    const statuses = await base44.entities.HotelOnboardingStatus.list('-created_date', 100);
    setAllApplications(apps);
    setAllOnboardingStatuses(statuses);
    setAdminNotes('');
  };

  const handleDispatchToLogistics = async (statusId, hotelName) => {
    setLogisticsStageUpdating(statusId);
    // Add 10 working days (14 calendar days approx)
    const target = new Date();
    target.setDate(target.getDate() + 14);
    await base44.entities.HotelOnboardingStatus.update(statusId, {
      logistics_stage: 'dispatched_to_logistics',
      dispatched_at: new Date().toISOString(),
      target_completion_date: target.toISOString().split('T')[0],
      stage_updated_at: new Date().toISOString(),
      stage_updated_by: user.email,
    });
    const statuses = await base44.entities.HotelOnboardingStatus.list('-created_date', 100);
    setAllOnboardingStatuses(statuses);
    setLogisticsStageUpdating(null);
  };

  const handleUpdateLogisticsStage = async (statusId, newStage) => {
    setLogisticsStageUpdating(statusId);
    await base44.entities.HotelOnboardingStatus.update(statusId, {
      logistics_stage: newStage,
      stage_updated_at: new Date().toISOString(),
      stage_updated_by: user.email,
    });
    const statuses = await base44.entities.HotelOnboardingStatus.list('-created_date', 100);
    setAllOnboardingStatuses(statuses);
    setLogisticsStageUpdating(null);
  };

  const generateQR = () => {
    if (!hotel) return;
    setQrLoading(true);
    const url = `${window.location.origin}/hotel/${hotel.id}`;
    setQrUrl(getQRUrl(url, 400));
    setTimeout(() => setQrLoading(false), 800);
  };

  const downloadQR = async () => {
    if (!qrUrl) return;
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name || 'hotel'}-qr-code.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isApproved = application?.status === 'approved';
  const isPending = application?.status === 'pending_approval';
  const isRejected = application?.status === 'rejected';
  const ndaSigned = nda?.status === 'signed' || application?.nda_signed;

  const canSubmit = ndaSigned && hotel && docs.trade_license_url && docs.gm_employment_card_url && !isPending;

  const qrLandingUrl = hotel ? `${window.location.origin}/hotel/${hotel.id}` : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-black text-foreground">SEND<span className="text-accent">IT</span>HOME</span>
        </div>
        <div className="flex items-center gap-3">
          {application && <StatusBadge status={application.status} />}
          {user?.role === 'admin' && (
            <Button size="sm" variant="outline" onClick={() => setAdminView(!adminView)} className="text-xs rounded-xl gap-1">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Button>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-foreground">{user.full_name || user.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Hotel className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Admin Panel */}
      <AnimatePresence>
        {adminView && user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5 border-b border-border overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" /> Admin — Hotel Applications
                </h3>
                <button onClick={() => setAdminView(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              {allApplications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {allApplications.map(app => {
                    const appOnboarding = allOnboardingStatuses.find(s => s.application_id === app.id);
                    const LOGISTICS_STAGE_LABELS = {
                      pending_dispatch: 'Pending Dispatch',
                      dispatched_to_logistics: 'Dispatched to Logistics',
                      logistics_contacted: 'Logistics Contacted Hotel',
                      site_visit_scheduled: 'Site Visit Scheduled',
                      site_visit_done: 'Site Visit Done',
                      materials_delivered: 'Materials Delivered',
                      fully_onboarded: 'Fully Onboarded',
                    };
                    const NEXT_STAGES = {
                      dispatched_to_logistics: 'logistics_contacted',
                      logistics_contacted: 'site_visit_scheduled',
                      site_visit_scheduled: 'site_visit_done',
                      site_visit_done: 'materials_delivered',
                      materials_delivered: 'fully_onboarded',
                    };
                    return (
                      <div key={app.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-bold text-foreground">{app.user_email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Hotel ID: {app.hotel_id || '—'}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <StatusBadge status={app.status} />
                              {app.nda_signed && (
                                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-semibold flex items-center gap-1">
                                  <PenLine className="w-2.5 h-2.5" /> NDA Signed
                                </span>
                              )}
                            </div>
                            {app.submitted_at && (
                              <p className="text-[10px] text-muted-foreground mt-1">Submitted: {new Date(app.submitted_at).toLocaleString()}</p>
                            )}
                            {app.admin_notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">Notes: {app.admin_notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              {app.trade_license_url && <a href={app.trade_license_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-0.5 font-medium">Trade License</a>}
                              {app.gm_employment_card_url && <a href={app.gm_employment_card_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-0.5 font-medium">GM Card</a>}
                              {app.agm_employment_card_url && <a href={app.agm_employment_card_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-0.5 font-medium">AGM Card</a>}
                              {app.fdm_employment_card_url && <a href={app.fdm_employment_card_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-0.5 font-medium">FDM Card</a>}
                            </div>
                            {app.status === 'pending_approval' && (
                              <>
                                <Input
                                  placeholder="Admin notes (optional)"
                                  value={adminNotes}
                                  onChange={e => setAdminNotes(e.target.value)}
                                  className="h-8 text-xs rounded-lg"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs h-8 gap-1" onClick={() => handleAdminAction(app.id, 'approved', app.hotel_id, app.user_email, app.hotel_name)}>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Issue QR
                                  </Button>
                                  <Button size="sm" variant="destructive" className="rounded-lg text-xs h-8 gap-1" onClick={() => handleAdminAction(app.id, 'rejected', app.hotel_id, app.user_email)}>
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Logistics Onboarding Controls — only for approved hotels */}
                        {app.status === 'approved' && (
                          <div className="border-t border-border pt-3">
                            <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-blue-500" /> Logistics Onboarding
                            </p>
                            {!appOnboarding || appOnboarding.logistics_stage === 'pending_dispatch' ? (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs h-8 gap-1"
                                disabled={logisticsStageUpdating === (appOnboarding?.id)}
                                onClick={() => appOnboarding && handleDispatchToLogistics(appOnboarding.id, app.hotel_name)}
                              >
                                {logisticsStageUpdating === appOnboarding?.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                                Push to Logistics Company
                              </Button>
                            ) : (
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                                  {LOGISTICS_STAGE_LABELS[appOnboarding.logistics_stage] || appOnboarding.logistics_stage}
                                </span>
                                {appOnboarding.logistics_stage !== 'fully_onboarded' && NEXT_STAGES[appOnboarding.logistics_stage] && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg text-xs h-7 gap-1"
                                    disabled={logisticsStageUpdating === appOnboarding.id}
                                    onClick={() => handleUpdateLogisticsStage(appOnboarding.id, NEXT_STAGES[appOnboarding.logistics_stage])}
                                  >
                                    {logisticsStageUpdating === appOnboarding.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                    → Mark: {LOGISTICS_STAGE_LABELS[NEXT_STAGES[appOnboarding.logistics_stage]]}
                                  </Button>
                                )}
                                {appOnboarding.logistics_stage === 'fully_onboarded' && (
                                  <span className="text-xs text-green-700 font-semibold">✓ Fully Onboarded</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <nav className="bg-card border-b border-border px-4">
        <div className="flex gap-1 max-w-3xl mx-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
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

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">

              {/* Onboarding progress */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Onboarding Progress</p>
                <div className="flex items-center gap-1">
                  {FLOW_STEPS.map((s, i) => {
                    const done = (s.n === 1) || (s.n === 2 && ndaSigned) || (s.n === 3 && !!hotel) || (s.n === 4 && isApproved);
                    const active = (s.n === 2 && !ndaSigned) || (s.n === 3 && ndaSigned && !hotel) || (s.n === 4 && hotel && !isApproved);
                    return (
                      <div key={s.n} className="flex items-center gap-1 flex-1 min-w-0">
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>
                          {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                        </div>
                        <span className={`text-[10px] truncate hidden sm:block ${done ? 'text-green-700 font-semibold' : active ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
                        {i < FLOW_STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${done ? 'bg-green-300' : 'bg-border'}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NDA Banner */}
              {!ndaSigned && (
                <div className="bg-accent/5 border-2 border-accent/30 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <PenLine className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-foreground">Step 2: Sign the NDA</p>
                    <p className="text-xs text-muted-foreground mt-1">Before you can submit documents or access full onboarding, you must review and electronically sign the Non-Disclosure Agreement with Sandit.</p>
                  </div>
                  <Button size="sm" onClick={() => navigate('/nda-signing')} className="bg-accent hover:bg-accent/90 text-white rounded-xl text-xs gap-1 shrink-0">
                    <PenLine className="w-3.5 h-3.5" /> Sign NDA
                  </Button>
                </div>
              )}

              {ndaSigned && !isApproved && !isPending && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">NDA Signed — Account Active</p>
                    <p className="text-xs text-green-700">Complete your hotel profile and upload documents to proceed.</p>
                  </div>
                </div>
              )}

              {/* Status banner */}
              {isApproved && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Your hotel is approved!</p>
                    <p className="text-xs text-green-700">Go to the QR Code tab to generate and download your hotel QR code.</p>
                  </div>
                  <Button size="sm" className="ml-auto bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs gap-1 shrink-0" onClick={() => setTab('qr')}>
                    <QrCode className="w-3.5 h-3.5" /> Get QR
                  </Button>
                </div>
              )}
              {isPending && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Application Under Review</p>
                    <p className="text-xs text-amber-700">Our team is reviewing your submission. We'll notify you within 1–2 business days.</p>
                  </div>
                </div>
              )}
              {isRejected && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Application Rejected</p>
                    {application.admin_notes && <p className="text-xs text-red-700 mt-0.5">Reason: {application.admin_notes}</p>}
                    <p className="text-xs text-red-600 mt-1">Please update your information and documents, then resubmit.</p>
                  </div>
                </div>
              )}

              {/* Profile form */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Hotel Information</h2>
                  {hotel && <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Saved</span>}
                </div>

                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {form.logo_url ? <img src={form.logo_url} className="w-full h-full object-cover" alt="logo" /> : <Hotel className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Hotel Logo</p>
                    <label className="mt-1 cursor-pointer inline-flex items-center gap-1.5 text-xs text-accent font-medium hover:underline">
                      {uploading.logo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {uploading.logo ? 'Uploading…' : 'Upload logo'}
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0]; if (!file) return; e.target.value = '';
                        setUploading(p => ({ ...p, logo: true }));
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        update('logo_url', file_url);
                        setUploading(p => ({ ...p, logo: false }));
                      }} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Hotel Name *</Label>
                    <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Grand Hyatt Dubai" className="mt-1 h-10 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Street Address *</Label>
                    <Input value={form.address_line1} onChange={e => update('address_line1', e.target.value)} placeholder="15 Sheikh Zayed Road" className="mt-1 h-10 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Area / District *</Label>
                    <Input value={form.area} onChange={e => update('area', e.target.value)} placeholder="Downtown Dubai" className="mt-1 h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">City *</Label>
                    <Input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Dubai" className="mt-1 h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State / Province *</Label>
                    <Input value={form.state} onChange={e => update('state', e.target.value)} placeholder="Dubai" className="mt-1 h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Postal Code *</Label>
                    <Input value={form.postal_code} onChange={e => update('postal_code', e.target.value)} placeholder="00000" className="mt-1 h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country *</Label>
                    <Input value={form.country} onChange={e => update('country', e.target.value)} placeholder="United Arab Emirates" className="mt-1 h-10 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Floor / Tower / Complex (optional)</Label>
                    <Input value={form.floor_tower_complex} onChange={e => update('floor_tower_complex', e.target.value)} placeholder="Tower A, Floor 12" className="mt-1 h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Official Email *</Label>
                    <Input value={form.official_email} onChange={e => update('official_email', e.target.value)} placeholder="info@hotel.com" className="mt-1 h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Official Phone</Label>
                    <div className="flex gap-1.5 mt-1">
                      <div className="flex items-center bg-muted border border-input rounded-md px-2 shrink-0">
                        <span className="text-xs font-mono">{form.dial_code || '+?'}</span>
                      </div>
                      <Input value={form.official_phone} onChange={e => update('official_phone', e.target.value)} placeholder="04 000 0000" className="h-10 text-sm flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Registered Email <span className="text-accent">(for shipment paperwork)</span></Label>
                    <Input value={form.registered_email} onChange={e => update('registered_email', e.target.value)} placeholder="shipments@hotel.com" className="mt-1 h-10 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Star Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {[4, 5].map(n => (
                        <button type="button" key={n} onClick={() => update('star_rating', n)}
                          className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold transition-colors ${form.star_rating === n ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                          <Star className="w-3.5 h-3.5 fill-current" /> {n} Star
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Contacts */}
                <div className="border-t border-border pt-4 space-y-4">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-accent" /> Key Contacts
                  </p>

                  {[
                    { title: 'General Manager *', prefix: 'gm', required: true },
                    { title: 'Assistant General Manager *', prefix: 'agm', required: true },
                    { title: 'Front Desk Manager *', prefix: 'fdm', required: true },
                    { title: 'Head of Concierge / Bell Captain', prefix: 'hoc', required: false },
                  ].map(({ title, prefix, required }) => (
                    <div key={prefix} className="bg-muted/40 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">{title}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Full Name{required ? ' *' : ''}</Label>
                          <Input value={form[`${prefix}_name`]} onChange={e => update(`${prefix}_name`, e.target.value)} placeholder="Full Name" className="mt-1 h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Company Email{required ? ' *' : ''}</Label>
                          <Input value={form[`${prefix}_email`]} onChange={e => update(`${prefix}_email`, e.target.value)} placeholder="email@hotel.com" className="mt-1 h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone{required ? ' *' : ''}</Label>
                          <div className="flex gap-1 mt-1">
                            <div className="flex items-center bg-muted border border-input rounded-md px-2 shrink-0"><span className="text-xs font-mono">{form.dial_code}</span></div>
                            <Input value={form[`${prefix}_phone`]} onChange={e => update(`${prefix}_phone`, e.target.value)} placeholder="50 000 0000" className="h-9 text-sm flex-1" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">WhatsApp{required ? ' *' : ''}</Label>
                          <div className="flex gap-1 mt-1">
                            <div className="flex items-center bg-muted border border-input rounded-md px-2 shrink-0"><span className="text-xs font-mono">{form.dial_code}</span></div>
                            <Input value={form[`${prefix}_whatsapp`]} onChange={e => update(`${prefix}_whatsapp`, e.target.value)} placeholder="50 000 0000" className="h-9 text-sm flex-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.city || !form.country}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-10"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {saving ? 'Saving…' : 'Save Hotel Profile'}
                </Button>
              </div>

              {/* Continue to Documents */}
              {hotel && !isApproved && (
                <button
                  onClick={() => setTab('documents')}
                  className="w-full flex items-center justify-between bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4 hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-accent" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">Upload Documents & Submit</p>
                      <p className="text-xs text-muted-foreground">Trade license + employee cards required for approval</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-accent" />
                </button>
              )}
            </motion.div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {tab === 'documents' && (
            <motion.div key="docs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Verification Documents</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your trade license and employee ID cards for verification. Accepted formats: JPG, PNG, PDF.
                </p>
              </div>

              {/* NDA Gate */}
              {!ndaSigned && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <PenLine className="w-7 h-7 text-amber-600" />
                  </div>
                  <p className="text-sm font-bold text-amber-800 mb-2">NDA Required First</p>
                  <p className="text-xs text-amber-700 mb-4">You must sign the Non-Disclosure Agreement before you can submit documents for verification.</p>
                  <Button size="sm" onClick={() => navigate('/nda-signing')} className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2">
                    <PenLine className="w-3.5 h-3.5" /> Sign NDA Now
                  </Button>
                </div>
              )}

              {ndaSigned && isPending && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800">Your application is under review. Documents are locked during review.</p>
                </div>
              )}

              {/* Document forms — only visible once NDA is signed */}
              {ndaSigned && <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Trade License *</p>
                    <p className="text-[10px] text-muted-foreground">Required for hotel identity verification</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Trade License Number *</Label>
                    <Input value={docs.trade_license_number} onChange={e => setDocs(p => ({ ...p, trade_license_number: e.target.value }))}
                      placeholder="TL-123456" className="mt-1 h-10 text-sm" disabled={isPending} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Expiry Date *</Label>
                    <Input type="date" value={docs.trade_license_expiry} onChange={e => setDocs(p => ({ ...p, trade_license_expiry: e.target.value }))}
                      className="mt-1 h-10 text-sm" disabled={isPending} />
                  </div>
                </div>

                <UploadField
                  label="Trade License Document (PDF or image) *"
                  value={docs.trade_license_url}
                  uploading={uploading.trade_license_url}
                  onChange={e => handleUpload('trade_license_url', e)}
                  note="Upload a clear copy of your valid trade license."
                />
              </div>}

              {/* Employee Cards */}
              {ndaSigned && <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Employee Identification Cards</p>
                    <p className="text-[10px] text-muted-foreground">Upload employment cards to verify hotel staff identity</p>
                  </div>
                </div>

                <UploadField
                  label="General Manager — Employment Card *"
                  value={docs.gm_employment_card_url}
                  uploading={uploading.gm_employment_card_url}
                  onChange={e => handleUpload('gm_employment_card_url', e)}
                  note="Official employment ID card of the General Manager."
                />
                <UploadField
                  label="Assistant General Manager — Employment Card *"
                  value={docs.agm_employment_card_url}
                  uploading={uploading.agm_employment_card_url}
                  onChange={e => handleUpload('agm_employment_card_url', e)}
                />
                <UploadField
                  label="Front Desk Manager — Employment Card"
                  value={docs.fdm_employment_card_url}
                  uploading={uploading.fdm_employment_card_url}
                  onChange={e => handleUpload('fdm_employment_card_url', e)}
                />
                <UploadField
                  label="Head of Concierge — Employment Card"
                  value={docs.hoc_employment_card_url}
                  uploading={uploading.hoc_employment_card_url}
                  onChange={e => handleUpload('hoc_employment_card_url', e)}
                />
              </div>}

              {/* Checklist */}
              {ndaSigned && <div className="bg-muted/40 rounded-2xl p-4">
                <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wide">Submission Checklist</p>
                <div className="space-y-2">
                  {[
                    { label: 'Hotel profile saved', done: !!hotel },
                    { label: 'Trade license uploaded', done: !!docs.trade_license_url },
                    { label: 'Trade license number entered', done: !!docs.trade_license_number },
                    { label: 'GM employment card uploaded', done: !!docs.gm_employment_card_url },
                    { label: 'AGM employment card uploaded', done: !!docs.agm_employment_card_url },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.done
                        ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />}
                      <span className={`text-xs ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>}

              {/* Send for Approval */}
              {ndaSigned && !isApproved && (
                <Button
                  onClick={handleSendForApproval}
                  disabled={!canSubmit || submitting}
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl text-sm gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {submitting ? 'Submitting…' : isPending ? 'Application Submitted — Awaiting Review' : 'Send for Approval'}
                </Button>
              )}

              {ndaSigned && isApproved && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-green-800">Application Approved!</p>
                  <p className="text-sm text-green-700 mt-1 mb-4">Your hotel is now verified. Generate your QR code.</p>
                  <Button onClick={() => setTab('qr')} className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2">
                    <QrCode className="w-4 h-4" /> Generate QR Code
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STATUS TAB ── */}
          {tab === 'status' && (
            <motion.div key="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Onboarding Status</h2>
                <p className="text-sm text-muted-foreground mt-1">Live view of your full onboarding pipeline — from registration to hotel going live.</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <OnboardingPipeline
                  application={application}
                  onboardingStatus={onboardingStatus}
                  ndaSigned={ndaSigned}
                />
              </div>
              {isApproved && onboardingStatus?.logistics_stage !== 'fully_onboarded' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">Logistics Onboarding in Progress</p>
                    <p className="text-xs text-blue-700 mt-1">Our logistics partner has been notified and will contact your hotel within 1–2 business days to arrange staff briefing, signage placement, and setup. Target: 10 working days.</p>
                  </div>
                </div>
              )}
              {onboardingStatus?.logistics_stage === 'fully_onboarded' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Your hotel is fully onboarded!</p>
                    <p className="text-xs text-green-700 mt-1">Your QR code is live, staff have been briefed, and materials are in place. Guests can now scan and ship.</p>
                    <p className="text-xs text-green-700 mt-1">Tourist shipping link: <span className="font-mono font-semibold">{qrLandingUrl}</span></p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── QR TAB ── */}
          {tab === 'qr' && (
            <motion.div key="qr" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">QR Code Generator</h2>
                <p className="text-sm text-muted-foreground mt-1">Generate your unique hotel QR code for guests to scan.</p>
              </div>

              {!isApproved ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-amber-600" />
                  </div>
                  <p className="text-sm font-bold text-amber-800 mb-2">Approval Required</p>
                  <p className="text-xs text-amber-700 mb-4">
                    {isPending
                      ? 'Your application is under review. QR code generation will be enabled once approved.'
                      : 'Complete your hotel profile and submit all documents for approval before generating your QR code.'}
                  </p>
                  {!isPending && (
                    <Button size="sm" onClick={() => setTab(hotel ? 'documents' : 'profile')} className="bg-accent hover:bg-accent/90 text-white rounded-xl">
                      {hotel ? 'Upload Documents' : 'Complete Profile First'}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Hotel card */}
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
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{[hotel.city, hotel.country].filter(Boolean).join(', ')}
                      </p>
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
                        <p className="text-sm text-muted-foreground text-center">Click below to generate your hotel QR code</p>
                        <Button onClick={generateQR} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl px-8">
                          <QrCode className="w-4 h-4 mr-2" /> Generate QR Code
                        </Button>
                      </div>
                    ) : qrLoading ? (
                      <div className="flex flex-col items-center gap-3 py-12">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                        <p className="text-sm text-muted-foreground">Generating your QR code…</p>
                      </div>
                    ) : (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
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
                        <div className="bg-muted/50 rounded-xl px-4 py-2 text-center max-w-xs">
                          <p className="text-[10px] text-muted-foreground">QR code links to:</p>
                          <p className="text-xs font-mono text-accent break-all mt-0.5">{qrLandingUrl}</p>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={downloadQR} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold">
                            <Download className="w-4 h-4 mr-2" /> Download PNG
                          </Button>
                          <Button variant="outline" onClick={generateQR} className="rounded-xl">
                            <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                          </Button>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 w-full">
                          <p className="text-xs font-semibold text-green-800 mb-1">✅ QR Code Ready</p>
                          <ul className="text-[10px] text-green-700 space-y-0.5 list-disc pl-3">
                            <li>Print and place at your concierge desk</li>
                            <li>Add to in-room information folders</li>
                            <li>Share digitally on hotel app or TV screens</li>
                            <li>Guests scan → register → ship in under 3 minutes</li>
                          </ul>
                        </div>
                      </motion.div>
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