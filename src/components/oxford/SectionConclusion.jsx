import SectionWrapper from './SectionWrapper';
import PullQuote from './PullQuote';

export default function SectionConclusion({ id, setActive }) {
  return (
    <SectionWrapper id={id} number="05" title="Conclusion" setActive={setActive}>

      <p className="text-sm text-gray-700 leading-relaxed">
        The macro-economic context examined in this overview establishes a clear and compelling 
        structural case. Dubai's tourism economy is characterised by high-yield, retail-motivated 
        international visitors whose purchasing behaviour is systematically constrained by the 
        absence of accessible, integrated international shipping infrastructure at the point of stay.
      </p>

      <p className="text-sm text-gray-700 leading-relaxed mt-4">
        This gap is not incidental — it is a structural consequence of the mismatch between 
        Dubai's world-class retail offer and the absence of a consumer-grade logistics layer 
        capable of serving individual tourists at the hotel interface. The economic consequence 
        is measurable in the form of suppressed retail basket sizes, forgone purchasing decisions, 
        and an under-served guest experience within the five-star hospitality segment.
      </p>

      <PullQuote>
        "Where structural friction exists in a well-capitalised, high-frequency consumer market, 
        the solution is invariably a purpose-built intermediary that removes complexity from 
        the demand side — not an expansion of supply-side logistics capacity alone."
      </PullQuote>

      <div className="grid sm:grid-cols-3 gap-4 my-8">
        <div className="bg-[#1a1a2e] text-white rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">🌍</p>
          <p className="text-xs font-bold mb-1">Global Macro Trend</p>
          <p className="text-[11px] text-white/60 leading-relaxed">Shopping tourism is a structurally growing segment of global travel economics</p>
        </div>
        <div className="bg-amber-400 text-gray-900 rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-xs font-bold mb-1">Identified Market Gap</p>
          <p className="text-[11px] text-gray-800/70 leading-relaxed">No tourist-grade hotel-embedded international shipping solution exists at scale in Dubai</p>
        </div>
        <div className="bg-[#1a1a2e] text-white rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">🏗️</p>
          <p className="text-xs font-bold mb-1">Solution Position</p>
          <p className="text-[11px] text-white/60 leading-relaxed">Send It Home is purpose-built to occupy and resolve this structural gap</p>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Key Structural Conclusions</p>
        <ol className="space-y-2.5 list-none">
          {[
            "Dubai's tourism economy generates significant and recurring shopping tourism demand that is structurally under-served by existing logistics infrastructure.",
            'The primary barrier to tourist-initiated international shipping is not courier capacity but accessible interface design, compliance automation, and hotel-point integration.',
            'A hotel-embedded, AI-mediated shipping platform directly addresses each identified dimension of the structural logistics gap.',
            'The Oxford Economics framework of high-yield tourism multiplier effects supports the thesis that removing retail-logistics friction generates measurable tourism GDP uplift.',
            'Send It Home operates at the intersection of hospitality, logistics, and consumer technology — a convergence point with no incumbent operating at comparable scale or integration.',
          ].map((c, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[10px] font-black text-amber-500 mt-0.5 shrink-0">{i + 1}.</span>
              <p className="text-xs text-gray-700 leading-relaxed">{c}</p>
            </li>
          ))}
        </ol>
      </div>

    </SectionWrapper>
  );
}