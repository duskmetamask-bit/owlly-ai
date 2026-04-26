"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "assistant"; content: string; }
interface Profile { name: string; yearLevels: string[]; subjects: string[]; focusAreas?: string[]; school?: string; }

const QUICK_PROMPTS = [
  "Write a lesson plan on...",
  "Help me with a behaviour issue...",
  "Create a rubric for...",
  "Explain AC9 codes...",
];

export default function ChatView({ profile }: { profile: Profile }) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: `Hi ${profile.name}! I'm PickleNickAI — your personal AI teaching assistant for Australian F-6. I know the AC9 curriculum inside out, and I'm here to help with lesson plans, assessments, behaviour strategies, differentiation, unit design — anything.\n\nWhat would you like to work on today?`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("pn-chat-session");
      if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2); localStorage.setItem("pn-chat-session", id); }
      return id;
    }
    return "";
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text?: string) {
    const textToSend = (text ?? input).trim();
    if (!textToSend || loading) return;
    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(m => [...m, userMsg]);
    if (!text) setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], sessionId, profile }),
      });
      const data = await res.json();
      if (data.reply) setMessages(m => [...m, { role: "assistant", content: data.reply }]);
      else if (data.error) setMessages(m => [...m, { role: "assistant", content: `Error: ${data.error}` }]);
    } catch { setMessages(m => [...m, { role: "assistant", content: "Sorry — something went wrong. Please try again." }]); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#fff", flexShrink: 0 }}>PN</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>PickleNickAI Chat</div>
          <div style={{ fontSize: 12, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)" }} />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#fff", flexShrink: 0, marginRight: 10 }}>
                PN
              </div>
            )}
            <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "var(--primary)" : "var(--surface2)", color: msg.role === "user" ? "#fff" : "var(--text)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 10 }}>
            <div style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#fff" }}>PN</div>
            <div style={{ background: "var(--surface2)", padding: "12px 16px", borderRadius: "16px", color: "var(--text3)", fontSize: 14 }}>Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && (
        <div style={{ padding: "0 20px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => send(q)} style={{ padding: "7px 14px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 13, color: "var(--text2)", cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Ask me anything about teaching..."
          style={{ flex: 1, padding: "11px 16px", background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 24, fontSize: 14, outline: "none" }}
          onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{ width: 42, height: 42, background: input.trim() ? "var(--primary)" : "var(--surface2)", color: input.trim() ? "#fff" : "var(--text3)", border: "none", borderRadius: "50%", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
