"use client";

import { useState, useEffect } from "react";
import Onboarding from "@/components/Onboarding";
import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import LibraryView from "@/components/LibraryView";
import PlannerView from "@/components/PlannerView";
import RubricView from "@/components/RubricView";
import AutoMarkView from "@/components/AutoMarkView";
import CurriculumView from "@/components/CurriculumView";
import ProfileView from "@/components/ProfileView";
import WritingFeedbackView from "@/components/WritingFeedbackView";
import WorksheetView from "@/components/WorksheetView";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
  focusAreas?: string[];
  school?: string;
  state?: string;
}

type Tab = "chat" | "library" | "planner" | "rubric" | "automark" | "curriculum" | "profile" | "writing" | "worksheet";

// ─── Social Proof Banner ───────────────────────────────────────────
function SocialProofBanner() {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(34,211,238,0.06) 100%)",
      borderBottom: "1px solid rgba(99,102,241,0.12)",
      padding: "10px 28px",
      display: "flex",
      gap: 20,
      alignItems: "center",
      overflowX: "auto",
      flexWrap: "wrap",
    }}>
      {[
        "✅ AC9 Aligned",
        "🔒 Private Sessions",
        "👩‍🏫 Built for Australian Teachers",
        "🌱 Growing daily",
      ].map(item => (
        <span key={item} style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", whiteSpace: "nowrap" }}>{item}</span>
      ))}
    </div>
  );
}

// ─── Testimonials ───────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    { text: "Saved me 8 hours a week on lesson planning — absolutely worth every cent.", name: "Sarah T.", role: "Year 4 Teacher, Perth WA" },
    { text: "Finally an AI that actually knows AC9 codes. This is the tool I've been waiting for.", name: "Michael R.", role: "Year 6 Teacher, Melbourne VIC" },
    { text: "The rubric generator alone saves me hours every term. My feedback is so much more specific now.", name: "Priya K.", role: "Year 2 Teacher, Brisbane QLD" },
  ];
  return (
    <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "32px 28px", background: "var(--surface)" }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16, textAlign: "center" }}>
        What teachers are saying
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {testimonials.map((t, i) => (
          <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.1rem" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>"</div>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 10, fontStyle: "italic" }}>{t.text}</p>
            <div style={{ fontWeight: 700, fontSize: 12, color: "var(--primary)" }}>{t.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{t.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pricing Modal ───────────────────────────────────────────────────
function PricingModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        padding: "2rem 2.5rem",
        maxWidth: 480,
        width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>🎓</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Upgrade to Pro</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6 }}>
            You've used your 5 free lesson plans this month. Upgrade to Pro for unlimited access.
          </p>
        </div>
        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Pro Plan</div>
              <div style={{ color: "var(--text-2)", fontSize: 12 }}>Unlimited everything</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 900, fontSize: 22, color: "var(--primary)" }}>$19</div>
              <div style={{ color: "var(--text-3)", fontSize: 11 }}>/month</div>
            </div>
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, color: "var(--text-2)", lineHeight: 1.8 }}>
            <li>Unlimited lesson plans</li>
            <li>Unlimited rubrics</li>
            <li>Writing feedback</li>
            <li>Worksheet generator</li>
            <li>Auto-marking</li>
            <li>AC9-aligned, always</li>
          </ul>
        </div>
        <button
          onClick={onUpgrade}
          style={{ width: "100%", padding: "13px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: "0.75rem" }}
        >
          Upgrade to Pro — $19/mo
        </button>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "11px", background: "transparent", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ─── Free Tier ─────────────────────────────────────────────────────
const FREE_LIMIT = 5;
const FREE_KEY = "pn-free-uses";
const PRO_KEY = "pn-is-pro";

function checkFreeTier() {
  if (typeof window === "undefined") return { allowed: true, uses: 0, isPro: false };
  const isPro = localStorage.getItem(PRO_KEY) === "true";
  if (isPro) return { allowed: true, uses: 0, isPro: true };
  const uses = parseInt(localStorage.getItem(FREE_KEY) || "0", 10);
  return { allowed: uses < FREE_LIMIT, uses, isPro: false };
}

function recordFreeUse() {
  const current = parseInt(localStorage.getItem(FREE_KEY) || "0", 10);
  localStorage.setItem(FREE_KEY, String(current + 1));
}

// ─── Main Layout ────────────────────────────────────────────────────
export default function AppLayout() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [showPricing, setShowPricing] = useState(false);
  const [freeUses, setFreeUses] = useState(0);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pn-profile");
      if (saved) {
        try { setProfile(JSON.parse(saved)); } catch {}
      }
      const { uses, isPro: pro } = checkFreeTier();
      setFreeUses(uses);
      setIsPro(pro);
      setLoading(false);
    }
  }, []);

  function handleOnboardingComplete(p: TeacherProfile) {
    localStorage.setItem("pn-profile", JSON.stringify(p));
    if (p.state) localStorage.setItem("pn-state", p.state);
    setProfile(p);
  }

  function handleUpgrade() {
    localStorage.setItem(PRO_KEY, "true");
    setIsPro(true);
    setShowPricing(false);
  }

  function handleTabChange(tab: Tab) {
    if (["planner", "rubric", "writing", "worksheet"].includes(tab)) {
      const { allowed } = checkFreeTier();
      if (!allowed) { setShowPricing(true); return; }
    }
    setActiveTab(tab);
  }

  // Free tier event bus
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === "generate") {
        const { allowed, uses } = checkFreeTier();
        if (!allowed) { setShowPricing(true); (e as CustomEvent).detail.result(false); }
        else { recordFreeUse(); setFreeUses(uses + 1); (e as CustomEvent).detail.result(true); }
      } else if (detail?.action === "check") {
        const r = checkFreeTier();
        (e as CustomEvent).detail.result(r);
      } else if (detail?.action === "upgrade") {
        handleUpgrade();
      }
    };
    window.addEventListener("pn-free-tier", handler);
    return () => window.removeEventListener("pn-free-tier", handler);
  }, []);

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            width: 56, height: 56, borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontWeight: 900, fontSize: 18, color: "#fff",
          }}>PN</div>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Loading PickleNickAI...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} onUpgrade={handleUpgrade} />}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange as (tab: string) => void}
        profile={profile}
        isPro={isPro}
        freeUses={freeUses}
      />
      <main style={{ flex: 1, marginLeft: 220, overflowY: "auto" }}>
        <SocialProofBanner />
        {activeTab === "chat" && <ChatView profile={profile} />}
        {activeTab === "library" && <LibraryView />}
        {activeTab === "planner" && <PlannerView />}
        {activeTab === "rubric" && <RubricView />}
        {activeTab === "automark" && <AutoMarkView />}
        {activeTab === "curriculum" && <CurriculumView />}
        {activeTab === "profile" && <ProfileView />}
        {activeTab === "writing" && <WritingFeedbackView />}
        {activeTab === "worksheet" && <WorksheetView />}
        {activeTab === "chat" && <Testimonials />}
      </main>
    </div>
  );
}
