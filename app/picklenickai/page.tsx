"use client";

import { useState, useEffect } from "react";
import Onboarding from "@/components/Onboarding";
import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import LibraryView from "@/components/LibraryView";
import PlannerView from "@/components/PlannerView";
import WorkflowsView from "@/components/WorkflowsView";
import RubricView from "@/components/RubricView";
import AutoMarkView from "@/components/AutoMarkView";
import CurriculumView from "@/components/CurriculumView";
import ProfileView from "@/components/ProfileView";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
  focusAreas?: string[];
  school?: string;
}

type Tab = "chat" | "library" | "workflows" | "planner" | "rubric" | "automark" | "curriculum" | "profile";

export default function PickleNickAIPage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  useEffect(() => {
    const saved = localStorage.getItem("pn-profile");
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  function handleOnboardingComplete(p: TeacherProfile) {
    localStorage.setItem("pn-profile", JSON.stringify(p));
    setProfile(p);
  }

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
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} profile={profile} />
      <main style={{ flex: 1, marginLeft: 240, overflowY: "auto" }}>
        {activeTab === "chat" && <ChatView profile={profile} />}
        {activeTab === "workflows" && <WorkflowsView />}
        {activeTab === "planner" && <PlannerView />}
        {activeTab === "rubric" && <RubricView />}
        {activeTab === "automark" && <AutoMarkView />}
        {activeTab === "curriculum" && <CurriculumView />}
        {activeTab === "profile" && <ProfileView />}
      </main>
    </div>
  );
}