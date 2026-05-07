import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

export const runtime = "nodejs";

function parseBoldMeta(text: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const re = /\*\*(.+?):\*\*(.+)$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    meta[m[1].trim().toLowerCase()] = m[2].trim();
  }
  return meta;
}

function parseSections(content: string) {
  const sections: { heading: string; lines: string[] }[] = [];
  const lines = content.split("\n");
  let current: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      if (current) sections.push(current);
      current = { heading: hMatch[2].trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.title = title || "Lesson Plan";
    pptx.author = "PickleNickAI";

    const primary = "267359";
    const accent = "99E0CC";
    const dark = "1A3333";
    const light = "FFFFFF";
    const mid = "64748B";

    // ── Title slide ──────────────────────────────────────────────────────────
    const slide1 = pptx.addSlide();
    slide1.background = { color: dark };

    // Green accent strip on left
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.15, h: 5.625,
      fill: { color: accent },
    });

    slide1.addText("PICKLENICKAI", {
      x: 0.5, y: 0.4, w: 9, h: 0.4,
      fontSize: 11, color: accent, bold: true, charSpacing: 6,
    });

    const cleanTitle = (title || "Lesson Plan").replace(/\*\*/g, "").trim();
    slide1.addText(cleanTitle, {
      x: 0.5, y: 1.6, w: 8.5, h: 2,
      fontSize: 36, color: "FFFFFF", bold: true, valign: "top",
    });

    const meta = parseBoldMeta(content);
    if (meta["year level"]) {
      slide1.addText(meta["year level"], {
        x: 0.5, y: 3.6, w: 9, h: 0.5,
        fontSize: 16, color: accent,
      });
    }
    if (meta["subject"]) {
      slide1.addText(meta["subject"], {
        x: 0.5, y: 4.1, w: 9, h: 0.4,
        fontSize: 14, color: "99E0CC",
      });
    }

    // ── Content slides ───────────────────────────────────────────────────────
    const sections = parseSections(content);

    for (const section of sections) {
      const slide = pptx.addSlide();
      slide.background = { color: light };

      // Green header bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 10, h: 0.9,
        fill: { color: primary },
      });

      // Green accent strip
      slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.1, h: 5.625,
        fill: { color: accent },
      });

      // Section heading in header
      slide.addText(section.heading.replace(/\*\*/g, ""), {
        x: 0.4, y: 0.15, w: 9.2, h: 0.6,
        fontSize: 18, color: "FFFFFF", bold: true,
      });

      // Parse bullet items and table rows
      const bulletItems: string[] = [];
      const tableLines: string[] = [];

      for (const line of section.lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("|")) {
          tableLines.push(trimmed);
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          bulletItems.push(trimmed.replace(/^[-*]\s+/, "• ").replace(/\*\*/g, ""));
        } else {
          bulletItems.push(trimmed.replace(/\*\*/g, ""));
        }
      }

      // Render table if present
      if (tableLines.length > 0) {
        const rows = tableLines
          .filter(l => l.startsWith("|") && !l.match(/^\|[\s\-:]+纵\|$/))
          .map(l =>
            l.split("|")
              .filter((_, i, a) => i > 0 && i < a.length - 1)
              .map(c => c.trim().replace(/\*\*/g, ""))
          );

        if (rows.length > 0) {
          // Title row
          const headerRow = rows[0].map(cell => ({
            text: cell,
            options: { bold: true, color: "FFFFFF", fill: { color: primary } },
          }));

          const tableData = [
            headerRow,
            ...rows.slice(1).map(row =>
              row.map(cell => ({ text: cell, options: { color: dark } }))
            ),
          ];

          slide.addTable(tableData, {
            x: 0.5, y: 1.1, w: 9, h: 3.5,
            fontSize: 10,
            fontFace: "Arial",
            border: { pt: 0.5, color: "CCCCCC" },
            colW: [2, 2, 2, 2, 1],
            valign: "top",
          });

          // Bullets below table
          if (bulletItems.length > 0) {
            const bulletText = bulletItems.join("\n");
            slide.addText(bulletText, {
              x: 0.5, y: 4.7, w: 9, h: 0.8,
              fontSize: 11, color: dark, valign: "top",
            });
          }
          continue;
        }
      }

      // Bullet content — chunk into groups of 8
      const chunkSize = 8;
      for (let i = 0; i < bulletItems.length; i += chunkSize) {
        const chunk = bulletItems.slice(i, i + chunkSize);
        const slideForChunk = i === 0 ? slide : (() => {
          const s = pptx.addSlide();
          s.background = { color: light };
          s.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: 10, h: 0.9,
            fill: { color: primary },
          });
          s.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: 0.1, h: 5.625,
            fill: { color: accent },
          });
          s.addText(section.heading.replace(/\*\*/g, ""), {
            x: 0.4, y: 0.15, w: 9.2, h: 0.6,
            fontSize: 18, color: "FFFFFF", bold: true,
          });
          s.addText("(continued)", {
            x: 0.4, y: 0.55, w: 9.2, h: 0.3,
            fontSize: 10, color: "99E0CC",
          });
          return s;
        })();

        slideForChunk.addText(chunk.join("\n"), {
          x: 0.5, y: 1.1, w: 9, h: 4.2,
          fontSize: 13, color: dark, valign: "top",
          paraSpaceAfter: 6,
        });
      }
    }

    // ── Closing slide ────────────────────────────────────────────────────────
    const finalSlide = pptx.addSlide();
    finalSlide.background = { color: dark };

    finalSlide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.15, h: 5.625,
      fill: { color: accent },
    });

    finalSlide.addText("PICKLENICKAI", {
      x: 0.5, y: 2.0, w: 9, h: 0.5,
      fontSize: 14, color: accent, bold: true, charSpacing: 6, align: "center",
    });

    finalSlide.addText("Created with PickleNickAI", {
      x: 0.5, y: 2.7, w: 9, h: 0.8,
      fontSize: 28, color: "FFFFFF", bold: true, align: "center",
    });

    finalSlide.addText("picklenickai.com", {
      x: 0.5, y: 3.6, w: 9, h: 0.4,
      fontSize: 12, color: "99E0CC", align: "center",
    });

    const blob: Blob = await (pptx as unknown as { write: () => Promise<Blob> }).write();
    const arrayBuffer: ArrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${cleanTitle.replace(/[^a-z0-9]/gi, "-")}.pptx"`,
      },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[export/chat-to-pptx]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
