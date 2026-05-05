"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

// ─── Floating shapes for hero ───────────────────────────────────────
function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 5 + delay, ease: "easeInOut", delay }}
      style={{ position: "absolute", pointerEvents: "none" }}
    />
  );
}

// ─── Animated counter ───────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        {isInView ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {target.toLocaleString()}{suffix}
          </motion.span>
        ) : "0"}
      </motion.span>
    </motion.span>
  );
}

// ─── Feature cards data ──────────────────────────────────────────────
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

// ─── Feature card with animation ───────────────────────────────────
function FeatureCard({ f, index }: { f: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(99,102,241,0.12)" }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "28px",
        cursor: "default",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: index * 0.07 + 0.1 }}
        style={{
          width: 48, height: 48, borderRadius: 12,
          background: "var(--primary-dim)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--primary-hover)",
          marginBottom: 18,
        }}
      >
        {f.icon}
      </motion.div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</h3>
        <span style={{
          padding: "2px 8px", borderRadius: "var(--radius-full)",
          background: `${f.tagColor}18`, color: f.tagColor,
          fontSize: 11, fontWeight: 600,
        }}>{f.tag}</span>
      </div>
      <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
    </motion.div>
  );
}

// ─── Testimonial card ────────────────────────────────────────────────
function TestimonialCard({ t, index }: { t: typeof TESTIMONIALS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "28px",
      }}
    >
      <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, marginBottom: 16, fontStyle: "italic" }}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 400, delay: index * 0.1 + 0.2 }}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, color: "#fff",
          }}
        >
          {t.name.split(" ").map(n => n[0]).join("")}
        </motion.div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });
  const howInView = useInView(howRef, { once: true, margin: "-60px" });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-60px" });

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* ─── Nav ──────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "sticky", top: 0, zIndex: 100,
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(10,10,10,0.8)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "0 28px",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 12, color: "#fff",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}
          >PN</motion.div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>PickleNickAI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#features" style={{ fontSize: 14, color: "var(--text-2)", textDecoration: "none" }}>Features</a>
          <a href="#pricing" style={{ fontSize: 14, color: "var(--text-2)", textDecoration: "none" }}>Pricing</a>
          <a href="#how" style={{ fontSize: 14, color: "var(--text-2)", textDecoration: "none" }}>How it works</a>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/picklenickai"
            style={{
              padding: "8px 18px",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius)",
              fontWeight: 700, fontSize: 14,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 0 24px rgba(99,102,241,0.35)",
            }}
          >
            Open App
          </Link>
        </motion.div>
      </motion.nav>

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          maxWidth: 1100, margin: "0 auto",
          padding: "100px 24px 80px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Floating shapes */}
        <FloatingShape delay={0}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", top: 40, left: 60 }} />
        </FloatingShape>
        <FloatingShape delay={1.2}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.12)", top: 120, right: 80 }} />
        </FloatingShape>
        <FloatingShape delay={2.4}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.06)", top: 60, right: 180 }} />
        </FloatingShape>
        <FloatingShape delay={0.8}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.1)", bottom: 80, left: 100 }} />
        </FloatingShape>
        <FloatingShape delay={1.8}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(99,102,241,0.1)", bottom: 120, right: 120 }} />
        </FloatingShape>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: "var(--radius-full)",
            background: "var(--primary-dim)",
            border: "1px solid rgba(99,102,241,0.2)",
            fontSize: 13, fontWeight: 600, color: "var(--primary-hover)",
            marginBottom: 28,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }}
          />
          Built for Australian F–6 Teachers
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1.05,
            marginBottom: 24,
          }}
        >
          Your AI Teaching Assistant
          <br />
          <span style={{
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #22d3ee 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            for Australian F–6
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{
            fontSize: 18, color: "var(--text-2)", lineHeight: 1.65,
            maxWidth: 520, margin: "0 auto 40px",
          }}
        >
          Cut admin. Boost capability. Become the best teacher possible.
          Chat with an AI that knows AC9 inside out.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/picklenickai"
              style={{
                padding: "14px 32px",
                background: "var(--primary)",
                color: "#fff", borderRadius: "var(--radius)",
                fontWeight: 700, fontSize: 15,
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 0 40px rgba(99,102,241,0.3)",
                textDecoration: "none",
              }}
            >
              Start free — it&apos;s instant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <a
              href="#how"
              style={{
                padding: "14px 28px",
                background: "var(--surface-2)",
                color: "var(--text-2)", borderRadius: "var(--radius)",
                fontWeight: 600, fontSize: 15,
                border: "1px solid var(--border)",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              See how it works
            </a>
          </motion.div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ marginTop: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}
        >
          <div style={{ display: "flex" }}>
            {["TC", "MR", "SH", "JK", "AL"].map((init, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: `hsl(${i * 60 + 220}, 70%, 50%)`,
                  border: "2px solid var(--bg)",
                  marginLeft: i === 0 ? 0 : -8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 10, color: "#fff",
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
      </section>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <section
        id="features"
        ref={featuresRef}
        style={{
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--surface)",
          padding: "100px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}>
              Everything a teacher needs
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-2)" }}>
              One AI. Six tools. Zero friction.
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

      {/* ─── How it works ───────────────────────────────────────────── */}
      <section
        id="how"
        ref={howRef}
        style={{
          padding: "100px 24px",
          opacity: howInView ? 1 : 0,
          transform: howInView ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={howInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}
            >
              How it works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={howInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 40 }}
            >
              From question to result<br/>in under 60 seconds
            </motion.h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {HOW_STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, x: -20 }}
                  animate={howInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  style={{ display: "flex", gap: 20 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={howInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ type: "spring", stiffness: 400, delay: 0.3 + i * 0.1 }}
                    style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: "var(--primary-dim)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 14, color: "var(--primary-hover)",
                      flexShrink: 0, fontFamily: "monospace",
                    }}
                  >{step.n}</motion.div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{step.title}</h3>
                    <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — demo card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={howInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -4, boxShadow: "0 24px 64px rgba(99,102,241,0.15)" }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "28px",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
              <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 6 }}>chat.picklenickai.com</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={howInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.6 }}
                style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text-2)", border: "1px solid var(--border-subtle)" }}
              >
                Write me a WALT, TIB and WILF for Year 4 Science — Energy transfers
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={howInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.7 }}
                style={{ padding: "12px 16px", background: "var(--primary-dim)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text)" }}
              >
                <p style={{ marginBottom: 8, fontWeight: 600 }}>Here&apos;s what I&apos;ll create for you:</p>
                <p style={{ color: "var(--text-2)" }}><span style={{ color: "var(--primary-hover)", fontWeight: 600 }}>WALT:</span> Investigate how energy transfers through different forms...</p>
                <p style={{ color: "var(--text-2)", marginTop: 4 }}><span style={{ color: "var(--primary-hover)", fontWeight: 600 }}>TIB:</span> Understanding energy helps us explain everyday phenomena...</p>
                <p style={{ color: "var(--text-2)", marginTop: 4 }}><span style={{ color: "var(--primary-hover)", fontWeight: 600 }}>WILF:</span> Check boxes for explain 3 energy transfers, use scientific language...</p>
              </motion.div>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              {["Save", "Copy", "Export PDF"].map((label, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={howInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 + i * 0.06 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: "6px 12px",
                    background: i === 2 ? "var(--primary-dim)" : "var(--surface-2)",
                    border: `1px solid ${i === 2 ? "rgba(99,102,241,0.2)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    color: i === 2 ? "var(--primary-hover)" : "var(--text-2)",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Testimonials ───────────────────────────────────────────── */}
      <section
        ref={testimonialsRef}
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "100px 24px",
          background: "var(--surface)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 48 }}
          >
            Australian teachers love it
          </motion.h2>
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

      {/* ─── Pricing ────────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{ padding: "100px 24px", textAlign: "center" }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 12 }}
          >
            Simple pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 32 }}
          >
            One plan. Everything included. No seat limits, no feature gates.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
            style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "40px 64px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--primary)", marginBottom: 8 }}>
              Pro Plan
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.04em" }}>$19</span>
              <span style={{ fontSize: 16, color: "var(--text-3)", fontWeight: 500 }}>/month</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>billed monthly, per teacher</div>
            {[
              "Unlimited lesson plans",
              "Unlimited rubrics & assessments",
              "Writing feedback & auto-marking",
              "Worksheet generator",
              "Behaviour support plans",
              "AC9-aligned, always current",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {item}
              </div>
            ))}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ marginTop: 16 }}>
              <Link
                href="/picklenickai"
                style={{
                  padding: "14px 32px",
                  background: "var(--primary)",
                  color: "#fff", borderRadius: "var(--radius)",
                  fontWeight: 700, fontSize: 15,
                  display: "inline-block",
                  boxShadow: "0 0 32px rgba(99,102,241,0.35)",
                  textDecoration: "none",
                }}
              >
                Start 14-Day Free Trial
              </Link>
            </motion.div>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>No credit card required · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "40px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 11, color: "#fff",
            }}>PN</div>
            <span style={{ fontWeight: 800, fontSize: 14 }}>PickleNickAI</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(link => (
              <span key={link} style={{ fontSize: 13, color: "var(--text-3)" }}>{link}</span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>© 2026 PickleNickAI. Built for Australian teachers.</p>
        </div>
      </footer>
    </div>
  );
}
