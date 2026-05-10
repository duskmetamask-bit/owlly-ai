"use client";
import { useState } from "react";

function logFeedback(type: string, quality: "good" | "bad", context: string) {
  const key = `pn-feedback-${type}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ quality, context, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
}

function logUsage(type: string, action: string, context: string) {
  const key = `pn-usage`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ type, action, context, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
}

function saveRubricToProfile(content: string, label: string) {
  if (!teacherId) return;
  const title = `Rubric — ${subject} ${yearLevel} — ${taskType}`;
  const btns = document.querySelectorAll(`[data-save-btn]`);
  btns.forEach(b => {
    const el = b as HTMLElement;
    el.textContent = "✓ Saved";
    el.style.color = "#34d399";
    setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500);
  });
}

const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education"];
const YEAR_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

export default function RubricView({ teacherId }: { teacherId?: string }) {
  const [subject, setSubject] = useState("English");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [taskType, setTaskType] = useState("Narrative Writing");
  const [criteria, setCriteria] = useState("Writing structure, Vocabulary choices, Grammar and punctuation, Organisation and cohesion");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function generate() {
    setError(""); setLoading(true); setResult(""); setFeedback(null);
    try {
      const res = await fetch("/api/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, taskType, criteria }),
      });
      const data = await res.json();
      if (data.rubric) { setResult(data.rubric); logUsage("rubric", "generate", `${subject} ${yearLevel} ${taskType}`); }
      else if (data.error) setError(data.error);
    } catch { setError("Failed to generate rubric."); }
    finally { setLoading(false); }
  }

  function download(format: "txt" | "pdf" | "pptx" | "docx") {
    if (!result) return;
    logUsage("rubric", "export", `${format} ${subject} ${yearLevel} ${taskType}`);
    if (format === "txt") {
      const blob = new Blob([result], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `Rubric_${subject}_${yearLevel}_${taskType}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const endpoint = format === "pdf" ? "chat-to-pdf" : format;
      fetch(`/api/export/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result, title: `Rubric_${subject}_${yearLevel}_${taskType}` }),
      })
        .then(res => { if (!res.ok) throw new Error(`${format.toUpperCase()} export failed`); return res.blob(); })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `Rubric_${subject}_${yearLevel}_${taskType}.${format === "docx" ? "docx" : format === "pptx" ? "pptx" : "pdf"}`; a.click();
          URL.revokeObjectURL(url);
        })
        .catch(() => {
          const blob = new Blob([result], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `Rubric_${subject}_${yearLevel}_${taskType}.txt`; a.click();
          URL.revokeObjectURL(url);
        });
    }
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("rubric", f, `${subject} ${yearLevel} ${taskType}`);
  }

  const baseInput: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: "#13151c", color: "#e2e8f0",
    border: "1px solid #1e2433", borderRadius: 8,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #1a1d27", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
          border: "1px solid rgba(99,102,241,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em", margin: 0 }}>Rubric Generator</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>4-level assessment rubrics for any task</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 73px)" }}>
        {/* Form Panel */}
        <div style={{ padding: "28px", borderRight: "1px solid #1a1d27" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                style={{ ...baseInput, cursor: "pointer" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#1e2433"; e.currentTarget.style.boxShadow = "none"; }}>
                {SUBJECTS.map(s => <option key={s} style={{ background: "#13151c" }}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Year Level</label>
              <select value={yearLevel} onChange={e => setYearLevel(e.target.value)}
                style={{ ...baseInput, cursor: "pointer" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#1e2433"; e.currentTarget.style.boxShadow = "none"; }}>
                {YEAR_LEVELS.map(y => <option key={y} style={{ background: "#13151c" }}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Task Type</label>
            <input value={taskType} onChange={e => setTaskType(e.target.value)} placeholder="e.g. Persuasive Essay, Science Report"
              style={baseInput}
              onFocus={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#1e2433"; e.currentTarget.style.boxShadow = "none"; }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Criteria</label>
            <textarea value={criteria} onChange={e => setCriteria(e.target.value)} rows={3}
              placeholder="Comma-separated criteria..."
              style={{ ...baseInput, resize: "vertical", lineHeight: 1.6 }}
              onFocus={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#1e2433"; e.currentTarget.style.boxShadow = "none"; }} />
          </div>

          {error && (
            <div style={{ padding: "11px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button onClick={generate} disabled={loading} style={{
            width: "100%", padding: "13px",
            background: loading ? "#1e2433" : "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: loading ? "#64748b" : "#fff",
            border: "none", borderRadius: 9,
            fontWeight: 600, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
            boxShadow: loading ? "none" : "0 4px 14px rgba(99,102,241,0.25)",
          }}>
            {loading ? (
              <>
                <div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Generating...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Generate Rubric
              </>
            )}
          </button>
        </div>

        {/* Result Panel */}
        <div style={{ padding: "28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", margin: 0 }}>Generated Rubric</h2>
            {result && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {feedback === null ? (
                  <>
                    <button onClick={() => handleFeedback("good")} style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 13, color: "#34d399" }}>Good</button>
                    <button onClick={() => handleFeedback("bad")} style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontSize: 13, color: "#f87171" }}>Poor</button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: feedback === "good" ? "#34d399" : "#94a3b8", fontWeight: 600 }}>
                    {feedback === "good" ? "Thanks!" : "Noted"}
                  </span>
                )}
                <button onClick={() => saveRubricToProfile(result, `Rubric_${subject}_${yearLevel}_${taskType}`)}
                  data-save-btn style={{ padding: "5px 11px", background: "#13151c", border: "1px solid #1e2433", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#94a3b8", cursor: "pointer" }}>Save</button>
                <button onClick={() => download("txt")} style={{ padding: "5px 11px", background: "#13151c", border: "1px solid #1e2433", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#94a3b8", cursor: "pointer" }}>TXT</button>
                <button onClick={() => download("pdf")} style={{ padding: "5px 11px", background: "#13151c", border: "1px solid #1e2433", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#94a3b8", cursor: "pointer" }}>PDF</button>
                <button onClick={() => download("docx")} style={{ padding: "5px 11px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#818cf8", cursor: "pointer" }}>DOCX</button>
              </div>
            )}
          </div>
          <div style={{
            flex: 1, background: "#13151c",
            border: "1px solid #1e2433",
            borderRadius: 12,
            padding: "1.25rem",
            overflowY: "auto",
            fontSize: 13.5, lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            color: result ? "#cbd5e1" : "#475569",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
          }}>
            {result || "Your rubric will appear here after generation."}
          </div>
        </div>
      </div>
    </div>
  );
}
