"use client";
import { useState } from "react";

const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const LESSON_TYPES = ["Explicit Teaching", "Inquiry-Based", "Guided Practice", "Independent Task", "Flipped Classroom"];
const DURATIONS = [30, 45, 50, 60, 70, 90];

export default function PlannerView() {
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [lessonType, setLessonType] = useState("Explicit Teaching");
  const [objectives, setObjectives] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic"); return; }
    setError(""); setLoading(true); setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, topic, duration, lessonType, objectives }),
      });
      const data = await res.json();
      if (data.plan) setResult(data.plan);
      else if (data.error) setError(data.error);
    } catch { setError("Generation failed. Please try again."); }
    finally { setLoading(false); }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `LessonPlan_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Lesson Planner</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Generate complete, AC9-aligned lesson plans in seconds</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 73px)" }}>
        {/* Form */}
        <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Year Level</label>
              <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}>
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Topic / Focus</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Multiplication, Narrative Writing..." style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }} onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Duration (min)</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lesson Type</label>
              <select value={lessonType} onChange={e => setLessonType(e.target.value)} style={{ width: "100%", padding: "10px 12px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none" }}>
                {LESSON_TYPES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Learning Objectives (optional)</label>
            <textarea value={objectives} onChange={e => setObjectives(e.target.value)} placeholder="Students will be able to..." rows={2} style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", resize: "vertical" }} onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>

          {error && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "13px", background: loading ? "var(--surface2)" : "var(--primary)", color: loading ? "var(--text3)" : "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Generating..." : "Generate Lesson Plan"}
          </button>
        </div>

        {/* Result */}
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Generated Lesson Plan</h2>
            {result && <button onClick={download} style={{ padding: "7px 14px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>Download</button>}
          </div>
          <div style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem", overflowY: "auto", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", color: result ? "var(--text)" : "var(--text3)" }}>
            {result || "Your lesson plan will appear here after generation."}
          </div>
        </div>
      </div>
    </div>
  );
}
