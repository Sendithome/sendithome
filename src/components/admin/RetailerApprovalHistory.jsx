import { CheckCircle2, XCircle, KeyRound, StickyNote, Clock } from 'lucide-react';

const ACTION_CONFIG = {
  approved: { icon: CheckCircle2, color: 'text-green-600', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-600', label: 'Rejected' },
  resent: { icon: KeyRound, color: 'text-blue-600', label: 'Credentials Resent' },
  note: { icon: StickyNote, color: 'text-amber-600', label: 'Note Added' },
};

export default function RetailerApprovalHistory({ history = [] }) {
  if (!history.length) {
    return <p className="text-xs text-muted-foreground italic">No approval history yet.</p>;
  }
  const sorted = [...history].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  return (
    <div className="space-y-2.5">
      {sorted.map((h, i) => {
        const cfg = ACTION_CONFIG[h.action] || { icon: Clock, color: 'text-muted-foreground', label: h.action };
        const Icon = cfg.icon;
        return (
          <div key={i} className="flex items-start gap-2.5">
            <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cfg.color}`} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {cfg.label}
                {h.by && <span className="font-normal text-muted-foreground"> · {h.by}</span>}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {h.at ? new Date(h.at).toLocaleString('en-GB') : ''}
              </p>
              {h.note && <p className="text-xs text-foreground mt-0.5 bg-muted/50 rounded-lg px-2 py-1">{h.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}