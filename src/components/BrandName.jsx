// Canonical SENDITHOME wordmark.
// "IT" is ALWAYS uppercase and pink (text-accent) — no exceptions.
// SEND/HOME inherit the current text color so they adapt to any background (white/black).
//   - primary  → SENDITHOME  (hero sections, page titles, large headings, major branding)
//   - default  → SendITHome  (body copy, paragraphs, buttons, cards, UI elements)
export default function BrandName({ primary = false, className = '' }) {
  if (primary) {
    return (
      <span className={className} style={{ whiteSpace: 'nowrap' }}>
        SEND<span className="text-accent">IT</span>HOME
      </span>
    );
  }
  return (
    <span className={className} style={{ whiteSpace: 'nowrap' }}>
      Send<span className="text-accent">IT</span>Home
    </span>
  );
}