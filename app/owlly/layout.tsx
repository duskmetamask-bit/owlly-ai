"use client";

// Block FOUC — apply theme before first paint
(function() {
  const s = localStorage.getItem("pn-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const t = s === "dark" || s === "light" ? s : (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", t);
})();

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useConvex, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Onboarding from "@/components/Onboarding";
import Sidebar from "@/components/Sidebar";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import CommandMenu from "@/components/CommandMenu";
import DifferentiateView from "@/components/DifferentiateView";
import LibraryView from "@/components/LibraryView";
import PlannerView from "@/components/PlannerView";
import RubricView from "@/components/RubricView";
import AutoMarkView from "@/components/AutoMarkView";
import CurriculumView from "@/components/CurriculumView";
import ProfileView from "@/components/ProfileView";
import WritingFeedbackView from "@/components/WritingFeedbackView";
import WorksheetView from "@/components/WorksheetView";
import ChatView from "@/components/ChatView";
import DashboardView from "@/components/DashboardView";
import MyLessonPlansView from "@/components/MyLessonPlansView";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
  focusAreas?: string[];
  school?: string;
  state?: string;
}

type Tab = "chat" | "dashboard" | "library" | "planner" | "rubric" | "automark" | "curriculum" | "profile" | "writing" | "worksheet" | "differentiate" | "lessonplans";

// ─── Theme ─────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("pn-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("pn-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }, [theme]);

  return { theme, toggleTheme };
}

// ─── Social Proof Banner ───────────────────────────────────────────
function SocialProofBanner({ theme }: { theme: string }) {
  return (
    <div style={{
      background: theme === "dark"
        ? "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.06) 100%)"
        : "linear-gradient(135deg, rgba(245,158,11,0.04) 0%, rgba(16,185,129,0.04) 100%)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "10px 28px",
      display: "flex",
      gap: 20,
      alignItems: "center",
      overflowX: "auto",
      flexWrap: "wrap",
    }}>
      {[
        "AC9 Aligned",
        "Private Sessions",
        "Built for Australian Teachers",
        "Growing daily",
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
          <div key={i} style={{
            background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.1rem",
            transition: "all 0.15s var(--ease)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
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
      animation: "fade-in 0.15s var(--ease)",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        padding: "2rem 2.5rem",
        maxWidth: 480,
        width: "100%",
        boxShadow: "var(--shadow-xl)",
        animation: "slide-up 0.2s var(--ease)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 40, marginBottom: "0.75rem", fontFamily: "Georgia, serif" }}>Pro</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Upgrade to Pro</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6 }}>
            You've used your 5 free lesson plans this month. Upgrade to Pro for unlimited access.
          </p>
        </div>
        <div style={{ background: "var(--primary-dim)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
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

// ─── Chat Welcome ───────────────────────────────────────────────────
function ChatWelcome({ profile }: { profile: TeacherProfile }) {
  return (
    <div style={{ padding: "24px", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Hi {profile.name}!</h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          I am Owlly — your AI teaching colleague. Ask me anything or use the chat widget in the bottom-right corner to get started.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: "Lesson Plans", desc: "AC9 aligned" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, label: "Rubrics", desc: "Criterion-based" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>, label: "Writing Feedback", desc: "Detailed & specific" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label: "Behaviour Support", desc: "BSPs & strategies" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, label: "Assessments", desc: "Hot & cold tasks" },
          { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: "Parent Emails", desc: "Professional tone" },
        ].map(card => (
          <div key={card.label} style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "1rem", cursor: "pointer", transition: "all 0.15s var(--ease)",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, color: "var(--primary)" }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{card.desc}</div>
          </div>
        ))}
      </div>
      <Testimonials />
    </div>
  );
}

// ─── Main Layout ────────────────────────────────────────────────────
export default function AppLayout() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [showPricing, setShowPricing] = useState(false);
  const [freeUses, setFreeUses] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [cmdMenuOpen, setCmdMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const { user, isLoaded } = useUser();
  const convex = useConvex();
  const [teacherId, setTeacherId] = useState<string | undefined>();

  // Resolve Clerk user → Convex teacherId on load
  useEffect(() => {
    if (!isLoaded || !user) return;
    async function resolveTeacher() {
      try {
        // Sync Clerk user to Convex if needed, then look up teacherId
        await (convex as any).mutation("teachers/syncFromClerk", {
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          name: user.fullName ?? user.firstName ?? "Teacher",
          avatarUrl: user.imageUrl,
        });
        const teacher = await (convex as any).query("teachers/getByClerkUserId", {
          clerkUserId: user.id,
        });
        if (teacher) setTeacherId(teacher._id);
      } catch (e) {
        console.error("Failed to resolve teacherId", e);
      }
    }
    resolveTeacher();
  }, [isLoaded, user, convex]);

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

  // Cmd+K keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdMenuOpen(o => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  function handleNavigate(tab: string) {
    handleTabChange(tab as Tab);
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #f59e0b, #10b981)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", boxShadow: "0 0 32px rgba(245,158,11,0.35)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 400 400" fill="none">
              <rect width="400" height="400" fill="#f1f5f9"/>
              <line x1="40" y1="330" x2="360" y2="330" stroke="#334155" strokeWidth="6" strokeLinecap="round"/>
              <line x1="160" y1="295" x2="160" y2="330" stroke="#334155" strokeWidth="5" strokeLinecap="round"/>
              <line x1="240" y1="295" x2="240" y2="330" stroke="#334155" strokeWidth="5" strokeLinecap="round"/>
              <ellipse cx="200" cy="235" rx="90" ry="105" fill="none" stroke="#334155" strokeWidth="4"/>
              <path d="M130 200 Q95 220 95 270 Q95 295 115 300" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
              <path d="M270 200 Q305 220 305 270 Q305 295 285 300" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="185" cy="270" r="5" fill="#334155"/>
              <circle cx="215" cy="270" r="5" fill="#334155"/>
              <circle cx="170" cy="288" r="5" fill="#334155"/>
              <circle cx="200" cy="288" r="5" fill="#334155"/>
              <circle cx="230" cy="288" r="5" fill="#334155"/>
              <ellipse cx="200" cy="145" rx="82" ry="75" fill="none" stroke="#334155" strokeWidth="4"/>
              <circle cx="168" cy="140" r="26" fill="none" stroke="#334155" strokeWidth="4"/>
              <circle cx="168" cy="140" r="11" fill="#334155"/>
              <circle cx="232" cy="140" r="26" fill="none" stroke="#334155" strokeWidth="4"/>
              <circle cx="232" cy="140" r="11" fill="#334155"/>
              <path d="M200 152 L188 178 Q200 188 212 178 Z" fill="#334155"/>
              <path d="M138 90 Q148 65 162 78" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
              <path d="M262 90 Q252 65 238 78" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
              <path d="M108 88 L200 58 L292 88 L200 100 Z" fill="none" stroke="#334155" strokeWidth="4" strokeLinejoin="round"/>
              <path d="M120 100 Q200 82 280 100" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
              <line x1="200" y1="58" x2="270" y2="95" stroke="#334155" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="270" cy="95" r="6" fill="#334155"/>
            </svg>
          </motion.div>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>Loading Owlly...</p>
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
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCmdMenu={() => setCmdMenuOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
      />
      <main style={{ flex: 1, marginLeft: sidebarCollapsed ? 60 : 220, overflowY: "auto", transition: "margin-left 0.3s var(--ease), opacity 0.25s var(--ease)" }}>
        <SocialProofBanner theme={theme} />
        {activeTab === "chat" && <ChatView profile={profile} teacherId={teacherId} />}
        {activeTab === "dashboard" && <DashboardView onNavigate={handleNavigate} teacherId={teacherId} isPro={isPro} />}
        {activeTab === "library" && <LibraryView onNavigate={handleNavigate} />}
        {activeTab === "planner" && <PlannerView teacherId={teacherId} />}
        {activeTab === "rubric" && <RubricView teacherId={teacherId} />}
        {activeTab === "automark" && <AutoMarkView />}
        {activeTab === "curriculum" && <CurriculumView />}
        {activeTab === "profile" && <ProfileView teacherId={teacherId} />}
        {activeTab === "writing" && <WritingFeedbackView />}
        {activeTab === "worksheet" && <WorksheetView />}
        {activeTab === "differentiate" && <DifferentiateView />}
        {activeTab === "lessonplans" && <MyLessonPlansView teacherId={teacherId} />}
      </main>

      {activeTab !== "chat" && <FloatingChatWidget profile={profile} initialCollapsed />}

      <CommandMenu
        isOpen={cmdMenuOpen}
        onClose={() => setCmdMenuOpen(false)}
        onNavigate={handleNavigate}
        onUpgrade={() => { setCmdMenuOpen(false); setShowPricing(true); }}
      />
    </div>
  );
}
