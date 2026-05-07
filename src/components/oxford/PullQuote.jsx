export default function PullQuote({ children }) {
  return (
    <blockquote className="border-l-4 border-amber-400 bg-amber-50 rounded-r-2xl px-5 py-4 my-6">
      <p className="text-sm font-semibold text-amber-900 leading-relaxed italic">
        {children}
      </p>
    </blockquote>
  );
}