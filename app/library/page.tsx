"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

const SUBJECTS = ["All", "English", "Mathematics", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "General"];
const YEAR_LEVELS = ["All", "F", "1", "2", "3", "4", "5", "6", "F-6"];
const SUBJECT_COLORS: Record<string, string> = {
  "English": "#6366f1",
  "Mathematics": "#22d3ee",
  "Science": "#34d399",
  "HASS": "#fbbf24",
  "Technologies": "#a78bfa",
  "The Arts": "#f472b6",
  "Health & Physical Education": "#fb923c",
  "General": "#94a3b8",
};

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} style={{ background: "#fef08a", color: "#1e293b", borderRadius: 2, padding: "0 2px" }}>{part}</mark> : part
  );
}

export default function LibraryPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("pn-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/library/units");
      const data = await res.json();
      setUnits(data.units || []);
    } catch {
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const filtered = units.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.description.toLowerCase().includes(search.toLowerCase()) ||
      u.subject.toLowerCase().includes(search.toLowerCase()) ||
      u.curriculum.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "All" || u.subject === subjectFilter;
    const matchesYear = yearFilter === "All" || u.yearLevel.includes(yearFilter) || u.yearLevel === yearFilter;
    return matchesSearch && matchesSubject && matchesYear;
  });

  const counts = SUBJECTS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = s === "All" ? units.length : units.filter((u) => u.subject === s).length;
    return acc;
  }, {});

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "1px solid var(--border-subtle)",
        background: theme === "dark" ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 24px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 12, color: "#fff",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}>PN</div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "var(--text)" }}>PickleNickAI</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-2)",
              }}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <Link href="/picklenickai" style={{
              padding: "8px 18px",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius)",
              fontWeight: 700, fontSize: 14,
              textDecoration: "none",
            }}>Open App</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid var(--border-subtle)",
        background: theme === "dark" ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.03)",
        padding: "48px 24px 40px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: "var(--radius-full)",
            background: "var(--primary-dim)",
            border: "1px solid rgba(99,102,241,0.2)",
            fontSize: 12, fontWeight: 600, color: "var(--primary-hover)",
            marginBottom: 16,
          }}>
            📚 {units.length} Unit Plans and Growing
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Australian Curriculum Unit Library
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 560, lineHeight: 1.6 }}>
            Browse {units.length} ready-to-use unit plans aligned to AC9. Search by subject, year level, or keyword.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search units by title, topic, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px 12px 42px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", fontSize: 15,
              color: "var(--text)", outline: "none",
              boxSizing: "border-box",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "var(--surface-2)", border: "none", borderRadius: 6,
                padding: "4px 8px", fontSize: 11, color: "var(--text-3)", cursor: "pointer",
              }}
            >Clear</button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
          {/* Subject pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(subjectFilter === s ? "All" : s)}
                style={{
                  padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  background: subjectFilter === s ? (SUBJECT_COLORS[s] || "#6366f1") : "var(--surface-2)",
                  color: subjectFilter === s ? "#fff" : "var(--text-2)",
                  border: `1px solid ${subjectFilter === s ? "transparent" : "var(--border)"}`,
                  opacity: counts[s] === 0 ? 0.5 : 1,
                }}
              >
                {s} {s !== "All" && `(${counts[s] || 0})`}
              </button>
            ))}
          </div>

          {/* Year level */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: "auto" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>Year:</span>
            {YEAR_LEVELS.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(yearFilter === y ? "All" : y)}
                style={{
                  padding: "5px 10px", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                  background: yearFilter === y ? "var(--primary)" : "var(--surface-2)",
                  color: yearFilter === y ? "#fff" : "var(--text-2)",
                  border: `1px solid ${yearFilter === y ? "transparent" : "var(--border)"}`,
                }}
              >{y}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text-3)" }}>
          Showing {filtered.length} of {units.length} units
          {subjectFilter !== "All" && ` · ${subjectFilter}`}
          {yearFilter !== "All" && ` · Year ${yearFilter}`}
          {search && ` · matching "${search}"`}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20,
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: 24,
                animation: "pulse 1.5s ease-in-out infinite",
              }}>
                <div style={{ height: 20, background: "var(--border)", borderRadius: 4, marginBottom: 12, width: "70%" }} />
                <div style={{ height: 14, background: "var(--border)", borderRadius: 4, marginBottom: 8, width: "40%" }} />
                <div style={{ height: 14, background: "var(--border)", borderRadius: 4, width: "90%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No units found</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(""); setSubjectFilter("All"); setYearFilter("All"); }}
              style={{ marginTop: 16, padding: "10px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer" }}
            >Clear all filters</button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}>
            {filtered.map((unit) => {
              const isExpanded = expandedId === unit.id;
              const accent = SUBJECT_COLORS[unit.subject] || "#6366f1";
              return (
                <div
                  key={unit.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    transition: "all 0.15s var(--ease)",
                    cursor: "pointer",
                  }}
                  className="unit-card"
                  onClick={() => setExpandedId(isExpanded ? null : unit.id)}
                >
                  {/* Card header */}
                  <div style={{ padding: "20px 22px 16px" }}>
                    {/* Subject + Year badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "var(--radius-full)",
                        background: `${accent}18`, color: accent,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {unit.subject}
                      </span>
                      <span style={{
                        padding: "3px 10px", borderRadius: "var(--radius-full)",
                        background: "var(--surface-2)", color: "var(--text-2)",
                        fontSize: 11, fontWeight: 700,
                      }}>
                        Years {unit.yearLevel}
                      </span>
                      {unit.duration && (
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>⏱ {unit.duration}</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.4, marginBottom: 10 }}>
                      {highlightText(unit.title, search)}
                    </h3>

                    {/* Description */}
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 12 }}>
                      {unit.description.slice(0, 140)}{unit.description.length > 140 ? "..." : ""}
                    </p>

                    {/* AC9 codes */}
                    {unit.curriculum && (
                      <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace" }}>
                        {unit.curriculum.slice(0, 80)}
                      </div>
                    )}
                  </div>

                  {/* Expand/collapse */}
                  <div style={{
                    borderTop: "1px solid var(--border-subtle)",
                    padding: "10px 22px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: theme === "dark" ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.02)",
                  }}>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {isExpanded ? "▲ Hide preview" : "▼ View preview"}
                    </span>
                    <Link
                      href="/picklenickai"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: "6px 14px",
                        background: "var(--primary)",
                        color: "#fff",
                        borderRadius: "var(--radius)",
                        fontSize: 12, fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Use in App →
                    </Link>
                  </div>

                  {/* Expanded content preview */}
                  {isExpanded && (
                    <div style={{
                      padding: "0 22px 20px",
                      borderTop: "1px solid var(--border-subtle)",
                    }}>
                      <div style={{
                        marginTop: 16, padding: "16px",
                        background: theme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
                        borderRadius: "var(--radius)",
                        fontSize: 12.5, color: "var(--text-2)",
                        lineHeight: 1.8, maxHeight: 300, overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        {unit.content.slice(0, 2000)}
                        {unit.content.length > 2000 && "..."}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Footer */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "60px 24px",
        textAlign: "center",
        background: theme === "dark" ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.03)",
      }}>
        <h2 style={{ fontWeight: 900, fontSize: 24, marginBottom: 12 }}>Want to generate your own custom unit plans?</h2>
        <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 24 }}>
          Use PickleNickAI to generate unlimited AC9-aligned unit plans, lesson plans, rubrics, and more.
        </p>
        <Link href="/picklenickai" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "14px 28px",
          background: "var(--primary)",
          color: "#fff", borderRadius: "var(--radius-full)",
          fontWeight: 700, fontSize: 16,
          textDecoration: "none",
          boxShadow: "0 0 30px rgba(99,102,241,0.4)",
        }}>
          Start using PickleNickAI free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #ffffff;
          --surface: #ffffff;
          --surface-2: #f8fafc;
          --text: #0f172a;
          --text-2: #475569;
          --text-3: #94a3b8;
          --border: #e2e8f0;
          --border-subtle: #f1f5f9;
          --primary: #6366f1;
          --primary-hover: #4f46e5;
          --primary-dim: rgba(99,102,241,0.08);
          --radius: 8px;
          --radius-lg: 12px;
          --radius-full: 9999px;
          --shadow-lg: 0 4px 20px rgba(0,0,0,0.08);
          --ease: cubic-bezier(0.25, 0.1, 0.25, 1);
        }
        [data-theme="dark"] {
          --bg: #0f172a;
          --surface: #1e293b;
          --surface-2: #0f172a;
          --text: #f1f5f9;
          --text-2: #94a3b8;
          --text-3: #64748b;
          --border: #334155;
          --border-subtle: #1e293b;
          --primary-dim: rgba(99,102,241,0.15);
        }
        .unit-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        body { background: var(--bg); }
        input::placeholder { color: var(--text-3); }
        input:focus { border-color: var(--primary) !important; }
      `}</style>
    </div>
  );
}
