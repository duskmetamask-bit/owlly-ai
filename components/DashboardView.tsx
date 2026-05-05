"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

interface DashboardProps { onNavigate?: (tab: string) => void; }
type ActivityType = "chat" | "lesson" | "export" | "rubric" | "worksheet" | "feedback" | "diff" | "writing";
interface ActivityItem { action: string; detail: string; time: string; type: ActivityType; }
interface SkillUsage { name: string; uses: number; max: number; color: string; }
interface QuickAction { label: string; icon: React.ReactNode; tab: string; primary?: boolean; }

// ─── Sample Data ────────────────────────────────────────────────
const STATS = [
  { label: "Total Sessions", value: 127, icon: "💬", color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)" },
  { label: "Lessons Generated", value: 43, icon: "📅", color: "#22d3ee", gradient: "linear-gradient(135deg, #22d3ee 0%, #67e8f9 100%)" },
  { label: "Files Exported", value: 89, icon: "📤", color: "#34d399", gradient: "linear-gradient(135deg, #34d399 0%, #6ee7b7 100%)" },
  { label: "Help Requests", value: 28, icon: "❓", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)" },
];

const ACTIVITY: ActivityItem[] = [
  { action: "Lesson plan generated", detail: "Year 4 History — British Colonisation", time: "2 min ago", type: "lesson" },
  { action: "PDF exported", detail: "Science Assessment Rubric", time: "14 min ago", type: "export" },
  { action: "Chat session", detail: "28 min — behaviour support query", time: "41 min ago", type: "chat" },
  { action: "Rubric created", detail: "Year 2 Mathematics — Geometry", time: "1 hr ago", type: "rubric" },
  { action: "Worksheet generated", detail: "Year 5 English — Persuasive Text", time: "2 hr ago", type: "worksheet" },
  { action: "Feedback report", detail: "Year 3 Writing — Narrative", time: "3 hr ago", type: "feedback" },
];

const SKILLS: SkillUsage[] = [
  { name: "Lesson Planning", uses: 38, max: 38, color: "#6366f1" },
  { name: "Assessment Design", uses: 27, max: 38, color: "#22d3ee" },
  { name: "Differentiation Engine", uses: 19, max: 38, color: "#34d399" },
  { name: "Feedback Reports", uses: 14, max: 38, color: "#f59e0b" },
];

const QUICK_ACTIONS: QuickAction[] = [
  { label: "New Chat", icon: "💬", tab: "chat", primary: true },
  { label: "Lesson Plan", icon: "📅", tab: "planner" },
  { label: "Upload Image", icon: "🖼", tab: "chat" },
  { label: "Help", icon: "❓", tab: "profile" },
];

const BADGE_MAP: Record<ActivityType, { label: string; bg: string; color: string }> = {
  chat:      { label: "Chat",           bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
  lesson:    { label: "Lesson",         bg: "rgba(34,211,238,0.15)",  color: "#22d3ee" },
  export:    { label: "Export",         bg: "rgba(52,211,153,0.15)",  color: "#34d399" },
  rubric:    { label: "Rubric",         bg: "rgba(99,102,241,0.15)",  color: "#818cf8" },
  worksheet: { label: "Worksheet",      bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  feedback:  { label: "Feedback",       bg: "rgba(99,102,241,0.15)",  color: "#818cf8" },
  diff:      { label: "Differentiation",bg: "rgba(34,211,238,0.15)",  color: "#22d3ee" },
  writing:   { label: "Writing",        bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
};

function getDateLabel(): string {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date();
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

function AnimatedCounter({ target, delay = 0 }: { target: number; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration: 1.4, delay, ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, target, delay]);

  return <motion.span ref={ref} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}>{count}</motion.span>;
}

function ProgressBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 9999, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ height: "100%", background: color, borderRadius: 9999, boxShadow: `0 0 8px ${color}60` }}
      />
    </div>
  );
}

function Badge({ type }: { type: ActivityType }) {
  const s = BADGE_MAP[type] || BADGE_MAP.chat;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 9999, background: s.bg, color: s.color, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", border: `1px solid ${s.color}20` }}>
      {s.label}
    </span>
  );
}

function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, ...style }}>{children}</div>;
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 18 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay, duration: 0.42, ease: [0.25, 0.1, 0.25, 1] }}>{children}</motion.div>;
}

// ─── Main Component ──────────────────────────────────────────────
export default function DashboardView({ onNavigate }: DashboardProps) {
  const navigate = (tab: string) => { if (onNavigate) onNavigate(tab); };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto", minHeight: "100vh", background: "linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0d0d14 100%)" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 24 }}>
        <GlassCard style={{ padding: "1.4rem 1.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, color: "rgba(255,255,255,0.95)" }}>Welcome back</h1>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 9999, background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(34,211,238,0.2) 100%)", border: "1px solid rgba(99,102,241,0.35)", color: "#a78bfa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", boxShadow: "0 0 15px rgba(99,102,241,0.2)" }}>
                  ★ Pro Plan
                </span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>{getDateLabel()}</p>
            </div>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} style={{ position: "relative", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              🔔
              <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)", border: "1.5px solid #0a0a0f" }}/>
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={{ y: -4, boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${stat.color}15` }}
            style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.1rem 1.2rem", display: "flex", flexDirection: "column", gap: 8, cursor: "default", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: stat.gradient, borderRadius: "16px 16px 0 0" }}/>
            <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${stat.color}15 0%, transparent 70%)`, pointerEvents: "none" }}/>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</span>
              <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }} style={{ color: stat.color, opacity: 0.9, background: `${stat.color}15`, padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                {stat.icon}
              </motion.div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}>
              <AnimatedCounter target={stat.value} delay={i * 0.1 + 0.15} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Skills */}
          <FadeIn delay={0.05}>
            <GlassCard style={{ padding: "1.3rem" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 18, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 8 }}>
                ⭐ Most Used Skills
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {SKILLS.map((skill, i) => (
                  <motion.div key={skill.name} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{skill.name}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{skill.uses}<span style={{ opacity: 0.4 }}>/{skill.max}</span></span>
                    </div>
                    <ProgressBar pct={(skill.uses / skill.max) * 100} color={skill.color} delay={i * 0.1 + 0.1} />
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Activity */}
          <FadeIn delay={0.12}>
            <GlassCard style={{ padding: "1.3rem" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 18, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 8 }}>
                🕐 Recent Activity
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {ACTIVITY.map((item, i) => {
                  const ref = useRef<HTMLDivElement>(null);
                  const isInView = useInView(ref, { once: true, margin: "-20px" });
                  return (
                    <motion.div ref={ref} key={i} initial={{ opacity: 0, x: -16 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: i * 0.08, duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }} style={{ display: "flex", gap: 12, position: "relative" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 3 }}>
                        <motion.div initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : { scale: 0 }} transition={{ delay: i * 0.08 + 0.1, type: "spring", stiffness: 400, damping: 20 }} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(99,102,241,0.6)", border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 0 10px rgba(99,102,241,0.4)" }}/>
                        {i < ACTIVITY.length - 1 && <div style={{ width: 1.5, flex: 1, minHeight: 24, background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)" }}/>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: i < ACTIVITY.length - 1 ? 14 : 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Badge type={item.type} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{item.action}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{item.detail}</span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", marginLeft: 8 }}>{item.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </FadeIn>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick Actions */}
          <FadeIn delay={0.08}>
            <GlassCard style={{ padding: "1.2rem" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, color: "rgba(255,255,255,0.9)" }}>Quick Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {QUICK_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.label}
                    onClick={() => navigate(action.tab)}
                    initial={{ opacity: 0, x: 14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 400, damping: 30 }}
                    whileHover={{ scale: 1.03, x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                      background: action.primary ? "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.15) 100%)" : "rgba(255,255,255,0.03)",
                      color: action.primary ? "#c7d2fe" : "rgba(255,255,255,0.75)",
                      border: action.primary ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
                      boxShadow: action.primary ? "0 4px 20px rgba(99,102,241,0.15)" : "none",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{action.icon}</span>
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Getting Started */}
          <FadeIn delay={0.15}>
            <motion.div
              whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(99,102,241,0.15)" }}
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(34,211,238,0.06) 100%)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "1.3rem", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }}/>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 7, position: "relative", zIndex: 1 }}>
                💡 Getting Started
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 14, position: "relative", zIndex: 1 }}>
                Start a chat and ask me anything about lesson planning, behaviour support, assessment design, or AC9 curriculum alignment.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
                {[
                  "Try: 'Generate a Year 3 Maths lesson on Fractions'",
                  "Try: 'Create a behaviour support plan template'",
                  "Try: 'Build a rubric for Year 5 Persuasive Writing'",
                ].map((tip, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.2, duration: 0.3 }} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#6366f1", fontSize: 10, marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{tip}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
