/**
 * Owlly Brand Owl Logo — Concept 2
 * Modern flat design with expressive AI-glow eyes.
 * Colors: Gold #C49A2A / #F5B800, White #FFFFFF, Cyan #00D4FF
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
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="irisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#0099CC" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C49A2A" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="chestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8F0" />
          <stop offset="100%" stopColor="#F5E6C8" />
        </linearGradient>
      </defs>

      {/* ── Dark background circle ── */}
      <circle cx="60" cy="60" r="56" fill="#1a1a2e" />

      {/* ── Wing shapes ── */}
      <ellipse cx="22" cy="68" rx="14" ry="20" fill="#A07D1C" transform="rotate(-10,22,68)" />
      <ellipse cx="98" cy="68" rx="14" ry="20" fill="#A07D1C" transform="rotate(10,98,68)" />

      {/* ── Body ── */}
      <ellipse cx="60" cy="75" rx="32" ry="35" fill="url(#bodyGrad)" />

      {/* ── Chest ── */}
      <ellipse cx="60" cy="80" rx="22" ry="24" fill="url(#chestGrad)" />

      {/* ── Chest feather lines ── */}
      <path d="M46,76 Q60,72 74,76" stroke="#E8D5B0" strokeWidth="1.5" fill="none" />
      <path d="M43,86 Q60,82 77,86" stroke="#E8D5B0" strokeWidth="1.5" fill="none" />
      <path d="M46,96 Q60,92 74,96" stroke="#E8D5B0" strokeWidth="1.5" fill="none" />

      {/* ── Head ── */}
      <circle cx="60" cy="40" r="36" fill="url(#bodyGrad)" />

      {/* ── Ear tufts ── */}
      <path d="M34,16 L24,4 L40,12 Z" fill="#5C4A0F" />
      <path d="M86,16 L96,4 L80,12 Z" fill="#5C4A0F" />

      {/* ── Eye glow halos (AI aura) ── */}
      <circle cx="42" cy="40" r="18" fill="url(#eyeGlow)" />
      <circle cx="78" cy="40" r="18" fill="url(#eyeGlow)" />

      {/* ── Eye whites ── */}
      <circle cx="42" cy="40" r="15" fill="white" />
      <circle cx="78" cy="40" r="15" fill="white" />

      {/* ── Iris ── */}
      <circle cx="42" cy="40" r="11" fill="url(#irisGrad)" />
      <circle cx="78" cy="40" r="11" fill="url(#irisGrad)" />

      {/* ── Pupils ── */}
      <circle cx="42" cy="40" r="5.5" fill="#0a0a2e" />
      <circle cx="78" cy="40" r="5.5" fill="#0a0a2e" />

      {/* ── Gold eye rings ── */}
      <circle cx="42" cy="40" r="15" fill="none" stroke="#E8C84A" strokeWidth="2" />
      <circle cx="78" cy="40" r="15" fill="none" stroke="#E8C84A" strokeWidth="2" />

      {/* ── AI sparkle highlights ── */}
      <circle cx="37.5" cy="35.5" r="3" fill="white" opacity="0.95" />
      <circle cx="73.5" cy="35.5" r="3" fill="white" opacity="0.95" />
      <circle cx="39" cy="39" r="1.5" fill="white" opacity="0.6" />
      <circle cx="75" cy="39" r="1.5" fill="white" opacity="0.6" />

      {/* ── Beak ── */}
      <path d="M60,52 L52,65 L60,62 L68,65 Z" fill="#F5B800" />
      <path d="M60,52 L52,65 L68,65 Z" fill="#E8A818" />

      {/* ── AI lightbulb top symbol ── */}
      <circle cx="60" cy="6" r="7" fill="#00D4FF" opacity="0.25" />
      <path d="M54,14 Q54,5 60,2 Q66,5 66,14 L63,14 L63,18 L57,18 L57,14 Z" fill="#00D4FF" opacity="0.85" />
    </svg>
  );
}