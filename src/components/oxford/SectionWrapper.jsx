import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function SectionWrapper({ id, number, title, children, setActive }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(id); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [id, setActive]);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-20"
    >
      <div className="flex items-baseline gap-3 mb-6 pb-4 border-b-2 border-gray-900">
        <span className="text-[11px] font-black text-gray-300 tracking-widest">{number}</span>
        <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </motion.section>
  );
}