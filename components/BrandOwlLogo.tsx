import { useId } from "react";

export function BrandOwlLogo({ size = 72 }: { size?: number }) {
  const uid = useId().replace(/:/g, "")
  const bodyId = `owlBody-${uid}`
  const ringId = `owlRing-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bodyId} x1="122" y1="88" x2="286" y2="318" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="52%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={ringId} x1="120" y1="88" x2="280" y2="304" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Perch */}
      <line x1="54" y1="332" x2="346" y2="332" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />

      {/* Feet */}
      <line x1="160" y1="296" x2="160" y2="332" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
      <line x1="240" y1="296" x2="240" y2="332" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />

      {/* Body */}
      <ellipse cx="200" cy="237" rx="92" ry="104" fill={`url(#${bodyId})`} stroke="#0f172a" strokeWidth="7" />
      <path d="M132 203 Q96 223 96 270 Q96 296 116 302" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
      <path d="M268 203 Q304 223 304 270 Q304 296 284 302" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />

      {/* Head */}
      <circle cx="200" cy="148" r="86" fill="#fef3c7" stroke="#0f172a" strokeWidth="7" />

      {/* Ears / tufts */}
      <path d="M140 96 Q150 68 166 80" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      <path d="M260 96 Q250 68 234 80" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="168" cy="142" r="28" fill="white" stroke={`url(#${ringId})`} strokeWidth="7" />
      <circle cx="232" cy="142" r="28" fill="white" stroke={`url(#${ringId})`} strokeWidth="7" />
      <circle cx="168" cy="142" r="12" fill="#0f172a" />
      <circle cx="232" cy="142" r="12" fill="#0f172a" />

      {/* Beak */}
      <path d="M200 154 L188 180 Q200 190 212 180 Z" fill="#f59e0b" stroke="#0f172a" strokeWidth="4" strokeLinejoin="round" />

      {/* Feather dots */}
      <circle cx="185" cy="271" r="6" fill="#10b981" />
      <circle cx="215" cy="271" r="6" fill="#10b981" />
      <circle cx="170" cy="290" r="6" fill="#f59e0b" />
      <circle cx="200" cy="290" r="6" fill="#f59e0b" />
      <circle cx="230" cy="290" r="6" fill="#f59e0b" />

      {/* Cap */}
      <path d="M110 88 L200 56 L290 88 L200 102 Z" fill="#0f172a" stroke="#0f172a" strokeWidth="6" strokeLinejoin="round" />
      <path d="M122 102 Q200 84 278 102" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
      <line x1="200" y1="56" x2="270" y2="96" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
      <circle cx="270" cy="96" r="7" fill="#f59e0b" stroke="#0f172a" strokeWidth="3" />
    </svg>
  );
}
