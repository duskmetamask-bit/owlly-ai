/**
 * Owlly Brand Owl Logo
 * Clean, geometric owl face — warm, friendly, education-first.
 * Colors: Gold #F59E0B, Emerald #10B981, Slate #0F172A, Cream #FFF7E6
 */
export function BrandOwlLogo({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Head circle (cream face) ── */}
      <circle cx="60" cy="60" r="52" fill="#fff7e6" />

      {/* ── Dark outer ring / body suggestion ── */}
      <circle cx="60" cy="60" r="52" fill="none" stroke="#0f172a" strokeWidth="5" />

      {/* ── Gold head cap ── */}
      <path
        d="M14 52 Q60 18 106 52 Q60 42 14 52Z"
        fill="#f59e0b"
        stroke="#0f172a"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* ── Emerald ear tufts ── */}
      <path
        d="M20 50 Q16 30 30 36"
        fill="none"
        stroke="#10b981"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M100 50 Q104 30 90 36"
        fill="none"
        stroke="#10b981"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* ── Left eye ── */}
      <circle cx="40" cy="62" r="15" fill="white" stroke="#f59e0b" strokeWidth="4" />
      <circle cx="40" cy="62" r="7" fill="#0f172a" />
      <circle cx="36" cy="58" r="2.5" fill="white" />

      {/* ── Right eye ── */}
      <circle cx="80" cy="62" r="15" fill="white" stroke="#f59e0b" strokeWidth="4" />
      <circle cx="80" cy="62" r="7" fill="#0f172a" />
      <circle cx="76" cy="58" r="2.5" fill="white" />

      {/* ── Beak (gold diamond) ── */}
      <path
        d="M60 72 L50 84 Q60 92 70 84 Z"
        fill="#f59e0b"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* ── Emerald book base (two leaves at bottom) ── */}
      <path
        d="M30 96 Q24 106 34 112 Q46 114 60 108"
        fill="#10b981"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M90 96 Q96 106 86 112 Q74 114 60 108"
        fill="#10b981"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Book spine */}
      <path d="M60 96 L60 108" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
