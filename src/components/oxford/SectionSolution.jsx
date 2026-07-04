import SectionWrapper from './SectionWrapper';
import PullQuote from './PullQuote';
import BrandName from '@/components/BrandName';

const PILLARS = [
  {
    icon: '🏨',
    title: 'Hotel-Embedded Service Delivery',
    desc: 'By embedding the service within the hotel guest experience via QR-code access at concierge, the solution eliminates the discovery and trust barriers. The hotel relationship provides implicit service endorsement — a critical factor for tourist consumer confidence.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Receipt & Item Processing',
    desc: 'Machine learning-assisted receipt digitisation automates item cataloguing, customs categorisation, and eligibility verification against destination country import regulations — removing the primary knowledge barrier to tourist-initiated international shipping.',
  },
  {
    icon: '📋',
    title: 'Automated Customs Compliance',
    desc: 'CN22/CN23 customs declaration generation, harmonised tariff classification, and passport-linked sender verification are automated end-to-end, converting a legally complex multi-step process into a seamless consumer action.',
  },
  {
    icon: '🌍',
    title: 'Global Courier Network Integration',
    desc: 'Integration with established international logistics providers (FedEx, DHL) provides the physical delivery infrastructure, while the platform provides the consumer-facing interface, compliance layer, and tracking experience.',
  },
  {
    icon: '📱',
    title: 'Mobile-First Tourist UX',
    desc: 'The entire service flow — from QR scan to delivery confirmation — is designed for mobile completion by a first-time, non-technical user in a foreign country. This UX-first design philosophy is the core differentiator vs. existing B2B courier services.',
  },
];

export default function SectionSolution({ id, setActive }) {
  return (
    <SectionWrapper id={id} number="04" title="The Solution Architecture" setActive={setActive}>

      <p className="text-sm text-gray-700 leading-relaxed">
        <BrandName /> addresses the structural logistics gap through a vertically integrated, 
        hotel-anchored, technology-mediated international shipping platform. The service is not 
        a logistics company — it is a <strong>consumer experience layer</strong> built on top of 
        existing logistics infrastructure, purpose-designed for the shopping tourist in Dubai's 
        five-star hotel ecosystem.
      </p>

      <div className="grid gap-4 my-8">
        {PILLARS.map((p, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="text-2xl leading-none mt-0.5 shrink-0">{p.icon}</div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <PullQuote>
        "The platform converts an unresolved structural market friction into a frictionless 
        consumer service — unlocking latent purchasing capacity that currently goes unrealised 
        within the tourism retail economy."
      </PullQuote>

      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Service Flow Overview</p>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-amber-200" />
          {[
            { step: 'Guest scans QR code at hotel concierge desk', sub: 'Hotel-embedded entry point' },
            { step: 'Registers profile with passport verification', sub: 'AI-assisted identity & compliance' },
            { step: 'Uploads receipts for AI item extraction', sub: 'Automated customs cataloguing' },
            { step: 'Selects eligible items & destination address', sub: 'Eligibility & compliance check' },
            { step: 'Completes payment at flat-rate pricing', sub: 'Transparent, pre-quoted cost' },
            { step: 'Shipment collected from hotel & dispatched', sub: 'FedEx / DHL physical delivery' },
            { step: 'Real-time tracking to home address', sub: 'End-to-end visibility' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-4 mb-4 relative">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-white font-black text-sm flex items-center justify-center shrink-0 z-10">
                {i + 1}
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1">
                <p className="text-xs font-semibold text-gray-900">{s.step}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </SectionWrapper>
  );
}