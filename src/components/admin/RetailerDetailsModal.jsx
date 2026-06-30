import { Building2, Calendar, ExternalLink, FileText, Mail, MapPin, Phone, Shield, X } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-600 border-red-200',
  suspended: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function RetailerDetailsModal({ retailer, onClose }) {
  if (!retailer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-accent" /></div>
            <div>
              <h3 className="text-base font-bold text-foreground">{retailer.store_name}</h3>
              {retailer.brand_name && <p className="text-xs text-muted-foreground">{retailer.brand_name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[retailer.status] || ''}`}>{retailer.status}</span>
          {retailer.partner_code && <span className="text-[10px] font-mono text-accent">{retailer.partner_code}</span>}
          {retailer.commission_rate != null && <span className="text-[10px] text-muted-foreground">Commission {retailer.commission_rate}%</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Field icon={<Building2 className="w-3.5 h-3.5" />} label="Business Name" value={retailer.store_name} />
          <Field icon={null} label="Owner / Contact" value={retailer.contact_name} />
          <Field icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={retailer.contact_email} />
          <Field icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={retailer.contact_phone} />
          <Field icon={null} label="Business Category" value={retailer.store_category} />
          <Field icon={<MapPin className="w-3.5 h-3.5" />} label="Store Location" value={retailer.store_location} />
          <Field icon={null} label="Trade Licence No." value={retailer.trade_license_number} />
          <Field icon={null} label="Branches" value={retailer.branches_count} />
          <Field icon={<Calendar className="w-3.5 h-3.5" />} label="Registration Date" value={retailer.created_date ? new Date(retailer.created_date).toLocaleDateString('en-GB') : '—'} />
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold text-foreground mb-2">Uploaded Documents</p>
          {retailer.trade_license_url ? (
            <a href={retailer.trade_license_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
              <FileText className="w-3.5 h-3.5" /> View Trade License <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">No documents uploaded.</p>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-accent" /> Verification &amp; Approval History</p>
          <div className="space-y-2">
            <TimelineRow label="Registration Submitted" date={retailer.created_date} done />
            <TimelineRow label="Verification Status" value={retailer.status} done={retailer.status !== 'pending'} />
            {retailer.status === 'approved' && <TimelineRow label="Approved — Partner Code Issued" value={retailer.partner_code} done />}
            {retailer.status === 'rejected' && <TimelineRow label="Rejected" value="Application declined" done />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div>
        <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-foreground mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );
}

function TimelineRow({ label, date, value, done }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-2 h-2 rounded-full ${done ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
      <span className="text-muted-foreground flex-1">{label}</span>
      <span className="font-semibold text-foreground">{date ? new Date(date).toLocaleDateString('en-GB') : value || '—'}</span>
    </div>
  );
}