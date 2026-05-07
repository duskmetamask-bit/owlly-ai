"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── AC9 Strand Color Map ──────────────────────────────────────────────────
const STRAND_COLORS: Record<string, string> = {
  M: "#f59e0b",  // Mathematics
  E: "#3b82f6",  // English
  S: "#22c55e",  // Science
  H: "#f97316",  // Humanities
  A: "#a855f7",  // The Arts
  T: "#ec4899",  // Health / Technologies
  // fallbacks
  HA: "#f97316",
  SC: "#22c55e",
  EN: "#3b82f6",
  MA: "#f59e0b",
  AR: "#a855f7",
  TE: "#ef4444",
  L: "#06b6d4",
};

const STRAND_NAMES: Record<string, string> = {
  M: "Mathematics", E: "English", S: "Science",
  H: "Humanities", A: "The Arts", T: "Technologies",
  HA: "HASS", SC: "Science", EN: "English",
  MA: "Mathematics", AR: "The Arts", TE: "Technologies",
  L: "Languages",
};

function getStrandColor(code: string): string {
  const letter = code.replace(/AC9/i, "").replace(/[0-9-]/g, "")[0]?.toUpperCase() || "M";
  return STRAND_COLORS[letter] || "#6366f1";
}

function getStrandName(code: string): string {
  const letter = code.replace(/AC9/i, "").replace(/[0-9-]/g, "")[0]?.toUpperCase() || "M";
  return STRAND_NAMES[letter] || "Curriculum";
}

function extractAC9Codes(content: string): { code: string; strand: string; color: string }[] {
  const regex = /AC9[A-Z0-9]{1,6}-\d{2}/gi;
  const matches = content.match(regex) || [];
  const seen = new Set<string>();
  return matches
    .filter(m => { const u = m.toUpperCase(); if (seen.has(u)) return false; seen.add(u); return true; })
    .map(code => ({
      code: code.toUpperCase(),
      strand: getStrandName(code),
      color: getStrandColor(code),
    }));
}

function AC9Pill({ code, strand, color }: { code: string; strand: string; color: string }) {
  return (
    <span title={strand} style={{
      display: "inline-block",
      background: color,
      color: "#fff",
      padding: "3px 9px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "0.05em",
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      boxShadow: `0 2px 6px ${color}55`,
      cursor: "default",
    }}>
      {code}
    </span>
  );
}

function SectionCard({ accentColor, children, style }: { accentColor: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      border: "1px solid #f0f0f0",
      borderLeft: `4px solid ${accentColor}`,
      padding: "18px 22px",
      marginBottom: 12,
      ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "#10b981", marginBottom: 10, // Owlly Emerald
    }}>{children}</div>
  );
}

// ─── "Why This?" Rationale Panel ──────────────────────────────────────────
function generateRationale(phases: string[], content: string): string[] {
  const reasons: string[] = [];
  const phaseText = phases.join(" ").toLowerCase();
  const hasIDo = phaseText.includes("i do") || phaseText.includes("model") || phaseText.includes("demonstrat");
  const hasWeDo = phaseText.includes("we do") || phaseText.includes("guided") || phaseText.includes("collaborat");
  const hasYouDo = phaseText.includes("you do") || phaseText.includes("independent") || phaseText.includes("solo");

  if (hasIDo && hasWeDo && hasYouDo) {
    reasons.push("Sequenced using the Gradual Release Model — explicit instruction, guided practice, then independent application to maximise understanding and retention.");
  } else if (hasIDo && hasWeDo) {
    reasons.push("Structured with direct instruction followed by guided practice to build confidence before independent work.");
  } else if (hasYouDo) {
    reasons.push("Includes independent practice phase to develop student autonomy and check comprehension.");
  }

  if (phaseText.includes("warm") || phaseText.includes("review") || phaseText.includes("activat")) {
    reasons.push("Begins with a warm-up or activation activity to engage prior knowledge and prepare students for new learning.");
  }
  if (phaseText.includes("plenar") || phaseText.includes("clos") || phaseText.includes("exit")) {
    reasons.push("Includes a plenary or exit check to assess 80%+ student mastery and consolidate key takeaways.");
  }
  if (content.includes("differenti") || content.includes("scaffold") || content.includes("support")) {
    reasons.push("Built-in differentiation strategies ensure learners at every level are supported and challenged appropriately.");
  }
  if (phases.length >= 5) {
    reasons.push(phases.length + " clearly defined phases provide structure and pacing so students always know where they are in the lesson.");
  }

  if (reasons.length === 0) {
    reasons.push("Designed to build conceptual understanding before procedural fluency - a research-backed sequence for lasting learning.");
  }
  return reasons.slice(0, 3);
}

function WhyPanel({ rationale }: { rationale: string[] }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(open ? bodyRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <div style={{
      border: `1.5px dashed #fde68a`,           // Owlly Gold border
      borderRadius: 12,
      marginBottom: 16,
      overflow: "hidden",
      transition: "border-color 0.3s ease",
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: open ? "#fef3c7" : "transparent",  // Pale Gold
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.3s ease",
        }}
      >
        <span style={{ fontSize: 18 }}>💡</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e", letterSpacing: "0.02em" }}>  // Dark amber
          Why this lesson?
        </span>
        <span style={{ marginLeft: "auto", fontSize: 16, color: "#f59e0b", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
          ▼
        </span>
      </button>

      {/* Body */}
      <div
        ref={bodyRef}
        style={{
          height: height === undefined ? "auto" : `${height}px`,
          overflow: "hidden",
          transition: "height 0.3s ease",
        }}
      >
        <div style={{ padding: "0 16px 14px" }}>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {rationale.map((r, i) => (
              <li key={i} style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface LessonPlanDisplayProps {
  content: string;
  onSave?: () => void;
  onDownloadTxt?: () => void;
  onDownloadPdf?: () => void;
  onDownloadDOCX?: () => void;
  onDownloadPPTX?: () => void;
  onSaveToGoogleDrive?: () => void;
  compact?: boolean;
}

export default function LessonPlanDisplay({ content, onSave, onDownloadTxt, onDownloadPdf, onDownloadDOCX, onDownloadPPTX, onSaveToGoogleDrive, compact }: LessonPlanDisplayProps) {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionIds = ["header", "walttibwilf", "phases", "materials", "differentiation", "exitticket", "ac9strip", "whypanel"];
  const sectionOrder = ["header", "walttibwilf", "whypanel", "phases", "materials", "differentiation", "exitticket", "ac9strip"];

  // Staggered reveal animation
  useEffect(() => {
    if (!content) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    sectionOrder.forEach((id, i) => {
      const t = setTimeout(() => {
        setVisibleSections(prev => new Set([...prev, id]));
      }, i * 80);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [content]);

  const withAnimation = (id: string, el: React.ReactNode) => {
    const isVisible = visibleSections.has(id);
    return (
      <div style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
      }}>
        {el}
      </div>
    );
  };

  const lines = content.split("\n");
  let title = "Lesson Plan";
  let walt = "";
  let tib = "";
  let wilf = "";
  const phases: { name: string; duration: string; teacher: string; students: string; resources: string; cfu: string }[] = [];
  let materials = "";
  let differentiation = "";
  let exitTicket = "";

  // Parse title
  const titleMatch = content.match(/^#\s+(.+?)\n/im);
  if (titleMatch) title = titleMatch[1].trim();

  // Parse WALT / TIB / WILF
  const waltMatch = content.match(/\*\*WALT[\s:]*\*\*(.+?)(?:\n|$)/i) || content.match(/WALT[\s:—]*(.+?)(?:\n|$)/i);
  const tibMatch = content.match(/\*\*TIB[\s:]*\*\*(.+?)(?:\n|$)/i) || content.match(/TIB[\s:—]*(.+?)(?:\n|$)/i);
  const wilfMatch = content.match(/\*\*WILF[\s:]*\*\*(.+?)(?:\n|$)/i) || content.match(/WILF[\s:—]*(.+?)(?:\n|$)/i);
  if (waltMatch) walt = waltMatch[1].replace(/^\s*[*_]+\s*/, "").trim();
  if (tibMatch) tib = tibMatch[1].replace(/^\s*[*_]+\s*/, "").trim();
  if (wilfMatch) wilf = wilfMatch[1].replace(/^\s*[*_]+\s*/, "").trim();

  // Parse AC9 codes
  const ac9Data = extractAC9Codes(content);

  // Parse phase table — 3 strategies for resilience
  // Strategy 1: pipe table rows
  const tableRows = content.match(/\|[^\n]+\|/g) || [];
  const phaseNames: string[] = [];
  for (const row of tableRows) {
    const cells = row.split("|").map(c => c.replace(/[*#\n]/g, "").trim()).filter(c => c);
    if (cells.length >= 4 && (cells[0].match(/\d+\s*min/i) || cells[0].match(/Phase/i))) {
      phases.push({
        name: cells[0] || "",
        duration: cells[1] || "",
        teacher: cells[2] || "",
        students: cells[3] || "",
        resources: cells[4] || "",
        cfu: cells[5] || "",
      });
      if (cells[0]) phaseNames.push(cells[0]);
    }
  }

  // Strategy 2: block-based phase parsing (non-table markdown)
  if (phases.length === 0) {
    const phasePatterns = [
      /(?:^|\n)(###?\s*Phase\s*\d*[^#\n]*|(?:^|\n)(?:Hook|Tuning\s*In|I\s*Do|We\s*Do|You\s*Do|Explicit|Guided|Independent|Plenary|Conclusion|Reflection)[^\n]{0,50})\s*\n((?:\d+\s*min[^\n]*\n)?)((?:Teacher[:\s][^\n]{3,50}\n)?)((?:Students?[:\s][^\n]{3,50}\n)?)((?:Resources?[:\s][^\n]{3,50}\n)?)((?:CFU[:\s][^\n]{3,50}\n)?)/gim,
    ];
    for (const pattern of phasePatterns) {
      const matches = [...content.matchAll(new RegExp(pattern.source, pattern.flags))];
      for (const m of matches) {
        const phaseName = (m[1] || "").replace(/^#+\s*/, "").trim() || "Phase";
        const timeM = (m[2] || "").match(/\d+\s*min/i);
        const teacherM = (m[3] || "").replace(/Teacher[:\s]*/i, "").trim();
        const studentM = (m[4] || "").replace(/Students?[:\s]*/i, "").trim();
        if (teacherM || studentM) {
          phases.push({ name: phaseName, duration: timeM ? timeM[0] : "", teacher: teacherM, students: studentM, resources: "", cfu: "" });
          phaseNames.push(phaseName);
        }
      }
      if (phases.length > 0) break;
    }
  }

  // Strategy 3: heading-based blocks (### Hook / ## I Do etc.)
  if (phases.length === 0) {
    const headingBlocks = content.split(/(?=^#{1,3}\s*(?:Phase|Hook|I\s*Do|We\s*Do|You\s*Do|Explicit|Guided|Independent|Plenary|Conclusion|Reflection|Tuning))/gim);
    for (const block of headingBlocks) {
      const headingMatch = block.match(/^#{1,3}\s*(.+?)(?:\n|$)/);
      if (!headingMatch) continue;
      const name = headingMatch[1].trim();
      const timeM = block.match(/(\d+)\s*min/i);
      const teacherM = block.match(/(?:Teacher[:\s]*)([^\n]{3,60})/i);
      const studentM = block.match(/(?:Students?[:\s]*)([^\n]{3,60})/i);
      if (name && (timeM || teacherM || studentM)) {
        phases.push({
          name,
          duration: timeM ? timeM[1] + " min" : "",
          teacher: teacherM ? teacherM[1].trim() : "",
          students: studentM ? studentM[1].trim() : "",
          resources: "",
          cfu: "",
        });
        phaseNames.push(name);
      }
    }
  }

  // Parse Materials
  const matsMatch = content.match(/\*\*Materials?[\s:]*\*\*(.+?)[\s\S]*?(?:\n\n|\*\*|## )/i);
  if (matsMatch) materials = matsMatch[1].trim();

  // Parse Differentiation
  const diffMatch = content.match(/\*\*Differentiation[\s:]*\*\*(.+?)[\s\S]*?(?:\n\n|## |---)/i);
  if (diffMatch) differentiation = diffMatch[1].trim();

  // Parse Exit Ticket
  const exitMatch = content.match(/\*\*Exit Ticket[\s:]*\*\*(.+?)[\s\S]*?(?:\n\n|## )/i);
  if (exitMatch) exitTicket = exitMatch[1].trim();

  const rationale = generateRationale(phaseNames, content);
  const cp = compact;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: cp ? 340 : 820, margin: "0 auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {/* ── HEADER ── */}
        {withAnimation("header", (
          <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", padding: cp ? "12px 14px 10px" : "24px 28px 20px" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
              {onSave && <button onClick={onSave} data-save-btn style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>Save</button>}
              {onDownloadTxt && <button onClick={onDownloadTxt} style={{ padding: "7px 16px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>TXT</button>}
              {onDownloadPdf && <button onClick={onDownloadPdf} style={{ padding: "7px 16px", background: "#fff", color: "#312e81", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>PDF</button>}
              {onDownloadDOCX && <button onClick={onDownloadDOCX} style={{ padding: "7px 16px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>DOCX</button>}
              {onDownloadPPTX && <button onClick={onDownloadPPTX} style={{ padding: "7px 16px", background: "#22D3EE", color: "#0a0a0a", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>📑 PPTX</button>}
              {onSaveToGoogleDrive && <button onClick={onSaveToGoogleDrive} style={{ padding: "7px 16px", background: "#1DB954", color: "#fff", border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "inline-flex", alignItems: "center", gap: 6 }}>📁 Google Drive</button>}
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>Owlly</div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Lesson Plan</div>
                  </div>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{title}</h2>
              </div>
              {ac9Data.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "flex-start" }}>
                  {ac9Data.slice(0, 6).map(d => (
                    <AC9Pill key={d.code} code={d.code} strand={d.strand} color={d.color} />
                  ))}
                </div>
              )}
            </div>

            {/* AC9 Strand Strip */}
            {ac9Data.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginRight: 2 }}>AC9:</span>
                {ac9Data.slice(0, 8).map(d => (
                  <AC9Pill key={d.code} code={d.code} strand={d.strand} color={d.color} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ── BODY ── */}
        <div style={{ padding: cp ? "12px 14px" : "24px 28px" }}>

          {/* Why This? Panel */}
          {withAnimation("whypanel", (
            <WhyPanel rationale={rationale} />
          ))}

          {/* WALT / TIB / WILF */}
          {withAnimation("walttibwilf", (walt || tib || wilf) && (
            <SectionCard accentColor="#10b981"> {/* Owlly Emerald */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#d1fae5", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}> {/* Pale Emerald */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <SectionLabel>Learning Intentions</SectionLabel>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {walt && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: "#10b981", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", minWidth: 60 }}>WALT</span>
                    <span style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6, fontWeight: 500 }}>{walt}</span>
                  </div>
                )}
                {tib && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: "#f59e0b", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", minWidth: 60 }}>TIB</span>
                    <span style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6, fontStyle: "italic" }}>{tib}</span>
                  </div>
                )}
                {wilf && (
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ background: "#f59e0b", color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", minWidth: 60 }}>WILF</span>
                    <span style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>{wilf}</span>
                  </div>
                )}
              </div>
            </SectionCard>
          ))}

          {/* Phase Table */}
          {withAnimation("phases", phases.length > 0 && (
            <SectionCard accentColor="#f59e0b"> {/* Owlly Gold */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "#fef3c7", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>⏱️</div>
                <SectionLabel>Lesson Structure</SectionLabel>
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Phase", "Duration", "Teacher Does", "Students Do", "Resources", "CFU"].map(h => (
                        <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#10b981", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {phases.slice(0, 12).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: i < Math.min(phases.length, 12) - 1 ? "1px solid #f0f0f0" : "none" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10b981", fontSize: 12 }}>{row.name}</td>
                        <td style={{ padding: "10px 12px", color: "#1e293b", fontSize: 12, fontWeight: 600 }}>{row.duration}</td>
                        <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12 }}>{row.teacher}</td>
                        <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12 }}>{row.students}</td>
                        <td style={{ padding: "10px 12px", color: "#374151", fontSize: 12 }}>{row.resources}</td>
                        <td style={{ padding: "10px 12px", color: "#f59e0b", fontSize: 12 }}>{row.cfu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ))}

          {/* Materials */}
          {withAnimation("materials", materials && (
            <SectionCard accentColor="#f59e0b">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#fef3c7", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>📦</div>
                <SectionLabel>Materials</SectionLabel>
              </div>
              <div style={{ background: "#fffbeb", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{materials}</ReactMarkdown>
              </div>
            </SectionCard>
          ))}

          {/* Differentiation */}
          {withAnimation("differentiation", differentiation && (
            <SectionCard accentColor="#10b981">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#d1fae5", borderRadius: 8, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <SectionLabel>Differentiation</SectionLabel>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{differentiation}</ReactMarkdown>
              </div>
            </SectionCard>
          ))}

          {/* Exit Ticket */}
          {withAnimation("exitticket", exitTicket && (
            <SectionCard accentColor="#ec4899">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "#fce7f3", borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>🎫</div>
                <SectionLabel>Exit Ticket</SectionLabel>
              </div>
              <div style={{ background: "#fdf2f8", borderRadius: 10, padding: "14px 16px" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{exitTicket}</ReactMarkdown>
              </div>
            </SectionCard>
          ))}

          {/* AC9 Bottom Strip — only if not already shown in header */}
          {withAnimation("ac9strip", ac9Data.length === 0 && (
            <div style={{
              background: "#f8f7ff",
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#94a3b8",
              fontSize: 12,
              fontStyle: "italic",
              marginBottom: 4,
            }}>
              <span>📋</span>
              <span>Curriculum codes will appear here once generated with AC9 content</span>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "10px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Generated by Owlly</span>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>{new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}