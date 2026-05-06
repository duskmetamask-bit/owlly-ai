"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandOwlLogo } from "./BrandOwlLogo";

const NAV_LINKS = [
  { label: "Products", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Support", href: "#support" },
];

const FEATURE_CARDS = [
  {
    title: "AI Chat",
    tag: "Core",
    text: "Ask anything — lesson plans, feedback, admin, differentiation, parent comms. Fast, curriculum-aware answers.",
    accent: "#f59e0b",
  },
  {
    title: "Curriculum Library",
    tag: "Library",
    text: "Browse ready-to-use resources, units, and lesson sequences organized by year level and topic.",
    accent: "#10b981",
  },
  {
    title: "Auto-Mark",
    tag: "AI",
    text: "Upload work and rubrics to generate criterion-by-criterion feedback in seconds.",
    accent: "#fbbf24",
  },
  {
    title: "Lesson Planner",
    tag: "Popular",
    text: "Build full lesson plans with objectives, success criteria, differentiation, and timing.",
    accent: "#a3e635",
  },
  {
    title: "Rubric Builder",
    tag: "New",
    text: "Create clean assessment rubrics with levels, descriptors, and printable outputs.",
    accent: "#34d399",
  },
  {
    title: "Curriculum Guide",
    tag: "AC9",
    text: "Search the curriculum by subject and year level so nothing important gets missed.",
    accent: "#60a5fa",
  },
];

const HOW_STEPS = [
  {
    n: "01",
    title: "Tell us about your classroom",
    text: "Pick year levels, subjects, and what you need to get done. Owlly learns the context immediately.",
  },
  {
    n: "02",
    title: "Chat with your assistant",
    text: "Ask for lesson plans, rubrics, marking help, or admin support — all in one place.",
  },
  {
    n: "03",
    title: "Get it done instantly",
    text: "Copy, export, refine, or save to your library. No clutter. No waiting.",
  },
];

const TESTIMONIALS = [
  {
    quote: "I used to burn hours on planning. Owlly gives me back my evenings.",
    name: "Rachel T.",
    role: "Year 3 Teacher, WA",
  },
  {
    quote: "Finally an AI tool that actually understands teaching workflows.",
    name: "Marcus L.",
    role: "HASS Coordinator, NSW",
  },
  {
    quote: "It feels like a calm assistant, not another piece of software.",
    name: "Sofia M.",
    role: "Year 5 Teacher, QLD",
  },
];

function GlowOrb({
  size,
  x,
  y,
  color,
  blur = 80,
  opacity = 0.25,
}: {
  size: number;
  x: string;
  y: string;
  color: string;
  blur?: number;
  opacity?: number;
}) {
  return (
    <motion.div
      aria-hidden
      animate={{ y: [0, -18, 0], scale: [1, 1.03, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: 9999,
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 14px",
          borderRadius: 9999,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.82)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 9999,
            background: "linear-gradient(135deg, #f59e0b, #10b981)",
            boxShadow: "0 0 18px rgba(245,158,11,0.5)",
          }}
        />
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1.03,
          marginBottom: 14,
        }}
      >
        {title}
      </h2>
      <p style={{ color: "rgba(226,232,240,0.72)", fontSize: 17, lineHeight: 1.7 }}>
        {subtitle}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  tag,
  text,
  accent,
}: {
  title: string;
  tag: string;
  text: string;
  accent: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "relative",
        borderRadius: 28,
        padding: 28,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 140,
          height: 140,
          borderRadius: 9999,
          background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: `${accent}15`,
            border: `1px solid ${accent}30`,
            display: "grid",
            placeItems: "center",
            color: accent,
            boxShadow: `0 0 0 1px ${accent}10 inset`,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700 }}>
            {tag}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 }}>
            {title}
          </h3>
        </div>
      </div>
      <p style={{ color: "rgba(226,232,240,0.75)", lineHeight: 1.7, fontSize: 15 }}>
        {text}
      </p>
    </motion.article>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        minWidth: 120,
        padding: "14px 18px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: 12, color: "rgba(226,232,240,0.6)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div
      id="product"
      style={{
        position: "relative",
        borderRadius: 34,
        padding: 14,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.16), transparent 30%), radial-gradient(circle at 85% 15%, rgba(16,185,129,0.14), transparent 25%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          borderRadius: 28,
          background: "rgba(8,13,24,0.86)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <BrandOwlLogo size={30} />
            </div>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Owlly</div>
              <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)" }}>Teacher workspace</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            <span style={{ padding: "7px 12px", borderRadius: 9999, background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.18)" }}>Products</span>
            <span style={{ padding: "7px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.04)" }}>Features</span>
            <span style={{ padding: "7px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.04)" }}>Pricing</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9999, background: "linear-gradient(135deg, #f59e0b, #10b981)" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Teacher account</div>
              <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)" }}>Active now</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: 660 }}>
          <aside
            style={{
              padding: 22,
              borderRight: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.025)",
            }}
          >
            <div style={{ marginBottom: 18, color: "rgba(226,232,240,0.55)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
              Workspace
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                ["Dashboard", true],
                ["Lesson Plans", false],
                ["Curriculum Guide", false],
                ["Auto-Mark", false],
                ["Rubrics", false],
                ["Learning Paths", false],
                ["Analytics", false],
              ].map(([label, active]) => (
                <div
                  key={String(label)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 16,
                    background: active ? "linear-gradient(135deg, rgba(245,158,11,0.16), rgba(16,185,129,0.12))" : "transparent",
                    border: active ? "1px solid rgba(245,158,11,0.18)" : "1px solid transparent",
                    color: active ? "#fff" : "rgba(226,232,240,0.72)",
                    fontWeight: active ? 700 : 600,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{label}</span>
                  {active ? <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#10b981", boxShadow: "0 0 14px rgba(16,185,129,0.75)" }} /> : null}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 22, padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(226,232,240,0.55)", fontWeight: 700, marginBottom: 10 }}>Today</div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 6 }}>3h 42m</div>
              <div style={{ color: "rgba(226,232,240,0.68)", lineHeight: 1.6, fontSize: 14 }}>
                Saved from lesson planning, marking, and admin work.
              </div>
            </div>
          </aside>

          <main style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: "rgba(226,232,240,0.55)", marginBottom: 6 }}>Teacher Profiles &gt; Overview</div>
                <h3 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em" }}>Class Overview</h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Dusk</div>
                  <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)" }}>dusk@owlly.ai</div>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 9999, background: "linear-gradient(135deg, #f59e0b, #10b981)" }} />
              </div>
            </div>

            <div
              style={{
                borderRadius: 28,
                padding: 22,
                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 24,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <BrandOwlLogo size={54} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 6 }}>
                      Lesson profile
                    </div>
                    <h4 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 6 }}>Year 4 Science — Energy Transfer</h4>
                    <div style={{ color: "rgba(226,232,240,0.72)", fontSize: 15 }}>
                      AC9 aligned • 6 lessons • 2 differentiation pathways • ready to export
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    ["Project Completion", "89%"],
                    ["Task Efficiency", "64%"],
                    ["Student Engagement", "53%"],
                    ["Admin Reduction", "29%"],
                  ].map(([label, value]) => (
                    <StatPill key={label} label={label} value={value} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }}>
              <div style={{ borderRadius: 26, padding: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h5 style={{ fontSize: 16, fontWeight: 800 }}>Generated lesson preview</h5>
                  <div style={{ display: "inline-flex", gap: 8 }}>
                    <span style={{ padding: "6px 10px", borderRadius: 9999, background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.18)", color: "#fde68a", fontSize: 12, fontWeight: 700 }}>WALT</span>
                    <span style={{ padding: "6px 10px", borderRadius: 9999, background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.18)", color: "#bbf7d0", fontSize: 12, fontWeight: 700 }}>WILF</span>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                  {[
                    ["WALT", "Investigate how energy transfers through different forms"],
                    ["TIB", "Understanding energy helps us explain everyday phenomena around us"],
                    ["WILF", "Identify 3 energy transfers and use scientific language"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: 16, borderRadius: 18, background: "rgba(8,13,24,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)", fontWeight: 800, marginBottom: 6 }}>{k}</div>
                      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderRadius: 26, padding: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h5 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Performance snapshot</h5>
                <div style={{ display: "grid", gap: 14 }}>
                  {[
                    ["Planning time", "↓ 71%"],
                    ["Marking speed", "↑ 54%"],
                    ["Curriculum fit", "96%"],
                    ["Parent comms", "Auto-drafted"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 18, background: "rgba(8,13,24,0.75)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ color: "rgba(226,232,240,0.72)", fontSize: 14 }}>{k}</span>
                      <strong style={{ fontSize: 14 }}>{v}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 18, padding: 16, borderRadius: 18, background: "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(16,185,129,0.12))", border: "1px solid rgba(245,158,11,0.16)" }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.65)", fontWeight: 800, marginBottom: 8 }}>Current goal</div>
                  <div style={{ lineHeight: 1.6, color: "rgba(255,255,255,0.92)" }}>
                    Finish your week with every lesson plan drafted and every rubric ready.
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.12), transparent 24%), radial-gradient(circle at 82% 15%, rgba(16,185,129,0.12), transparent 20%), linear-gradient(180deg, #020617 0%, #07111d 55%, #030712 100%)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 20%, black 0%, rgba(0,0,0,0.8) 55%, transparent 85%)",
          pointerEvents: "none",
          opacity: 0.35,
        }}
      />

      <GlowOrb size={540} x="-10%" y="-6%" color="rgba(245,158,11,0.18)" blur={100} opacity={0.4} />
      <GlowOrb size={480} x="72%" y="-2%" color="rgba(16,185,129,0.18)" blur={110} opacity={0.4} />
      <GlowOrb size={380} x="18%" y="68%" color="rgba(14,165,233,0.16)" blur={120} opacity={0.25} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1380, margin: "0 auto", padding: "20px 22px 80px" }}>
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            position: "sticky",
            top: 18,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            padding: "14px 18px",
            borderRadius: 24,
            background: "rgba(6, 11, 20, 0.62)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#fff" }}>
            <BrandOwlLogo size={52} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.03em" }}>Owlly</div>
              <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)" }}>Teacher's AI assistant</div>
            </div>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap", justifyContent: "center" }}>
            {NAV_LINKS.map((item) => (
              <a key={item.label} href={item.href} style={{ color: "rgba(226,232,240,0.76)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            href="/owlly"
            style={{
              textDecoration: "none",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              padding: "12px 18px",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #f59e0b, #10b981)",
              boxShadow: "0 12px 30px rgba(245,158,11,0.18)",
              whiteSpace: "nowrap",
            }}
          >
            Get Started
          </Link>
        </motion.header>

        <section style={{ padding: "92px 0 34px", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ maxWidth: 960, margin: "0 auto" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(226,232,240,0.88)",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 26,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: "linear-gradient(135deg, #f59e0b, #10b981)", boxShadow: "0 0 18px rgba(16,185,129,0.55)" }} />
              Built for Australian teachers who want their time back
            </div>

            <h1
              style={{
                fontSize: "clamp(3rem, 8vw, 6.6rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.07em",
                fontWeight: 950,
                marginBottom: 24,
              }}
            >
              <span style={{ background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 35%, #10b981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Unlock Every Teacher's
              </span>
              <br />
              <span style={{ color: "#fff" }}>Full Potential.</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.75, color: "rgba(226,232,240,0.74)", maxWidth: 760, margin: "0 auto 34px" }}>
              Cut admin. Build lessons faster. Mark with confidence. Owlly keeps the busy work out of the way so teachers can focus on teaching.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="#product"
                style={{
                  padding: "14px 24px",
                  borderRadius: 9999,
                  background: "linear-gradient(135deg, #f59e0b, #10b981)",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 800,
                  boxShadow: "0 18px 50px rgba(245,158,11,0.22)",
                }}
              >
                Request a Demo
              </Link>
              <Link
                href="#features"
                style={{
                  padding: "14px 24px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.92)",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                See how it works
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 32, flexWrap: "wrap" }}>
              <div style={{ display: "flex" }}>
                {['TC', 'MR', 'SH', 'JK', 'AL'].map((initial, index) => (
                  <div
                    key={initial}
                    style={{
                      width: 34,
                      height: 34,
                      marginLeft: index === 0 ? 0 : -10,
                      borderRadius: 9999,
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid rgba(2,6,23,0.8)",
                      background: `linear-gradient(135deg, hsl(${index * 28 + 34} 85% 58%), hsl(${index * 26 + 150} 55% 44%))`,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div style={{ color: "rgba(226,232,240,0.72)", fontSize: 14 }}>
                <strong style={{ color: "#fff" }}>840+</strong> teachers onboarded and counting
              </div>
            </div>
          </motion.div>
        </section>

        <section style={{ padding: "28px 0 92px" }}>
          <DashboardMockup />
        </section>

        <section id="features" style={{ padding: "18px 0 96px" }}>
          <SectionTitle
            eyebrow="Powerful features"
            title="Everything a teacher needs in one calm workspace"
            subtitle="Built to feel premium, fast, and uncluttered — with every important tool one click away."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18, marginTop: 36 }}>
            {FEATURE_CARDS.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section id="support" style={{ padding: "10px 0 100px" }}>
          <SectionTitle
            eyebrow="How it works"
            title="From question to result in under 60 seconds"
            subtitle="A simple flow that keeps teachers moving without adding friction."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18, marginTop: 36 }}>
            {HOW_STEPS.map((step) => (
              <motion.div
                key={step.n}
                whileHover={{ y: -4 }}
                style={{
                  borderRadius: 28,
                  padding: 26,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.24)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 18, display: "grid", placeItems: "center", background: "linear-gradient(135deg, #f59e0b, #10b981)", color: "#fff", fontWeight: 900, fontSize: 15, boxShadow: "0 0 28px rgba(16,185,129,0.18)" }}>
                    {step.n}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 850, letterSpacing: "-0.02em" }}>{step.title}</h3>
                </div>
                <p style={{ color: "rgba(226,232,240,0.74)", lineHeight: 1.7 }}>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="pricing" style={{ padding: "10px 0 96px" }}>
          <SectionTitle
            eyebrow="Simple pricing"
            title="One plan. Everything included."
            subtitle="No seat limits, no feature gates, no hidden weirdness — just a clear path to getting work done."
          />

          <div style={{ marginTop: 34, display: "grid", placeItems: "center" }}>
            <div style={{ maxWidth: 760, width: "100%", borderRadius: 34, padding: 28, background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 90px rgba(0,0,0,0.35)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                <div style={{ fontSize: 54, fontWeight: 950, letterSpacing: "-0.06em" }}>Pro</div>
                <div style={{ fontSize: 16, color: "rgba(226,232,240,0.72)" }}>Everything teachers need to plan, mark, and automate</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, marginBottom: 20 }}>
                {[
                  "Unlimited lesson plans",
                  "Unlimited rubrics & assessments",
                  "Writing feedback & auto-marking",
                  "AC9-aligned curriculum support",
                ].map((item) => (
                  <div key={item} style={{ padding: 14, borderRadius: 18, background: "rgba(8,13,24,0.75)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)" }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 13, color: "rgba(226,232,240,0.6)", marginBottom: 4 }}>Starts at</div>
                  <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.04em" }}>$19 / month</div>
                </div>
                <Link href="/owlly" style={{ padding: "14px 22px", borderRadius: 9999, background: "linear-gradient(135deg, #f59e0b, #10b981)", color: "#fff", textDecoration: "none", fontWeight: 800 }}>
                  Start 14-Day Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "10px 0 80px" }}>
          <SectionTitle
            eyebrow="Australian teachers love it"
            title="Real impact without the chaos"
            subtitle="A premium feel, a calmer workflow, and faster outcomes for busy classrooms."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18, marginTop: 36 }}>
            {TESTIMONIALS.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                whileHover={{ y: -3 }}
                style={{ borderRadius: 28, padding: 26, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.88)", marginBottom: 18 }}>
                  “{testimonial.quote}”
                </p>
                <div style={{ fontWeight: 800 }}>{testimonial.name}</div>
                <div style={{ color: "rgba(226,232,240,0.6)", fontSize: 13 }}>{testimonial.role}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer
          style={{
            padding: "18px 0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BrandOwlLogo size={30} />
            <div>
              <div style={{ fontWeight: 900 }}>Owlly</div>
              <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)" }}>Built for Australian teachers</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, color: "rgba(226,232,240,0.7)", fontSize: 14, flexWrap: "wrap" }}>
            <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Features</a>
            <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
            <a href="#support" style={{ color: "inherit", textDecoration: "none" }}>Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
