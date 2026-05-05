"use client";
import { useState, useEffect } from "react";

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const FOCUS_AREAS = ["Lesson Planning", "Assessment Design", "Rubrics & Feedback", "Differentiation", "Behaviour Management", "Classroom Routines", "Parent Communication", "Reporting", "Unit Planning", "Inquiry Learning"];

interface SavedDoc { id: string; type: string; label: string; content: string; savedAt: number; }
interface ProfileData { name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string; }

const TYPE_LABELS: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  lesson: {
    label: "Lesson Plan",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    color: "#6366f1"
  },
  rubric: {
    label: "Rubric",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    color: "#34d399"
  },
  assessment: {
    label: "Assessment",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    color: "#f97316"
  },
  unit: {
    label: "Unit",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    color: "#a78bfa"
  },
  worksheet: {
    label: "Worksheet",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
    color: "#fbbf24"
  },
  writing: {
    label: "Writing Feedback",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
    color: "#22d3ee"
  },
  other: {
    label: "Document",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    color: "#94a3b8"
  },
};

function downloadDoc(doc: SavedDoc) {
  const blob = new Blob([doc.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `${doc.label}_${new Date(doc.savedAt).toISOString().slice(0,10)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function deleteDoc(id: string, setDocs: React.Dispatch<React.SetStateAction<SavedDoc[]>>) {
  const existing = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]") as SavedDoc[];
  const updated = existing.filter(d => d.id !== id);
  localStorage.setItem("pn-saved-docs", JSON.stringify(updated));
  setDocs(updated);
}

export default function ProfileView() {
  const [name, setName] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);
  const [school, setSchool] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [activeSection, setActiveSection] = useState<"profile" | "documents">("profile");

  useEffect(() => {
    const p = localStorage.getItem("pn-profile");
    if (p) {
      try {
        const parsed = JSON.parse(p) as ProfileData;
        setName(parsed.name || "");
        setYears(parsed.yearLevels || []);
        setSubjects(parsed.subjects || []);
        setFocus(parsed.focusAreas || []);
        setSchool(parsed.school || "");
      } catch {}
    }
    const docs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]") as SavedDoc[];
    setSavedDocs(docs);
  }, []);

  function toggle(arr: string[], item: string, set: (v: string[]) => void) {
    set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  function save() {
    const p: ProfileData = { name, yearLevels: years, subjects, focusAreas: focus, school };
    localStorage.setItem("pn-profile", JSON.stringify(p));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "var(--primary-dim)",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--primary)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 2 }}>My Profile</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Your info and saved documents</p>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 28px", gap: 4 }}>
        {(["profile", "documents"] as const).map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            style={{
              padding: "14px 18px",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${activeSection === sec ? "var(--primary)" : "transparent"}`,
              color: activeSection === sec ? "var(--text)" : "var(--text-2)",
              fontSize: 13,
              fontWeight: activeSection === sec ? 600 : 400,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "color 0.15s ease",
              marginBottom: -1,
            }}
          >
            {sec === "profile" ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Saved ({savedDocs.length})
              </>
            )}
          </button>
        ))}
      </div>

      {activeSection === "profile" ? (
        <div style={{ padding: "28px", maxWidth: 680 }}>
          {/* Name */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--text-3)", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              Your Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px",
                background: "var(--surface)", color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 15, outline: "none",
                fontFamily: "var(--font)",
                transition: "border-color 0.15s ease",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          {/* School */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--text-3)", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              School / Setting <span style={{ color: "var(--text-3)", fontWeight: 400, textTransform: "none" }}>— optional</span>
            </label>
            <input
              value={school}
              onChange={e => setSchool(e.target.value)}
              placeholder="e.g. Perth Primary School"
              style={{
                width: "100%", padding: "11px 14px",
                background: "var(--surface)", color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 15, outline: "none",
                fontFamily: "var(--font)",
                transition: "border-color 0.15s ease",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Year levels */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--text-3)", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              Year Levels You Teach
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {YEAR_LEVELS.map(yl => {
                const sel = years.includes(yl);
                return (
                  <button
                    key={yl}
                    onClick={() => toggle(years, yl, setYears)}
                    style={{
                      padding: "7px 13px",
                      background: sel ? "var(--primary-dim)" : "var(--surface)",
                      color: sel ? "var(--primary-hover)" : "var(--text-2)",
                      border: `1px solid ${sel ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                      borderRadius: "var(--radius-full)",
                      fontSize: 13,
                      fontWeight: sel ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}
                  >
                    {yl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjects */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--text-3)", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              Subjects You Teach
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SUBJECTS.map(sub => {
                const sel = subjects.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => toggle(subjects, sub, setSubjects)}
                    style={{
                      padding: "7px 13px",
                      background: sel ? "var(--primary-dim)" : "var(--surface)",
                      color: sel ? "var(--primary-hover)" : "var(--text-2)",
                      border: `1px solid ${sel ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                      borderRadius: "var(--radius-full)",
                      fontSize: 13,
                      fontWeight: sel ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus areas */}
          <div style={{ marginBottom: 30 }}>
            <label style={{
              display: "block", fontSize: 11, fontWeight: 700,
              color: "var(--text-3)", marginBottom: 8,
              textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              Areas You Want Help With
            </label>
            <p style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 10 }}>
              PickleNickAI will prioritise these areas
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {FOCUS_AREAS.map(area => {
                const sel = focus.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggle(focus, area, setFocus)}
                    style={{
                      padding: "7px 13px",
                      background: sel ? "var(--accent-dim)" : "var(--surface)",
                      color: sel ? "var(--accent)" : "var(--text-2)",
                      border: `1px solid ${sel ? "rgba(34,211,238,0.3)" : "var(--border)"}`,
                      borderRadius: "var(--radius-full)",
                      fontSize: 13,
                      fontWeight: sel ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={save}
            style={{
              padding: "12px 28px",
              background: saved ? "#22c55e" : "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: saved ? "0 0 20px rgba(34,197,94,0.3)" : "0 0 0 0 rgba(99,102,241,0)",
            }}
          >
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Profile
              </>
            )}
          </button>
        </div>
      ) : (
        /* Saved Documents */
        <div style={{ padding: "24px 28px" }}>
          {savedDocs.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "80px 20px",
              animation: "fadeIn 0.3s ease",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                color: "var(--text-3)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
                No saved documents yet
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                Use the <strong style={{ fontWeight: 600, color: "var(--primary)" }}>Save</strong> button on any chat response to save it here
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.2s ease" }}>
              {savedDocs.map(doc => {
                const typeInfo = TYPE_LABELS[doc.type] || TYPE_LABELS.other;
                return (
                  <div key={doc.id} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    transition: "border-color 0.12s ease",
                  }}>
                    {/* Type icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${typeInfo.color}12`,
                      border: `1px solid ${typeInfo.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: typeInfo.color,
                      flexShrink: 0,
                    }}>
                      {typeInfo.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{
                          color: typeInfo.color,
                          fontSize: 11,
                          fontWeight: 700,
                          background: `${typeInfo.color}12`,
                          padding: "2px 8px",
                          borderRadius: 5,
                          letterSpacing: "0.02em",
                        }}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "var(--text)" }}>
                        {doc.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>
                        Saved {new Date(doc.savedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div style={{
                        fontSize: 12, color: "var(--text-2)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}>
                        {doc.content.slice(0, 140)}...
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => downloadDoc(doc)}
                        style={{
                          padding: "6px 12px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12,
                          color: "var(--text-2)",
                          cursor: "pointer",
                          fontWeight: 600,
                          transition: "all 0.12s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download
                      </button>
                      <button
                        onClick={() => deleteDoc(doc.id, setSavedDocs)}
                        style={{
                          padding: "6px 10px",
                          background: "rgba(248,113,113,0.08)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12,
                          color: "#f87171",
                          cursor: "pointer",
                          fontWeight: 600,
                          transition: "all 0.12s ease",
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
