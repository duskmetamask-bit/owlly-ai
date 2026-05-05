"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import LessonPlanDisplay from "./LessonPlanDisplay";
import RubricDisplay from "./RubricDisplay";
import AssessmentDisplay from "./AssessmentDisplay";
import WritingFeedbackDisplay from "./WritingFeedbackDisplay";

interface Message { role: "user" | "assistant"; content: string; streaming?: boolean; contentType?: string | null; }
interface Profile { name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string; }

const QUICK_PROMPTS = [
  { label: "Behaviour support plan", prompt: "Create a behaviour support plan for a Year 4 student who..." },
  { label: "Report comment", prompt: "Write a report comment for a Year 5 student who..." },
  { label: "Parent email", prompt: "Write a parent email about..." },
  { label: "Lesson plan", prompt: "Write a lesson plan on..." },
  { label: "AC9 codes", prompt: "What are the AC9 codes for..." },
  { label: "Differentiation", prompt: "Help me differentiate this lesson for..." },
];

const SUGGESTION_RULES: { keywords: string[]; label: string; fill: string }[] = [
  { keywords: ["lesson plan", "walt", "tib", "walf", "lesson"], label: "Generate lesson plan", fill: "Write a complete lesson plan with WALT, TIB and WILF for" },
  { keywords: ["rubric", "assessment criteria", "marking criteria"], label: "Create rubric", fill: "Create an assessment rubric for" },
  { keywords: ["behaviour", "bsp", "behaviour support", "de-escalate"], label: "Behaviour support plan", fill: "Create a behaviour support plan for a Year" },
  { keywords: ["report comment", "report", "parent report"], label: "Write report comment", fill: "Write a report comment for a Year" },
  { keywords: ["differentiate", "eal", "gifted", "additional needs", "differentiation"], label: "Differentiate content", fill: "Differentiate this lesson for EAL/D learners," },
  { keywords: ["email parent", "parent email", "contact parent"], label: "Write parent email", fill: "Write a professional parent email about" },
  { keywords: ["ac9", "australian curriculum", "curriculum code"], label: "Look up AC9 codes", fill: "What are the AC9 codes for Year" },
  { keywords: ["worksheet", "activity", "task"], label: "Generate worksheet", fill: "Create a worksheet for" },
  { keywords: ["exit ticket", "exit pass", " AFL"], label: "Create exit ticket", fill: "Create an exit ticket for Year" },
  { keywords: ["cold task", "hot task", "pre-assessment", "post-assessment"], label: "Design assessment", fill: "Design a cold task and hot task for Year" },
];

function getSmartSuggestions(input: string): { label: string; fill: string }[] {
  if (input.length < 2) return [];
  const lower = input.toLowerCase();
  const matched: { label: string; fill: string }[] = [];
  for (const rule of SUGGESTION_RULES) {
    if (rule.keywords.some(k => lower.includes(k)) && !matched.find(m => m.label === rule.label)) {
      matched.push({ label: rule.label, fill: rule.fill });
    }
  }
  return matched.slice(0, 3);
}

interface ImageUploadState { file: File | null; preview: string; base64: string; }

function useImageUpload() {
  const [image, setImage] = useState<ImageUploadState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1] || "";
      setImage({ file, preview: ev.target?.result as string, base64 });
    };
    reader.readAsDataURL(file);
  }
  function removeImage() {
    setImage(null);
    if (inputRef.current) inputRef.current.value = "";
  }
  return { image, inputRef, handleFileChange, removeImage };
}

function downloadTxt(content: string, label: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `${label}_${new Date().toISOString().slice(0, 10)}.txt`; a.click();
  URL.revokeObjectURL(url);
}

async function downloadPdf(content: string, label: string) {
  try {
    const res = await fetch("/api/export/chat-to-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, label }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob(); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0, 10)}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("PDF export failed — try downloading as text instead"); }
}

async function downloadPPTX(content: string, label: string) {
  try {
    const res = await fetch("/api/export/pptx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, title: label }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob(); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0, 10)}.pptx`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("PPTX export failed"); }
}

async function downloadDOCX(content: string, label: string) {
  try {
    const res = await fetch("/api/export/docx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, title: label }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob(); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0, 10)}.docx`; a.click();
    URL.revokeObjectURL(url);
  } catch { alert("DOCX export failed"); }
}

function isStructuredContent(content: string): boolean {
  return ["WALT", "TIB", "WILF", "Lesson Plan", "Assessment", "Rubric", "Learning Intention", "Success Criteria", "AC9", "Hot Task", "Cold Task", "Exit Ticket", "Phase | Duration"].some(ind => content.includes(ind));
}

function getContentType(content: string): string {
  if ((content.includes("WALT") || content.includes("Lesson Plan")) && (content.includes("Phase") || content.includes("Duration") || content.includes("Teacher Does"))) return "lesson";
  if (content.includes("Rubric") && content.includes("Excellent")) return "rubric";
  if (content.includes("Cold Task") || content.includes("Hot Task")) return "assessment";
  if (content.includes("Writing Feedback") || (content.includes("Strengths") && content.includes("Areas to Develop"))) return "feedback";
  if (content.includes("WALT") || content.includes("Lesson Plan")) return "lesson";
  return "other";
}

// ─── Gradient animated dots ─────────────────────────────────────────
function StreamingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{
            scale: [0.5, 1.4, 0.5],
            opacity: [0.2, 1, 0.2],
            background: ["#6366f1", "#818cf8", "#6366f1"]
          }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            delay: i * 0.18,
            ease: "easeInOut"
          }}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#6366f1",
          }}
        />
      ))}
    </div>
  );
}

// ─── Glass avatar ───────────────────────────────────────────────────
function GlassAvatar({ isStreaming }: { isStreaming?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.05 }}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: "linear-gradient(135deg, #6366f1, #818cf8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: 11,
        color: "#fff",
        flexShrink: 0,
        marginTop: 2,
        boxShadow: "0 0 20px rgba(99,102,241,0.45)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* shimmer overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2.5s infinite",
      }} />
      <motion.div
        animate={isStreaming ? { rotate: [0, 8, -8, 0] } : { rotate: [0, 4, -4, 0] }}
        transition={{ repeat: Infinity, duration: isStreaming ? 2 : 3.5, ease: "easeInOut" }}
        style={{ position: "relative", zIndex: 1 }}
      >
        PN
      </motion.div>
    </motion.div>
  );
}

// ─── Glass message bubble ────────────────────────────────────────────
function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.role === "user";
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
      }}
    >
      {/* Avatar — AI only */}
      {!isUser && <GlassAvatar />}

      <div style={{ maxWidth: isUser ? "75%" : "78%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>

        {/* Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.06, duration: 0.3 }}
          style={{
            position: "relative",
            padding: "14px 18px",
            borderRadius: isUser
              ? "20px 20px 6px 20px"
              : "20px 20px 20px 6px",
            width: "100%",
            // Glassmorphism — user vs AI
            background: isUser
              ? "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(129,140,248,0.9))"
              : "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isUser
              ? "1px solid rgba(129,140,248,0.4)"
              : "1px solid rgba(255,255,255,0.10)",
            boxShadow: isUser
              ? "0 8px 32px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"
              : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
            color: isUser ? "#fff" : "var(--text)",
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {/* AI left accent border */}
          {!isUser && (
            <div style={{
              position: "absolute",
              left: 0,
              top: "16px",
              bottom: "16px",
              width: "3px",
              borderRadius: "0 3px 3px 0",
              background: "linear-gradient(180deg, #6366f1, #22d3ee)",
              opacity: 0.8,
            }} />
          )}

          {/* Structured content types */}
          {msg.contentType && !isUser && !msg.streaming ? (
            <>
              {msg.contentType === "lesson" && (
                <LessonPlanDisplay
                  content={msg.content}
                  onDownloadTxt={() => downloadTxt(msg.content, "lesson-plan")}
                  onDownloadPdf={() => downloadPdf(msg.content, "lesson-plan")}
                  onDownloadDOCX={() => downloadDOCX(msg.content, "lesson-plan")}
                />
              )}
              {msg.contentType === "rubric" && (
                <RubricDisplay
                  content={msg.content}
                  onDownloadTxt={() => downloadTxt(msg.content, "rubric")}
                  onDownloadPdf={() => downloadPdf(msg.content, "rubric")}
                  onDownloadDOCX={() => downloadDOCX(msg.content, "rubric")}
                />
              )}
              {msg.contentType === "assessment" && (
                <AssessmentDisplay
                  content={msg.content}
                  onDownloadTxt={() => downloadTxt(msg.content, "assessment")}
                  onDownloadPdf={() => downloadPdf(msg.content, "assessment")}
                  onDownloadDOCX={() => downloadDOCX(msg.content, "assessment")}
                />
              )}
              {msg.contentType === "feedback" && (
                <WritingFeedbackDisplay
                  content={msg.content}
                  onDownloadTxt={() => downloadTxt(msg.content, "feedback")}
                  onDownloadPdf={() => downloadPdf(msg.content, "feedback")}
                  onDownloadDOCX={() => downloadDOCX(msg.content, "feedback")}
                />
              )}
              {msg.contentType === "other" && (
                <div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              )}
            </>
          ) : (
            <div>
              {msg.content}
              {msg.streaming && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  style={{ opacity: 0.5, marginLeft: 2 }}
                >
                  ▍
                </motion.span>
              )}
            </div>
          )}
        </motion.div>

        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            marginTop: 4,
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
            letterSpacing: "0.02em",
          }}
        >
          {isUser ? `You · ${timestamp}` : `PickleNickAI · ${timestamp}`}
        </motion.div>

        {/* Action bar */}
        <AnimatePresence>
          {msg.contentType && !msg.streaming && !isUser && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ delay: 0.18, duration: 0.25 }}
              style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}
            >
              {[
                {
                  label: "Copy",
                  icon: (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  ),
                  action: () => navigator.clipboard.writeText(msg.content)
                },
                {
                  label: "PDF",
                  icon: (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  ),
                  action: () => downloadPdf(msg.content, msg.contentType || "content")
                },
                {
                  label: "PPTX",
                  icon: (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  ),
                  action: () => downloadPPTX(msg.content, msg.contentType || "content")
                },
                {
                  label: "DOCX",
                  icon: (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  ),
                  action: () => downloadDOCX(msg.content, msg.contentType || "content")
                },
              ].map(btn => (
                <motion.button
                  key={btn.label}
                  onClick={btn.action}
                  whileHover={{ scale: 1.07, y: -2, backgroundColor: "rgba(255,255,255,0.12)" }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    padding: "5px 10px",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "var(--radius-full)",
                    fontSize: 12,
                    color: "var(--text-2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 500,
                    transition: "background 0.15s",
                  }}
                >
                  {btn.icon}{btn.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Glass quick-prompt chip ─────────────────────────────────────────
function QuickChip({ label, onClick, delay }: { label: string; onClick: () => void; delay: number }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 420, damping: 26 }}
      whileHover={{ scale: 1.06, y: -2, boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}
      whileTap={{ scale: 0.94 }}
      style={{
        padding: "8px 16px",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "var(--radius-full)",
        fontSize: 12.5,
        color: "var(--text-2)",
        cursor: "pointer",
        fontWeight: 500,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle left gradient line */}
      <div style={{
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: "2px",
        height: "50%",
        borderRadius: "0 2px 2px 0",
        background: "linear-gradient(180deg, #6366f1, #22d3ee)",
        opacity: 0.7,
      }} />
      {label}
    </motion.button>
  );
}

// ─── Main component ─────────────────────────────────────────────────
export default function ChatView({ profile }: { profile: Profile }) {
  const initialMessage = `Hi ${profile.name}! I'm PickleNickAI — your teaching colleague who never sleeps.

Ask me anything a knowledgeable teacher would know:
• Lesson plans, unit outlines, worksheets
• Behaviour support, de-escalation, wellbeing strategies
• Rubrics, assessment tasks, feedback
• Parent emails, report comments, communications
• AC9 codes, curriculum alignment, scope & sequence
• WA mandatory reporting, AITSL standards, state requirements
• Differentiation for EAL/D, Gifted, Additional Needs

What can I help you with today?`;

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [suggestions, setSuggestions] = useState<{ label: string; fill: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { image, inputRef: imageInputRef, handleFileChange, removeImage } = useImageUpload();

  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("pn-chat-session");
      if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem("pn-chat-session", id); }
      return id;
    }
    return "";
  });

  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: initialMessage }]);

  useEffect(() => {
    const timer = setTimeout(() => setSuggestions(getSmartSuggestions(input)), 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function fillSuggestion(fill: string) {
    setInput(fill + " ");
    textareaRef.current?.focus();
    setSuggestions([]);
  }

  function send(text?: string) {
    const textToSend = (text ?? input).trim();
    if (!textToSend && !image) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(m => [...m, userMsg]);
    if (!text) setInput("");
    setShowChips(false);
    setSuggestions([]);
    const imageBase64 = image?.base64 || undefined;
    if (!text) removeImage();

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages(m => [...m, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg], sessionId, profile, imageBase64 }),
      signal: controller.signal,
    })
      .then(res => {
        if (!res.body) throw new Error("No response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        function processChunk() {
          reader.read().then(({ done, value }) => {
            if (done) {
              setIsStreaming(false);
              setMessages(m => {
                const last = m[m.length - 1];
                if (!last || last.role !== "assistant") return m.map(msg => ({ ...msg, streaming: false }));
                const ct = getContentType(last.content);
                return [...m.slice(0, -1), { ...last, streaming: false, contentType: ct !== "other" ? ct : null }];
              });
              return;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            let accumulated = "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  if (parsed.type === "text") accumulated += parsed.content;
                  else if (parsed.type === "done" || parsed.type === "error") {
                    setIsStreaming(false);
                    setMessages(m => {
                      const last = m[m.length - 1];
                      if (!last || last.role !== "assistant") return m.map(msg => ({ ...msg, streaming: false }));
                      const ct = getContentType(last.content);
                      return [...m.slice(0, -1), { ...last, streaming: false, contentType: ct !== "other" ? ct : null }];
                    });
                    return;
                  }
                } catch {}
              }
            }
            if (accumulated) {
              setMessages(m => {
                const last = m[m.length - 1];
                if (last?.streaming) return [...m.slice(0, -1), { ...last, content: last.content + accumulated }];
                return m;
              });
            }
            processChunk();
          }).catch(() => { setIsStreaming(false); setMessages(m => m.map(msg => ({ ...msg, streaming: false }))); });
        }
        processChunk();
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          setMessages(m => [...m, { role: "assistant", content: "Sorry — something went wrong. Please try again.", streaming: false }]);
        }
        setIsStreaming(false);
        setMessages(m => m.map(msg => ({ ...msg, streaming: false })));
      });
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      background: "var(--bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow background */}
      <div style={{
        position: "absolute",
        top: "-20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "400px",
        background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(9,9,11,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Logo mark */}
          <motion.div
            whileHover={{ scale: 1.07, rotate: [0, -4, 4, 0] }}
            transition={{ type: "spring", stiffness: 400 }}
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              width: 38,
              height: 38,
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 13,
              color: "#fff",
              boxShadow: "0 0 24px rgba(99,102,241,0.5)",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s infinite",
            }} />
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              style={{ position: "relative", zIndex: 1 }}
            >
              PN
            </motion.div>
          </motion.div>

          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #f4f4f5, #e4e4e7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              PickleNickAI
            </div>
            <div style={{
              fontSize: 11.5,
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 500,
            }}>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                }}
              />
              Online · AC9 aligned
            </div>
          </div>
        </div>

        {/* New chat button */}
        <motion.button
          onClick={() => setMessages([{ role: "assistant", content: `Hi ${profile.name}! I'm PickleNickAI. What would you like to work on today?` }])}
          whileHover={{ scale: 1.04, boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 15px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "var(--radius-full)",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--text-2)",
            cursor: "pointer",
            letterSpacing: "0.01em",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New chat
        </motion.button>
      </motion.div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          position: "relative",
          zIndex: 1,
        }}
        // Custom scrollbar styles via ref or global — inline approach
        className="chat-messages-scroll"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i} />
          ))}
        </AnimatePresence>

        {/* Streaming indicator */}
        <AnimatePresence>
          {isStreaming && messages[messages.length - 1]?.streaming && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
            >
              <GlassAvatar isStreaming />
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 18px",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "20px 20px 20px 6px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              }}>
                {/* AI accent line */}
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: "16px",
                  bottom: "16px",
                  width: "3px",
                  borderRadius: "0 3px 3px 0",
                  background: "linear-gradient(180deg, #6366f1, #22d3ee)",
                  opacity: 0.8,
                }} />
                <StreamingDots />
                <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>Generating response…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <AnimatePresence>
        {messages.length === 1 && showChips && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: "0 20px 14px",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {QUICK_PROMPTS.map((q, i) => (
              <QuickChip
                key={q.label}
                label={q.label}
                delay={i * 0.06}
                onClick={() => { send(q.prompt); setShowChips(false); }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ padding: "0 20px 8px", display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={s.label}
                onClick={() => fillSuggestion(s.fill)}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 420, damping: 26 }}
                whileHover={{ scale: 1.06, y: -2, boxShadow: "0 6px 20px rgba(99,102,241,0.35)" }}
                whileTap={{ scale: 0.94 }}
                style={{
                  padding: "6px 13px",
                  background: "rgba(99,102,241,0.12)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(99,102,241,0.35)",
                  borderRadius: "var(--radius-full)",
                  fontSize: 12,
                  color: "#818cf8",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {s.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{
          padding: "14px 20px 20px",
          background: "rgba(9,9,11,0.90)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Image preview pill */}
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 4 }}
              style={{ marginBottom: 10, position: "relative", display: "inline-block" }}
            >
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 10px 5px 5px",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "var(--radius-full)",
              }}>
                <img
                  src={image.preview}
                  alt="Upload preview"
                  style={{
                    height: 48,
                    width: 48,
                    objectFit: "cover",
                    borderRadius: "var(--radius)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <div style={{ fontSize: 11, color: "var(--text-2)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {image.file?.name}
                </div>
                <motion.button
                  onClick={removeImage}
                  whileHover={{ scale: 1.15, backgroundColor: "rgba(239,68,68,0.9)" }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.75)",
                    border: "none",
                    color: "#fff",
                    fontSize: 9,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar — gradient border */}
        <div
          style={{
            position: "relative",
            borderRadius: "var(--radius-lg)",
            padding: "2px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(34,211,238,0.4), rgba(99,102,241,0.5))",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 4s ease infinite",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-end",
              background: "rgba(15,15,18,0.95)",
              borderRadius: "calc(var(--radius-lg) - 2px)",
              padding: "6px 6px 6px 14px",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {/* Image upload button */}
            <motion.button
              onClick={() => imageInputRef.current?.click()}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              title="Attach image"
              style={{
                background: "none",
                border: "none",
                color: image ? "#818cf8" : "var(--text-3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
                flexShrink: 0,
                transition: "color 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </motion.button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about lesson plans, rubrics, behaviour, AC9…"
              disabled={isStreaming}
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                color: "var(--text)",
                border: "none",
                outline: "none",
                fontSize: 14,
                lineHeight: 1.55,
                resize: "none",
                padding: "8px 0",
                maxHeight: 120,
                overflowY: "auto",
                fontFamily: "var(--font)",
              }}
            />

            {/* Send button with gradient */}
            <motion.button
              onClick={() => send()}
              disabled={(!input.trim() && !image) || isStreaming}
              whileHover={input.trim() || image ? { scale: 1.06 } : {}}
              whileTap={input.trim() || image ? { scale: 0.93 } : {}}
              style={{
                width: 40,
                height: 40,
                background: (input.trim() || image)
                  ? "linear-gradient(135deg, #6366f1, #818cf8)"
                  : "rgba(255,255,255,0.06)",
                color: (input.trim() || image) ? "#fff" : "var(--text-3)",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: (input.trim() || image) && !isStreaming ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow: (input.trim() || image) ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{
          fontSize: 11,
          color: "var(--text-3)",
          textAlign: "center",
          marginTop: 8,
          letterSpacing: "0.01em",
        }}>
          PickleNickAI may produce inaccurate information. Always verify against official AC9 curriculum documents.
        </p>
      </motion.div>

      {/* Global styles injected for scrollbar */}
      <style>{`
        .chat-messages-scroll::-webkit-scrollbar { width: 5px; }
        .chat-messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-messages-scroll::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.25);
          border-radius: 10px;
        }
        .chat-messages-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99,102,241,0.45);
        }
      `}</style>
    </div>
  );
}
