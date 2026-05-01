"use client";

import { useState } from "react";

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

// ─── Mock data ──────────────────────────────────────────────────────
const STATS = [
  { label: "Total Sessions", value: "127", icon: "💬", color: "#6366f1" },
  { label: "Lessons Generated", value: "43", icon: "📋", color: "#22d3ee" },
  { label: "Files Exported", value: "89", icon: "📄", color: "#34d399" },
  { label: "Active Teachers", value: "12", icon: "👩‍🏫", color: "#f59e0b" },
];

const ACTIVITY = [
  { action: "Lesson plan generated", detail: "Year 4 History — British Colonisation", time: "2 min ago", type: "lesson" },
  { action: "PDF exported", detail: "Science Assessment Rubric", time: "14 min ago", type: "export" },
  { action: "Chat session", detail: "28 min — behaviour support query", time: "41 min ago", type: "chat" },
  { action: "Rubric created", detail: "Year 2 Mathematics — Geometry", time: "1 hr ago", type: "rubric" },
  { action: "Worksheet generated", detail: "Year 5 English — Persuasive Text", time: "2 hr ago", type: "worksheet" },
  { action: "Feedback report", detail: "Year 3 Writing — Narrative", time: "3 hr ago", type: "feedback" },
  { action: "Differentiation plan", detail: "Year 1 Maths — Number Sense", time: "5 hr ago", type: "diff" },
];

const POPULAR_SKILLS = [
  { name: "Lesson Planning", uses: 38, color: "#6366f1" },
  { name: "Assessment Design", uses: 27, color: "#22d3ee" },
  { name: "Differentiation Engine", uses: 19, color: "#34d399" },
  { name: "Feedback Reports", uses: 14, color: "#f59e0b" },
];

const QUICK_ACTIONS = [
  { label: "New Chat", icon: "💬", primary: true, tab: "chat" },
  { label: "Lesson Plan", icon: "📋", tab: "planner" },
  { label: "Export Last", icon: "📄", tab: "library" },
  { label: "Help", icon: "❓", tab: "profile" },
];

// ─── Icons ──────────────────────────────────────────────────────────
function IconChat() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconDoc() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IconCheck() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}

// ─── Activity type badge ────────────────────────────────────────────
function ActivityBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    lesson: { label: "Lesson", bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
    export: { label: "Export", bg: "rgba(34,211,238,0.1)", color: "#22d3ee" },
    chat: { label: "Chat", bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
    rubric: { label: "Rubric", bg: "rgba(52,211,153,0.1)", color: "#34d399" },
    worksheet: { label: "Worksheet", bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
    feedback: { label: "Feedback", bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
    diff: { label: "Differentiation", bg: "rgba(34,211,238,0.1)", color: "#22d3ee" },
  };
  const s = map[type] || map.chat;
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 9999,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {s.label}
    </span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({ stat }: { stat: typeof STATS[0] }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 16,
      padding: "1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      transition: "all 0.15s var(--ease)",
      cursor: "default",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {stat.label}
        </span>
        <span style={{ fontSize: 18 }}>{stat.icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: stat.color }}>
        {stat.value}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function DashboardView({ onNavigate }: DashboardProps) {
  const [animate, setAnimate] = useState(false);

  const navigate = (tab: string) => {
    if (onNavigate) onNavigate(tab);
  };

  return (
    <div style={{ padding: "28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>
          PickleNickAI overview — Friday, May 1 2026
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {STATS.map(stat => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Revenue tracker */}
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(34,211,238,0.06) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 16,
            padding: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  Monthly Recurring Revenue
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--primary)" }}>
                  $228
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                  12 teachers × $19/mo
                </div>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(99,102,241,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
            <div style={{
              display: "flex", gap: 8, alignItems: "center",
              padding: "10px 14px",
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              borderRadius: 10,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#34d399" }}>+2 new this week</span>
              <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>Target: 30 teachers</span>
            </div>
          </div>

          {/* Popular Skills */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: "1.5rem",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Popular Skills</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {POPULAR_SKILLS.map((skill, i) => (
                <div key={skill.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{skill.name}</span>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>{skill.uses} uses</span>
                  </div>
                  <div style={{ height: 6, background: "var(--border-subtle)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(skill.uses / 38) * 100}%`,
                      background: skill.color,
                      borderRadius: 9999,
                      transition: "width 0.5s var(--ease)",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick Actions */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: "1.25rem",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.tab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    background: action.primary ? "var(--primary)" : "var(--surface-2)",
                    color: action.primary ? "#fff" : "var(--text)",
                    border: action.primary ? "none" : "1px solid var(--border-subtle)",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s var(--ease)",
                    boxShadow: action.primary ? "0 0 12px rgba(99,102,241,0.25)" : "none",
                  }}
                  onMouseEnter={e => { if (!action.primary) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = action.primary ? "0 0 12px rgba(99,102,241,0.25)" : "none"; }}
                >
                  <span style={{ fontSize: 14 }}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 16,
            padding: "1.25rem",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Recent Activity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ACTIVITY.map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ActivityBadge type={item.type} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{item.action}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--text-2)" }}>{item.detail}</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}