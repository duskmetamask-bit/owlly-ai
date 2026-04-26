"use client";
import { useState } from "react";

const SUBJECTS = [
  { id: "mathematics", label: "Mathematics", strands: ["Number", "Algebra", "Measurement", "Geometry", "Statistics", "Probability"] },
  { id: "english", label: "English", strands: ["Language", "Literature", "Literacies"] },
  { id: "science", label: "Science", strands: ["Biological Sciences", "Chemical Sciences", "Earth & Space Sciences", "Physical Sciences"] },
  { id: "hass", label: "HASS", strands: ["History", "Geography", "Civics & Citizenship", "Economics & Business"] },
  { id: "technologies", label: "Technologies", strands: ["Digital Technologies", "Design & Technologies"] },
];

export default function CurriculumView() {
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [selectedStrand, setSelectedStrand] = useState("");
  const subject = SUBJECTS[selectedSubject];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Curriculum Guide</h1>
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Browse the Australian Curriculum v9 by subject and strand</p>
      </div>
      <div style={{ padding: "14px 28px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SUBJECTS.map((s, i) => (
          <button key={s.id} onClick={() => { setSelectedSubject(i); setSelectedStrand(""); }}
            style={{ padding: "8px 16px", background: selectedSubject === i ? "var(--primary)" : "var(--surface2)", color: selectedSubject === i ? "#fff" : "var(--text2)", border: "none", borderRadius: 20, fontSize: 13, fontWeight: selectedSubject === i ? 700 : 400, cursor: "pointer" }}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 130px)" }}>
        <div style={{ borderRight: "1px solid var(--border)", padding: "16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Strands</div>
          {subject.strands.map(strand => (
            <button key={strand} onClick={() => setSelectedStrand(selectedStrand === strand ? "" : strand)}
              style={{ width: "100%", padding: "9px 12px", background: selectedStrand === strand ? "rgba(99,102,241,0.15)" : "transparent", color: selectedStrand === strand ? "var(--primary)" : "var(--text2)", border: "none", borderRadius: 8, fontSize: 13, textAlign: "left", cursor: "pointer", marginBottom: 2 }}>
              {strand}
            </button>
          ))}
        </div>
        <div style={{ padding: "24px 28px" }}>
          {selectedStrand ? (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>{selectedStrand}</h2>
              <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Content for {selectedStrand} in {subject.label} across F-6. Connect to a curriculum database to populate full content descriptors and achievement standards.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["F", "1", "2", "3", "4", "5", "6"].map(yl => (
                  <div key={yl} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Year {yl}</div>
                    <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.6 }}>
                      Content descriptor placeholder for {selectedStrand} at Year {yl} level.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{subject.label}</h2>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>Select a strand to view content descriptors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
