"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <IconGrid /> },
  { id: "chat", label: "Chat", icon: <IconChat /> },
  { id: "differentiate", label: "Differentiate", icon: <IconDiff /> },
  { id: "library", label: "Unit Library", icon: <IconBook /> },
  { id: "planner", label: "Lesson Planner", icon: <IconCalendar /> },
  { id: "rubric", label: "Rubric Generator", icon: <IconList /> },
  { id: "automark", label: "Auto-Marking", icon: <IconCheck /> },
  { id: "writing", label: "Writing Feedback", icon: <IconPencil /> },
  { id: "worksheet", label: "Worksheet Gen", icon: <IconGrid2 /> },
  { id: "curriculum", label: "Curriculum", icon: <IconBook2 /> },
  { id: "profile", label: "My Profile", icon: <IconUser /> },
];

function IconGrid() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconChat() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconDiff() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="1.5"/><rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15"/><rect x="14" y="14" width="8" height="8" rx="1.5" fill="currentColor" fillOpacity="0.3"/></svg>;
}
function IconBook() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function IconCalendar() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconList() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function IconCheck() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function IconPencil() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
}
function IconGrid2() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>;
}
function IconBook2() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
function IconUser() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconChevronLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function IconChevronRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile: { name: string; subjects: string[]; state?: string };
  isPro?: boolean;
  freeUses?: number;
  theme?: string;
  onToggleTheme?: () => void;
  onOpenCmdMenu?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FREE_LIMIT = 5;
const EXPANDED_W = 220;
const COLLAPSED_W = 60;

export default function Sidebar({
  activeTab,
  onTabChange,
  profile,
  isPro = false,
  freeUses = 0,
  theme = "light",
  onToggleTheme,
  onOpenCmdMenu,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const width = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <motion.div
      animate={{ width, opacity: 1 }}
      initial={false}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        minHeight: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {/* Logo + collapse toggle */}
      <motion.div
        animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -8 : 0 }}
        initial={false}
        transition={{ duration: 0.2 }}
        style={{
          padding: collapsed ? "18px 0" : "18px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Logo row — hidden when collapsed */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                transition={{ type: "spring", stiffness: 400 }}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 12, color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 0 16px rgba(99,102,241,0.35)",
                }}
              >
                PN
              </motion.div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)", letterSpacing: "-0.01em" }}>
                  PickleNickAI
                </div>
                <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>
                  Teacher Assistant
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust bar — hidden when collapsed */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                display: "flex", gap: 6, flexWrap: "wrap",
                padding: "8px 10px",
                background: "var(--surface-2)",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                width: "100%",
              }}
            >
              {["Private", "AC9 Aligned", "WA Reporting", "AITSL"].map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  style={{ fontSize: 10, color: "var(--text-2)", fontWeight: 600 }}
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* State badge — hidden when collapsed */}
        <AnimatePresence>
          {!collapsed && profile.state && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15, type: "spring", stiffness: 400 }}
              style={{ padding: "4px 10px", background: "var(--primary-dim)", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4, width: "100%", justifyContent: "center" }}
            >
              <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>{profile.state}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dark mode + Cmd+K */}
      <motion.div
        animate={{ opacity: collapsed ? 0 : 1, y: collapsed ? -4 : 0 }}
        initial={false}
        transition={{ duration: 0.2 }}
        style={{
          padding: collapsed ? "8px 0" : "8px 12px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              onClick={onToggleTheme}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "7px 8px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                color: "var(--text-2)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {theme === "dark" ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
              {theme === "dark" ? "Light" : "Dark"}
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          onClick={onOpenCmdMenu}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="Command menu (Cmd+K)"
          style={{
            width: collapsed ? 36 : "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "7px 8px",
            background: "var(--primary-dim)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            color: "var(--primary-hover)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {!collapsed && <span>Cmd+K</span>}
        </motion.button>
      </motion.div>

      {/* Collapse toggle */}
      <motion.button
        onClick={onToggleCollapse}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: "absolute",
          top: 72,
          right: -12,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text-2)",
          zIndex: 60,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
      </motion.button>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.04)" }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "9px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "var(--primary-dim)" : "transparent",
                color: isActive ? "var(--primary-hover)" : "var(--text-2)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                textAlign: "left",
                width: "100%",
                position: "relative",
              }}
            >
              <motion.span
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0, display: "flex" }}
              >
                {item.icon}
              </motion.span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-dot"
                  style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--primary)" }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Free usage bar */}
      {!isPro && freeUses > 0 && (
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              style={{ borderTop: "1px solid var(--border-subtle)", padding: "10px 16px" }}
            >
              <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Free Plan — {FREE_LIMIT - freeUses} uses left
              </div>
              <motion.div style={{ background: "var(--surface-2)", borderRadius: 6, height: 4, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${(freeUses / FREE_LIMIT) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ height: "100%", background: freeUses >= FREE_LIMIT ? "var(--danger)" : "var(--primary)" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: collapsed ? "12px 0" : "12px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", justifyContent: collapsed ? "center" : "flex-start" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 12, color: "#fff",
              flexShrink: 0,
            }}
          >
            {profile.name ? profile.name[0].toUpperCase() : "T"}
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                style={{ minWidth: 0, flex: 1, overflow: "hidden" }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.name || "Teacher"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.subjects?.slice(0, 2).join(", ") || "F–6"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          onClick={() => { localStorage.removeItem("pn-profile"); window.location.reload(); }}
          whileHover={{ scale: 1.1, color: "var(--danger)" }}
          whileTap={{ scale: 0.9 }}
          title="Sign out"
          style={{
            background: "none", border: "none",
            color: "var(--text-3)", cursor: "pointer",
            padding: 4, fontSize: 14,
            display: "flex", alignItems: "center",
            borderRadius: 4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && (
            <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 600 }}>Sign out</span>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
