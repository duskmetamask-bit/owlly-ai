"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LessonPlanDisplay from "@/components/LessonPlanDisplay";
import { downloadTxt, downloadPdf, downloadDOCX, downloadPPTX } from "@/components/exportUtils";

interface DocumentViewerModalProps {
  content: string;
  title: string;
  onClose: () => void;
  onEditInChat?: () => void;
}

export default function DocumentViewerModal({ content, title, onClose, onEditInChat }: DocumentViewerModalProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflowY: "auto",
          padding: "24px 16px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 860,
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Controls bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}>
            <button
              onClick={onEditInChat}
              style={{
                padding: "8px 16px",
                background: "rgba(245,158,11,0.2)",
                color: "#fde68a",
                border: "1px solid rgba(245,158,11,0.35)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Edit in Chat
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.07)",
                color: "var(--text-2)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            </button>
            <button
              onClick={() => downloadPdf(content, title)}
              style={{
                padding: "8px 16px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
              }}
            >
              📄 PDF
            </button>
            <button
              onClick={() => downloadDOCX(content, title)}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.07)",
                color: "var(--text)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📝 DOCX
            </button>
            <button
              onClick={() => downloadTxt(content, title)}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.07)",
                color: "var(--text)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📃 TXT
            </button>
            <button
              onClick={() => downloadPPTX(content, title)}
              style={{
                padding: "8px 16px",
                background: "rgba(34,211,238,0.15)",
                color: "#22d3ee",
                border: "1px solid rgba(34,211,238,0.3)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📑 PPTX
            </button>
          </div>

          {/* Document */}
          <LessonPlanDisplay content={content} compact={false} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}