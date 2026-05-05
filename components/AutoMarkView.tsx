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

const DropZone = ({
  label, icon, file, onFile, accent,
}: {
  label: string; icon: React.ReactNode; file: File | null; onFile: (f: File) => void; accent: string;
}) => {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        onClick={() => {
          const i = document.createElement("input");
          i.type = "file";
          i.accept = "image/*,application/pdf";
          i.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) onFile(f); };
          i.click();
        }}
        style={{
          background: dragging ? "rgba(52,211,153,0.06)" : "#13151c",
          border: `2px dashed ${dragging ? "#34d399" : "#1e2433"}`,
          borderRadius: 12,
          padding: "2rem 1.5rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "center", opacity: dragging ? 1 : 0.7 }}>{icon}</div>
        {file ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>{file.name}</span>
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 13 }}>Drag & drop or click to upload</div>
        )}
      </div>
    </div>
  );
};

export default function AutoMarkView() {
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  async function analyze() {
    if (!rubricFile || !workFile) { setError("Please upload both a rubric and student work"); return; }
    setError(""); setLoading(true); setResult(""); setFeedback(null);
    const formData = new FormData();
    formData.append("rubric", rubricFile);
    formData.append("work", workFile);
    try {
      const res = await fetch("/api/auto-mark", { method: "POST", body: formData });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
        logUsage("auto-mark", "analyze", `${rubricFile.name} vs ${workFile.name}`);
      } else if (data.error) setError(data.error);
    } catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  }

  function handleFeedback(f: "good" | "bad") {
    setFeedback(f);
    logFeedback("auto-mark", f, `${rubricFile?.name || "rubric"} vs ${workFile?.name || "work"}`);
  }

  const disabled = !rubricFile || !workFile;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #1a1d27", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))",
          border: "1px solid rgba(52,211,153,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em", margin: 0 }}>Auto-Marking</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0" }}>Upload rubric + student work for instant AI feedback</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 73px)" }}>
        {/* Upload Panel */}
        <div style={{ padding: "28px", borderRight: "1px solid #1a1d27" }}>
          <DropZone
            label="Step 1: Upload Rubric"
            accent="#6366f1"
            icon={
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            }
            file={rubricFile}
            onFile={setRubricFile}
          />

          <div style={{ marginTop: 16 }}>
            <DropZone
              label="Step 2: Upload Student Work"
              accent="#f59e0b"
              icon={
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              }
              file={workFile}
              onFile={setWorkFile}
            />
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: "11px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, color: "#f87171", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={loading || disabled}
            style={{
              width: "100%", marginTop: 20,
              padding: "13px",
              background: loading ? "#1e2433" : disabled ? "#13151c" : "linear-gradient(135deg, #34d399, #10b981)",
              color: disabled ? "#475569" : loading ? "#94a3b8" : "#fff",
              border: "none", borderRadius: 9,
              fontWeight: 600, fontSize: 14,
              cursor: disabled || loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              boxShadow: disabled || loading ? "none" : "0 4px 14px rgba(52,211,153,0.2)",
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Analyzing...
              </>
            ) : "Analyze Student Work"}
          </button>
        </div>

        {/* Result Panel */}
        <div style={{ padding: "28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", margin: 0 }}>Feedback</h2>
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
            color: result ? "#cbd5e1" : "#475569",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
          }}>
            {result || "Results will appear here after analysis. Each criterion will be graded with actionable feedback for the student."}
          </div>
        </div>
      </div>
    </div>
  );
}
