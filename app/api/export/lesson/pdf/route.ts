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
    pdfDoc.setAuthor("Owlly");

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

    // ── Extract Success Criteria before other sections ──────────────────────
    const successCriteriaIdx = sections.findIndex(s =>
      /^success\s*criteria/i.test(s.header)
    );
    let successCriteriaBody = "";
    if (successCriteriaIdx !== -1) {
      successCriteriaBody = sections[successCriteriaIdx].body;
      sections.splice(successCriteriaIdx, 1);
    }

    // ── Success Criteria light-grey card (after meta row) ─────────────────
    if (successCriteriaBody) {
      if (y < 100) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = page.getSize().height - margin;
      }
      // Card background
      page.drawRectangle({ x: margin, y: y - 60, width: contentWidth, height: 56, color: rgb(0.93, 0.94, 0.96) });
      // Green accent strip on left
      page.drawRectangle({ x: margin, y: y - 60, width: 4, height: 56, color: accent });
      // Label
      page.drawText("SUCCESS CRITERIA", { x: margin + 12, y: y - 14, size: 7, font: boldFont, color: accent });
      // Bullet items
      const scLines = wrapText(successCriteriaBody.replace(/^[-*]\s*/gm, "• ").replace(/\n/g, "  "), Math.floor(contentWidth / 5.5));
      let scY = y - 28;
      for (const scLine of scLines.slice(0, 3)) {
        page.drawText(scLine, { x: margin + 12, y: scY, size: 9, font, color: dark });
        scY -= 12;
      }
      y -= 72;
    }

    // ── Differentiation banner (detect keywords) ───────────────────────────
    const diffKeywords = /\b(eal|esl|differentiation|gifted|extension|neps|neurodiverse|additional needs|scaffold|support)\b/i;
    const hasDiffSection = sections.some(s => diffKeywords.test(s.header + " " + s.body));

    const lineHeight = 14;
    const charsPerLine = Math.floor(contentWidth / 6.5);

    // ── Differentiation banner (before sections if keywords found in body) ─
    if (hasDiffSection) {
      if (y < 80) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = page.getSize().height - margin;
      }
      page.drawRectangle({ x: margin, y: y - 36, width: contentWidth, height: 34, color: rgb(0.15, 0.45, 0.35) });
      page.drawText("DIFFERENTIATION", { x: margin + 10, y: y - 24, size: 10, font: boldFont, color: rgb(1, 1, 1) });
      y -= 44;
    }

    for (const { header, body } of sections) {
      if (y < 120) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = page.getSize().height - margin;
      }

      // ── Detect Teacher | Students lesson-phase table ───────────────────────
      const bodyLines = body.split("\n").filter(l => l.trim());
      const tableRows = bodyLines.filter(l => l.startsWith("|") && !l.match(/^\|[\s\-:|]+\|$/));
      if (
        tableRows.length >= 2 &&
        /^\|\s*(Phase|Phase Name|Phase)\s*\|/i.test(tableRows[0]) &&
        /^\|\s*(Teacher|Teacher \()/i.test(tableRows[1] || "")
      ) {
        // Render proper phase table with green header
        if (y < 80) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = page.getSize().height - margin;
        }
        // Green header row
        page.drawRectangle({ x: margin, y: y - 22, width: contentWidth, height: 20, color: accent });
        const colWidths = [120, (contentWidth - 120) / 2, (contentWidth - 120) / 2];
        const headers = ["Phase", "Teacher", "Students"];
        let xPos = margin + 4;
        for (let ci = 0; ci < headers.length; ci++) {
          page.drawText(headers[ci], { x: xPos, y: y - 15, size: 9, font: boldFont, color: rgb(1, 1, 1) });
          xPos += colWidths[ci];
        }
        y -= 26;

        // Data rows
        let rowIdx = 0;
        for (const row of tableRows) {
          const cells = row.split("|").filter((_: string, i: number, a: string[]) => i > 0 && i < a.length - 1).map(c => c.trim());
          if (cells.length < 3) {
            // fallback: plain text
            const wrapped = wrapText(cells.join("  •  "), charsPerLine);
            for (const wl of wrapped) {
              if (y < 60) { page = pdfDoc.addPage([595.28, 841.89]); y = page.getSize().height - margin; }
              page.drawText(wl, { x: margin, y, size: 9, font, color: dark });
              y -= 12;
            }
            continue;
          }
          // Alternating row background
          if (rowIdx % 2 === 0) {
            page.drawRectangle({ x: margin, y: y - 20, width: contentWidth, height: 18, color: rgb(0.95, 0.97, 0.96) });
          }
          let cx = margin + 4;
          for (let ci = 0; ci < 3 && ci < cells.length; ci++) {
            const cellContent = cells[ci].replace(/[*_`]/g, "");
            const wrapped = wrapText(cellContent, Math.floor(colWidths[ci] / 4.5));
            const cellY = y - 10;
            page.drawText(wrapped[0].substring(0, 40), { x: cx, y: cellY, size: 8, font: ci === 0 ? boldFont : font, color: dark });
            cx += colWidths[ci];
          }
          y -= 20;
          rowIdx++;
        }
        y -= 10;
        continue;
      }

      page.drawText(header.toUpperCase(), { x: margin, y, size: 11, font: boldFont, color: accent });
      y -= 4;
      page.drawLine({ start: { x: margin, y }, end: { x: margin + 120, y }, thickness: 1, color: accent });
      y -= 18;

      const lines = wrapText(body, charsPerLine);
      for (const line of lines) {
        if (y < 80) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = page.getSize().height - margin;
        }
        page.drawText(line, { x: margin, y, size: 10, font, color: dark });
        y -= lineHeight;
      }
      y -= 10;
    }

    // Footer — branded with mint accent line
    const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
    const footerY = 40;
    // Mint accent line (4px green strip across bottom)
    lastPage.drawRectangle({ x: 0, y: 0, width, height: 4, color: accent });
    // Grey divider
    lastPage.drawLine({ start: { x: margin, y: footerY }, end: { x: width - margin, y: footerY }, thickness: 0.5, color: rgb(0.8, 0.8, 0.85) });
    lastPage.drawText("Created with Owlly · owlly.ai", { x: margin, y: footerY - 14, size: 8, font, color: rgb(0.5, 0.5, 0.6) });
    lastPage.drawText("Australian Curriculum v9 aligned", { x: width - margin - 150, y: footerY - 14, size: 8, font, color: rgb(0.5, 0.5, 0.6) });

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
