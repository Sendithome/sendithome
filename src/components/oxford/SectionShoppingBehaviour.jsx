import SectionWrapper from './SectionWrapper';
import StatCard from './StatCard';
import PullQuote from './PullQuote';

export default function SectionShoppingBehaviour({ id, setActive }) {
  return (
    <SectionWrapper id={id} number="02" title="Shopping Tourism Behaviour" setActive={setActive}>

      <p className="text-sm text-gray-700 leading-relaxed">
        Shopping tourism — defined as international travel motivated in part or wholly by the intent to 
        purchase goods unavailable, more expensive, or harder to acquire in the visitor's country of 
        origin — represents a structurally significant and growing segment of global tourism economics. 
        Dubai occupies a dominant position within this segment owing to its tax-free retail environment, 
        brand density, and logistics infrastructure.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Purchase Categories</p>
          {['Fashion & Apparel', 'Electronics & Tech', 'Jewellery & Watches', 'Cosmetics & Fragrance', 'Homewares & Gifts'].map(c => (
            <div key={c} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <p className="text-xs text-gray-700">{c}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Top Visitor Origins</p>
          {['India & South Asia', 'United Kingdom', 'GCC Neighbours', 'Russia & CIS', 'China & East Asia'].map(c => (
            <div key={c} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <p className="text-xs text-gray-700">{c}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Purchasing Triggers</p>
          {['Tax-free pricing differential', 'Brand availability', 'Limited editions & exclusives', 'Outlet & seasonal sales', 'Gifting & social occasions'].map(c => (
            <div key={c} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <p className="text-xs text-gray-700">{c}</p>
            </div>
          ))}
        </div>
      </div>

      <PullQuote>
        "The volume and value of goods purchased by international visitors in Dubai creates a 
        structural downstream logistics challenge that existing infrastructure has not addressed at scale."
      </PullQuote>

      <p className="text-sm text-gray-700 leading-relaxed">
        A critical behavioural characteristic of shopping tourists is the <strong>volume-to-mobility 
        constraint</strong>: the quantity and category of goods purchased routinely exceeds the practical 
        carrying capacity of air travel. Premium fashion items, electronics, fragrance, and homewares 
        are high in value but generate physical bulk that conflicts with airline baggage allowances, 
        excess baggage costs, and the logistical realities of onward travel within multi-destination itineraries.
      </p>

      <div className="mt-6 bg-gray-900 text-white rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Behavioural Friction Points Identified</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: '🧳', point: 'Airline baggage allowance constraints limit purchase volume' },
            { icon: '💸', point: 'Excess baggage fees disincentivise high-value bulk purchasing' },
            { icon: '🔄', point: 'Multi-city itineraries make carrying large purchases impractical' },
            { icon: '🏨', point: 'Hotel storage is temporary and insecure for high-value goods' },
            { icon: '📦', point: 'Local postal/courier services lack tourist-oriented UX' },
            { icon: '🛃', point: 'Customs declaration complexity deters independent shipping' },
          ].map(f => (
            <div key={f.point} className="flex items-start gap-2.5">
              <span className="text-lg leading-none mt-0.5">{f.icon}</span>
              <p className="text-xs text-white/70 leading-relaxed">{f.point}</p>
            </div>
          ))}
        </div>
      </div>

    </SectionWrapper>
  );
}