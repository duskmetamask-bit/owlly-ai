"use client";
import { useState, useEffect, useRef } from "react";
import { useConvex } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { downloadTxt, downloadPdf, downloadDOCX } from "@/components/exportUtils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseLessonPlan(raw: string) {
  if (!raw) return null;
  const titleMatch = raw.match(/(?:Lesson\s*Plan[\s\n]*)?(Year\s*\d[\s\w\u2013\u2014]*)/i);
  const title = titleMatch ? titleMatch[1].trim() : "Lesson Plan";
  const durMatch = raw.match(/(\d+)\s*min/i);
  const duration = durMatch ? durMatch[1] + " min" : "";
  const typeMatch = raw.match(/(Explicit\s*Teaching|Inquiry[- ]Based|Guided\s*Practice|Independent\s*Task|Flipped\s*Classroom)/i);
  const lessonType = typeMatch ? typeMatch[1] : "";
  const ac9Codes = raw.match(/AC9\w{1,3}\d{1,2}-\d{2}/g) || [];
  const waltMatch = raw.match(/(?:WALT[:\s]+)([\s\S]*?)(?=TIB|\n\n|$)/i);
  const walt = waltMatch ? waltMatch[1].replace(/\*\*/g, "").trim() : "";
  const tibMatch = raw.match(/(?:TIB[:\s]+|Purpose[\s:]+)([\s\S]*?)(?=Success|WILF|\n\n|WALT|$)/i);
  const tib = tibMatch ? tibMatch[1].replace(/\*\*/g, "").trim() : "";
  const wilfSection = raw.match(/(?:WILF[:\s]*|Success\s*Criteria[:\s]*)([\s\S]*?)(?=Phase|Materials|Resources|Differentiation|Exit|\n\n)/i);
  const wilfItems = wilfSection
    ? wilfSection[1].split(/[\n•\-\*]/).map(l => l.replace(/\*\*/g, "").trim()).filter(l => l && l.length > 3)
    : [];
  const phases: { name: string; time: string; teacher: string; students: string }[] = [];
  const phaseBlocks = raw.match(/(?:Phase|Timing|Input|Process|Activity)[\s\S]{0,40}?(?:Hook|Tuning\s*In|I\s*Do|We\s*Do|You\s*Do|Plenary|Conclusion|Explicit|Guided|Independent|Reflection)[\s\S]{0,200}?(?=\n\n|Materials|Resources|Differentiation|Exit|$)/gi) || [];
  const phaseNames = ["Hook", "Tuning In", "I Do", "We Do", "You Do", "Plenary", "Conclusion", "Explicit Teaching", "Guided Practice", "Independent", "Reflection"];
  for (const block of phaseBlocks) {
    for (const pname of phaseNames) {
      if (block.toLowerCase().includes(pname.toLowerCase())) {
        const timeM = block.match(/(\d+)\s*min/);
        const teacherM = block.match(/(?:Teacher[:\s]*|Teacher's\s*Role[:\s]*)([^\n\-]{3,30})/i);
        const studentM = block.match(/(?:Students?[:\s]*|Students?'\s*Role[:\s]*)([^\n\-]{3,30})/i);
        phases.push({ name: pname, time: timeM ? timeM[1] + " min" : "", teacher: teacherM ? teacherM[1].trim() : "", students: studentM ? studentM[1].trim() : "" });
        break;
      }
    }
  }
  const matSection = raw.match(/(?:Materials|Resources)[:\s]*\n?([\s\S]*?)(?=Differentiation|Exit|Success|$)/i);
  const materials: string[] = [];
  if (matSection) {
    matSection[1].split(/[\n•\-\*]/).forEach(l => {
      const t = l.replace(/\*\*/g, "").trim();
      if (t && t.length > 2) materials.push(t);
    });
  }
  const diffEAL = raw.match(/(?:EAL|ESL)[\s:]*([^\n\-]{10,200})/i);
  const diffExt = raw.match(/(?:Extension|Gifted|Accelerate)[\s:]*([^\n\-]{10,200})/i);
  const diffSupport = raw.match(/(?:Support|Additional)[\s:]*([^\n\-]{10,200})/i);
  const exitMatch = raw.match(/(?:Exit\s*Ticket|Exit\s*Slip)[:\s]*([^\n]{10,200})/i);
  const exitTicket = exitMatch ? exitMatch[1].replace(/\*\*/g, "").trim() : "";
  return { title, duration, lessonType, ac9Codes, walt, tib, wilfItems, phases, materials, diffEAL: diffEAL ? diffEAL[1].trim() : "", diffExt: diffExt ? diffExt[1].trim() : "", diffSupport: diffSupport ? diffSupport[1].trim() : "", exitTicket };
}

// ─── LessonPlanDisplay ────────────────────────────────────────────────────

function AC9Pill({ code }: { code: string }) {
  return (
    <span style={{ display: "inline-block", background: "#f59e0b", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "monospace" }}>
      {code}
    </span>
  );
}

function SectionCard({ accentColor, children }: { accentColor: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", borderLeft: `4px solid ${accentColor}`, padding: "20px 24px", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#f59e0b", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function PhaseIcon({ name }: { name: string }) {
  const icons: Record<string, string> = { "Hook": "H", "Tuning In": "T", "I Do": "1", "We Do": "2", "You Do": "3", "Plenary": "P", "Conclusion": "C", "Explicit Teaching": "E", "Guided Practice": "G", "Independent": "I", "Reflection": "R" };
  return <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>{icons[name] || "L"}</span>;
}

export function LessonPlanDisplay({ content }: { content: string }) {
  const parsed = parseLessonPlan(content);
  const hasContent = parsed && (parsed.walt || parsed.phases.length > 0 || parsed.materials.length > 0);

  if (!hasContent) {
    return (
      <div style={{ whiteSpace: "pre-wrap", fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.8, color: "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: "28px 32px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>Owlly</div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Lesson Plan</div>
                </div>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{parsed.title}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              {parsed.duration && (
                <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{parsed.duration}</span>
                </div>
              )}
              {parsed.lessonType && (
                <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{parsed.lessonType}</span>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "flex-end" }}>
                {parsed.ac9Codes.slice(0, 4).map(code => <AC9Pill key={code} code={code} />)}
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: "28px 32px" }}>
          {/* Learning Intention */}
          {(parsed.walt || parsed.tib) && (
            <SectionCard accentColor="#f59e0b">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#eef2ff", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <SectionLabel>Learning Intention</SectionLabel>
              </div>
              {parsed.walt && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: parsed.tib ? 12 : 0 }}>
                  <div style={{ background: "#eef2ff", color: "#4338ca", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>WALT</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "#1e293b", margin: 0 }}>{parsed.walt}</p>
                </div>
              )}
              {parsed.tib && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ background: "#eef2ff", color: "#4338ca", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>TIB</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", margin: 0, fontStyle: "italic" }}>{parsed.tib}</p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Success Criteria / WILF */}
          {parsed.wilfItems.length > 0 && (
            <SectionCard accentColor="#22c55e">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <SectionLabel>Success Criteria — What I'm Looking For</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {parsed.wilfItems.slice(0, 8).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "#f0fdf4", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontSize: 11, color: "#22c55e", fontWeight: 800 }}>✓</div>
                    <span style={{ fontSize: 14, lineHeight: 1.7, color: "#1e293b" }}>{item.replace(/^\s*[-•*]\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Lesson Structure */}
          {parsed.phases.length > 0 && (
            <SectionCard accentColor="#f59e0b">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "#fef3c7", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <SectionLabel>Lesson Structure</SectionLabel>
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f5f3ff" }}>
                      {["Phase", "Duration", "Teacher", "Students"].map((h, i) => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f59e0b", borderBottom: "2px solid #e0e7ff", ...(i === 0 ? { width: 130 } : {}) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.phases.map((p, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < parsed.phases.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <PhaseIcon name={p.name} />
                            <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 12 }}>{p.time || "—"}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569", fontSize: 13 }}>{p.teacher || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "#475569", fontSize: 13 }}>{p.students || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Materials */}
          {parsed.materials.length > 0 && (
            <SectionCard accentColor="#f97316">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#fff7ed", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📦</div>
                <SectionLabel>Resources & Materials</SectionLabel>
              </div>
              <div style={{ background: "#fff7ed", borderRadius: 12, padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {parsed.materials.slice(0, 10).map((m, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 8, padding: "5px 12px", fontSize: 13, color: "#9a3412", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12 }}>•</span>{m}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Differentiation */}
          {(parsed.diffEAL || parsed.diffExt || parsed.diffSupport) && (
            <SectionCard accentColor="#8b5cf6">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#ede9fe", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💡</div>
                <SectionLabel>Differentiation</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {parsed.diffEAL && (
                  <div style={{ background: "#ede9fe", borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14 }}>🌍</span>
                      <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7c3aed" }}>EAL / ESL Learners</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4c1d95", margin: 0 }}>{parsed.diffEAL}</p>
                  </div>
                )}
                {parsed.diffExt && (
                  <div style={{ background: "#fef3c7", borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14 }}>🚀</span>
                      <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b45309" }}>Extension / Gifted</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#92400e", margin: 0 }}>{parsed.diffExt}</p>
                  </div>
                )}
                {parsed.diffSupport && (
                  <div style={{ background: "#cffafe", borderRadius: 12, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14 }}>💛</span>
                      <span style={{ fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0e7490" }}>Additional Support</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#155e75", margin: 0 }}>{parsed.diffSupport}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Exit Ticket */}
          {parsed.exitTicket && (
            <SectionCard accentColor="#ef4444">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#fef2f2", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚪</div>
                <SectionLabel>Exit Ticket</SectionLabel>
              </div>
              <div style={{ background: "#fef2f2", borderRadius: 12, padding: "16px 20px", border: "1px solid #fecaca" }}>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#991b1b", margin: 0, fontStyle: "italic", fontWeight: 500 }}>"{parsed.exitTicket}"</p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Generated by Owlly</span>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>{new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}

// ─── PlannerView ────────────────────────────────────────────────────────────

const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

export default function PlannerView({ teacherId }: { teacherId?: string }) {
  const convex = useConvex();
  const controllerRef = useRef<AbortController | null>(null);
  const [mode, setMode] = useState<"lesson" | "unit">("lesson");
  const [subject, setSubject] = useState("Mathematics");
  const [yearLevel, setYearLevel] = useState("Year 4");
  const [topic, setTopic] = useState("");
  const [weeks, setWeeks] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // Pre-fill from Library "Use in App" — read pending unit from localStorage
  useEffect(() => {
    const pending = localStorage.getItem("pn_pending_unit");
    if (pending) {
      try {
        const unit = JSON.parse(pending);
        // Extract subject from the unit's curriculum or subject field
        if (unit.subject) {
          const match = SUBJECTS.find(s => unit.subject.toLowerCase().includes(s.toLowerCase()));
          if (match) setSubject(match);
        }
        if (unit.yearLevel) {
          const yl = unit.yearLevel.replace("F", "Pre-Primary").replace("F-6", "Year 4");
          const ylMatch = YEAR_LEVELS.find(y => yl.toLowerCase().includes(y.toLowerCase().replace("year ", "")));
          if (ylMatch) setYearLevel(ylMatch);
          else setYearLevel(yl);
        }
        if (unit.title) {
          // Strip "Unit Plan: " prefix if present
          setTopic(unit.title.replace(/^Unit\s*Plan[:\s]*/i, "").trim());
        }
        // Clear so it only applies once
        localStorage.removeItem("pn_pending_unit");
      } catch { /* ignore malformed JSON */ }
    }
  }, []);

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic"); return; }
    setError("");
    setLoading(true);
    setResult("");

    controllerRef.current = new AbortController();
    let accumulated = "";

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, yearLevel, topic, weeks: mode === "unit" ? weeks : undefined }),
        signal: controllerRef.current.signal,
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "done" || data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text") accumulated += parsed.content;
            else if (parsed.type === "error") { setError(parsed.content || "Generation failed"); controllerRef.current?.abort(); return; }
          } catch { /* skip */ }
        }
      }

      setResult(accumulated);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("abort") || controllerRef.current?.signal.aborted) return;
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function savePlan() {
    if (!result || !teacherId) return;
    const title = `Lesson Plan — ${subject} ${yearLevel} — ${topic}`;
    try {
      await convex.mutation("lessonHistory/saveLessonPlan", {
        teacherId: teacherId as Id<"teachers">,
        title,
        content: result,
        yearLevel,
        subject,
      });
      const btns = document.querySelectorAll(`[data-save-btn]`);
      btns.forEach(b => {
        const el = b as HTMLElement;
        el.textContent = "✓ Saved";
        el.style.color = "#22c55e";
        setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500);
      });
    } catch (e) {
      console.error("Failed to save lesson plan", e);
      alert("Failed to save. Please try again.");
    }
  }

  async function saveUnitPlan() {
    if (!result || !teacherId) return;
    const title = `Unit Plan — ${subject} ${yearLevel} — ${topic}`;
    try {
      await convex.mutation("lessonHistory/saveUnitPlan", {
        teacherId: teacherId as Id<"teachers">,
        title,
        content: result,
        yearLevel,
        subject,
      });
      const btns = document.querySelectorAll(`[data-save-btn]`);
      btns.forEach(b => {
        const el = b as HTMLElement;
        el.textContent = "✓ Saved";
        el.style.color = "#22c55e";
        setTimeout(() => { el.textContent = "Save"; el.style.color = ""; }, 1500);
      });
    } catch (e) {
      console.error("Failed to save unit plan", e);
      alert("Failed to save. Please try again.");
    }
  }

  function download(format: "txt" | "pdf" | "pptx" | "docx" | "google-docs") {
    const text = result;
    if (!text) return;
    const prefix = mode === "unit" ? "UnitPlan" : "LessonPlan";
    if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `${prefix}_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else if (format === "google-docs") {
      const token = localStorage.getItem("pn_gdrive_access_token");
      const refreshToken = localStorage.getItem("pn_gdrive_refresh_token");
      if (!token && !refreshToken) {
        const width = 600, height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(`/api/auth/google?redirect=popup`, "google_auth", `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`);
        const done = new Promise<string>((resolve, reject) => {
          const handler = (e: MessageEvent) => { if (e.data?.type === "gdrive_connected") { cleanup(); resolve("connected"); } };
          const poll = setInterval(() => { if (!popup || popup.closed) { cleanup(); reject(new Error("closed")); } }, 500);
          const cleanup = () => { window.removeEventListener("message", handler); clearInterval(poll); };
          window.addEventListener("message", handler);
        });
        try { done.catch(() => alert("Google authorization failed.")); } catch { /* noop */ }
        return;
      }
      fetch("/api/export/google-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, title: `LessonPlan_${subject}_${yearLevel}`, accessToken: token, refreshToken }),
      }).then(res => res.status === 401 ? (localStorage.removeItem("pn_gdrive_access_token"), localStorage.removeItem("pn_gdrive_refresh_token")) : res.json()).then(data => {
        if (data.documentUrl) window.open(data.documentUrl, "_blank");
        else if (data.authUrl) window.open(data.authUrl, "_blank");
      }).catch(() => alert("Google Docs export failed."));
    } else {
      const endpoint = format === "pdf" ? "chat-to-pdf" : format;
      fetch(`/api/export/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, title: `LessonPlan_${subject}_${yearLevel}` }),
      })
        .then(res => { if (!res.ok) throw new Error(); return res.blob(); })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `LessonPlan_${subject}_${yearLevel}_${topic.slice(0, 20)}.${format === "docx" ? "docx" : format === "pptx" ? "pptx" : "pdf"}`; a.click();
          URL.revokeObjectURL(url);
        })
        .catch(() => {
          const blob = new Blob([text], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url;
          a.download = `LessonPlan_${subject}_${yearLevel}_${topic.slice(0, 20)}.txt`; a.click();
          URL.revokeObjectURL(url);
        });
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--surface)", color: "var(--text)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius)", fontSize: 14, outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-dim)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-hover)", fontSize: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 }}>
            {mode === "unit" ? "Unit Planner" : "Lesson Planner"}
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>
            {mode === "unit" ? "Generate AC9-aligned unit plans with weekly breakdown" : "Generate AC9-aligned lesson plans in seconds"}
          </p>
        </div>
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 0, background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius)", padding: 3 }}>
          {(["lesson", "unit"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(""); }}
              style={{ padding: "6px 16px", borderRadius: "calc(var(--radius) - 2px)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: mode === m ? "var(--primary)" : "transparent", color: mode === m ? "#fff" : "var(--text-3)",
                border: "none", transition: "all 0.15s" }}>
              {m === "lesson" ? "Lesson" : "Unit Plan"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", minHeight: "calc(100vh - 74px)" }}>
        {/* Form Panel */}
        <div style={{ padding: "24px 28px", borderRight: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Subject */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Year Level */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Year Level</label>
              <select value={yearLevel} onChange={e => setYearLevel(e.target.value)} style={inputStyle}>
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Topic / Focus</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={mode === "unit" ? "e.g. Colonial Australia, Fractions..." : "e.g. Multiplication, Narrative Writing..."}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
              />
            </div>

            {/* Weeks (unit mode only) */}
            {mode === "unit" && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Duration</label>
                <select value={weeks} onChange={e => setWeeks(Number(e.target.value))} style={inputStyle}>
                  {[4, 5, 6, 7, 8, 9, 10].map(w => <option key={w}>{w} weeks</option>)}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "var(--radius)", color: "var(--danger)", fontSize: 13, marginTop: 14 }}>
              {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: "100%", padding: "12px", marginTop: 14,
              background: loading ? "var(--surface)" : "var(--primary)",
              color: loading ? "var(--text-3)" : "#fff",
              border: "none", borderRadius: "var(--radius)",
              fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Generating...</>
            ) : (
              <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>Generate {mode === "unit" ? "Unit Plan" : "Lesson Plan"}</>
            )}
          </button>
          {loading && (
            <button
              onClick={() => { controllerRef.current?.abort(); }}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "8px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "var(--radius)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Cancel Generation
            </button>
          )}
        </div>

        {/* Result Panel */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Generated {mode === "unit" ? "Unit Plan" : "Lesson Plan"}</h2>
            {result && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => mode === "unit" ? saveUnitPlan() : savePlan()} data-save-btn style={{ padding: "6px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>Save</button>
                <button onClick={() => download("txt")} style={{ padding: "6px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>TXT</button>
                <button onClick={() => download("pdf")} style={{ padding: "6px 14px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>PDF</button>
                <button onClick={() => download("docx")} style={{ padding: "6px 14px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>DOCX</button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {result ? (
              <LessonPlanDisplay content={result} />
            ) : (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, textAlign: "center", paddingTop: 80, paddingBottom: 80, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <div style={{ background: "rgba(245,158,11,0.15)", borderRadius: 10, padding: "10px 14px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", marginBottom: 6 }}>Your {mode === "unit" ? "unit plan" : "lesson plan"} will appear here</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>Fill in the form — click Generate</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
