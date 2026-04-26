"use client";

import { useState, useEffect } from "react";
import Onboarding from "@/components/Onboarding";
import Chat from "@/components/Chat";

interface TeacherProfile {
  name: string;
  yearLevels: string[];
  subjects: string[];
}

const SESSION_KEY = "pn-session";

function getOrCreateSession(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function PickleNickAIPage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionId(getOrCreateSession());

    // Try to restore from localStorage
    const saved = localStorage.getItem("pn-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  function handleOnboardingComplete(p: TeacherProfile) {
    localStorage.setItem("pn-profile", JSON.stringify(p));
    setProfile(p);
  }

  if (loading) {
    return (
      <div style={{
        background: "var(--bg)", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
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

  return <Chat profile={profile} sessionId={sessionId} />;
}
