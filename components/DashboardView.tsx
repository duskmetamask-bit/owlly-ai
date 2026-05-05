"use client";

import { useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef } from "react";

interface DashboardProps { onNavigate?: (tab: string) => void; }
type ActivityType = "chat" | "lesson" | "export" | "rubric" | "worksheet" | "feedback" | "diff" | "writing";
interface ActivityItem { action: string; detail: string; time: string; type: ActivityType; }
interface SkillUsage { name: string; uses: number; max: number; color: string; }
interface QuickAction { label: string; icon: React.ReactNode; tab: string; primary?: boolean; }

const STATS = [
  { label: "Total Sessions", value: "127", icon: <IconChat />, color: "#6366f1" },
  { label: "Lessons Generated", value: "43", icon: <IconLesson />, color: "#22d3ee" },
  { label: "Files Exported", value: "89", icon: <IconExport />, color: "#34d399" },
  { label: "Help Requests", value: "28", icon: <IconHelp />, color: "#f59e0b" },
];

const ACTIVITY: ActivityItem[] = [
  { action: "Lesson plan generated", detail: "Year 4 History — British Colonisation", time: "2 min ago", type: "lesson" },
  { action: "PDF exported", detail: "Science Assessment Rubric", time: "14 min ago", type: "export" },
  { action: "Chat session", detail: "28 min — behaviour support query", time: "41 min ago", type: "chat" },
  { action: "Rubric created", detail: "Year 2 Mathematics — Geometry", time: "1 hr ago", type: "rubric" },
  { action: "Worksheet generated", detail: "Year 5 English — Persuasive Text", time: "2 hr ago", type: "worksheet" },
  { action: "Feedback report", detail: "Year 3 Writing — Narrative", time: "3 hr ago", type: "feedback" },
  { action: "Differentiation plan", detail: "Year 1 Maths — Number Sense", time: "5 hr ago", type: "diff" },
];

const SKILLS: SkillUsage[] = [
  { name: "Lesson Planning", uses: 38, max: 38, color: "#6366f1" },
  { name: "Assessment Design", uses: 27, max: 38, color: "#22d3ee" },
  { name: "Differentiation Engine", uses: 19, max: 38, color: "#34d399" },
  { name: "Feedback Reports", uses: 14, max: 38, color: "#f59e0b" },
];

const QUICK_ACTIONS: QuickAction[] = [
  { label: "New Chat", icon: <IconChat />, tab: "chat", primary: true },
  { label: "Lesson Plan", icon: <IconLesson />, tab: "planner" },
  { label: "Upload Image", icon: <IconImage />, tab: "chat" },
  { label: "Help", icon: <IconHelp />, tab: "profile" },
];

function IconChat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconLesson() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconImage() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
    </svg>
  );
}

function getDateLabel(): string {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date();
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

// ─── Count-up animation hook ──────────────────────────────────────
function useCountUp(target: number, { start = 0, duration = 1.2, delay = 0 }: { start?: number; duration?: number; delay?: number }) {
  const motionVal = useMotionValue(start);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(start);

  useTransform(motionVal, (v) => Math.round(v));

  if (isInView) {
    const ctrl = animate(motionVal, target, { duration, delay, ease: [0.25, 0.1, 0.25, 1] });
    motionVal.on("change", (v) => setDisplay(Math.round(v)));
    return { ref, value: display };
  }

  return { ref, value: start };
}

// ─── Animated counter with true count-up ──────────────────────────
function AnimatedCounter({ target, delay = 0 }: { target: number; delay?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useTransform(rounded, (v) => setDisplay(v));

  if (isInView) {
    animate(count, target, { duration: 1.4, delay, ease: [0.25, 0.1, 0.25, 1] });
  }

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
    >
      {display}
    </motion.span>
  );
}

function ActivityBadge({ type }: { type: ActivityType }) {
  const map: Record<ActivityType, { label: string; bg: string; color: string }> = {
    chat:      { label: "Chat",           bg: "rgba(99,102,241,0.10)", color: "#6366f1" },
    lesson:    { label: "Lesson",         bg: "rgba(34,211,238,0.10)",  color: "#22d3ee" },
    export:    { label: "Export",         bg: "rgba(52,211,153,0.10)",  color: "#34d399" },
    rubric:    { label: "Rubric",         bg: "rgba(99,102,241,0.10)",  color: "#6366f1" },
    worksheet: { label: "Worksheet",      bg: "rgba(245,158,11,0.10)",  color: "#f59e0b" },
    feedback:  { label: "Feedback",       bg: "rgba(99,102,241,0.10)",  color: "#6366f1" },
    diff:      { label: "Differentiation",bg: "rgba(34,211,238,0.10)",  color: "#22d3ee" },
    writing:   { label: "Writing",        bg: "rgba(245,158,11,0.10)",  color: "#f59e0b" },
  };
  const s = map[type] || map.chat;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "2px 7px", borderRadius: 9999,
        background: s.bg, color: s.color,
        fontSize: 9, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}
    >
      {s.label}
    </motion.span>
  );
}

// ─── Animated progress bar ─────────────────────────────────────────
function AnimatedProgressBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      style={{ height: 5, background: "var(--border-subtle)", borderRadius: 9999, overflow: "hidden" }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ height: "100%", background: color, borderRadius: 9999 }}
      />
    </motion.div>
  );
}

// ─── Beautiful Empty State ─────────────────────────────────────────
function EmptyState() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "var(--surface)",
        border: "1px dashed var(--border-subtle)",
        borderRadius: 16,
        textAlign: "center",
        gap: 12,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
        style={{ color: "var(--text-3)", opacity: 0.5 }}
      >
        <IconEmpty />
      </motion.div>
      <div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}
        >
          No activity yet
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.28 }}
          style={{ fontSize: 12, color: "var(--text-3)" }}
        >
          Start a chat or generate your first lesson plan<br />to see your activity here.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.36 }}
        style={{ display: "flex", gap: 8, marginTop: 4 }}
      >
        {["Lesson Planning", "Chat", "Rubrics"].map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 + i * 0.06 }}
            style={{
              padding: "3px 10px",
              borderRadius: 9999,
              background: "rgba(99,102,241,0.08)",
              color: "#6366f1",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────
function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 14,
        padding: "1rem 1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {stat.label}
        </span>
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          style={{ color: stat.color, opacity: 0.85 }}
        >
          {stat.icon}
        </motion.div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em", color: stat.color }}>
        <AnimatedCounter target={parseInt(stat.value)} delay={index * 0.1 + 0.15} />
      </div>
    </motion.div>
  );
}

// ─── Timeline entry with connecting line ───────────────────────────
function ActivityRow({ item, index, isLast }: { item: ActivityItem; index: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ display: "flex", gap: 12, position: "relative" }}
    >
      {/* Timeline dot + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 3 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: index * 0.08 + 0.1, type: "spring", stiffness: 400, damping: 20 }}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--border-subtle)",
            border: "2px solid var(--surface)",
            boxShadow: "0 0 0 2px var(--border-subtle)",
          }}
        />
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ delay: index * 0.08 + 0.2, duration: 0.3, ease: "easeOut" }}
            style={{
              width: 1.5,
              flex: 1,
              minHeight: 24,
              background: "var(--border-subtle)",
              transformOrigin: "top",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: isLast ? 0 : 14, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ActivityBadge type={item.type} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{item.action}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-2)" }}>{item.detail}</span>
          <motion.span
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            style={{ fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap", marginLeft: 8 }}
          >
            {item.time}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function DashboardView({ onNavigate }: DashboardProps) {
  const navigate = (tab: string) => { if (onNavigate) onNavigate(tab); };
  const hasActivity = ACTIVITY.length > 0;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const skillVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ marginBottom: 22 }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 3, color: "var(--text)" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>
          {getDateLabel()}
        </p>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Popular Skills */}
          <Section delay={0.05}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 14,
              padding: "1.2rem",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  style={{ display: "inline-flex" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </motion.span>
                Most Used Skills
              </div>
              <motion.div
                variants={skillVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {SKILLS.map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.35, delay: i * 0.1 } }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{skill.name}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>
                        {skill.uses}<span style={{ opacity: 0.5 }}>/{skill.max}</span>
                      </span>
                    </div>
                    <AnimatedProgressBar pct={(skill.uses / skill.max) * 100} color={skill.color} delay={i * 0.1 + 0.1} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Section>

          {/* Recent Activity */}
          <Section delay={0.12}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 14,
              padding: "1.2rem",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 16, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  style={{ display: "inline-flex" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </motion.span>
                Recent Activity
              </div>

              {!hasActivity ? (
                <EmptyState />
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {ACTIVITY.map((item, i) => (
                    <ActivityRow key={i} item={item} index={i} isLast={i === ACTIVITY.length - 1} />
                  ))}
                </motion.div>
              )}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick Actions */}
          <Section delay={0.08}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 14,
              padding: "1.1rem",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
                Quick Actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {QUICK_ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.label}
                    onClick={() => navigate(action.tab)}
                    variants={{
                      hidden: { opacity: 0, x: 14 },
                      visible: { opacity: 1, x: 0, transition: { delay: i * 0.07, type: "spring", stiffness: 400, damping: 30 } }
                    }}
                    whileHover={{ scale: 1.03, x: 3, boxShadow: action.primary ? "0 6px 20px rgba(99,102,241,0.3)" : "0 4px 12px rgba(0,0,0,0.06)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "10px 13px",
                      background: action.primary ? "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" : "transparent",
                      color: action.primary ? "#fff" : "var(--text)",
                      border: action.primary ? "none" : "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      fontSize: 12, fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: action.primary ? "0 4px 18px rgba(99,102,241,0.28)" : "none",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ opacity: action.primary ? 1 : 0.7 }}>{action.icon}</span>
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </Section>

          {/* Getting Started Card */}
          <Section delay={0.15}>
            <motion.div
              whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(99,102,241,0.12)" }}
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(34,211,238,0.05) 100%)",
                border: "1px solid rgba(99,102,241,0.14)",
                borderRadius: 14,
                padding: "1.2rem",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  style={{ display: "inline-flex", color: "#6366f1" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </motion.span>
                Getting Started
              </div>
              <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 14 }}>
                Start a chat and ask me anything about lesson planning, behaviour support, assessment design, or AC9 curriculum alignment.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  "Try: 'Generate a Year 3 Maths lesson on Fractions'",
                  "Try: 'Create a behaviour support plan template'",
                  "Try: 'Build a rubric for Year 5 Persuasive Writing'",
                ].map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.3 }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 7 }}
                  >
                    <span style={{ color: "#6366f1", fontSize: 10, marginTop: 1.5, flexShrink: 0 }}>
                      <IconCheck />
                    </span>
                    <span style={{ fontSize: 10.5, color: "var(--text-3)", lineHeight: 1.55 }}>{tip}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Section>
        </div>
      </div>
    </div>
  );
}
