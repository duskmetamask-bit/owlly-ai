import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (!para.trim()) { lines.push(""); continue; }
    const words = para.split(" ");
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

function parseMetadata(content: string) {
  const result = { yearLevel: "", subject: "", duration: "" };
  const lines = content.split("\n");
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("year") || lower.match(/year\s*(level|yr)?\s*[:\-]?\s*\d/i)) {
      const match = line.match(/(?:year|yr)[^:\d]*(\d+)/i) || line.match(/(\d+)\s*(?:year|yr)/i);
      result.yearLevel = match ? `Year ${match[1]}` : line.replace(/^#+\s*/, "").trim();
    } else if (lower.includes("subject") || lower.includes("learning area")) {
      result.subject = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
    } else if (lower.includes("duration") || lower.includes("time") || (lower.includes("lesson") && lower.includes("min"))) {
      result.duration = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
    }
  }
  // Also try inline patterns like "Year 8" or "60 minutes"
  for (const line of lines) {
    const ym = line.match(/\bYear\s*(\d+)\b/i);
    if (ym && !result.yearLevel) result.yearLevel = `Year ${ym[1]}`;
    const dm = line.match(/(\d+)\s*(minutes?|mins?|hours?|hr?)\b/i);
    if (dm && !result.duration) result.duration = `${dm[1]} ${dm[2]}`;
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { content, label } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const cleanTitle = (label || "Lesson Plan").replace(/\*\*/g, "").trim();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(cleanTitle);
    pdfDoc.setAuthor("PickleNickAI");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const BRAND_GREEN = rgb(0.13, 0.55, 0.38);
    const DARK_TEXT = rgb(0.2, 0.2, 0.2);
    const MINT = rgb(0.6, 0.88, 0.8);
    const LIGHT_GRAY = rgb(0.96, 0.96, 0.96);
    const WHITE = rgb(1, 1, 1);
    const ACCENT_GREEN = rgb(0.18, 0.67, 0.43);
    const CARD_BG = rgb(0.97, 0.97, 0.97);

    const PAGE_W = 595;
    const PAGE_H = 842;
    const MARGIN = 50;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const LINE_H = 14;

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    // Track all pages so we can add footers to all
    const pages: typeof page[] = [page];

    function newPage() {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      pages.push(page);
      y = PAGE_H - MARGIN;
    }

    function checkPage(linesNeeded: number) {
      if (y - linesNeeded * LINE_H < MARGIN + 60) newPage();
    }

    // --- Header bar (full-width green) ---
    page.drawRectangle({ x: 0, y: PAGE_H - 85, width: PAGE_W, height: 85, color: BRAND_GREEN });
    y = PAGE_H - 42;
    page.drawText(cleanTitle.toUpperCase(), { x: MARGIN, y, size: 18, font: boldFont, color: WHITE });
    y -= LINE_H * 1.3;
    page.drawText(`PickleNickAI  •  ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}  •  AC9`, {
      x: MARGIN, y, size: 9, font, color: MINT,
    });
    y -= LINE_H * 1.2;

    // --- Metadata cards row ---
    const meta = parseMetadata(content);
    const cardLabels = [
      { label: "Year Level", value: meta.yearLevel || "—" },
      { label: "Subject", value: meta.subject || "—" },
      { label: "Duration", value: meta.duration || "—" },
    ];
    const cardW = (CONTENT_W - 16) / 3;
    const cardH = 44;
    const cardY = y - cardH;

    for (let i = 0; i < 3; i++) {
      const cardX = MARGIN + i * (cardW + 8);
      // Card background (light grey)
      page.drawRectangle({ x: cardX, y: cardY, width: cardW, height: cardH, color: LIGHT_GRAY });
      // Card label (small, grey)
      page.drawText(cardLabels[i].label.toUpperCase(), {
        x: cardX + 10, y: cardY + cardH - 18, size: 7, font: boldFont, color: rgb(0.45, 0.45, 0.45),
      });
      // Card value (bold, dark)
      const val = cardLabels[i].value.length > 22 ? cardLabels[i].value.slice(0, 20) + "…" : cardLabels[i].value;
      page.drawText(val, {
        x: cardX + 10, y: cardY + cardH - 32, size: 11, font: boldFont, color: DARK_TEXT,
      });
    }
    y = cardY - LINE_H;

    // Content — split by sections
    const lines = content.split("\n");
    let inCard = false;
    let cardStartY = y;

    function startCard() {
      if (!inCard) {
        inCard = true;
        cardStartY = y;
      }
    }

    function endCard() {
      if (inCard) {
        const cardHeight = cardStartY - y + LINE_H;
        if (cardHeight > LINE_H * 2) {
          page.drawRectangle({
            x: MARGIN - 6,
            y: y - 4,
            width: CONTENT_W + 12,
            height: cardHeight + 8,
            color: CARD_BG,
          });
        }
        inCard = false;
      }
    }

    for (const raw of lines) {
      const line = raw.trim();

      if (!line) { y -= LINE_H * 0.5; continue; }

      const isStandaloneMeta =
        /^#{1,3}\s*(Year|Subject|Duration|Learning Area|Time|Lesson)\b/i.test(line) ||
        /^#{1,3}\s*\*\*?\s*(Year|Subject|Duration|Learning Area|Time|Lesson)\s*\*\*?\s*[:\-]?\s*/i.test(line);

      // Heading 1
      if (line.startsWith("# ") && !isStandaloneMeta) {
        endCard();
        y -= LINE_H;
        checkPage(4);
        page.drawText(line.replace(/^#\s/, "").toUpperCase(), {
          x: MARGIN, y, size: 14, font: boldFont, color: DARK_TEXT,
        });
        y -= LINE_H;
      }
      // Heading 2 — green left-border accent bar
      else if (line.startsWith("## ") && !isStandaloneMeta) {
        endCard();
        y -= LINE_H * 0.6;
        checkPage(4);
        const headingText = line.replace(/^##\s/, "");
        const accentBarH = 18;
        // Green left-border accent bar (tall, thin rectangle)
        page.drawRectangle({
          x: MARGIN,
          y: y - accentBarH + 4,
          width: 4,
          height: accentBarH,
          color: ACCENT_GREEN,
        });
        // Heading text offset by bar + gap (12px)
        page.drawText(headingText, {
          x: MARGIN + 12,
          y: y - 1,
          size: 12,
          font: boldFont,
          color: DARK_TEXT,
        });
        y -= LINE_H;
      }
      // Heading 3
      else if (line.startsWith("### ") && !isStandaloneMeta) {
        y -= LINE_H * 0.4;
        checkPage(3);
        page.drawText(line.replace(/^###\s/, ""), {
          x: MARGIN, y, size: 10, font: boldFont, color: rgb(45 / 255, 45 / 255, 74 / 255),
        });
        y -= LINE_H * 0.7;
      }
      // Table row
      else if (line.startsWith("|") && !isStandaloneMeta) {
        startCard();
        const cells = line.split("|").filter((_: string, i: number, a: string[]) => i > 0 && i < a.length - 1);
        if (cells.length > 0) {
          checkPage(2);
          const cellText = cells.map((c: string) => c.trim()).join("  •  ");
          const wrapped = wrapText(cellText, 90);
          for (const wl of wrapped) {
            page.drawText(wl, { x: MARGIN + 10, y, size: 8, font, color: DARK_TEXT });
            y -= LINE_H * 0.8;
          }
        }
      }
      // Plain text — handle **bold** inline
      else if (!isStandaloneMeta) {
        startCard();
        checkPage(2);
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        let xPos = MARGIN;
        for (const part of parts) {
          if (part.startsWith("**") && part.endsWith("**")) {
            const text = part.replace(/\*\*/g, "");
            const w = boldFont.widthOfTextAtSize(text, 10);
            page.drawText(text, { x: xPos, y, size: 10, font: boldFont, color: DARK_TEXT });
            xPos += w + 2;
          } else if (part) {
            const wrapped = wrapText(part, 80);
            page.drawText(wrapped[0], { x: xPos, y, size: 10, font, color: DARK_TEXT });
            y -= LINE_H * 0.8;
            if (wrapped.length > 1) y += LINE_H * 0.8;
          }
        }
        y -= LINE_H * 0.5;
      }
    }
    endCard();

    // --- Footer on ALL pages ---
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      p.drawText("PickleNickAI — Teacher's AI Assistant — picklenickai.com", {
        x: MARGIN, y: 28, size: 8, font, color: MINT,
      });
      p.drawText(`Page ${i + 1} of ${pages.length}`, {
        x: PAGE_W - MARGIN - 52, y: 28, size: 8, font, color: MINT,
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cleanTitle.replace(/[^a-z0-9]/gi, "-")}.pdf"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[export/chat-to-pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
