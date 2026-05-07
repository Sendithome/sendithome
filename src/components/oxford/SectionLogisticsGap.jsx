import SectionWrapper from './SectionWrapper';
import PullQuote from './PullQuote';

const GAP_ITEMS = [
  {
    title: 'Absence of Hotel-Integrated Shipping',
    desc: 'Five-star hotels in Dubai do not systematically offer outbound international parcel shipping as a guest service. Concierge desks historically refer guests to generic courier services that lack tourist-specific interfaces, pricing transparency, or customs guidance.',
    tag: 'Service Gap',
    color: 'bg-red-50 border-red-200 text-red-700',
  },
  {
    title: 'Fragmented Last-Mile Courier Landscape',
    desc: 'Existing international courier providers (FedEx, DHL, Aramex) operate B2B-dominant models not optimised for individual tourist consignments. Price discovery, customs declaration, and collection scheduling are inaccessible to non-business users without prior accounts or technical knowledge.',
    tag: 'Market Structure Gap',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  {
    title: 'Customs Declaration Complexity',
    desc: 'International personal effects shipments require accurate CN22/CN23 customs declarations, harmonised tariff classification, and country-of-destination compliance — processes entirely unfamiliar to leisure tourists. This creates a significant behavioural barrier to self-organised shipping.',
    tag: 'Regulatory Gap',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  {
    title: 'No AI-Assisted Eligibility Verification',
    desc: 'Tourists are unaware of destination country import restrictions, duty thresholds, or prohibited item categories. Without automated eligibility checking, the risk of failed deliveries, customs seizure, or unexpected tax liabilities prevents confidence in independent shipping.',
    tag: 'Information Gap',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    title: 'Payment & Trust Infrastructure',
    desc: 'The combination of international payments, unfamiliar logistics providers, and high-value goods creates a trust deficit. Tourists require a consolidated, transparent, and secure platform — not a patchwork of local logistics operators.',
    tag: 'Trust Gap',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
];

export default function SectionLogisticsGap({ id, setActive }) {
  return (
    <SectionWrapper id={id} number="03" title="The Structural Logistics Gap" setActive={setActive}>

      <p className="text-sm text-gray-700 leading-relaxed">
        Despite Dubai's position as a global retail and tourism hub, there exists a fundamental and 
        largely unaddressed structural gap between the volume of goods purchased by international 
        visitors and the availability of accessible, tourist-oriented international shipping infrastructure. 
        This gap operates across five distinct dimensions:
      </p>

      <div className="space-y-4 my-8">
        {GAP_ITEMS.map((g, i) => (
          <div key={i} className={`border rounded-2xl p-5 ${g.color}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-bold">{g.title}</p>
              <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${g.color}`}>{g.tag}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-80">{g.desc}</p>
          </div>
        ))}
      </div>

      <PullQuote>
        "The logistics gap is not a supply-side failure of courier capacity — it is a 
        demand-side failure of accessibility, interface design, and end-to-end trust architecture 
        for the individual tourist consumer."
      </PullQuote>

      <div className="bg-[#1a1a2e] text-white rounded-2xl p-6 mt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Economic Consequence of the Gap</p>
        <div className="space-y-3">
          {[
            'Suppressed retail purchasing decisions due to perceived post-purchase logistics friction',
            'Retail revenue leakage — tourists reduce basket size to conform to baggage constraints',
            'Hotel service score deflation where concierge cannot resolve guest logistics needs',
            'Lost tourism GDP multiplier from goods that would otherwise have been purchased',
            'Competitive disadvantage vs. destinations with integrated hotel-shipping ecosystems',
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[9px] font-black text-amber-400">{i + 1}</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{c}</p>
            </div>
          ))}
        </div>
      </div>

    </SectionWrapper>
  );
}