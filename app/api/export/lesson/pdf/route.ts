import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const BRAND_GREEN = rgb(0.15, 0.45, 0.35);
const DARK = rgb(0.1, 0.1, 0.18);

const SUBJECT_LABELS: Record<string, string> = {
  mathematics: "Mathematics",
  english: "English",
  science: "Science",
  hass: "HASS",
  technologies: "Technologies",
  "the arts": "The Arts",
  "health & physical education": "Health & PE",
  languages: "Languages",
};

function getSubjectLabel(subject?: string): string {
  const key = (subject || "general").toLowerCase();
  return SUBJECT_LABELS[key] || subject || "General";
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) { lines.push(""); continue; }
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

export async function POST(req: NextRequest) {
  try {
    const { content, title, week, subject, yearLevel } = await req.json();
    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

    const subjectLabel = getSubjectLabel(subject);
    const cleanTitle = (title || "Lesson Plan").replace(/\*\*/g, "").trim();
    const safeName = cleanTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(cleanTitle);
    pdfDoc.setAuthor("PickleNickAI");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const accent = BRAND_GREEN;
    const dark = DARK;

    let page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 50;
    const contentWidth = width - margin * 2;
    let y = height - margin;

    // Header bar
    page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: accent });
    page.drawText("PICKLENICKAI", { x: margin, y: height - 45, size: 14, font: boldFont, color: rgb(1, 1, 1) });
    page.drawText("Australian Curriculum v9 · F-6 Teaching Resource", { x: margin, y: height - 65, size: 8, font, color: rgb(1, 1, 1) });
    y = height - 100;

    // Subject badge
    page.drawText(subjectLabel.toUpperCase(), { x: margin, y, size: 9, font: boldFont, color: accent });
    y -= 25;

    // Title
    const titleLines = wrapText(cleanTitle, 45);
    for (const line of titleLines) {
      page.drawText(line, { x: margin, y, size: 22, font: boldFont, color: dark });
      y -= 28;
    }
    y -= 5;

    // Meta row
    const colW = contentWidth / 3;
    const metaItems: [string, string][] = [
      ["Subject", subject || "—"],
      ["Year Level", yearLevel || "—"],
      ["Week", week ? String(week) : "—"],
    ];
    for (let i = 0; i < metaItems.length; i++) {
      const [label, value] = metaItems[i];
      const x = margin + i * colW;
      page.drawRectangle({ x, y: y - 18, width: colW - 6, height: 36, color: rgb(0.95, 0.96, 0.99) });
      page.drawText(label.toUpperCase(), { x: x + 6, y: y - 6, size: 7, font: boldFont, color: accent });
      page.drawText(value, { x: x + 6, y: y - 26, size: 11, font, color: dark });
    }
    y -= 50;

    // Divider
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1.5, color: accent });
    y -= 20;

    // Parse sections by markdown headers
    const sectionRegex = /^(#{1,3})\s+(.+)\n([\s\S]*?)(?=(^#{1,3}\s)|$)/gm;
    const matches = [...content.matchAll(sectionRegex)];
    const sections: { header: string; body: string }[] = [];
    for (const m of matches) {
      sections.push({ header: m[2].replace(/[*_]/g, ""), body: m[3].trim() });
    }
    if (sections.length === 0) sections.push({ header: "Lesson Plan", body: content });

    const lineHeight = 14;
    const charsPerLine = Math.floor(contentWidth / 6.5);

    for (const { header, body } of sections) {
      if (y < 120) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = page.getSize().height - margin;
      }

      page.drawText(header.toUpperCase(), { x: margin, y, size: 11, font: boldFont, color: accent });
      y -= 4;
      page.drawLine({ start: { x: margin, y }, end: { x: margin + 120, y }, thickness: 1, color: accent });
      y -= 18;

      const bodyLines = wrapText(body, charsPerLine);
      for (const line of bodyLines) {
        if (y < 80) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = page.getSize().height - margin;
        }
        page.drawText(line, { x: margin, y, size: 10, font, color: dark });
        y -= lineHeight;
      }
      y -= 10;
    }

    // Footer
    const footerY = 40;
    page.drawLine({ start: { x: margin, y: footerY }, end: { x: width - margin, y: footerY }, thickness: 0.5, color: rgb(0.8, 0.8, 0.85) });
    page.drawText("Created with PickleNickAI · picklenickai.com", { x: margin, y: footerY - 14, size: 8, font, color: rgb(0.5, 0.5, 0.6) });
    page.drawText("Australian Curriculum v9 aligned", { x: width - margin - 150, y: footerY - 14, size: 8, font, color: rgb(0.5, 0.5, 0.6) });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Export failed" }, { status: 500 });
  }
}
