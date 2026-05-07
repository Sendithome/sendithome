export default function OxfordHero() {
  return (
    <div className="bg-[#1a1a2e] text-white px-6 py-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,#fff,#fff_1px,transparent_1px,transparent_12px)]" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400 mb-4">Economic Context Overview</p>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
          The Structural Logistics Gap in<br />
          <span className="text-amber-400">Dubai's Shopping Tourism Economy</span>
        </h1>
        <p className="text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
          An academic framing of the macro-economic conditions that define the opportunity 
          for last-mile international baggage logistics services operating within the 
          Dubai hospitality and retail ecosystem.
        </p>
        <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Sector</p>
            <p className="text-xs font-bold text-white/80 mt-0.5">Tourism & Logistics</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Geography</p>
            <p className="text-xs font-bold text-white/80 mt-0.5">United Arab Emirates — Dubai</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Framework</p>
            <p className="text-xs font-bold text-white/80 mt-0.5">Oxford Economics Methodology</p>
          </div>
        </div>
      </div>
    </div>
  );
}