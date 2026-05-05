"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

// ─── Data ───────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "AI Chat",
    desc: "Ask anything — lesson plans, assessments, behaviour, differentiation. Instant curriculum-aligned responses.",
    tag: "Core", tagColor: "#6366f1",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    title: "Unit Library",
    desc: "Browse ready-to-use unit plans aligned to Australian Curriculum (AC9). Search by subject, year level, topic.",
    tag: "Library", tagColor: "#22d3ee",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: "Auto-Marking",
    desc: "Upload a rubric and student work. Get instant, criterion-by-criterion feedback powered by AI vision.",
    tag: "AI", tagColor: "#34d399",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: "Lesson Planner",
    desc: "Generate complete lesson plans in seconds. Specify subject, year level, topic, duration, and lesson type.",
    tag: "Popular", tagColor: "#fbbf24",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    title: "Rubric Generator",
    desc: "Create detailed assessment rubrics for any subject, year level, and task type in minutes.",
    tag: "New", tagColor: "#a78bfa",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    title: "Curriculum Guide",
    desc: "Browse the full AC9 curriculum by subject and year level. Never miss a content descriptor.",
    tag: "AC9", tagColor: "#f472b6",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Tell us about your class",
    desc: "Complete a 30-second onboarding — year levels and subjects you teach. PickleNickAI learns your context.",
  },
  {
    n: "02",
    title: "Chat with your AI assistant",
    desc: "Ask anything. Lesson plans, rubrics, assessments, behaviour strategies — all curriculum-aligned to AC9.",
  },
  {
    n: "03",
    title: "Get results instantly",
    desc: "Copy, export to PDF, or save to your library. No waiting, no forms. Just results.",
  },
];

const TESTIMONIALS = [
  { quote: "I used to spend hours on rubrics. PickleNickAI generated mine in 90 seconds.", name: "Rachel T.", role: "Year 3 Teacher, WA" },
  { quote: "Finally an AI that actually understands AC9 codes and the Australian curriculum.", name: "Marcus L.", role: "HASS Coordinator, NSW" },
  { quote: "My lesson plans are better and I save 3+ hours per week. Game changer.", name: "Sofia M.", role: "Year 5 Teacher, QLD" },
];

// ─── Orb blob ───────────────────────────────────────────────────────────────
function Orb({ color, size, top, left, right, bottom, delay = 0, duration = 12 }: {
  color: string; size: number; top?: string; left?: string; right?: string; bottom?: string; delay?: number; duration?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut", delay }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(40px)",
        opacity: 0.5,
        top,
        left,
        right,
        bottom,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ─── Glass card ─────────────────────────────────────────────────────────────
function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`glass-surface ${className}`}
      style={{ borderRadius: "var(--radius-lg)", ...style }}
    >
      {children}
    </div>
  );
}

// ─── Gradient button ────────────────────────────────────────────────────────
function GradientButton({ href, children, size = "md", glow = true }: {
  href: string; children: React.ReactNode; size?: "sm" | "md" | "lg"; glow?: boolean;
}) {
  const padding = size === "lg" ? "14px 32px" : size === "sm" ? "8px 18px" : "12px 24px";
  const fontSize = size === "lg" ? 15 : size === "sm" ? 13 : 14;
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{ display: "inline-block" }}
    >
      <Link
        href={href}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding,
          background: "var(--gradient-primary)",
          backgroundSize: "200% 200%",
          color: "#fff",
          borderRadius: "var(--radius-full)",
          fontWeight: 700,
          fontSize,
          textDecoration: "none",
          boxShadow: glow ? "0 0 32px var(--primary-glow)" : "none",
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </Link>
    </motion.div>
  );
}

// ─── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({ f, index }: { f: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="glass-surface"
      style={{ borderRadius: "var(--radius-lg)", padding: "28px", cursor: "default", position: "relative", overflow: "hidden" }}
    >
      {/* Gradient glow on hover */}
      <motion.div
        animate={{ opacity: isInView ? [0.3, 0.6, 0.3] : 0 }}
        transition={{ repeat: Infinity, duration: 3, delay: index * 0.5 }}
        style={{
          position: "absolute", top: -40, right: -40,
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${f.tagColor}30 0%, transparent 70%)`,
          filter: "blur(20px)", pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: index * 0.07 + 0.1, type: "spring", stiffness: 400 }}
        style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${f.tagColor}18`,
          border: `1px solid ${f.tagColor}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: f.tagColor, marginBottom: 18, position: "relative", zIndex: 1,
        }}
      >
        {f.icon}
      </motion.div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, position: "relative", zIndex: 1 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{f.title}</h3>
        <span style={{
          padding: "2px 8px", borderRadius: "var(--radius-full)",
          background: `${f.tagColor}18`, color: f.tagColor,
          fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
        }}>{f.tag}</span>
      </div>
      <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.65, position: "relative", zIndex: 1 }}>{f.desc}</p>
    </motion.div>
  );
}

// ─── Testimonial card ────────────────────────────────────────────────────────
function TestimonialCard({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-surface"
      style={{ borderRadius: "var(--radius-lg)", padding: "28px", position: "relative", overflow: "hidden" }}
    >
      {/* Subtle top gradient line */}
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
        background: "var(--gradient-primary)", opacity: 0.4,
      }} />

      <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic", position: "relative", zIndex: 1 }}>
        &ldquo;{t.quote}&rdquo;
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: index * 0.1 + 0.15 }}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0,
          }}
        >
          {t.name.split(" ").map(n => n[0]).join("")}
        </motion.div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{t.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── How-it-works step ───────────────────────────────────────────────────────
function HowStep({ step, index }: { step: typeof HOW_STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.12 }}
      style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 + index * 0.12 }}
        style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: "var(--gradient-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 14, color: "#fff", fontFamily: "monospace",
          boxShadow: "0 0 24px var(--primary-glow)",
        }}
      >
        {step.n}
      </motion.div>
      <div style={{ paddingTop: 4 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: "var(--text)" }}>{step.title}</h3>
        <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.65 }}>{step.desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Count-up ───────────────────────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {target.toLocaleString()}{suffix}
    </motion.span>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const howInView = useInView(howRef, { once: true, margin: "-60px" });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-60px" });

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ─── Nav ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-surface"
        style={{
          position: "sticky", top: 0, zIndex: 100,
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 28px",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 12, color: "#fff",
              boxShadow: "0 0 20px var(--primary-glow)",
            }}
          >PN</motion.div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.025em" }}>PickleNickAI</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How it works", "Pricing"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              style={{ fontSize: 14, color: "var(--text-2)", textDecoration: "none", fontWeight: 500 }}
              whileHover={{ color: "var(--text)" }}
            >
              {item}
            </motion.a>
          ))}
        </div>

        <GradientButton href="/picklenickai" size="sm">Open App</GradientButton>
      </motion.nav>

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          maxWidth: 1100, margin: "0 auto",
          padding: "110px 24px 100px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient mesh orbs */}
        <Orb color="#6366f1" size={500} top="-20%" left="-10%" delay={0} duration={14} />
        <Orb color="#22d3ee" size={400} top="10%" right="-15%" delay={2} duration={18} />
        <Orb color="#818cf8" size={300} bottom="-10%" left="20%" delay={4} duration={12} />
        <Orb color="#34d399" size={200} bottom="20%" right="10%" delay={1} duration={20} />
        <Orb color="#a78bfa" size={180} top="40%" left="5%" delay={3} duration={16} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }} />

        {/* Hero badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          style={{ position: "relative", zIndex: 1, marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <div style={{
            padding: "5px 14px", borderRadius: "var(--radius-full)",
            background: "var(--primary-dim)",
            border: "1px solid rgba(99,102,241,0.25)",
            fontSize: 13, fontWeight: 600, color: "var(--primary-hover)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)" }}
            />
            Built for Australian F–6 Teachers
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: "clamp(2.6rem, 7vw, 4.5rem)",
            fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.04,
            marginBottom: 24, position: "relative", zIndex: 1,
          }}
        >
          Your AI Teaching Assistant
          <br />
          <span className="gradient-text">for Australian F–6</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          style={{
            fontSize: 18, color: "var(--text-2)", lineHeight: 1.7,
            maxWidth: 540, margin: "0 auto 40px", position: "relative", zIndex: 1,
          }}
        >
          Cut admin. Boost capability. Become the best teacher possible.
          Chat with an AI that knows AC9 inside out.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}
        >
          <GradientButton href="/picklenickai" size="lg">
            Start free — it&apos;s instant
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </GradientButton>

          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "14px 28px",
              background: "var(--surface-glass)",
              backdropFilter: "var(--glass-blur-sm)",
              WebkitBackdropFilter: "var(--glass-blur-sm)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-2)", borderRadius: "var(--radius-full)",
              fontWeight: 600, fontSize: 15,
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            See how it works
          </motion.a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          style={{ marginTop: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, position: "relative", zIndex: 1 }}
        >
          <div style={{ display: "flex" }}>
            {["TC", "MR", "SH", "JK", "AL"].map((init, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.06 }}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `linear-gradient(135deg, hsl(${i * 55 + 220}, 70%, 55%), hsl(${i * 55 + 260}, 70%, 45%))`,
                  border: "2px solid var(--bg)",
                  marginLeft: i === 0 ? 0 : -10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 10, color: "#fff",
                  boxShadow: "0 0 12px rgba(99,102,241,0.3)",
                }}
              >{init}</motion.div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            <span style={{ color: "var(--text-2)", fontWeight: 600 }}>
              <CountUp target={840} suffix="+" /> Australian teachers onboarded
            </span>
          </p>
        </motion.div>

        {/* Floating demo card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, type: "spring", stiffness: 200, damping: 25 }}
          whileHover={{ y: -6, boxShadow: "0 32px 80px rgba(99,102,241,0.25)" }}
          className="glass-surface"
          style={{
            maxWidth: 580, margin: "56px auto 0", borderRadius: "var(--radius-xl)",
            padding: "24px 28px", position: "relative", zIndex: 1,
            border: "1px solid var(--border-glass)",
          }}
        >
          {/* Browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>chat.picklenickai.com</span>
          </div>

          {/* Chat messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                padding: "12px 16px", borderRadius: "var(--radius-lg)", fontSize: 14,
                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                color: "var(--text-2)", alignSelf: "flex-start", maxWidth: "85%",
                borderBottomLeftRadius: 4,
              }}
            >
              Write me a WALT, TIB and WILF for Year 4 Science — Energy transfers
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
              style={{
                padding: "14px 18px", borderRadius: "var(--radius-lg)", fontSize: 14,
                background: "var(--primary-dim)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "var(--text)", alignSelf: "flex-end", maxWidth: "85%",
                borderBottomRightRadius: 4,
              }}
            >
              <p style={{ marginBottom: 8, fontWeight: 600, color: "var(--primary-hover)" }}>Here&apos;s your Year 4 Science lesson:</p>
              <p style={{ color: "var(--text-2)", marginBottom: 4 }}>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>WALT:</span> Investigate how energy transfers through different forms
              </p>
              <p style={{ color: "var(--text-2)", marginBottom: 4 }}>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>TIB:</span> Understanding energy helps us explain everyday phenomena around us
              </p>
              <p style={{ color: "var(--text-2)" }}>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>WILF:</span> All students can identify 3 energy transfers & use scientific language
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────── */}
      <section
        id="features"
        ref={featuresRef}
        style={{
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "linear-gradient(180deg, rgba(99,102,241,0.04) 0%, transparent 100%)",
          padding: "100px 24px",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={featuresInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
              style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-hover)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}
            >
              Powerful Features
            </motion.p>
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900,
              letterSpacing: "-0.03em", marginBottom: 14,
            }}>
              Everything a teacher needs
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 480, margin: "0 auto" }}>
              One AI. Six tools. Zero friction. Built by teachers, for teachers.
            </p>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} f={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        ref={howRef}
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left orb */}
        <Orb color="#6366f1" size={350} top="20%" left="-15%" delay={1} duration={16} />
        <Orb color="#22d3ee" size={250} bottom="10%" right="-10%" delay={3} duration={20} />

        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 80, alignItems: "center",
          position: "relative", zIndex: 1,
        }}>

          {/* Left content */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={howInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-hover)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}
            >
              How it works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={howInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 900,
                letterSpacing: "-0.03em", marginBottom: 48, lineHeight: 1.15,
              }}
            >
              From question to result{' '}
              <span className="gradient-text">in under 60 seconds</span>
            </motion.h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {HOW_STEPS.map((step, i) => (
                <HowStep key={step.n} step={step} index={i} />
              ))}
            </div>
          </div>

          {/* Right — floating demo card */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={howInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.55, delay: 0.35, type: "spring", stiffness: 200, damping: 25 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="glass-surface"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "28px",
              border: "1px solid var(--border-glass)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            {/* Ambient top glow */}
            <div style={{
              position: "absolute", top: -1, left: "10%", right: "10%", height: 2,
              background: "var(--gradient-primary)",
              borderRadius: "0 0 50% 50%",
              filter: "blur(4px)", opacity: 0.7,
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 22 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
              <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>app.picklenickai.com</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={howInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.55 }}
                style={{
                  padding: "11px 16px", borderRadius: "var(--radius-lg)", fontSize: 13.5,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                  borderBottomLeftRadius: 4,
                }}
              >
                Generate a Year 5 History unit on colonial Australia
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={howInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.65 }}
                style={{
                  padding: "14px 18px", borderRadius: "var(--radius-lg)", fontSize: 13.5,
                  background: "var(--primary-dim)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "var(--text)",
                  borderBottomRightRadius: 4,
                }}
              >
                <p style={{ marginBottom: 10, fontWeight: 600, color: "var(--primary-hover)", fontSize: 13 }}>
                  Unit Plan: Colonial Australia (Year 5)
                </p>
                <p style={{ color: "var(--text-2)", marginBottom: 5, fontSize: 12.5 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>Duration:</span> 6 weeks (12 lessons)
                </p>
                <p style={{ color: "var(--text-2)", marginBottom: 5, fontSize: 12.5 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>AC9:</span> HASS — Historical Knowledge & Understanding
                </p>
                <p style={{ color: "var(--text-2)", fontSize: 12.5 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>Topics:</span> British colonisation, perspectives, impact on First Nations peoples
                </p>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              {["Save to Library", "Copy", "Export PDF"].map((label, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={howInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.78 + i * 0.07 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: "7px 14px",
                    background: i === 0 ? "var(--gradient-primary)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${i === 0 ? "transparent" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: i === 0 ? "#fff" : "var(--text-2)",
                    cursor: "pointer",
                    boxShadow: i === 0 ? "0 0 20px var(--primary-glow)" : "none",
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Testimonials ───────────────────────────────────────────────── */}
      <section
        ref={testimonialsRef}
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "100px 24px",
          background: "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.03) 50%, transparent 100%)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 52 }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={testimonialsInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.05 }}
              style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}
            >
              Social Proof
            </motion.p>
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900,
              letterSpacing: "-0.03em",
            }}>
              Australian teachers{' '}
              <span className="gradient-text">love it</span>
            </h2>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} t={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{ padding: "100px 24px", textAlign: "center", position: "relative" }}
      >
        {/* Glow behind pricing */}
        <Orb color="#6366f1" size={400} top="0%" left="50%" delay={0} duration={18} />

        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-hover)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 40 }}
          >
            One plan. Everything included. No seat limits, no feature gates.
          </motion.p>

          {/* Gradient border card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 250, damping: 28, delay: 0.15 }}
            className="glass-surface"
            style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "44px 60px",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--radius-xl)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Top gradient line */}
            <div style={{
              position: "absolute", top: 0, left: "15%", right: "15%", height: 2,
              background: "var(--gradient-primary)",
              borderRadius: "0 0 50% 50%",
              filter: "blur(3px)",
            }} />

            {/* Glow */}
            <div style={{
              position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
              width: 300, height: 200, borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)",
              filter: "blur(30px)", pointerEvents: "none",
            }} />

            <div style={{
              fontSize: 12, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "var(--primary-hover)",
              marginBottom: 8, position: "relative", zIndex: 1,
            }}>
              Pro Plan
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4, position: "relative", zIndex: 1 }}>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: 60, fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text)" }}
              >
                $19
              </motion.span>
              <span style={{ fontSize: 16, color: "var(--text-3)", fontWeight: 500 }}>/month</span>
            </div>

            <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20, position: "relative", zIndex: 1 }}>
              billed monthly, per teacher
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, position: "relative", zIndex: 1 }}>
              {[
                "Unlimited lesson plans",
                "Unlimited rubrics & assessments",
                "Writing feedback & auto-marking",
                "Worksheet generator",
                "Behaviour support plans",
                "AC9-aligned, always current",
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--text-2)" }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: "rgba(52,211,153,0.15)",
                    border: "1px solid rgba(52,211,153,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  {item}
                </motion.div>
              ))}
            </div>

            <GradientButton href="/picklenickai" size="lg">Start 14-Day Free Trial</GradientButton>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>No credit card required · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "48px 24px 40px",
        background: "rgba(0,0,0,0.3)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 11, color: "#fff",
              boxShadow: "0 0 16px var(--primary-glow)",
            }}>PN</div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>PickleNickAI</span>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: "var(--text-3)", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >
                {link}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 12, color: "var(--text-3)" }}>
            © 2026 PickleNickAI. Built for Australian teachers.
          </p>
        </div>
      </footer>
    </div>
  );
}
