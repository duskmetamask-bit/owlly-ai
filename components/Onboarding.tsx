"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

const YEAR_LEVELS = ["Pre-Primary", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SUBJECTS = ["Mathematics", "English", "Science", "HASS", "Technologies", "The Arts", "Health & Physical Education", "Languages"];
const STATES = [
  { label: "Western Australia (WA)", code: "WA" },
  { label: "New South Wales (NSW)", code: "NSW" },
  { label: "Victoria (VIC)", code: "VIC" },
  { label: "Queensland (QLD)", code: "QLD" },
  { label: "South Australia (SA)", code: "SA" },
  { label: "Tasmania (TAS)", code: "TAS" },
  { label: "Northern Territory (NT)", code: "NT" },
  { label: "Australian Capital Territory (ACT)", code: "ACT" },
];

interface OnboardingProps {
  onComplete: (profile: { name: string; yearLevels: string[]; subjects: string[]; state: string }) => void;
}

// ─── Selection chip with spring-bounce ───────────────────────────────────
function Chip({
  label,
  selected,
  onClick,
  delay = 0,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 500, damping: 28, mass: 0.8 }}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.04 }}
      style={{
        padding: "10px 16px",
        background: selected ? "rgba(99,102,241,0.15)" : "var(--surface-2)",
        color: selected ? "var(--primary-hover)" : "var(--text-2)",
        border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
        borderRadius: 10,
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 22 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}
      {label}
    </motion.button>
  );
}

// ─── Animated progress bar ───────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const progress = (step / (total - 1)) * 100;

  return (
    <div style={{
      display: "flex",
      gap: 6,
      marginBottom: "2rem",
      position: "relative",
    }}>
      {/* Track */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: 4,
        background: "var(--border)",
        borderRadius: 2,
        transform: "translateY(-50%)",
        zIndex: 0,
      }} />
      {/* Fill */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          height: 4,
          background: "linear-gradient(90deg, var(--primary), #818cf8)",
          borderRadius: 2,
          transform: "translateY(-50%)",
          zIndex: 1,
          minWidth: 4,
        }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      />
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: 8,
            height: 8,
            background: i <= step ? "var(--primary)" : "var(--border)",
            scale: i === step ? 1.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            borderRadius: "50%",
            zIndex: 2,
            position: "relative",
          }}
        />
      ))}
    </div>
  );
}

// ─── Confetti burst for done state ───────────────────────────────────────
function Confetti() {
  const colors = ["#6366f1", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: (i % 2 === 0 ? 1 : -1) * (60 + i * 20),
            y: -80 - i * 30,
            opacity: 0,
            scale: 0,
            rotate: i * 45,
          }}
          transition={{ duration: 1.2, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 8,
            height: 8,
            borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "4px",
            background: color,
          }}
        />
      ))}
    </div>
  );
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [state, setState] = useState<string>("");
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  function toggle<T>(arr: T[], item: T, set: (v: T[]) => void) {
    set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  function handleNext() {
    if (step === 0 && !name.trim()) { setError("Please enter your name"); return; }
    if (step === 1 && years.length === 0) { setError("Select at least one year level"); return; }
    if (step === 2 && subjects.length === 0) { setError("Select at least one subject"); return; }
    setError("");
    setStep(s => s + 1);
  }

  function handleFinish() {
    const stateObj = STATES.find(s => s.label === state);
    onComplete({ name: name.trim(), yearLevels: years, subjects, state: stateObj?.code || state });
  }

  const totalSteps = 4;

  // Slide variants for step transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.95,
    }),
  };

  // Track direction for slide animation
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    setDirection(1);
    handleNext();
  };

  const goBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "var(--bg)",
    }}>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 560,
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: "center", marginBottom: "1.5rem" }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
            transition={{ type: "spring", stiffness: 400 }}
            style={{
              background: "linear-gradient(135deg, #f59e0b, #10b981)",
              width: 56, height: 56, borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, margin: "0 auto 1rem",
              fontWeight: 900, color: "#fff",
              boxShadow: "0 8px 24px rgba(245,158,11,0.3)",
            }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{ display: "flex" }}
            >
              <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="12" fill="#1a1a2e"/>
                <ellipse cx="18" cy="38" rx="10" ry="14" fill="#A07D1C" transform="rotate(-8,18,38)"/>
                <ellipse cx="46" cy="38" rx="10" ry="14" fill="#A07D1C" transform="rotate(8,46,38)"/>
                <ellipse cx="32" cy="40" rx="16" ry="18" fill="#C49A2A"/>
                <ellipse cx="32" cy="42" rx="10" ry="11" fill="#FFF8F0"/>
                <circle cx="32" cy="22" r="16" fill="#C49A2A"/>
                <path d="M20,12 L16,4 L24,9 Z" fill="#5C4A0F"/>
                <path d="M44,12 L48,4 L40,9 Z" fill="#5C4A0F"/>
                <circle cx="25" cy="22" r="7" fill="white"/>
                <circle cx="39" cy="22" r="7" fill="white"/>
                <circle cx="25" cy="22" r="5" fill="#00D4FF"/>
                <circle cx="39" cy="22" r="5" fill="#00D4FF"/>
                <circle cx="25" cy="22" r="2.5" fill="#0a0a2e"/>
                <circle cx="39" cy="22" r="2.5" fill="#0a0a2e"/>
                <circle cx="25" cy="22" r="7" fill="none" stroke="#E8C84A" stroke-width="0.8"/>
                <circle cx="39" cy="22" r="7" fill="none" stroke="#E8C84A" stroke-width="0.8"/>
                <circle cx="23.5" cy="20.5" r="1.2" fill="white" opacity="0.95"/>
                <circle cx="37.5" cy="20.5" r="1.2" fill="white" opacity="0.95"/>
                <path d="M32,27 L29,31 L32,30 L35,31 Z" fill="#F5B800"/>
              </svg>
            </motion.div>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.h1
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}
            >
              {step === 0 && "Welcome to Owlly"}
              {step === 1 && "What year levels do you teach?"}
              {step === 2 && "What subjects do you teach?"}
              {step === 3 && "Where do you teach?"}
              {step === 4 && "You're all set!"}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${step}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              style={{ color: "var(--text-2)", fontSize: 14 }}
            >
              {step === 0 && "Let's set up your personal AI teaching assistant."}
              {step === 1 && "Select all the year levels you work with."}
              {step === 2 && "Select all the subjects you teach."}
              {step === 3 && "This helps Owlly tailor responses to your state's curriculum."}
              {step === 4 && "Your AI teaching colleague is ready."}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Animated progress bar */}
        <ProgressBar step={step} total={totalSteps} />

        {/* Step content */}
        <div style={{ position: "relative", minHeight: 200 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step-name"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  What&apos;s your name?
                </label>
                <motion.input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") goNext(); }}
                  placeholder="e.g. Sarah"
                  autoFocus
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    width: "100%", padding: "14px 16px",
                    background: "var(--surface-2)", color: "var(--text)",
                    border: "1px solid var(--border)", borderRadius: 12,
                    fontSize: 16, outline: "none",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-years"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Year levels you teach
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {YEAR_LEVELS.map((yl, i) => (
                    <Chip
                      key={yl}
                      label={yl}
                      selected={years.includes(yl)}
                      onClick={() => toggle(years, yl, setYears)}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
                <AnimatePresence>
                  {years.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ marginTop: 10, fontSize: 12, color: "var(--primary)", fontWeight: 600 }}
                    >
                      {years.length} selected
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-subjects"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Subjects you teach
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SUBJECTS.map((sub, i) => (
                    <Chip
                      key={sub}
                      label={sub}
                      selected={subjects.includes(sub)}
                      onClick={() => toggle(subjects, sub, setSubjects)}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
                <AnimatePresence>
                  {subjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ marginTop: 10, fontSize: 12, color: "var(--primary)", fontWeight: 600 }}
                    >
                      {subjects.length} selected
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-state"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  State or territory
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {STATES.map((s, i) => (
                    <Chip
                      key={s.label}
                      label={`${s.code} — ${s.label.split(" (")[0]}`}
                      selected={state === s.label}
                      onClick={() => setState(s.label)}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-done"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                style={{ textAlign: "center", padding: "1rem 0", position: "relative" }}
              >
                <Confetti />
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #10b981)",
                    width: 72, height: 72, borderRadius: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 24, color: "#fff",
                    margin: "0 auto 1.5rem",
                    boxShadow: "0 12px 32px rgba(245,158,11,0.4)",
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  >
                    <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="64" height="64" rx="12" fill="#1a1a2e"/>
                      <ellipse cx="18" cy="38" rx="10" ry="14" fill="#A07D1C" transform="rotate(-8,18,38)"/>
                      <ellipse cx="46" cy="38" rx="10" ry="14" fill="#A07D1C" transform="rotate(8,46,38)"/>
                      <ellipse cx="32" cy="40" rx="16" ry="18" fill="#C49A2A"/>
                      <ellipse cx="32" cy="42" rx="10" ry="11" fill="#FFF8F0"/>
                      <circle cx="32" cy="22" r="16" fill="#C49A2A"/>
                      <path d="M20,12 L16,4 L24,9 Z" fill="#5C4A0F"/>
                      <path d="M44,12 L48,4 L40,9 Z" fill="#5C4A0F"/>
                      <circle cx="25" cy="22" r="7" fill="white"/>
                      <circle cx="39" cy="22" r="7" fill="white"/>
                      <circle cx="25" cy="22" r="5" fill="#00D4FF"/>
                      <circle cx="39" cy="22" r="5" fill="#00D4FF"/>
                      <circle cx="25" cy="22" r="2.5" fill="#0a0a2e"/>
                      <circle cx="39" cy="22" r="2.5" fill="#0a0a2e"/>
                      <circle cx="25" cy="22" r="7" fill="none" stroke="#E8C84A" stroke-width="0.8"/>
                      <circle cx="39" cy="22" r="7" fill="none" stroke="#E8C84A" stroke-width="0.8"/>
                      <circle cx="23.5" cy="20.5" r="1.2" fill="white" opacity="0.95"/>
                      <circle cx="37.5" cy="20.5" r="1.2" fill="white" opacity="0.95"/>
                      <path d="M32,27 L29,31 L32,30 L35,31 Z" fill="#F5B800"/>
                    </svg>
                  </motion.div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}
                >
                  You&apos;re all set{state ? `, ${name.split(" ")[0]}!` : "!"}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}
                >
                  Your AI teaching colleague is ready.
                  Ask me anything about lesson plans, assessments, behaviour strategies, or the Australian curriculum.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 25 }}
                  style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}
                >
                  {years.slice(0, 3).map(yl => (
                    <motion.span
                      key={yl}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.5 + years.indexOf(yl) * 0.05 }}
                      style={{
                        padding: "4px 12px",
                        background: "var(--primary-dim)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: 20,
                        fontSize: 12,
                        color: "var(--primary-hover)",
                        fontWeight: 600,
                      }}
                    >
                      {yl}
                    </motion.span>
                  ))}
                  {subjects.slice(0, 2).map(sub => (
                    <motion.span
                      key={sub}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.6 + subjects.indexOf(sub) * 0.05 }}
                      style={{
                        padding: "4px 12px",
                        background: "rgba(34,211,238,0.1)",
                        border: "1px solid rgba(34,211,238,0.2)",
                        borderRadius: 20,
                        fontSize: 12,
                        color: "#22d3ee",
                        fontWeight: 600,
                      }}
                    >
                      {sub}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                marginTop: "1rem", padding: "10px 14px",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 10, color: "var(--danger)", fontSize: 13,
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <div style={{ display: "flex", gap: 12, marginTop: "2rem" }}>
          {step > 0 && step < 4 && (
            <motion.button
              onClick={goBack}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                flex: "0 0 auto", padding: "12px 20px",
                background: "var(--surface-2)", color: "var(--text-2)",
                border: "1px solid var(--border)", borderRadius: 10, fontWeight: 600, fontSize: 14,
                cursor: "pointer",
              }}
            >
              Back
            </motion.button>
          )}
          {step < 4 ? (
            <motion.button
              onClick={goNext}
              whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                flex: 1, padding: "13px",
                background: "var(--primary)", color: "#fff",
                border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              {step === 3 ? "Let's go" : "Next"}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleFinish}
              whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                flex: 1, padding: "13px",
                background: "var(--primary)", color: "#fff",
                border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              Start chatting
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
