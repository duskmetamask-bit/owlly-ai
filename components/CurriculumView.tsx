"use client";
import { useState } from "react";

const SUBJECTS = [
  {
    id: "mathematics", label: "Mathematics", color: "#6366f1",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M20 16l-4-4 4-4"/><path d="M4 8l4 4-4 4"/><path d="M16 4l-4 4-4-4"/>
      </svg>
    ),
    strands: [
      { id: "number", label: "Number", content: { F: [{ code: "AC9MFN01", desc: "Name, represent and order numbers including zero up to 20" }, { code: "AC9MFN02", desc: "Partition and combine numbers up to 10" }, { code: "AC9MFN03", desc: "Quantify and compare collections to at least 20" }], "1": [{ code: "AC9M1N01", desc: "Recognise, represent and order numbers to at least 120" }, { code: "AC9M1N02", desc: "Partition two-digit numbers using place value" }, { code: "AC9M1N03", desc: "Add and subtract numbers within 20" }, { code: "AC9M1N04", desc: "Multiply and divide by 1, 2, 5 and 10" }], "2": [{ code: "AC9M2N01", desc: "Recognise, represent and order numbers to at least 1000" }, { code: "AC9M2N02", desc: "Partition, rearrange and regroup two- and three-digit numbers" }, { code: "AC9M2N03", desc: "Add and subtract numbers using efficient strategies" }, { code: "AC9M2N04", desc: "Multiply and divide by 2, 3, 5 and 10" }], "3": [{ code: "AC9M3N01", desc: "Recognise, represent and order whole numbers to at least 10,000" }, { code: "AC9M3N02", desc: "Add and subtract two- and three-digit numbers" }, { code: "AC9M3N03", desc: "Multiply and divide by single-digit numbers" }, { code: "AC9M3N04", desc: "Count by fractions and locate them on a number line" }], "4": [{ code: "AC9M4N01", desc: "Recognise and represent multiples and factors" }, { code: "AC9M4N02", desc: "Develop efficient strategies for multiplication" }, { code: "AC9M4N03", desc: "Multiply two- and three-digit numbers by single-digit numbers" }, { code: "AC9M4N04", desc: "Divide by single-digit numbers, including remainders" }], "5": [{ code: "AC9M5N01", desc: "Interpret, compare and order numbers of any size" }, { code: "AC9M5N02", desc: "Multiply and divide by 10, 100 and 1000" }, { code: "AC9M5N03", desc: "Solve problems involving multiplication of large numbers" }, { code: "AC9M5N04", desc: "Find the absolute value of integers" }], "6": [{ code: "AC9M6N01", desc: "Apply systematic enumeration strategies" }, { code: "AC9M6N02", desc: "Multiply and divide fractions and decimals" }, { code: "AC9M6N03", desc: "Solve problems with integers using all four operations" }, { code: "AC9M6N04", desc: "Apply the order of operations" }] } },
      { id: "algebra", label: "Algebra", content: { F: [{ code: "AC9MFN01", desc: "Name, represent and order numbers including zero up to 20" }], "1": [{ code: "AC9M1A01", desc: "Recognise, continue and create pattern sequences" }], "2": [{ code: "AC9M2A01", desc: "Describe patterns with numbers and shapes" }], "3": [{ code: "AC9M3A01", desc: "Recognise equivalent fractions and locate them on a number line" }], "4": [{ code: "AC9M4A01", desc: "Find unknown values in number sentences involving addition and subtraction" }], "5": [{ code: "AC9M5A01", desc: "Use equivalence to find unknown values in number sentences" }], "6": [{ code: "AC9M6A01", desc: "Interpret and continue number sequences involving multiples" }] } },
      { id: "measurement", label: "Measurement", content: { F: [{ code: "AC9MFN01", desc: "Use direct and indirect comparisons to order length, mass and capacity" }], "1": [{ code: "AC9M1M01", desc: "Measure and compare non-standard lengths, masses and capacities" }, { code: "AC9M1M02", desc: "Identify half and quarter measures on continuous quantities" }], "2": [{ code: "AC9M2M01", desc: "Measure using metric units: metres, centimetres, kilograms, grams, litres, millilitres" }, { code: "AC9M2M02", desc: "Read and record time in hours, half-hours and quarter-hours" }], "3": [{ code: "AC9M3M01", desc: "Measure and compare objects using metric units: mass (kg, g), length (m, cm, mm), capacity (L, mL)" }, { code: "AC9M3M02", desc: "Read and record time using analog and digital clocks" }], "4": [{ code: "AC9M4M01", desc: "Use scaled instruments to measure length, mass, capacity and temperature" }, { code: "AC9M4M02", desc: "Compare 12- and 24-hour time systems" }], "5": [{ code: "AC9M5M01", desc: "Choose appropriate metric units and convert between them" }, { code: "AC9M5M02", desc: "Solve problems involving the perimeter of quadrilaterals" }], "6": [{ code: "AC9M6M01", desc: "Convert between metric units including length, mass and capacity" }, { code: "AC9M6M02", desc: "Solve problems involving the area of triangles and parallelograms" }] } },
    ]
  },
  {
    id: "english", label: "English", color: "#a78bfa",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    strands: [
      { id: "literature", label: "Literature", content: { F: [{ code: "AC9EFLA01", desc: "Recognise and appreciate how sounds and文字 connect" }, { code: "AC9EFLE01", desc: "Respond to texts, sharing preferences and opinions" }], "1": [{ code: "AC9E1LA01", desc: "Understand how text structures create meaning" }, { code: "AC9E1LE01", desc: "Discuss stories, informative texts and poems" }], "2": [{ code: "AC9E2LA01", desc: "Identify features of different text types" }, { code: "AC9E2LE01", desc: "Identify the audience and purpose of texts" }], "3": [{ code: "AC9E3LA01", desc: "Understand how language choices affect meaning" }, { code: "AC9E3LE01", desc: "Analyse texts to identify viewpoint and intended audience" }], "4": [{ code: "AC9E4LA01", desc: "Analyse how text structures support the purpose of a text" }, { code: "AC9E4LE01", desc: "Make and justify interpretations of texts" }], "5": [{ code: "AC9E5LA01", desc: "Investigate how language features create layers of meaning" }, { code: "AC9E5LE01", desc: "Analyse and evaluate text structures and language features" }], "6": [{ code: "AC9E6LA01", desc: "Analyse language features including vocabulary, syntax and grammar" }, { code: "AC9E6LE01", desc: "Critically analyse how texts present perspectives and positions" }] } },
      { id: "literacies", label: "Literacies", content: { F: [{ code: "AC9EFLY01", desc: "Use comprehension strategies to understand texts" }], "1": [{ code: "AC9E1LY01", desc: "Read and view texts using combined knowledge of syllables, rhyme and letter patterns" }], "2": [{ code: "AC9E2LY01", desc: "Read and view texts using developing phonic, fluency and comprehension strategies" }], "3": [{ code: "AC9E3LY01", desc: "Use phonic, fluency and comprehension strategies to read texts" }], "4": [{ code: "AC9E4LY01", desc: "Read and view texts and compose written and multimodal texts" }], "5": [{ code: "AC9E5LY01", desc: "Navigate, read and view imaginative, informative and persuasive texts" }], "6": [{ code: "AC9E6LY01", desc: "Read, view and compose written, spoken and multimodal texts" }] } },
    ]
  },
  {
    id: "science", label: "Science", color: "#34d399",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3h6v2H9zM10 5v5l-3 9h10l-3-9V5"/><path d="M7 19h10"/>
      </svg>
    ),
    strands: [
      { id: "biological", label: "Biological Sciences", content: { F: [{ code: "AC9SFU01", desc: "Identify and describe living things and non-living things" }, { code: "AC9SFU02", desc: "Sort and describe living things based on features" }], "1": [{ code: "AC9S1U01", desc: "Describe the observable features of living things and their environments" }, { code: "AC9S1U02", desc: "Describe how different places provide different habitats" }], "2": [{ code: "AC9S2U01", desc: "Describe how living things have observable features and grow" }, { code: "AC9S2U02", desc: "Identify that living things live in different places within their environment" }], "3": [{ code: "AC9S3U01", desc: "Describe how living things meet their needs in their environment" }, { code: "AC9S3U02", desc: "Investigate how environments change and this affects living things" }], "4": [{ code: "AC9S4U01", desc: "Examine how the structural and behavioural features of living things help them survive" }], "5": [{ code: "AC9S5U01", desc: "Investigate the life cycles of different living things" }, { code: "AC9S5U02", desc: "Describe how food provides energy and nutrients for living things" }], "6": [{ code: "AC9S6U01", desc: "Analyse the adaptions of living things in relation to their environment" }, { code: "AC9S6U02", desc: "Investigate how selective breeding changes living things" }] } },
      { id: "chemical", label: "Chemical Sciences", content: { F: [{ code: "AC9SFU03", desc: "Sort objects by their observable properties" }], "1": [{ code: "AC9S1U03", desc: "Identify different materials and describe their uses" }], "2": [{ code: "AC9S2U03", desc: "Describe how different materials can be combined" }], "3": [{ code: "AC9S3U03", desc: "Describe how heat can cause changes in materials" }], "4": [{ code: "AC9S4U03", desc: "Investigate how materials change when heated or cooled" }], "5": [{ code: "AC9S5U03", desc: "Investigate how different mixtures can be separated" }], "6": [{ code: "AC9S6U03", desc: "Analyse the effects of forces on the behaviour of objects" }] } },
    ]
  },
  {
    id: "hass", label: "HASS", color: "#fb923c",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    strands: [
      { id: "history", label: "History", content: { F: [{ code: "AC9HFU01", desc: "Explore how people describe their daily life experiences" }], "1": [{ code: "AC9H1U01", desc: "Describe events in their own life and in the lives of family members" }], "2": [{ code: "AC9H2U01", desc: "Describe significant events in the history of their community" }], "3": [{ code: "AC9H3U01", desc: "Describe people, events and changes in the local community over time" }], "4": [{ code: "AC9H4U01", desc: "Describe the significance of people and events in the development of Australia" }], "5": [{ code: "AC9H5U01", desc: "Analyse the causes and effects of European settlement on First Australians" }], "6": [{ code: "AC9H6U01", desc: "Analyse the development of Australian democracy and its impact on rights" }] } },
      { id: "geography", label: "Geography", content: { F: [{ code: "AC9GFU01", desc: "Identify and describe features of places they experience" }], "1": [{ code: "AC9G1U01", desc: "Describe the features of the places they live in and belong to" }], "2": [{ code: "AC9G2U01", desc: "Describe the natural features of places and how they change" }], "3": [{ code: "AC9G3U01", desc: "Identify and describe the native vegetation and climate of places" }], "4": [{ code: "AC9G4U01", desc: "Investigate how people manage and care for environments" }], "5": [{ code: "AC9G5U01", desc: "Analyse how the environment influences the way people live in different places" }], "6": [{ code: "AC9G6U01", desc: "Analyse how interconnections influence the characteristics of places" }] } },
    ]
  },
  {
    id: "technologies", label: "Technologies", color: "#38bdf8",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    strands: [
      { id: "digital", label: "Digital Technologies", content: { F: [{ code: "AC9TDI01", desc: "Identify and explore digital systems and their purpose" }], "1": [{ code: "AC9TDI01", desc: "Recognise and explore digital systems for different purposes" }], "2": [{ code: "AC9TDI01", desc: "Collect and explore simple data from digital systems" }], "3": [{ code: "AC9TDI01", desc: "Identify and describe the components of digital systems" }], "4": [{ code: "AC9TDI01", desc: "Explain how digital systems represent data in ways that computers use" }], "5": [{ code: "AC9TDI01", desc: "Investigate how data is transmitted and secured in digital systems" }], "6": [{ code: "AC9TDI01", desc: "Analyse the components and structure of digital systems" }] } },
    ]
  },
];

const YEAR_LEVELS = ["F", "1", "2", "3", "4", "5", "6"];

interface CodeItem { code: string; desc: string; }

export default function CurriculumView() {
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [selectedStrand, setSelectedStrand] = useState("");
  const subject = SUBJECTS[selectedSubject];
  const selectedStrandData = subject?.strands.find(s => s.id === selectedStrand);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top header bar */}
      <div style={{
        padding: "20px 28px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "var(--primary-dim)",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--primary)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 2 }}>Curriculum Guide</h1>
          <p style={{ color: "var(--text-2)", fontSize: 12 }}>Australian Curriculum v9 — AC9 content descriptors</p>
        </div>
      </div>

      {/* Subject pill tabs */}
      <div style={{
        padding: "16px 28px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        gap: 8,
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {SUBJECTS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setSelectedSubject(i); setSelectedStrand(""); }}
            style={{
              padding: "8px 16px",
              background: selectedSubject === i ? `${s.color}18` : "var(--surface)",
              color: selectedSubject === i ? s.color : "var(--text-2)",
              border: `1px solid ${selectedSubject === i ? `${s.color}40` : "var(--border)"}`,
              borderRadius: "var(--radius-full)",
              fontSize: 13,
              fontWeight: selectedSubject === i ? 600 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ color: selectedSubject === i ? s.color : "var(--text-3)" }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Main content area */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "calc(100vh - 140px)" }}>
        {/* Strand sidebar */}
        <div style={{
          borderRight: "1px solid var(--border)",
          padding: "20px 0",
          background: "rgba(255,255,255,0.01)",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-3)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "0 16px", marginBottom: 10,
          }}>
            {subject?.label} Strands
          </div>
          {subject?.strands.map(strand => (
            <button
              key={strand.id}
              onClick={() => setSelectedStrand(selectedStrand === strand.id ? "" : strand.id)}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: selectedStrand === strand.id ? "var(--primary-dim)" : "transparent",
                color: selectedStrand === strand.id ? "var(--primary)" : "var(--text-2)",
                border: "none",
                borderLeft: `2px solid ${selectedStrand === strand.id ? "var(--primary)" : "transparent"}`,
                fontSize: 13,
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.12s ease",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: selectedStrand === strand.id ? "var(--primary)" : "var(--text-3)",
                flexShrink: 0,
              }} />
              {strand.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{ padding: "24px 28px", overflowY: "auto" }}>
          {selectedStrand && selectedStrandData?.content ? (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              {/* Strand header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${subject?.color}15`,
                    border: `1px solid ${subject?.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: subject?.color,
                  }}>
                    {subject?.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: subject?.color, letterSpacing: "-0.01em" }}>
                      {selectedStrandData.label}
                    </h2>
                  </div>
                </div>
                <p style={{ color: "var(--text-2)", fontSize: 12, marginLeft: 46 }}>
                  Content descriptors across all year levels
                </p>
              </div>

              {/* Year level cards grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {YEAR_LEVELS.map(yl => {
                  const items = (selectedStrandData.content as Record<string, CodeItem[]>)[yl] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={yl} style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      overflow: "hidden",
                    }}>
                      {/* Year header */}
                      <div style={{
                        padding: "10px 14px",
                        background: `${subject?.color}08`,
                        borderBottom: `1px solid ${subject?.color}15`,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: `${subject?.color}20`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 800, color: subject?.color,
                        }}>
                          {yl === "F" ? "F" : yl}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: subject?.color }}>
                          {yl === "F" ? "Foundation" : `Year ${yl}`}
                        </span>
                      </div>

                      {/* Code items */}
                      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                        {items.map((item: CodeItem) => (
                          <CodeCard key={item.code} item={item} color={subject?.color || "#6366f1"} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
              textAlign: "center",
              animation: "fadeIn 0.3s ease",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
                color: "var(--text-3)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                {subject?.label}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 280 }}>
                Select a strand from the left panel to explore AC9 content descriptors
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function CodeCard({ item, color }: { item: CodeItem; color: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`${item.code} — ${item.desc}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius)",
      padding: "10px 12px",
      transition: "border-color 0.12s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{
          fontFamily: "monospace",
          fontSize: 10.5,
          fontWeight: 700,
          color: color,
          background: `${color}12`,
          padding: "2px 7px",
          borderRadius: 5,
          letterSpacing: "0.02em",
          flexShrink: 0,
        }}>
          {item.code}
        </div>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 10,
            padding: "3px 8px",
            background: copied ? `${color}15` : "var(--surface)",
            color: copied ? color : "var(--text-3)",
            border: `1px solid ${copied ? `${color}30` : "var(--border)"}`,
            borderRadius: 5,
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.12s ease",
            flexShrink: 0,
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55, margin: "6px 0 0", }}>
        {item.desc}
      </p>
    </div>
  );
}
