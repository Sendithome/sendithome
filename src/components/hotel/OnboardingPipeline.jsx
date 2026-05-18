import { CheckCircle2, Clock, Truck, CalendarCheck, Package, QrCode, FileText, PenLine, Building2, Loader2, AlertCircle } from 'lucide-react';

const PIPELINE = [
  {
    key: 'registration',
    label: 'Hotel Registration',
    desc: 'Account created via the private hotel partner portal.',
    icon: Building2,
    color: 'green',
  },
  {
    key: 'nda',
    label: 'NDA Signed',
    desc: 'Non-Disclosure Agreement reviewed and electronically signed.',
    icon: PenLine,
    color: 'green',
  },
  {
    key: 'documents',
    label: 'Documents Submitted',
    desc: 'Trade license and employment cards uploaded for verification.',
    icon: FileText,
    color: 'green',
  },
  {
    key: 'admin_verification',
    label: 'Admin Verification',
    desc: 'SendITHome team reviews all submitted documents.',
    icon: CheckCircle2,
    color: 'green',
  },
  {
    key: 'qr_approved',
    label: 'QR Code Generated & Final Approval',
    desc: 'Hotel approved. Unique QR code issued and activated.',
    icon: QrCode,
    color: 'green',
  },
  {
    key: 'dispatched_to_logistics',
    label: 'Logistics Company Notified',
    desc: 'Admin dispatches hotel details to logistics partner to begin physical onboarding.',
    icon: Truck,
    color: 'blue',
    logisticsStages: ['dispatched_to_logistics', 'logistics_contacted', 'site_visit_scheduled', 'site_visit_done', 'materials_delivered', 'fully_onboarded'],
  },
  {
    key: 'site_visit',
    label: 'Site Visit & Briefing',
    desc: 'Logistics team visits hotel for staff briefing and setup.',
    icon: CalendarCheck,
    color: 'blue',
    logisticsStages: ['site_visit_scheduled', 'site_visit_done', 'materials_delivered', 'fully_onboarded'],
  },
  {
    key: 'materials',
    label: 'Materials Delivered',
    desc: 'Printed QR codes, signage, and welcome kits placed at the hotel.',
    icon: Package,
    color: 'blue',
    logisticsStages: ['materials_delivered', 'fully_onboarded'],
  },
  {
    key: 'live',
    label: 'Fully Onboarded & Live',
    desc: 'Hotel is active. Guests can start shipping immediately.',
    icon: CheckCircle2,
    color: 'green',
    logisticsStages: ['fully_onboarded'],
  },
];

const LOGISTICS_STAGE_ORDER = [
  'pending_dispatch',
  'dispatched_to_logistics',
  'logistics_contacted',
  'site_visit_scheduled',
  'site_visit_done',
  'materials_delivered',
  'fully_onboarded',
];

function getStepStatus(step, application, onboardingStatus) {
  const appStatus = application?.status;
  const ndaSigned = onboardingStatus?.nda_signed ?? application?.nda_signed;
  const logStage = onboardingStatus?.logistics_stage || 'pending_dispatch';
  const logStageIndex = LOGISTICS_STAGE_ORDER.indexOf(logStage);

  if (step.key === 'registration') return 'done';
  if (step.key === 'nda') return ndaSigned ? 'done' : 'active';
  if (step.key === 'documents') {
    if (appStatus === 'approved' || appStatus === 'pending_approval') return 'done';
    if (ndaSigned) return 'active';
    return 'pending';
  }
  if (step.key === 'admin_verification') {
    if (appStatus === 'approved') return 'done';
    if (appStatus === 'pending_approval') return 'active';
    return 'pending';
  }
  if (step.key === 'qr_approved') {
    if (appStatus === 'approved') return 'done';
    return 'pending';
  }
  // Logistics steps
  if (step.logisticsStages) {
    if (!appStatus || appStatus !== 'approved') return 'pending';
    if (step.logisticsStages.includes(logStage)) return 'done';
    if (step.key === 'dispatched_to_logistics' && logStageIndex >= 1) return 'done';
    if (step.key === 'dispatched_to_logistics' && logStage === 'pending_dispatch') return 'active';
    return 'pending';
  }
  return 'pending';
}

const colorMap = {
  done: 'bg-green-500 text-white border-green-500',
  active: 'bg-accent text-white border-accent',
  pending: 'bg-muted text-muted-foreground border-border',
};

const labelMap = {
  done: { text: 'Complete', cls: 'text-green-700 bg-green-50' },
  active: { text: 'In Progress', cls: 'text-accent bg-accent/10' },
  pending: { text: 'Pending', cls: 'text-muted-foreground bg-muted' },
};

export default function OnboardingPipeline({ application, onboardingStatus, ndaSigned }) {
  const appWithNda = { ...application, nda_signed: ndaSigned || application?.nda_signed };

  const daysLeft = () => {
    if (!onboardingStatus?.target_completion_date) return null;
    const diff = Math.ceil((new Date(onboardingStatus.target_completion_date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const days = daysLeft();

  return (
    <div className="space-y-4">
      {onboardingStatus?.logistics_stage && onboardingStatus.logistics_stage !== 'fully_onboarded' && days !== null && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${days <= 2 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
          <Clock className={`w-5 h-5 shrink-0 ${days <= 2 ? 'text-red-500' : 'text-blue-500'}`} />
          <div>
            <p className={`text-sm font-bold ${days <= 2 ? 'text-red-800' : 'text-blue-800'}`}>
              {days > 0 ? `${days} working day${days !== 1 ? 's' : ''} remaining` : days === 0 ? 'Due today!' : `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`}
            </p>
            <p className={`text-xs ${days <= 2 ? 'text-red-600' : 'text-blue-600'}`}>
              Target completion: {new Date(onboardingStatus.target_completion_date).toLocaleDateString('en-AE')}
            </p>
          </div>
        </div>
      )}

      {onboardingStatus?.logistics_stage === 'fully_onboarded' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Hotel Fully Onboarded & Live!</p>
            <p className="text-xs text-green-700">Guests can now scan the QR code and start shipping.</p>
          </div>
        </div>
      )}

      <div className="relative">
        {PIPELINE.map((step, i) => {
          const status = getStepStatus(step, appWithNda, onboardingStatus);
          const Icon = step.icon;
          const isLast = i === PIPELINE.length - 1;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Timeline column */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${colorMap[status]}`}>
                  {status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${status === 'done' ? 'bg-green-300' : 'bg-border'}`} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 flex-1 ${isLast ? '' : ''}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-bold ${status === 'done' ? 'text-foreground' : status === 'active' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${labelMap[status].cls}`}>
                    {labelMap[status].text}
                  </span>
                  {step.color === 'blue' && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 font-semibold">Logistics</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                {step.key === 'dispatched_to_logistics' && onboardingStatus?.dispatched_at && (
                  <p className="text-[10px] text-blue-600 mt-1">Dispatched: {new Date(onboardingStatus.dispatched_at).toLocaleString('en-AE')}</p>
                )}
                {step.key === 'live' && onboardingStatus?.logistics_stage === 'fully_onboarded' && (
                  <p className="text-[10px] text-green-600 mt-1 font-semibold">✓ Hotel is live and operational</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {onboardingStatus?.logistics_notes && (
        <div className="bg-muted/40 rounded-xl p-3">
          <p className="text-xs font-semibold text-foreground mb-1">Logistics Notes</p>
          <p className="text-xs text-muted-foreground">{onboardingStatus.logistics_notes}</p>
        </div>
      )}
    </div>
  );
}