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

function saveWritingToProfile(dimensions: Dimension[], overall: string, yearLevel: string, taskType: string) {
  const content = [
    `WRITING FEEDBACK — ${yearLevel} ${taskType}`,
    `Generated: ${new Date().toLocaleDateString("en-AU")}`,
    "",
    ...dimensions.map(d => `${d.name}: ${d.grade} (${d.score}/10) — ${d.feedback}`),
    "",
    `OVERALL: ${overall}`,
  ].join("\n");
  const savedDocs = JSON.parse(localStorage.getItem("pn-saved-docs") || "[]");
  savedDocs.unshift({ id: Date.now().toString(36), type: "writing", label: `Writing Feedback — ${yearLevel} ${taskType}`, content, savedAt: Date.now() });
  localStorage.setItem("pn-saved-docs", JSON.stringify(savedDocs.slice(0, 50)));
  const btns = document.querySelectorAll(`[data-save-btn]`);
  btns.forEach(b => {
    const el = b as HTMLElement;
    el.textContent = "Saved";
    el.style.color = "#22c55e";
    setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500);
  });
}

interface Dimension {
  name: string;
  score: string;
  grade: string;
  feedback: string;
}

const DIMENSIONS: string[] = [
  "Ideas & Content",
  "Text Structure",
  "Voice & Tone",
  "Word Choice",
  "Sentence Fluency",
  "Grammar & Punctuation",
  "Spelling",
  "Paragraphing",
  "Audience Awareness",
  "Overall Impact",
];

const TASK_TYPES = ["Narrative", "Persuasive", "Informative", "Description", "Recount", "Explanation", "Discussion"];
const YEAR_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

function scoreToGrade(score: string): string {
  const n = parseFloat(score);
  if (isNaN(n)) return "—";
  if (n >= 9) return "A+";
  if (n >= 8) return "A";
  if (n >= 7) return "B+";
  if (n >= 6) return "B";
  if (n >= 5) return "C+";
  if (n >= 4) return "C";
  if (n >= 3) return "D";
  return "E";
}

function scoreColor(score: string): string {
  const n = parseFloat(score);
  if (isNaN(n)) return "var(--text-2)";
  if (n >= 8) return "#22c55e";
  if (n >= 6) return "#22d3ee";
  if (n >= 4) return "#fbbf24";
  return "#f87171";
}

export default function WritingFeedbackView() {
  const [studentWriting, setStudentWriting] = useState("");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [taskType, setTaskType] = useState("Narrative");
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function markWriting() {
    if (!studentWriting.trim()) { setError("Please paste student writing first"); return; }
    setError(""); setLoading(true); setDimensions([]); setOverallFeedback(""); setFeedback(null);

    const allowed = await new Promise<boolean>(resolve => {
      window.dispatchEvent(new CustomEvent("pn-free-tier", {
        detail: { action: "generate", result: resolve }
      }));
    });
    if (!allowed) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: studentWriting, yearLevel, taskType }),
      });
      const data = await res.json();
      if (data.dimensions) {
        setDimensions(data.dimensions);
        setOverallFeedback(data.overallFeedback || "");
        logUsage("writing-feedback", "mark", `${yearLevel} ${taskType}`);
      } else if (data.error) {
        setError(data.error);
      }
    } catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  }

  function downloadTxt() {
    if (!dimensions.length && !overallFeedback) return;
    const lines = [
      `WRITING FEEDBACK REPORT`,
      `========================`,
      `Year Level: ${yearLevel}`,
      `Task Type: ${taskType}`,
      ``,
      ...dimensions.map(d => `${d.name}: ${d.grade} (${d.score}/10)\n  ${d.feedback}`),
      ``,
      `OVERALL: ${overallFeedback}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `WritingFeedback_${yearLevel}_${taskType}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    if (!dimensions.length) return;
    fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: [
          "# Writing Feedback Report",
          `**Year Level:** ${yearLevel}  |  **Task Type:** ${taskType}`,
          "",
          ...dimensions.map(d => `## ${d.name} — ${d.grade} (${d.score}/10)\n${d.feedback}`),
          "",
          `## Overall Feedback\n${overallFeedback}`,
        ].join("\n"),
        title: `WritingFeedback_${yearLevel}_${taskType}`,
      }),
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `WritingFeedback_${yearLevel}_${taskType}.pdf`; a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("writing-feedback", f, `${yearLevel} ${taskType}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, rgba(34,211,238,0.06) 0%, transparent 100%)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "var(--accent-dim)",
          border: "1px solid rgba(34,211,238,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 2 }}>Writing Feedback</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Detailed 10-dimension rubric analysis with actionable feedback</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 74px)" }}>
        {/* Left: Input panel */}
        <div style={{
          padding: "24px 28px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          {/* Year and task selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                color: "var(--text-3)", marginBottom: 6,
                textTransform: "uppercase", letterSpacing: "0.06em"
              }}>
                Year Level
              </label>
              <select
                value={yearLevel}
                onChange={e => setYearLevel(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "var(--surface)", color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "var(--font)",
                  cursor: "pointer",
                }}
              >
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                color: "var(--text-3)", marginBottom: 6,
                textTransform: "uppercase", letterSpacing: "0.06em"
              }}>
                Task Type
              </label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "var(--surface)", color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "var(--font)",
                  cursor: "pointer",
                }}
              >
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Writing input */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 700,
              color: "var(--text-3)", marginBottom: 6,
              textTransform: "uppercase", letterSpacing: "0.06em"
            }}>
              Student Writing
            </label>
            <textarea
              value={studentWriting}
              onChange={e => setStudentWriting(e.target.value)}
              placeholder="Paste student writing here..."
              style={{
                flex: 1,
                width: "100%",
                padding: "12px 14px",
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 13,
                lineHeight: 1.7,
                resize: "none",
                fontFamily: "var(--font)",
                outline: "none",
                minHeight: 300,
                transition: "border-color 0.15s ease",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: "var(--radius)",
              color: "#f87171",
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={markWriting}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading ? "var(--surface)" : "var(--accent)",
              color: loading ? "var(--text-3)" : "#0a0a0a",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(0,0,0,0.15)",
                  borderTopColor: "#0a0a0a",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite"
                }} />
                Analysing...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
                Mark My Writing
              </>
            )}
          </button>
        </div>

        {/* Right: Results panel */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
          {/* Results header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>10-Dimension Analysis</h2>
              {dimensions.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                  padding: "2px 8px",
                  borderRadius: 5,
                }}>
                  {dimensions.length} dimensions
                </span>
              )}
            </div>
            {dimensions.length > 0 && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => saveWritingToProfile(dimensions, overallFeedback, yearLevel, taskType)}
                  data-save-btn
                  style={{
                    padding: "6px 12px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.12s ease",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save
                </button>
                <button
                  onClick={downloadTxt}
                  style={{
                    padding: "6px 10px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-2)",
                    cursor: "pointer",
                  }}
                >
                  TXT
                </button>
                <button
                  onClick={downloadPdf}
                  style={{
                    padding: "6px 10px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-2)",
                    cursor: "pointer",
                  }}
                >
                  PDF
                </button>
              </div>
            )}
          </div>

          {/* Results content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {dimensions.length === 0 && !loading && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                textAlign: "center",
                animation: "fadeIn 0.3s ease",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                  color: "var(--text-3)",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                  Ready to Analyse
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 300, lineHeight: 1.6 }}>
                  Paste student writing and click "Mark My Writing" to get a detailed rubric analysis
                </p>
              </div>
            )}

            {dimensions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.25s ease" }}>
                {dimensions.map((dim, i) => (
                  <div key={i} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{dim.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{dim.score}/10</span>
                        <span style={{
                          fontWeight: 900,
                          fontSize: 12,
                          color: scoreColor(dim.score),
                          background: `${scoreColor(dim.score)}15`,
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}>
                          {dim.grade}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
                      {dim.feedback}
                    </p>
                  </div>
                ))}

                {/* Overall feedback */}
                {overallFeedback && (
                  <div style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    borderRadius: "var(--radius)",
                    padding: "14px",
                    marginTop: 4,
                  }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: 12,
                      marginBottom: 6,
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Overall Feedback
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>
                      {overallFeedback}
                    </p>
                  </div>
                )}

                {/* Feedback thumbs */}
                {feedback === null ? (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8, padding: "8px 0" }}>
                    <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback("good")}
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#22c55e",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.12s ease",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                      Good
                    </button>
                    <button
                      onClick={() => handleFeedback("bad")}
                      style={{
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.2)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#f87171",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.12s ease",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h2.67A2.33 2.33 0 0 1 22 4v7a2.33 2.33 0 0 1-2.33 2H17"/>
                      </svg>
                      Needs Work
                    </button>
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "#22c55e",
                    fontWeight: 600,
                    marginTop: 8,
                    padding: "8px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feedback === "good" ? "Thanks for the feedback!" : "Noted — we'll keep improving."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
