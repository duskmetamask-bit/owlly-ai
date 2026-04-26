import Link from "next/link";

const C = {
  bg: "var(--bg)", surface: "var(--surface)", surface2: "var(--surface2)",
  border: "var(--border)", text: "var(--text)", text2: "var(--text2)",
  primary: "var(--primary)", accent: "var(--accent)",
};

export default function Home() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "0 2rem",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(13,15,26,0.95)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            width: 36, height: 36, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14, color: "#fff",
          }}>PN</div>
          <span style={{ fontWeight: 800, fontSize: 18 }}>PickleNickAI</span>
        </div>
        <Link
          href="/picklenickai"
          style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Open App
        </Link>
      </header>

      {/* Hero */}
      <section style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "6rem 2rem",
        textAlign: "center",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #6366f1, #22d3ee)",
          width: 72, height: 72, borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 2rem",
        }}>
          🤖
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Your personal AI<br />teaching assistant
        </h1>
        <p style={{ fontSize: 18, color: C.text2, lineHeight: 1.6, maxWidth: 540, margin: "0 auto 3rem" }}>
          Cut admin. Boost capability. Become the best teacher possible.
          Chat with an AI that knows the Australian curriculum, understands your students, and helps you plan, assess, and differentiate — instantly.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/picklenickai"
            style={{
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 16,
              boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
            }}
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: "5rem 2rem",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: "3rem" }}>
            Everything a teacher needs
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: "💬", title: "AI Chat", desc: "Ask anything about lesson plans, assessments, behaviour, differentiation — get instant, curriculum-aligned responses." },
              { icon: "📚", title: "Unit Library", desc: "Browse 100+ ready-to-use unit plans aligned to the Australian Curriculum (AC9). Search by subject, year level, topic." },
              { icon: "✅", title: "Auto-Marking", desc: "Upload a rubric and student work. Get instant, criterion-by-criterion feedback powered by AI vision." },
              { icon: "🎯", title: "Lesson Planner", desc: "Generate complete lesson plans in seconds. Specify subject, year level, topic, duration, and lesson type." },
              { icon: "📋", title: "Rubric Generator", desc: "Create detailed assessment rubrics for any subject, year level, and task type." },
              { icon: "📖", title: "Curriculum Guide", desc: "Browse the full AC9 curriculum by subject and year level. Never miss a content descriptor." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: C.surface2,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: 28, marginBottom: "0.75rem" }}>{icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{title}</h3>
                <p style={{ color: C.text2, fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "5rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: "3rem" }}>How it works</h2>
        {[
          { n: "1", title: "Tell us about your class", desc: "Complete a 30-second onboarding — year levels and subjects you teach." },
          { n: "2", title: "Chat with your AI assistant", desc: "Ask anything. Lesson plans, rubrics, assessments, behaviour strategies — all curriculum-aligned." },
          { n: "3", title: "Get results instantly", desc: "Copy, export, or deploy directly. No waiting, no forms to fill out." },
        ].map(({ n, title, desc }) => (
          <div key={n} style={{ display: "flex", gap: 20, marginBottom: "2rem", textAlign: "left" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 18, flexShrink: 0,
            }}>{n}</div>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{title}</h3>
              <p style={{ color: C.text2, fontSize: 15 }}>{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: "5rem 2rem",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: "1rem" }}>Ready to cut admin?</h2>
        <p style={{ color: C.text2, marginBottom: "2rem" }}>Start chatting with your AI teaching assistant in 30 seconds.</p>
        <Link
          href="/picklenickai"
          style={{
            background: "linear-gradient(135deg, #6366f1, #818cf8)",
            color: "#fff",
            padding: "14px 32px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 16,
            display: "inline-block",
          }}
        >
          Open PickleNickAI
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "2rem", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
        PickleNickAI — $19/mo · Built for Australian F-6 teachers
      </footer>
    </div>
  );
}
