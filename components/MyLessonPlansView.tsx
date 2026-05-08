"use client";
import { useState, useEffect } from "react";
import { useQuery, useConvex } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import LessonPlanDisplay from "@/components/LessonPlanDisplay";
import { downloadTxt, downloadPdf, downloadDOCX } from "@/components/exportUtils";
import DocumentViewerModal from "@/components/DocumentViewerModal";

interface LessonPlanItem {
  _id: string;
  title: string;
  content: string;
  yearLevel?: string;
  subject?: string;
  createdAt: number;
  type: string;
}

interface MyLessonPlansViewProps {
  teacherId?: string;
  type?: string;
  onOpenInChat?: (doc: { id: string; title: string; content: string; type: string }) => void;
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Science":                      { bg: "rgba(52,211,153,0.12)",   text: "#34d399", border: "rgba(52,211,153,0.3)" },
  "Australian Curriculum Science": { bg: "rgba(52,211,153,0.12)",   text: "#34d399", border: "rgba(52,211,153,0.3)" },
  "English":                      { bg: "rgba(167,139,250,0.12)",  text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
  "Mathematics":                   { bg: "rgba(34,211,238,0.12)",  text: "#22d3ee", border: "rgba(34,211,238,0.3)" },
  "HASS":                         { bg: "rgba(251,191,36,0.12)",   text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  "Technologies":                 { bg: "rgba(245,158,11,0.12)",   text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  "General":                      { bg: "rgba(148,163,184,0.12)",  text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
};

function getSubjectStyle(subject: string) {
  return SUBJECT_COLORS[subject] ?? { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" };
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((p, i) =>
    /escaped/i.test(p) ? <mark key={i} style={{ background: "rgba(251,191,36,0.25)", color: "#fbbf24", borderRadius: 3, padding: "0 2px" }}>{p}</mark> : p
  );
}

const SUBJECTS = ["All Subjects", "Science", "English", "Mathematics", "HASS", "Technologies", "General"];
const YEARS    = ["All Years", "F", "1", "2", "3", "4", "5", "6"];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default function MyLessonPlansView({ teacherId, onOpenInChat }: MyLessonPlansViewProps) {
  const convex = useConvex();
  const lessonPlans = useQuery(
    api.lessonHistory.query.listForTeacherByType,
    teacherId ? { teacherId: teacherId as Id<"teachers">, type: "lesson_plan" } : "skip"
  ) as (LessonPlanItem | null)[] | undefined;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "this_week" | "this_month">("all");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);

  const selected = lessonPlans?.find(p => p._id === selectedId);

  const filtered = lessonPlans
    ? lessonPlans.filter(p => {
        if (!p) return false;
        if (filter === "this_week") return p.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (filter === "this_month") return p.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (subject !== "All Subjects" && p.subject !== subject) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return p.title.toLowerCase().includes(q) || p.content.toLowerCase().slice(0, 200).includes(q);
        }
        return true;
      })
    : [];

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson plan?")) return;
    setDeleting(id);
    try {
      await convex.mutation("lessonHistory/deleteItem", { id });
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setDeleting(null);
    }
  }

  async function downloadPdf(content: string, title: string) {
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.addFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 50;
      const lineHeight = fontSize + 4;
      const pageWidth = 700;
      let y = 700;
      const titleFontSize = 18;
      const page = pdfDoc.addPage([700, 800]);

      // Title
      page.drawText(title, { x: margin, y, size: titleFontSize, font, color: rgb(0.1, 0.1, 0.1) });
      y -= titleFontSize + 8;
      page.drawText("─".repeat(80), { x: margin, y, size: fontSize, font, color: rgb(0.7, 0.7, 0.7) });
      y -= lineHeight;

      // Lines
      const lines = content.split("\n");
      for (const line of lines) {
        const words = line.split(" ");
        let row = "";
        for (const word of words) {
          const test = row ? row + " " + word : word;
          if (test.length > 90) {
            if (y < 60) { const np = pdfDoc.addPage([700, 800]); y = 770; }
            page.drawText(row, { x: margin, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
            y -= lineHeight;
            row = word;
          } else { row = test; }
        }
        if (row) {
          if (y < 60) { const np = pdfDoc.addPage([700, 800]); y = 770; }
          page.drawText(row, { x: margin, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
          y -= lineHeight;
        }
        if (y < 60) { const np = pdfDoc.addPage([700, 800]); y = 770; }
      }

      const buf = await pdfDoc.save();
      const blob = new Blob([buf.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert("PDF export failed: " + (e as Error).message); }
  }

  if (!teacherId) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>
        <p>Sign in to see your saved lesson plans.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .plan-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.35); }
        .filter-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .filter-btn.active { background: rgba(245,158,11,0.2) !important; color: #fbbf24 !important; border-color: rgba(245,158,11,0.4) !important; }
        .expand-btn:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(245,158,11,0.06) 0%, transparent 100%)",
        padding: "48px 40px 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, color: "#fff",
            boxShadow: "0 0 20px rgba(245,158,11,0.4)",
            flexShrink: 0,
          }}>📋</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>My Lesson Plans</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>
              {lessonPlans === undefined ? "Loading..." : `${filtered.length} of ${lessonPlans.filter(p => !!p).length} plans saved`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 520 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <input
            type="text"
            placeholder="Search by title or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "11px 42px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              fontSize: 14,
              color: "var(--text)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6,
              padding: "4px 8px", fontSize: 11, color: "var(--text-3)", cursor: "pointer",
            }}>✕</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Time filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Time</span>
          {(["all", "this_week", "this_month"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              style={{
                padding: "5px 14px", borderRadius: 999,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
                background: filter === f ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)",
                color: filter === f ? "#fbbf24" : "var(--text-2)",
                border: `1px solid ${filter === f ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
              }}>
              {f === "all" ? "All Time" : f === "this_week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
        {/* Subject pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Subject</span>
          {SUBJECTS.map(s => {
            const isActive = subject === s;
            return (
              <button key={s} onClick={() => setSubject(isActive ? "All Subjects" : s)}
                className={`filter-btn ${isActive ? "active" : ""}`}
                style={{
                  padding: "5px 14px", borderRadius: 999,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s",
                  background: isActive ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)",
                  color: isActive ? "#fbbf24" : "var(--text-2)",
                  border: `1px solid ${isActive ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`,
                }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "28px 40px 60px" }}>
        <div style={{ marginBottom: 20, fontSize: 12, color: "var(--text-3)" }}>
          {lessonPlans === undefined ? "..." : `Showing ${filtered.length} of ${lessonPlans.filter(p => !!p).length} plans`}
          {subject !== "All Subjects" && ` · ${subject}`}
          {filter !== "all" && ` · ${filter === "this_week" ? "This Week" : "This Month"}`}
          {search && ` · "${search}"`}
        </div>

        {lessonPlans === undefined ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, animation: "pulse 1.6s ease-in-out infinite" }}>
                <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, width: "35%", marginBottom: 16 }} />
                <div style={{ height: 18, background: "rgba(255,255,255,0.08)", borderRadius: 6, width: "85%", marginBottom: 10 }} />
                <div style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 6, width: "70%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: 18 }}>No lesson plans found</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>Generate one in the Chat tab and click Save.</p>
            <button onClick={() => { setSearch(""); setSubject("All Subjects"); setFilter("all"); }}
              style={{ padding: "10px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((plan) => {
              if (!plan) return null;
              const st = getSubjectStyle(plan.subject || "General");
              const isOpen = expandedId === plan._id;
              return (
                <div key={plan._id} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${isOpen ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  transition: "all 0.2s",
                  boxShadow: isOpen ? "0 4px 24px rgba(245,158,11,0.12)" : "none",
                }}>
                  {/* Card */}
                  <div
                    className="plan-card"
                    onClick={() => setExpandedId(isOpen ? null : plan._id)}
                    style={{ padding: "20px 24px", cursor: "pointer", transition: "transform 0.15s" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div style={{
                        width: 3, minHeight: 60, borderRadius: 2,
                        background: `linear-gradient(180deg, ${st.text}, ${st.border})`,
                        flexShrink: 0, marginTop: 2,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                          {plan.subject && (
                            <span style={{ padding: "3px 10px", borderRadius: 999, background: st.bg, color: st.text, fontSize: 11, fontWeight: 700, border: `1px solid ${st.border}` }}>
                              {plan.subject}
                            </span>
                          )}
                          {plan.yearLevel && (
                            <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.05)", color: "var(--text-2)", fontSize: 11, fontWeight: 700, border: "1px solid rgba(255,255,255,0.08)" }}>
                              Year {plan.yearLevel}
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                          {highlight(plan.title, search)}
                        </h3>
                        <p style={{ fontSize: 12, color: "var(--text-3)" }}>{formatDate(plan.createdAt)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedId(isOpen ? null : plan._id); }}
                        className="expand-btn"
                        style={{
                          padding: "6px 10px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "var(--text-3)",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}>
                        {isOpen ? "▲ Less" : "▼ Preview"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      padding: "24px",
                      background: "rgba(0,0,0,0.15)",
                      animation: "slideDown 0.2s ease-out",
                    }}>
                      {/* Export buttons */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        <button onClick={() => downloadPdf(plan.content, plan.title)}
                          style={{ padding: "6px 14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          📄 PDF
                        </button>
                        <button onClick={() => downloadDOCX(plan.content, plan.title)}
                          style={{ padding: "6px 14px", background: "rgba(255,255,255,0.07)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          📝 DOCX
                        </button>
                        <button onClick={() => downloadTxt(plan.content, plan.title)}
                          style={{ padding: "6px 14px", background: "rgba(255,255,255,0.07)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          📃 TXT
                        </button>
                        <button
                          onClick={() => setViewerId(plan._id)}
                          style={{ padding: "6px 14px", background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          🔍 Full Screen
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          disabled={deleting === plan._id}
                          style={{ padding: "6px 14px", background: deleting === plan._id ? "#fca5a5" : "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: deleting === plan._id ? "not-allowed" : "pointer" }}>
                          🗑 {deleting === plan._id ? "..." : "Delete"}
                        </button>
                      </div>
                      <LessonPlanDisplay content={plan.content} compact={true} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewerId && (() => {
        const plan = lessonPlans?.find(p => p._id === viewerId);
        if (!plan) return null;
        return (
          <DocumentViewerModal
            content={plan.content}
            title={plan.title}
            onClose={() => setViewerId(null)}
            onEditInChat={onOpenInChat ? () => { onOpenInChat({ id: plan._id, title: plan.title, content: plan.content, type: plan.type }); setViewerId(null); } : undefined}
          />
        );
      })()}
    </div>
  );
}
