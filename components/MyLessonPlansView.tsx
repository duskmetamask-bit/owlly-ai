"use client";
import { useState } from "react";
import { useQuery, useConvex } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface LessonPlanItem {
  _id: string;
  title: string;
  content: string;
  yearLevel?: string;
  subject?: string;
  createdAt: number;
  type: string;
}

interface MyLessonPlansViewProps {
  teacherId?: string;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function extractPreview(content: string, maxLen = 160): string {
  const stripped = content
    .replace(/^#.*$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^#+/gm, "")
    .trim();
  return stripped.slice(0, maxLen) + (stripped.length > maxLen ? "…" : "");
}

export default function MyLessonPlansView({ teacherId }: MyLessonPlansViewProps) {
  const convex = useConvex();
  const lessonPlans = useQuery(
    api.lessonHistory.query.listForTeacherByType,
    teacherId ? { teacherId: teacherId as Id<"teachers">, type: "lesson_plan" } : "skip"
  ) as (LessonPlanItem | null)[] | undefined;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "this_week" | "this_month">("all");

  const selected = lessonPlans?.find(p => p._id === selectedId);

  const filtered = lessonPlans
    ? lessonPlans.filter(p => {
        if (filter === "this_week") return p.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (filter === "this_month") return p.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000;
        return true;
      })
    : [];

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson plan?")) return;
    setDeleting(id);
    try {
      await convex.mutation("lessonHistory/deleteItem", { id });
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setDeleting(null);
    }
  }

  async function downloadPdf(content: string, title: string) {
    try {
      const res = await fetch("/api/export/chat-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, label: title }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF export failed");
    }
  }

  if (!teacherId) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-2)" }}>
        <p>Sign in to see your saved lesson plans.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      {/* ── Left: list ── */}
      <div style={{
        width: 360,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>My Lesson Plans</h2>
              <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0 }}>
                {lessonPlans === undefined ? "…" : `${filtered.length} plan${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "this_week", "this_month"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  background: filter === f ? "var(--primary)" : "var(--surface)",
                  color: filter === f ? "#fff" : "var(--text-2)",
                  border: `1px solid ${filter === f ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f === "all" ? "All" : f === "this_week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {lessonPlans === undefined ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-3)" }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-3)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
              <p style={{ fontSize: 13, margin: 0 }}>No lesson plans yet.</p>
              <p style={{ fontSize: 12, margin: "6px 0 0" }}>Generate one in the Chat tab and click Save.</p>
            </div>
          ) : (
            filtered.map(plan => (
              <div
                key={plan._id}
                onClick={() => setSelectedId(plan._id)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  marginBottom: 4,
                  background: selectedId === plan._id ? "var(--primary-dim)" : "transparent",
                  border: `1.5px solid ${selectedId === plan._id ? "var(--primary)" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: selectedId === plan._id ? "var(--primary)" : "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 3,
                    }}>
                      {plan.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 4 }}>
                      {plan.yearLevel || "—"}{plan.yearLevel && plan.subject ? " · " : ""}{plan.subject || ""}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {extractPreview(plan.content, 80)}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {formatDate(plan.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: preview ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {!selected ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-3)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: 12 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p style={{ fontSize: 14 }}>Select a lesson plan to preview</p>
          </div>
        ) : (
          <>
            {/* Preview header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{selected.title}</h2>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-2)" }}>
                  <span>{selected.yearLevel || "—"}</span>
                  <span>{selected.subject || "—"}</span>
                  <span>{formatDate(selected.createdAt)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => downloadPdf(selected.content, selected.title)}
                  style={{
                    padding: "8px 16px",
                    background: "#4F46E5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  PDF
                </button>
                <button
                  onClick={() => handleDelete(selected._id)}
                  disabled={deleting === selected._id}
                  style={{
                    padding: "8px 16px",
                    background: deleting === selected._id ? "#fca5a5" : "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: deleting === selected._id ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  {deleting === selected._id ? "…" : "Delete"}
                </button>
              </div>
            </div>

            {/* Content preview */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "24px 28px",
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--text)",
              whiteSpace: "pre-wrap",
              overflowY: "auto",
              maxHeight: "calc(100vh - 240px)",
            }}>
              {selected.content}
            </div>
          </>
        )}
      </div>

      <style>{`
        .lesson-plans-list::-webkit-scrollbar { width: 4px; }
        .lesson-plans-list::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
