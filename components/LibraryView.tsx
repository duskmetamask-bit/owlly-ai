"use client";

import { useState, useEffect } from "react";
import LessonPlanDisplay from "@/components/LessonPlanDisplay";
import DocumentViewerModal from "@/components/DocumentViewerModal";
import { downloadTxt, downloadPdf, downloadDOCX, downloadPPTX } from "@/components/exportUtils";

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Science":                      { bg: "rgba(52,211,153,0.12)",   text: "#34d399", border: "rgba(52,211,153,0.3)" },
  "Australian Curriculum Science": { bg: "rgba(52,211,153,0.12)",   text: "#34d399", border: "rgba(52,211,153,0.3)" },
  "English":                      { bg: "rgba(167,139,250,0.12)",  text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
  "Australian Curriculum English": { bg: "rgba(167,139,250,0.12)",  text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
  "Mathematics":                   { bg: "rgba(34,211,238,0.12)",  text: "#22d3ee", border: "rgba(34,211,238,0.3)" },
  "Australian Curriculum Mathematics": { bg: "rgba(34,211,238,0.12)", text: "#22d3ee", border: "rgba(34,211,238,0.3)" },
  "HASS":                         { bg: "rgba(251,191,36,0.12)",   text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  "Australian Curriculum HASS":    { bg: "rgba(251,191,36,0.12)",   text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  "General":                      { bg: "rgba(148,163,184,0.12)",  text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  "Technologies":                 { bg: "rgba(245,158,11,0.12)",   text: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  "The Arts":                     { bg: "rgba(244,114,182,0.12)",  text: "#f472b6", border: "rgba(244,114,182,0.3)" },
  "Health & Physical Education":   { bg: "rgba(251,146,60,0.12)",   text: "#fb923c", border: "rgba(251,146,60,0.3)" },
};

const SUBJECTS = ["All Subjects", "Science", "English", "Mathematics", "HASS", "Technologies", "The Arts", "Health & Physical Education", "General"];
const YEARS    = ["All Years", "F", "1", "2", "3", "4", "5", "6", "F-6"];

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

interface Unit {
  id: string;
  title: string;
  subject: string;
  yearLevel: string;
  duration: string;
  curriculum: string;
  description: string;
  content: string;
}

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 24,
      animation: "pulse 1.6s ease-in-out infinite",
    }}>
      <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, width: "35%", marginBottom: 16 }} />
      <div style={{ height: 18, background: "rgba(255,255,255,0.08)", borderRadius: 6, width: "85%", marginBottom: 10 }} />
      <div style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 6, width: "95%", marginBottom: 6 }} />
      <div style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 6, width: "70%" }} />
    </div>
  );
}

interface LibraryViewProps {
  onOpenInChat?: (doc: { id: string; title: string; content: string; type: string }) => void;
}

export default function LibraryView({ onOpenInChat }: LibraryViewProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [year, setYear] = useState("All Years");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewUnit, setPreviewUnit] = useState<Unit | null>(null);

  useEffect(() => {
    fetch("/api/library/units")
      .then(r => r.json())
      .then(d => { setUnits(d.units ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = units.filter(u => {
    const s = subject === "All Subjects" || u.subject === subject;
    const y = year === "All Years" || u.yearLevel.includes(year) || u.yearLevel === year;
    const q = !search.trim() ||
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.description.toLowerCase().includes(search.toLowerCase()) ||
      u.curriculum.toLowerCase().includes(search.toLowerCase());
    return s && y && q;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .unit-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        .filter-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .filter-btn.active { background: rgba(245,158,11,0.2) !important; color: #fbbf24 !important; border-color: rgba(245,158,11,0.4) !important; }
        .year-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .year-btn.active { background: var(--primary) !important; color: #fff !important; }
        .expand-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .ac9-code { background: rgba(245,158,11,0.15); color: #fcd34d; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; font-family: monospace; letter-spacing: 0.05em; }
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
          }}>📚</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Unit Library</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>{loading ? "Loading..." : `${units.length} AC9-aligned unit plans`}</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 520 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <input
            type="text"
            placeholder="Search by title, topic or keyword..."
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
        {/* Subject pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Subject</span>
          {SUBJECTS.map(s => {
            const isActive = subject === s;
            const st = getSubjectStyle(s === "All Subjects" ? "General" : s);
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
        {/* Year pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Year</span>
          {YEARS.map(y => {
            const isActive = year === y;
            return (
              <button key={y} onClick={() => setYear(isActive ? "All Years" : y)}
                className={`year-btn ${isActive ? "active" : ""}`}
                style={{
                  padding: "4px 12px", borderRadius: 8,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.15s",
                  background: isActive ? "var(--primary)" : "rgba(255,255,255,0.04)",
                  color: isActive ? "#fff" : "var(--text-2)",
                  border: `1px solid ${isActive ? "transparent" : "rgba(255,255,255,0.07)"}`,
                }}>
                {y}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "28px 40px 60px" }}>
        <div style={{ marginBottom: 20, fontSize: 12, color: "var(--text-3)" }}>
          {loading ? "..." : `Showing ${filtered.length} of ${units.length} units`}
          {subject !== "All Subjects" && ` · ${subject}`}
          {year !== "All Years" && ` · Years ${year}`}
          {search && ` · "${search}"`}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: 18 }}>No units found</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>Try different filters or clear your search</p>
            <button onClick={() => { setSearch(""); setSubject("All Subjects"); setYear("All Years"); }}
              style={{ padding: "10px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((unit) => {
              const st = getSubjectStyle(unit.subject);
              const isOpen = expanded === unit.id;
              return (
                <div key={unit.id} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${isOpen ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  transition: "all 0.2s",
                  boxShadow: isOpen ? "0 4px 24px rgba(245,158,11,0.12)" : "none",
                }}>
                  {/* Card row */}
                  <div
                    className="unit-card"
                    onClick={() => setExpanded(isOpen ? null : unit.id)}
                    style={{ padding: "20px 24px", cursor: "pointer", transition: "transform 0.15s" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      {/* Subject accent bar */}
                      <div style={{
                        width: 3, minHeight: 60, borderRadius: 2,
                        background: `linear-gradient(180deg, ${st.text}, ${st.border})`,
                        flexShrink: 0, marginTop: 2,
                      }} />

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges row */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 999,
                            background: st.bg, color: st.text,
                            fontSize: 11, fontWeight: 700,
                            border: `1px solid ${st.border}`,
                          }}>{unit.subject}</span>
                          <span style={{
                            padding: "3px 10px", borderRadius: 999,
                            background: "rgba(255,255,255,0.05)", color: "var(--text-2)",
                            fontSize: 11, fontWeight: 700,
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}>Years {unit.yearLevel}</span>
                          {unit.duration && (
                            <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
                              ⏱ {unit.duration.split(" ")[0]} {unit.duration.split(" ")[1]}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                          {highlight(unit.title, search)}
                        </h3>

                        {/* Description */}
                        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {unit.description?.slice(0, 200)}
                        </p>

                        {/* AC9 code */}
                        {unit.curriculum && (
                          <div style={{ marginTop: 8 }}>
                            <span className="ac9-code">{unit.curriculum.slice(0, 60)}</span>
                          </div>
                        )}
                      </div>

                      {/* Right actions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenInChat) {
                              onOpenInChat({ id: unit.id, title: unit.title, content: unit.content, type: "library" });
                            }
                          }}
                          style={{
                            padding: "7px 14px",
                            background: "var(--primary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 12, fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 12px rgba(245,158,11,0.3)",
                          }}>
                          Edit in Chat →
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewUnit(unit); }}
                          style={{
                            padding: "7px 14px",
                            background: "rgba(255,255,255,0.07)",
                            color: "var(--text)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8,
                            fontSize: 12, fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}>
                          Preview
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpanded(isOpen ? null : unit.id); }}
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
                          }}>
                          {isOpen ? "▲ Less" : "▼ Preview"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      padding: "24px",
                      background: "rgba(0,0,0,0.15)",
                      animation: "slideDown 0.2s ease-out",
                    }}>
                      {/* Export buttons */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        <button onClick={() => downloadPdf(unit.content, unit.title || "unit-plan")}
                          style={{ padding: "6px 14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          📄 PDF
                        </button>
                        <button onClick={() => downloadDOCX(unit.content, unit.title || "unit-plan")}
                          style={{ padding: "6px 14px", background: "rgba(255,255,255,0.07)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          📝 DOCX
                        </button>
                        <button onClick={() => downloadTxt(unit.content, unit.title || "unit-plan")}
                          style={{ padding: "6px 14px", background: "rgba(255,255,255,0.07)", color: "var(--text)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          📃 TXT
                        </button>
                        <button onClick={() => downloadPPTX(unit.content, unit.title || "unit-plan")}
                          style={{ padding: "6px 14px", background: "rgba(34,211,238,0.12)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.25)", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          📑 PPTX
                        </button>
                      </div>
                      <LessonPlanDisplay
                        content={unit.content}
                        compact={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewUnit && (
        <DocumentViewerModal
          content={previewUnit.content}
          title={previewUnit.title}
          onClose={() => setPreviewUnit(null)}
          onEditInChat={onOpenInChat ? () => { onOpenInChat({ id: previewUnit.id, title: previewUnit.title, content: previewUnit.content, type: "library" }); setPreviewUnit(null); } : undefined}
        />
      )}
    </div>
  );
}
