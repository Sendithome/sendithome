import { useState } from 'react';
import { motion } from 'framer-motion';
import OxfordHero from '../components/oxford/OxfordHero';
import OxfordNav from '../components/oxford/OxfordNav';
import SectionTourism from '../components/oxford/SectionTourism';
import SectionShoppingBehaviour from '../components/oxford/SectionShoppingBehaviour';
import SectionLogisticsGap from '../components/oxford/SectionLogisticsGap';
import SectionSolution from '../components/oxford/SectionSolution';
import SectionConclusion from '../components/oxford/SectionConclusion';

const SECTIONS = [
  { id: 'tourism', label: 'Dubai Tourism Economy' },
  { id: 'shopping', label: 'Shopping Tourism Behaviour' },
  { id: 'logistics', label: 'The Logistics Gap' },
  { id: 'solution', label: 'The Solution' },
  { id: 'conclusion', label: 'Conclusion' },
];

export default function OxfordOverview() {
  const [active, setActive] = useState('tourism');

  return (
    <div className="min-h-screen bg-[#F8F6F1] font-inter">
      <OxfordHero />
      <OxfordNav sections={SECTIONS} active={active} setActive={setActive} />
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-24">
        <SectionTourism id="tourism" setActive={setActive} />
        <SectionShoppingBehaviour id="shopping" setActive={setActive} />
        <SectionLogisticsGap id="logistics" setActive={setActive} />
        <SectionSolution id="solution" setActive={setActive} />
        <SectionConclusion id="conclusion" setActive={setActive} />
      </main>
      <footer className="bg-[#1a1a2e] text-white text-center py-6 px-4">
        <p className="text-xs font-semibold tracking-widest uppercase opacity-60">Send It Home — Economic Context Overview</p>
        <p className="text-[10px] opacity-40 mt-1">Prepared for internal strategic reference · Not for distribution</p>
      </footer>
    </div>
  );
}