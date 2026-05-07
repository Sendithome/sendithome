import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from './SectionWrapper';
import StatCard from './StatCard';
import PullQuote from './PullQuote';

export default function SectionTourism({ id, setActive }) {
  return (
    <SectionWrapper id={id} number="01" title="Dubai's Tourism Economy" setActive={setActive}>

      <p className="text-sm text-gray-700 leading-relaxed">
        Dubai has cemented its position as one of the world's foremost international tourism destinations, 
        consistently ranking among the top five most-visited cities globally. The emirate's strategic 
        geographic positioning — bridging Europe, Asia, and Africa — combined with its infrastructure 
        investment and regulatory environment have created a uniquely concentrated tourism ecosystem.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8">
        <StatCard label="International Visitors Annually" value="17–18M+" sub="pre-2020 peak levels restored" />
        <StatCard label="Tourism GDP Contribution" value="~11.5%" sub="share of total Dubai GDP" />
        <StatCard label="Hotel Keys Citywide" value="140,000+" sub="5-star properties dominant" />
        <StatCard label="Average Hotel Stay" value="3.8 nights" sub="shopping tourism segment" />
      </div>

      <PullQuote>
        "Dubai's tourism model is structurally different from leisure-only destinations — it is 
        purpose-built for commerce, retail, and high-value discretionary expenditure."
      </PullQuote>

      <p className="text-sm text-gray-700 leading-relaxed">
        The Dubai Tourism masterplan actively incentivises retail-led visitation. The emirate hosts the 
        world's largest shopping mall by total area, multiple internationally recognised retail corridors, 
        and a duty-free environment that structurally encourages high-value purchasing. This positions 
        Dubai not merely as a leisure destination but as a <strong>global retail hub</strong> where 
        physical proximity to premium goods is itself a driver of international travel decisions.
      </p>

      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-5 py-4 mt-6">
        <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide mb-1">Oxford Economics Context</p>
        <p className="text-xs text-amber-900 leading-relaxed">
          Oxford Economics defines "high-yield tourism" as visitor segments generating disproportionate 
          economic multiplier effects through retail, hospitality, and experiential spending. Dubai's 
          inbound tourism base is structurally over-indexed toward this classification — with GCC, 
          South Asian, European, and East Asian visitor cohorts each demonstrating above-average 
          retail expenditure per trip.
        </p>
      </div>

    </SectionWrapper>
  );
}