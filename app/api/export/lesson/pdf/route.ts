import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const SUBJECT_COLORS: Record<string, { r: number; g: number; b: number; label: string }> = {
  mathematics: { r: 0.15, g: 0.39, b: 0.92, label: "Mathematics" },
  english: { r: 0.31, g: 0.23, b: 0.93, label: "English" },
  science: { r: 0.09, g: 0.64, b: 0.29, label: "Science" },
  hass: { r: 0.92, g: 0.35, b: 0.05, label: "HASS" },
  technologies: { r: 0.03, g: 0.57, b: 0.70, label: "Technologies" },
  "the arts": { r: 0.86, g: 0.15, b: 0.47, label: "The Arts" },
  "health & physical education": { r: 0.05, g: 0.58, b: 0.53, label: "Health & PE" },
  languages: { r: 0.58, g: 0.20, b: 0.92, label: "Languages" },
};

function getSubjectColor(subject?: string) {
  const key = (subject || "general").toLowerCase();
  return SUBJECT_COLORS[key] || { r: 0.39, g: 0.40, b: 0.95, label: subject || "General" };
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) { lines.push(""); continue; }
    // Strip markdown
    const clean = trimmed.replace(/[#*_~`>\-\[\]()]/g, "").replace(/\s+/g, " ");
    const words = clean.split(" ");
    let current = "";
    for (const word of words) {
      if (current.length + word.length + 1 <= maxChars) {
        current += (current ? " " : "") + word;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function parseSections(content: string): { headers: string[]; bodies: string[] } {
  const headers: string[] = [];
  const bodies: string[] = [];
  const sections = content.split(/(?=^#{1,3}\s)/m);
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(#{1,3})\s+(.+)\n([\s\S]*)$/);
    if (match) {
      headers.push(match[2].replace(/[*_]/g, ""));
      bodies.push(match[3].trim());
    } else if (headers.length > 0) {
      bodies[bodies.length - 1] += "\n" + trimmed;
    } else {
      headers.push("Lesson Plan");
      bodies.push(trimmed);
    }
  }
  return { headers, bodies };
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, week, subject, yearLevel } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const color = getSubjectColor(subject);
    const cleanTitle = (title || "Lesson Plan").replace(/\*\*/g, "").trim();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(cleanTitle);
    pdfDoc.setAuthor("PickleNickAI");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const margin = 50;
    const contentWidth = width - margin * 2;
    let y = height - margin;

    const accent = rgb(color.r, color.g, color.b);
    const dark = rgb(0.1, 0.1, 0.18);

    // Header bar
    page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: accent });
    page.drawText("PICKLENICKAI", { x: margin, y: height - 45, size: 14, font: boldFont, color: rgb(1, 1, 1) });
    page.drawText("Australian Curriculum v9 · F-6 Teaching Resource", { x: margin, y: height - 65, size: 8, font, color: rgb(1, 1, 1) });
    y = height - 100;

    // Subject badge
    const badge = color.label;
    page.drawText(badge.toUpperCase(), { x: margin, y, size: 9, font: boldFont, color: accent });
    y -= 25;

    // Title
    const titleLines = wrapText(cleanTitle, 45);
    for (const line of titleLines) {
      page.drawText(line, { x: margin, y, size: 22, font: boldFont, color: dark });
      y -= 28;
    }
    y -= 5;

    // Meta info row
    const metaItems = [
      ["Subject", subject || "—"],
      ["Year Level", yearLevel || "—"],
      ["Week", week ? String(week) : "—"],
    ];
    const colW = contentWidth / 3;
    for (let i = 0; i < metaItems.length; i++) {
      const [label, value] = metaItems[i];
      const x = margin + i * colW;
      page.drawRectangle({ x, y: y - 18, width: colW - 6, height: 36, color: rgb(0.95, 0.96, 0.99), borderColor: rgb(0.85, 0.87, 0.93), borderSize: 1 });
      page.drawText(label.toUpperCase(), { x: x + 6, y: y - 6, size: 7, font: boldFont, color: accent });
      page.drawText(value, { x: x + 6, y: y - 26, size: 11, font, color: dark });
    }
    y -= 50;

    // Divider
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1.5, color: accent });
    y -= 20;

    // Content sections
    const { headers, bodies } = parseSections(content);
    const lineHeight = 14;
    const charsPerLine = Math.floor(contentWidth / 6.5);

    for (let s = 0; s < headers.length; s++) {
      const header = headers[s];
      const body = bodies[s];

      // Check space
      if (y < 120) { page = pdfDoc.addPage([595.28, 841.89]); y = page.getSize().height - margin; }

      // Section header
      page.drawText(header.toUpperCase(), { x: margin, y, size: 11, font: boldFont, color: accent });
      y -= 4;
      page.drawLine({ start: { x: margin, y }, end: { x: margin + 120, y }, thickness: 1, color: accent });
      y -= 18;

      // Body lines
      const bodyLines = wrapText(body, charsPerLine);
      for (const line of bodyLines) {
        if (y < 80) { page = pdfDoc.addPage([595.28, 841.89]); y = page.getSize().height - margin; }
        page.drawText(line, { x: margin, y, size: 10, font, color: dark });
        y -= lineHeight;
      }
      y -= 10;
    }

    // Footer
    page.drawLine({ start: { x: margin, y: 40 }, end: { x: width - margin, y: 40 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.85) });
    page.drawText("Created with PickleNickAI · picklenickai.com", { x: margin, y: 26, size: 8, font, color: rgb(0.5, 0.5, 0.6) });
    page.drawText("Australian Curriculum v9 aligned", { x: width - margin - 150, y: 26, size: 8, font, color: rgb(0.5, 0.5, 0.6) });

    const pdfBytes = await pdfDoc.save();
    const safeName = cleanTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Export failed" }, { status: 500 });
  }
}
