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

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const cleanTitle = (title || "Lesson Plan").replace(/\*\*/g, "").trim();
    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(cleanTitle);
    pdfDoc.setAuthor("PickleNickAI");

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const INDIGO = rgb(99 / 255, 102 / 255, 241 / 255);
    const DARK = rgb(26 / 255, 26 / 255, 46 / 255);
    const SLATE = rgb(51 / 255, 65 / 255, 85 / 255);
    const MUTED = rgb(148 / 255, 163 / 255, 184 / 255);

    const PAGE_W = 595; // A4 points
    const PAGE_H = 842;
    const MARGIN = 50;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const LINE_H = 14;
    const BOLD = StandardFonts.HelveticaBold;

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    function newPage() {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }

    function checkPage(linesNeeded: number) {
      if (y - linesNeeded * LINE_H < MARGIN + 60) newPage();
    }

    // Title
    page.drawRectangle({ x: 0, y: PAGE_H - 90, width: PAGE_W, height: 2, color: INDIGO });
    y = PAGE_H - 70;
    page.drawText(cleanTitle.toUpperCase(), { x: MARGIN, y, size: 18, font: boldFont, color: DARK });
    y -= LINE_H * 1.5;
    page.drawText("PickleNickAI — Australian Curriculum v9", {
      x: MARGIN, y, size: 9, font, color: MUTED,
    });
    y -= LINE_H * 2;

    // Content
    const lines = content.split("\n");

    for (const raw of lines) {
      const line = raw.trim();

      if (!line) { y -= LINE_H * 0.5; continue; }

      // Heading 1
      if (line.startsWith("# ")) {
        y -= LINE_H;
        checkPage(3);
        page.drawText(line.replace(/^#\s/, "").toUpperCase(), {
          x: MARGIN, y, size: 14, font: boldFont, color: DARK,
        });
        y -= LINE_H;
      }
      // Heading 2
      else if (line.startsWith("## ")) {
        y -= LINE_H * 0.8;
        checkPage(3);
        page.drawRectangle({ x: MARGIN, y: y - 2, width: 40, height: 1, color: INDIGO });
        y -= LINE_H;
        page.drawText(line.replace(/^##\s/, ""), {
          x: MARGIN, y, size: 12, font: boldFont, color: DARK,
        });
        y -= LINE_H * 0.6;
      }
      // Heading 3
      else if (line.startsWith("### ")) {
        y -= LINE_H * 0.5;
        checkPage(2);
        page.drawText(line.replace(/^###\s/, ""), {
          x: MARGIN, y, size: 10, font: boldFont, color: rgb(45 / 255, 45 / 255, 74 / 255),
        });
        y -= LINE_H * 0.8;
      }
      // Table row
      else if (line.startsWith("|")) {
        const cells = line.split("|").filter((_: string, i: number, a: string[]) => i > 0 && i < a.length - 1);
        if (cells.length > 0) {
          checkPage(2);
          const cellText = cells.map((c: string) => c.trim()).join("  •  ");
          const wrapped = wrapText(cellText, 90);
          for (const wl of wrapped) {
            page.drawText(wl, { x: MARGIN + 10, y, size: 8, font, color: SLATE });
            y -= LINE_H * 0.8;
          }
        }
      }
      // Plain text — handle **bold** inline
      else {
        checkPage(2);
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        let xPos = MARGIN;
        for (const part of parts) {
          if (part.startsWith("**") && part.endsWith("**")) {
            const text = part.replace(/\*\*/g, "");
            const w = boldFont.widthOfTextAtSize(text, 10);
            page.drawText(text, { x: xPos, y, size: 10, font: boldFont, color: DARK });
            xPos += w + 2;
          } else if (part) {
            const wrapped = wrapText(part, 80);
            page.drawText(wrapped[0], { x: xPos, y, size: 10, font, color: SLATE });
            y -= LINE_H * 0.8;
            if (wrapped.length > 1) y += LINE_H * 0.8;
          }
        }
        y -= LINE_H * 0.5;
      }
    }

    // Footer on last page
    const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
    lastPage.drawText("PickleNickAI — picklenickai.com", {
      x: MARGIN, y: 30, size: 8, font, color: MUTED,
    });

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
    console.error("[export/pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}