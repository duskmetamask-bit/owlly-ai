/**
 * Lesson Plan Template System
 * Parses raw AI content into structured sections, then renders to PDF/DOCX/PPTX
 */

export interface LessonPlan {
  title: string;
  subject: string;
  yearLevel: string;
  duration: string;
  date: string;
  teacherName: string;
  schoolName: string;
  objectives: string[];
  curriculumCodes: string[];
  materials: string[];
  lessonSteps: LessonStep[];
  assessment: string[];
  differentiation: string[];
  notes: string;
  rawContent: string;
}

export interface LessonStep {
  time: string;
  label: string;
  description: string;
  teacherActions: string[];
  studentActions: string[];
}

// ─── Parser ─────────────────────────────────────────────────────────

export function parseLessonPlan(content: string, title = "Lesson Plan"): LessonPlan {
  const lines = content.split("\n");
  const blank = (l: string) => l.trim() === "";

  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)/im);
  const foundTitle = titleMatch ? titleMatch[1].trim() : title;

  // Extract subject from "Subject:", "Subject:", "SUBJECT"
  const subjectMatch = content.match(/(?:Subject|Subject:|subject):\s*(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "";

  // Extract year level
  const yearMatch = content.match(/(?:Year|Year Level|Year:|year level):\s*(.+)/i);
  const yearLevel = yearMatch ? yearMatch[1].trim() : "";

  // Extract duration
  const durationMatch = content.match(/(?:Duration|Time|Length|Time Required):\s*(.+)/i);
  const duration = durationMatch ? durationMatch[1].trim() : "";

  // Extract date
  const dateMatch = content.match(/(?:Date|Date:|date):\s*(.+)/i);
  const date = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString("en-AU");

  // Extract objectives (## Objectives / ## Learning Objectives)
  const objectives = extractSection(content, /(?:## |##\s+)(?:Learning\s+)?Objectives?/i, /(?:## |##\s+)/);

  // Extract curriculum codes (AC9..., ACARA, Aust Curriculum)
  const curriculumCodes = extractList(content, /(?:Curriculum|Curriculum Codes|Australian Curriculum|AC9|ACARA)\s*Codes?:?/i, /(?:## |##\s+)/);

  // Extract materials
  const materials = extractList(content, /(?:## |##\s+)(?:Resources?|Materials?|Equipment|What You[' ]?ll Need)/i, /(?:## |##\s+)/);

  // Extract lesson steps
  const lessonSteps = extractSteps(content);

  // Extract assessment
  const assessment = extractList(content, /(?:## |##\s+)(?:Assessment|Evaluation|Success Criteria)/i, /(?:## |##\s+)/);

  // Extract differentiation
  const differentiation = extractList(content, /(?:## |##\s+)(?:Differentiation|Inclusive|Adjustments|Adaptations)/i, /(?:## |##\s+)/);

  // Extract notes
  const notesMatch = content.match(/(?:## |##\s+)(?:Notes|Teacher Notes|Reflection)\n([\s\S]*?)(?=\n## |\n# |\n*$)/i);
  const notes = notesMatch ? notesMatch[1].trim() : "";

  return {
    title: foundTitle,
    subject,
    yearLevel,
    duration,
    date,
    teacherName: "",
    schoolName: "",
    objectives,
    curriculumCodes,
    materials,
    lessonSteps,
    assessment,
    differentiation,
    notes,
    rawContent: content,
  };
}

function extractSection(content: string, startRx: RegExp, endRx: RegExp): string[] {
  const match = content.match(new RegExp(startRx.source + "([\\s\\S]*?)(?=" + endRx.source + "|$)", "i"));
  if (!match) return [];
  return match[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(l => l && !l.match(/^\s*$/));
}

function extractList(content: string, startRx: RegExp, endRx: RegExp): string[] {
  return extractSection(content, startRx, endRx);
}

function extractSteps(content: string): LessonStep[] {
  const steps: LessonStep[] = [];
  const regex = /(?:^|\n)(?:#{1,3}\s*)?(?:\d+\.?\s*)?(?:Step|Phase|Stage|Activity)?\s*(?:\d+\:?)\s*([^\n]+)\n([\s\S]*?)(?=(?:\n#{1,3}\s*(?:Step|Phase|Stage|Activity|Unpacked)|$))/gi;
  let m: RegExpExecArray | null = null;
  while ((m = regex.exec(content)) !== null) {
    const label = m[1].replace(/^[-–]\s*/, "").trim();
    const block = m[2].trim();
    const timeMatch = block.match(/(?:Time|Duration|Timing):\s*(.+)/i);
    const time = timeMatch ? timeMatch[1].trim() : "";
    // Separate teacher actions from student actions
    const teacherLines: string[] = [];
    const studentLines: string[] = [];
    const descLines: string[] = [];
    let currentList: string[] | null = null;
    for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) { currentList = null; continue; }
      if (/^(Teacher|Facilitator|You|Instructions?):/i.test(trimmed)) {
        currentList = teacherLines;
        teacherLines.push(trimmed.replace(/^(Teacher|Facilitator|You|Instructions?):\s*/i, ""));
      } else if (/^(Students?|Learners|Pupils):/i.test(trimmed)) {
        currentList = studentLines;
        studentLines.push(trimmed.replace(/^(Students?|Learners|Pupils):\s*/i, ""));
      } else if (/^[•\-*]/.test(trimmed)) {
        (currentList || descLines).push(trimmed.replace(/^[•\-*]\s*/, ""));
      } else if (/\d+\s*min/i.test(trimmed)) {
        // timing detail, skip
      } else {
        if (currentList) {
          currentList.push(trimmed);
        } else {
          descLines.push(trimmed);
        }
      }
    }
    steps.push({
      label: label || `Step ${steps.length + 1}`,
      time,
      description: descLines.join(" "),
      teacherActions: teacherLines,
      studentActions: studentLines,
    });
  }
  return steps;
}

// ─── PDF Renderer ────────────────────────────────────────────────────

export async function renderLessonPlanPDF(plan: LessonPlan): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 56;
  const fontSize = 10;
  const smallSize = 9;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let y = pageHeight - margin;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  function newPage() {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  function checkPage(h = 20) {
    if (y < margin + h) { newPage(); }
  }

  function drawText(text: string, size: number, isBold = false, color = rgb(0.12, 0.12, 0.12), indent = 0) {
    checkPage(size + 4);
    page.drawText(text, { x: margin + indent, y, size, font: isBold ? bold : font, color });
    y -= size + 4;
  }

  function drawHeading(text: string, size: number) {
    checkPage(size + 10);
    y -= 6;
    page.drawText(text.toUpperCase(), { x: margin, y, size, font: bold, color: rgb(0.55, 0.27, 0.07) });
    y -= size + 4;
  }

  function drawDivider() {
    checkPage(8);
    page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
    y -= 8;
  }

  // ── Header block ──
  // School name (if set)
  if (plan.schoolName) {
    drawText(plan.schoolName.toUpperCase(), 8, false, rgb(0.5, 0.5, 0.5));
  }

  // Title
  drawText(plan.title, 22, true, rgb(0.1, 0.1, 0.1));
  y -= 4;

  // Meta row
  const metaItems = [
    plan.subject && `Subject: ${plan.subject}`,
    plan.yearLevel && `Year: ${plan.yearLevel}`,
    plan.duration && `Duration: ${plan.duration}`,
    plan.date && `Date: ${plan.date}`,
  ].filter(Boolean);

  if (metaItems.length) {
    drawText(metaItems.join("  |  "), 9, false, rgb(0.4, 0.4, 0.4));
  }

  drawDivider();

  // ── Two-column layout: Objectives | Curriculum Codes ──
  if (plan.objectives.length || plan.curriculumCodes.length) {
    const colW = (pageWidth - margin * 2 - 16) / 2;

    if (plan.objectives.length) {
      checkPage(80);
      page.drawText("LEARNING OBJECTIVES", { x: margin, y, size: 8, font: bold, color: rgb(0.55, 0.27, 0.07) });
      y -= 12;
      for (const obj of plan.objectives) {
        checkPage(14);
        page.drawText("•  " + obj, { x: margin + 4, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
        y -= fontSize + 3;
      }
    }

    if (plan.curriculumCodes.length) {
      // Jump back up to draw in second column
      const startY = y;
      page.drawText("CURRICULUM CODES", { x: margin + colW + 16, y: pageHeight - margin - 8, size: 8, font: bold, color: rgb(0.55, 0.27, 0.07) });
      let cy = pageHeight - margin - 8 - 14;
      for (const code of plan.curriculumCodes) {
        if (cy < margin + 12) break;
        page.drawText(code, { x: margin + colW + 20, y: cy, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
        cy -= fontSize + 3;
      }
      if (y > cy) y = cy;
    }

    y -= 8;
    drawDivider();
  }

  // ── Materials ──
  if (plan.materials.length) {
    checkPage(60);
    drawHeading("Materials & Resources", 9);
    for (const mat of plan.materials) {
      checkPage(14);
      page.drawText("•  " + mat, { x: margin + 4, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
      y -= fontSize + 3;
    }
    y -= 6;
    drawDivider();
  }

  // ── Lesson Steps ──
  if (plan.lessonSteps.length) {
    checkPage(30);
    drawHeading("Lesson Sequence", 9);
    for (let i = 0; i < plan.lessonSteps.length; i++) {
      const step = plan.lessonSteps[i];
      checkPage(50);

      // Step number + label
      page.drawText(`${i + 1}.  ${step.label}`, { x: margin, y, size: 11, font: bold, color: rgb(0.1, 0.1, 0.1) });
      y -= fontSize + 2;

      if (step.time) {
        page.drawText(`Time: ${step.time}`, { x: margin + 16, y, size: smallSize, font: italic, color: rgb(0.5, 0.4, 0.3) });
        y -= smallSize + 3;
      }

      if (step.description) {
        checkPage(fontSize + 4);
        page.drawText(step.description, { x: margin + 16, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
        y -= fontSize + 4;
      }

      if (step.teacherActions.length) {
        for (const ta of step.teacherActions) {
          checkPage(fontSize + 3);
          page.drawText("  Teacher: " + ta, { x: margin + 16, y, size: smallSize, font, color: rgb(0.35, 0.35, 0.35) });
          y -= smallSize + 2;
        }
      }

      if (step.studentActions.length) {
        for (const sa of step.studentActions) {
          checkPage(fontSize + 3);
          page.drawText("  Students: " + sa, { x: margin + 16, y, size: smallSize, font, color: rgb(0.35, 0.35, 0.35) });
          y -= smallSize + 2;
        }
      }

      y -= 6;
    }
    drawDivider();
  }

  // ── Assessment ──
  if (plan.assessment.length) {
    checkPage(40);
    drawHeading("Assessment", 9);
    for (const a of plan.assessment) {
      checkPage(14);
      page.drawText("•  " + a, { x: margin + 4, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
      y -= fontSize + 3;
    }
    y -= 6;
    drawDivider();
  }

  // ── Differentiation ──
  if (plan.differentiation.length) {
    checkPage(40);
    drawHeading("Differentiation", 9);
    for (const d of plan.differentiation) {
      checkPage(14);
      page.drawText("•  " + d, { x: margin + 4, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
      y -= fontSize + 3;
    }
    y -= 6;
    drawDivider();
  }

  // ── Notes ──
  if (plan.notes) {
    checkPage(30);
    drawHeading("Teacher Notes", 9);
    const noteLines = plan.notes.split("\n").filter(l => l.trim());
    for (const nl of noteLines) {
      checkPage(fontSize + 3);
      page.drawText(nl, { x: margin, y, size: fontSize, font, color: rgb(0.25, 0.25, 0.25) });
      y -= fontSize + 3;
    }
  }

  // ── Footer ──
  const footerY = margin - 10;
  page.drawLine({ start: { x: margin, y: footerY }, end: { x: pageWidth - margin, y: footerY }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  page.drawText("Created with Owlly  |  pickle-nick-ai.vercel.app", { x: margin, y: footerY - 10, size: 7, font: italic, color: rgb(0.6, 0.6, 0.6) });

  const buf = await pdfDoc.save();
  return new Blob([new Uint8Array(buf)], { type: "application/pdf" });
}

// ─── DOCX Renderer ───────────────────────────────────────────────────

export async function renderLessonPlanDOCX(plan: LessonPlan): Promise<Blob> {
  const docxModule = await import("docx");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docxModule;

  const accentColor = "8B4513";

  function h(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
    return new Paragraph({ text, heading: level });
  }

  function p(text: string, bold = false, italic = false, color?: string) {
    return new Paragraph({
      children: [new TextRun({ text, bold, italics: italic, color })],
    });
  }

  function bullet(text: string) {
    return new Paragraph({
      children: [new TextRun({ text: "•  " + text })],
      indent: { left: 360 },
    });
  }

  function sectionHeading(text: string) {
    return new Paragraph({
      children: [new TextRun({ text: text.toUpperCase(), bold: true, color: accentColor, size: 22 })],
      spacing: { before: 280, after: 100 },
      border: { bottom: { color: accentColor, size: 8, style: BorderStyle.SINGLE, space: 4 } },
    });
  }

  function spacer() {
    return new Paragraph({ children: [] });
  }

  const children = [
    // Title block
    new Paragraph({ children: [new TextRun({ text: plan.title, bold: true, size: 40, color: "1A1A1A" })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    plan.schoolName ? new Paragraph({ children: [new TextRun({ text: plan.schoolName.toUpperCase(), color: "888888", size: 18 })], alignment: AlignmentType.CENTER }) : spacer(),
    spacer(),
    plan.subject ? p(`Subject: ${plan.subject}    Year: ${plan.yearLevel}    Duration: ${plan.duration}    Date: ${plan.date}`, false, true, "555555") : spacer(),
    spacer(),
    sectionHeading("Learning Objectives"),
    ...plan.objectives.map(bullet),
    spacer(),
    ...(plan.curriculumCodes.length ? [sectionHeading("Australian Curriculum Codes"), ...plan.curriculumCodes.map(bullet), spacer()] : []),
    ...(plan.materials.length ? [sectionHeading("Materials & Resources"), ...plan.materials.map(bullet), spacer()] : []),
    ...(plan.lessonSteps.length ? [sectionHeading("Lesson Sequence"), ...plan.lessonSteps.flatMap((step, i) => [
      new Paragraph({ children: [new TextRun({ text: `${i + 1}.  ${step.label}`, bold: true, size: 24, color: "1A1A1A" })], spacing: { before: 180, after: 60 } }),
      ...(step.time ? [p(`Time: ${step.time}`, false, true, "666666")] : []),
      ...(step.description ? [p(step.description)] : []),
      ...step.teacherActions.map(ta => p("Teacher: " + ta, false, false, "555555")),
      ...step.studentActions.map(sa => p("Students: " + sa, false, false, "555555")),
    ])] : []),
    ...(plan.assessment.length ? [sectionHeading("Assessment & Success Criteria"), ...plan.assessment.map(bullet), spacer()] : []),
    ...(plan.differentiation.length ? [sectionHeading("Differentiation"), ...plan.differentiation.map(bullet), spacer()] : []),
    ...(plan.notes ? [sectionHeading("Teacher Notes"), p(plan.notes)] : []),
    spacer(),
    new Paragraph({ children: [new TextRun({ text: "Created with Owlly  |  pickle-nick-ai.vercel.app", italics: true, size: 16, color: "AAAAAA" })], alignment: AlignmentType.CENTER }),
  ].flat();

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBlob(doc);
}

// ─── PPTX Renderer ──────────────────────────────────────────────────

export async function renderLessonPlanPPTX(plan: LessonPlan): Promise<Blob> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = plan.title;
  pptx.subject = plan.subject;
  pptx.author = "Owlly";

  const ACCENT = "8B4513";
  const DARK = "1A1A2E";
  const MID = "444444";
  const LIGHT_BG = "F8F4EF";

  // ── Slide 1: Title ──
  const t1 = pptx.addSlide();
  t1.background = { color: DARK };
  t1.addText(plan.title, { x: 0.5, y: 2.4, w: "90%", h: 1.6, fontSize: 44, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  t1.addText([plan.subject, plan.yearLevel, plan.duration].filter(Boolean).join("  •  "), { x: 0.5, y: 4.2, w: "90%", h: 0.5, fontSize: 20, color: "AAAAAA", align: "center" });
  t1.addText("Created with Owlly", { x: 0.5, y: 7.2, w: "90%", h: 0.4, fontSize: 12, color: "555555", align: "center" });

  // ── Slide 2: Overview ──
  const t2 = pptx.addSlide();
  t2.background = { color: LIGHT_BG };
  t2.addText("Lesson Overview", { x: 0.4, y: 0.3, w: "95%", h: 0.7, fontSize: 28, bold: true, color: ACCENT });
  t2.addShape("rect", { x: 0.4, y: 1.0, w: "95%", h: 0.04, fill: { color: ACCENT } });

  const overviewItems = [
    plan.subject && `Subject: ${plan.subject}`,
    plan.yearLevel && `Year Level: ${plan.yearLevel}`,
    plan.duration && `Duration: ${plan.duration}`,
    plan.date && `Date: ${plan.date}`,
  ].filter(Boolean);

  if (overviewItems.length) {
    t2.addText(overviewItems.join("\n"), { x: 0.5, y: 1.2, w: "90%", h: 2.0, fontSize: 18, color: MID, valign: "top" });
  }

  if (plan.objectives.length) {
    t2.addText("Learning Objectives", { x: 0.4, y: 3.3, w: "90%", h: 0.4, fontSize: 14, bold: true, color: ACCENT });
    t2.addText(plan.objectives.map(o => "•  " + o).join("\n"), { x: 0.5, y: 3.7, w: "90%", h: 2.5, fontSize: 14, color: MID, valign: "top" });
  }

  // ── Slides: Lesson Steps ──
  for (let i = 0; i < plan.lessonSteps.length; i++) {
    const step = plan.lessonSteps[i];
    const slide = pptx.addSlide();
    slide.background = { color: LIGHT_BG };

    // Header bar
    slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.7, fill: { color: ACCENT } });
    slide.addText(`Step ${i + 1}: ${step.label}`, { x: 0.4, y: 0.1, w: "95%", h: 0.5, fontSize: 22, bold: true, color: "FFFFFF" });

    if (step.time) {
      slide.addText(`⏱  ${step.time}`, { x: 0.4, y: 0.85, w: "90%", h: 0.35, fontSize: 13, color: "888888", italic: true });
    }

    if (step.description) {
      slide.addText(step.description, { x: 0.4, y: 1.3, w: "90%", h: 1.8, fontSize: 15, color: DARK, valign: "top" });
    }

    let sy = 3.3;
    if (step.teacherActions.length) {
      slide.addText("Teacher Actions", { x: 0.4, y: sy, w: "90%", h: 0.35, fontSize: 12, bold: true, color: ACCENT });
      sy += 0.35;
      slide.addText(step.teacherActions.map(ta => "•  " + ta).join("\n"), { x: 0.5, y: sy, w: "90%", h: 1.2, fontSize: 12, color: MID });
      sy += 1.1;
    }
    if (step.studentActions.length) {
      slide.addText("Student Activities", { x: 0.4, y: sy, w: "90%", h: 0.35, fontSize: 12, bold: true, color: ACCENT });
      sy += 0.35;
      slide.addText(step.studentActions.map(sa => "•  " + sa).join("\n"), { x: 0.5, y: sy, w: "90%", h: 1.2, fontSize: 12, color: MID });
    }
  }

  // ── Slide: Materials ──
  if (plan.materials.length) {
    const sm = pptx.addSlide();
    sm.background = { color: LIGHT_BG };
    sm.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.7, fill: { color: ACCENT } });
    sm.addText("Materials & Resources", { x: 0.4, y: 0.1, w: "95%", h: 0.5, fontSize: 22, bold: true, color: "FFFFFF" });
    sm.addText(plan.materials.map(m => "•  " + m).join("\n"), { x: 0.5, y: 1.0, w: "90%", h: 5.0, fontSize: 16, color: DARK, valign: "top" });
  }

  // ── Slide: Assessment ──
  if (plan.assessment.length || plan.differentiation.length) {
    const sa = pptx.addSlide();
    sa.background = { color: LIGHT_BG };
    sa.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.7, fill: { color: ACCENT } });
    sa.addText("Assessment & Differentiation", { x: 0.4, y: 0.1, w: "95%", h: 0.5, fontSize: 22, bold: true, color: "FFFFFF" });

    if (plan.assessment.length) {
      sa.addText("Assessment", { x: 0.4, y: 0.9, w: "90%", h: 0.4, fontSize: 14, bold: true, color: ACCENT });
      sa.addText(plan.assessment.map(a => "•  " + a).join("\n"), { x: 0.5, y: 1.3, w: "90%", h: 2.0, fontSize: 14, color: DARK });
    }
    if (plan.differentiation.length) {
      sa.addText("Differentiation", { x: 0.4, y: 3.5, w: "90%", h: 0.4, fontSize: 14, bold: true, color: ACCENT });
      sa.addText(plan.differentiation.map(d => "•  " + d).join("\n"), { x: 0.5, y: 3.9, w: "90%", h: 2.5, fontSize: 14, color: DARK });
    }
  }

  return pptx.write({}) as Promise<Blob>;
}

// ─── Auto-detection ─────────────────────────────────────────────────

export function detectLessonPlanType(content: string): "lesson_plan" | "unit_plan" | "rubric" | "other" {
  const lower = content.toLowerCase();
  if (/objectives?|learning outcomes?/i.test(lower) && /lesson sequence|lesson steps|lesson plan/i.test(lower)) return "lesson_plan";
  if (/unit plan|unit overview|unit title/i.test(lower)) return "unit_plan";
  if (/rubric|assessment criteria/i.test(lower)) return "rubric";
  return "other";
}

// ─── Updated export wrappers ─────────────────────────────────────────

import { downloadTxt } from "./exportUtils";

export async function downloadLessonPlanPdf(plan: LessonPlan) {
  const blob = await renderLessonPlanPDF(plan);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${plan.title}.pdf`; a.click();
  URL.revokeObjectURL(url);
}

export async function downloadLessonPlanDocx(plan: LessonPlan) {
  const blob = await renderLessonPlanDOCX(plan);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${plan.title}.docx`; a.click();
  URL.revokeObjectURL(url);
}

export async function downloadLessonPlanPptx(plan: LessonPlan) {
  const blob = await renderLessonPlanPPTX(plan);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${plan.title}.pptx`; a.click();
  URL.revokeObjectURL(url);
}

export async function downloadLessonPlan(content: string, label = "lesson-plan") {
  const plan = parseLessonPlan(content, label);
  return { plan, downloadPdf: () => downloadLessonPlanPdf(plan), downloadDocx: () => downloadLessonPlanDocx(plan), downloadPptx: () => downloadLessonPlanPptx(plan) };
}
