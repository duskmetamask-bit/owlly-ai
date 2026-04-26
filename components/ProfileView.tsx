"use client";
import { useState, useEffect } from "react";

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const FOCUS_AREAS = ["Lesson Planning", "Assessment Design", "Rubrics & Feedback", "Differentiation", "Behaviour Management", "Classroom Routines", "Parent Communication", "Reporting", "Unit Planning", "Inquiry Learning"];

export default function ProfileView() {
  const [profile, setProfile] = useState<{ name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string } | null>(null);
  const [name, setName] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);
  const [school, setSchool] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pn-profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setProfile(p); setName(p.name || ""); setYears(p.yearLevels || []); setSubjects(p.subjects || []); setFocus(p.focusAreas || []); setSchool(p.school || "");
      } catch {}
    }
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
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Tell PickleNickAI about yourself so it can personalise every response</p>
      </div>
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
    </div>
  );
}
