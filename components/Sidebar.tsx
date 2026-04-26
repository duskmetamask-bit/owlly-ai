"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "library", label: "Unit Library", icon: "📚" },
  { id: "planner", label: "Lesson Planner", icon: "📋" },
  { id: "rubric", label: "Rubric Generator", icon: "✅" },
  { id: "automark", label: "Auto-Marking", icon: "🔍" },
  { id: "curriculum", label: "Curriculum", icon: "🎓" },
  { id: "profile", label: "My Profile", icon: "👤" },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: { name: string; subjects: string[] };
}

export default function Sidebar({ activeTab, onTabChange, profile }: Props) {
  return (
    <div style={{
      width: 240,
      minHeight: "100vh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            width: 36, height: 36, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14, color: "#fff",
            flexShrink: 0,
          }}>PN</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: "var(--text)" }}>PickleNickAI</div>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>Teacher's Assistant</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: activeTab === item.id ? "rgba(99,102,241,0.12)" : "transparent",
              color: activeTab === item.id ? "var(--primary)" : "var(--text2)",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === item.id ? 700 : 500,
              textAlign: "left",
              width: "100%",
              transition: "all 0.1s",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Profile */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: "#fff",
          }}>
            {profile.name ? profile.name[0].toUpperCase() : "T"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.name || "Teacher"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.subjects?.join(", ") || "F-6"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
