"use client";
import { useState } from "react";

interface DifferentiatedContent {
  modifiedContent: string;
  strategies: string[];
  activities: string[];
}

interface Props {
  onUseInChat?: (content: string) => void;
}

export default function DifferentiateView({ onUseInChat }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    eal: DifferentiatedContent;
    gifted: DifferentiatedContent;
    additional: DifferentiatedContent;
  } | null>(null);
  const [error, setError] = useState("");
  const [activeCard, setActiveCard] = useState<string | null>(null);

  async function handleDifferentiate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/differentiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });
      if (!res.ok) throw new Error("Failed to differentiate");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function useInChat(content: string) {
    if (onUseInChat) {
      onUseInChat(content);
    } else {
      window.dispatchEvent(new CustomEvent("pn-use-in-chat", { detail: { content } }));
    }
  }

  const tierColors: Record<string, string> = {
    eal: "#14b8a6",
    gifted: "#a78bfa",
    additional: "#fb923c",
  };

  const tierLabels: Record<string, string> = {
    eal: "EAL/D Learners",
    gifted: "Gifted & Talented",
    additional: "Additional Needs",
  };

  return (
    <div style={{ padding: "28px 28px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "var(--primary-dim)",
            border: "1px solid rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--primary)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="8" height="8" rx="1.5"/>
              <rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15"/>
              <rect x="14" y="14" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.3"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
              Differentiation Engine
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginLeft: 52 }}>
          Paste any lesson content — lesson plan, text extract, or resource — and get three tailored versions for EAL/D learners, gifted students, and students with additional needs.
        </p>
      </div>

      {/* Input card */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        marginBottom: 20,
      }}>
        <label style={{
          display: "block",
          fontSize: 11, fontWeight: 700,
          color: "var(--text-3)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.06em"
        }}>
          Paste your content
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste a lesson plan, text excerpt, activity, or resource here..."
          rows={6}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "12px 14px",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text)",
            resize: "vertical",
            fontFamily: "var(--font)",
            outline: "none",
            transition: "border-color 0.15s ease",
          }}
          onFocus={e => e.target.style.borderColor = "var(--primary)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>
            Works with lesson plans, text excerpts, worksheets, rubrics, and more.
          </p>
          <button
            onClick={handleDifferentiate}
            disabled={!input.trim() || loading}
            style={{
              padding: "10px 22px",
              background: input.trim() && !loading ? "var(--primary)" : "var(--surface)",
              color: input.trim() && !loading ? "#fff" : "var(--text-3)",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 13,
              fontWeight: 600,
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 13, height: 13,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite",
                }} />
                Differentiating...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="2" width="8" height="8" rx="1.5"/>
                  <rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15"/>
                  <rect x="14" y="14" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.3"/>
                </svg>
                Differentiate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius)",
          color: "#f87171",
          fontSize: 13,
          marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          animation: "fadeIn 0.3s ease",
        }}>
          {(["eal", "gifted", "additional"] as const).map(tier => (
            <div
              key={tier}
              onMouseEnter={() => setActiveCard(tier)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                background: "var(--surface)",
                border: `1px solid ${activeCard === tier ? `${tierColors[tier]}50` : "var(--border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "all 0.15s ease",
                boxShadow: activeCard === tier ? `0 0 0 1px ${tierColors[tier]}30, 0 8px 24px rgba(0,0,0,0.3)` : "var(--shadow-sm)",
              }}
            >
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: `${tierColors[tier]}15`,
                  border: `1px solid ${tierColors[tier]}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tierColors[tier],
                  flexShrink: 0,
                }}>
                  {tier === "eal" && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  )}
                  {tier === "gifted" && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  )}
                  {tier === "additional" && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: tierColors[tier], letterSpacing: "0.01em" }}>
                  {tierLabels[tier]}
                </div>
              </div>

              {/* Modified content */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}>
                  Modified Content
                </div>
                <div style={{
                  fontSize: 12.5,
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  maxHeight: 120,
                  overflowY: "auto",
                }}>
                  {result[tier].modifiedContent}
                </div>
              </div>

              {/* Strategies */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}>
                  Teaching Strategies
                </div>
                <ul style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  padding: 0,
                  margin: 0,
                }}>
                  {result[tier].strategies.map((s, i) => (
                    <li key={i} style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--text-2)",
                      lineHeight: 1.5,
                    }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: tierColors[tier],
                        marginTop: 5,
                        flexShrink: 0,
                      }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities */}
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}>
                  Suggested Activities
                </div>
                <ul style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  padding: 0,
                  margin: 0,
                }}>
                  {result[tier].activities.map((a, i) => (
                    <li key={i} style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 12,
                      color: "var(--text-2)",
                      lineHeight: 1.5,
                    }}>
                      <span style={{ color: tierColors[tier], fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}.
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                <button
                  onClick={() => copyToClipboard(result[tier].modifiedContent)}
                  style={{
                    flex: 1, padding: "8px 10px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12, color: "var(--text-2)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    fontWeight: 600,
                    transition: "all 0.12s ease",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => useInChat(result[tier].modifiedContent)}
                  style={{
                    flex: 1, padding: "8px 10px",
                    background: tierColors[tier],
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12, color: "#fff",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    fontWeight: 600,
                    transition: "all 0.12s ease",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Use in Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div style={{
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "60px 24px",
          textAlign: "center",
          color: "var(--text-3)",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ marginBottom: 14 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto", opacity: 0.35 }}>
              <rect x="2" y="2" width="8" height="8" rx="1.5"/>
              <rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15"/>
              <rect x="14" y="14" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.3"/>
            </svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-2)" }}>
            No content differentiated yet
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Paste content above and click Differentiate to get three tailored versions.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
