"use client";
import { useState, useEffect } from "react";

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const FOCUS_AREAS = ["Lesson Planning", "Assessment Design", "Rubrics & Feedback", "Differentiation", "Behaviour Management", "Classroom Routines", "Parent Communication", "Reporting", "Unit Planning", "Inquiry Learning"];

interface SavedDoc { id: string; type: string; label: string; content: string; savedAt: number; }

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

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  lesson: { label: "Lesson Plan", icon: "📋", color: "#6366f1" },
  rubric: { label: "Rubric", icon: "✅", color: "#16a34a" },
  assessment: { label: "Assessment", icon: "🔍", color: "#ea580c" },
  unit: { label: "Unit", icon: "📚", color: "#9333ea" },
  other: { label: "Document", icon: "📄", color: "#64748b" },
};

export default function ProfileView() {
  const [profile, setProfile] = useState<{ name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string } | null>(null);
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
    if (p) { try { const parsed = JSON.parse(p); setProfile(parsed); setName(parsed.name || ""); setYears(parsed.yearLevels || []); setSubjects(parsed.subjects || []); setFocus(parsed.focusAreas || []); setSchool(parsed.school || ""); } catch {} }
    const docs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]") as SavedDoc[];
    setSavedDocs(docs);
  }, []);

  function toggle(arr: string[], item: string, set: (v: string[]) => void) {
    set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  function save() {
    const p = { name, yearLevels: years, subjects, focusAreas: focus, school };
    localStorage.setItem("pn-profile", JSON.stringify(p));
    setProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Your Profile</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Your info and saved documents</p>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 28px" }}>
        {(["profile", "documents"] as const).map(sec => (
          <button key={sec} onClick={() => setActiveSection(sec)} style={{ padding: "14px 20px", background: "transparent", border: "none", borderBottom: `2px solid ${activeSection === sec ? "var(--primary)" : "transparent"}`, color: activeSection === sec ? "var(--primary)" : "var(--text2)", fontSize: 14, fontWeight: activeSection === sec ? 700 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {sec === "profile" ? "👤 Profile" : `💾 Saved (${savedDocs.length})`}
          </button>
        ))}
      </div>

      {activeSection === "profile" ? (
        <div style={{ padding: "24px 28px", maxWidth: 640 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Name</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "11px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 15, outline: "none" }} onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>School / Setting (optional)</label>
            <input value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Perth Primary School" style={{ width: "100%", padding: "11px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 15, outline: "none" }} onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Year Levels You Teach</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {YEAR_LEVELS.map(yl => {
                const sel = years.includes(yl);
                return <button key={yl} onClick={() => toggle(years, yl, setYears)} style={{ padding: "7px 14px", background: sel ? "rgba(99,102,241,0.15)" : "var(--surface2)", color: sel ? "var(--primary)" : "var(--text2)", border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`, borderRadius: 20, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer" }}>{yl}</button>;
              })}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subjects You Teach</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUBJECTS.map(sub => {
                const sel = subjects.includes(sub);
                return <button key={sub} onClick={() => toggle(subjects, sub, setSubjects)} style={{ padding: "7px 14px", background: sel ? "rgba(99,102,241,0.15)" : "var(--surface2)", color: sel ? "var(--primary)" : "var(--text2)", border: `1px solid ${sel ? "var(--primary)" : "var(--border)"}`, borderRadius: 20, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer" }}>{sub}</button>;
              })}
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Areas You Want Help With</label>
            <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 10 }}>PickleNickAI will prioritise these areas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {FOCUS_AREAS.map(area => {
                const sel = focus.includes(area);
                return <button key={area} onClick={() => toggle(focus, area, setFocus)} style={{ padding: "7px 14px", background: sel ? "rgba(34,211,238,0.1)" : "var(--surface2)", color: sel ? "#22D3EE" : "var(--text2)", border: `1px solid ${sel ? "rgba(34,211,238,0.3)" : "var(--border)"}`, borderRadius: 20, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer" }}>{area}</button>;
              })}
            </div>
          </div>
          <button onClick={save} style={{ padding: "13px 28px", background: saved ? "var(--success)" : "var(--primary)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            {saved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      ) : (
        /* Saved Documents */
        <div style={{ padding: "24px 28px" }}>
          {savedDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text2)" }}>No saved documents yet</div>
              <div style={{ fontSize: 13 }}>Use the 💾 Save button on any chat response to save it here</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {savedDocs.map(doc => {
                const typeInfo = TYPE_LABELS[doc.type] || TYPE_LABELS.other;
                return (
                  <div key={doc.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${typeInfo.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{typeInfo.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: "var(--text)" }}>{typeInfo.label}: {doc.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>Saved {new Date(doc.savedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.content.slice(0, 120)}...</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => downloadDoc(doc)} style={{ padding: "7px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text2)", cursor: "pointer" }}>Download</button>
                      <button onClick={() => deleteDoc(doc.id, setSavedDocs)} style={{ padding: "7px 12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, fontSize: 12, color: "var(--danger)", cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}