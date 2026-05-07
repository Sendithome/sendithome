export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
      <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
      <p className="text-[11px] font-semibold text-gray-700 mt-2 leading-snug">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}