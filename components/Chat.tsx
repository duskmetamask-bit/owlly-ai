"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  profile: { name: string; yearLevels: string[]; subjects: string[] };
  sessionId: string;
}

export default function Chat({ profile, sessionId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi ${profile.name}! I'm PickleNickAI — your personal AI teaching assistant. I know the Australian Curriculum (AC9) and I'm here to help with lesson plans, assessments, behaviour strategies, differentiation, or anything else you need. What can I help you with today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const textToSend = (text ?? input).trim();
    if (!textToSend) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          sessionId,
          profile,
        }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages(m => [...m, { role: "assistant", content: data.reply }]);
      } else if (data.error) {
        setMessages(m => [...m, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Sorry — something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{
          background: "linear-gradient(135deg, #6366f1, #22d3ee)",
          width: 40, height: 40, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 13, color: "#fff",
        }}>PN</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>PickleNickAI</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {profile.yearLevels.join(", ")} · {profile.subjects.join(", ")}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 16,
          }}>
            {msg.role === "assistant" && (
              <div style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 16, borderBottomLeftRadius: 4,
                padding: "12px 16px",
                maxWidth: "75%",
                fontSize: 15,
                lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
            )}
            {msg.role === "user" && (
              <div style={{
                background: "var(--primary)",
                color: "#fff",
                borderRadius: 16, borderBottomRightRadius: 4,
                padding: "12px 16px",
                maxWidth: "75%",
                fontSize: 15,
                lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
            <div style={{
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 16, borderBottomLeftRadius: 4,
              padding: "12px 16px", color: "var(--text3)", fontSize: 15,
            }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about lesson plans, assessments, behaviour..."
            disabled={loading}
            style={{
              flex: 1, padding: "12px 16px",
              background: "var(--surface2)", color: "var(--text)",
              border: "1px solid var(--border)", borderRadius: 12,
              fontSize: 15, outline: "none", resize: "none",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              padding: "12px 20px",
              background: input.trim() ? "var(--primary)" : "var(--surface2)",
              color: input.trim() ? "#fff" : "var(--text3)",
              border: "none", borderRadius: 12,
              fontWeight: 700, fontSize: 14,
              cursor: input.trim() ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Send
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textAlign: "center" }}>
          PickleNickAI may make mistakes. Verify curriculum codes before using in lessons.
        </div>
      </div>
    </div>
  );
}
