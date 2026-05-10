import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
  ShadingType,
} from "docx";

export const runtime = "nodejs";

type HeadingLevelType = (typeof HeadingLevel)[keyof typeof HeadingLevel];

function bold(text: string): TextRun {
  return new TextRun({ text, bold: true });
}

function normal(text: string): TextRun {
  return new TextRun({ text });
}

function heading(text: string, level: HeadingLevelType): Paragraph {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 120 },
  });
}

function para(runs: TextRun[], spacingAfter = 120): Paragraph {
  return new Paragraph({
    children: runs,
    spacing: { after: spacingAfter },
  });
}

function parseSectionLines(content: string): {
  meta: Record<string, string>;
  sections: Array<{ heading: string; lines: string[] }>;
  tableRows: string[][];
} {
  const meta: Record<string, string> = {};
  const sections: Array<{ heading: string; lines: string[] }> = [];
  const tableRows: string[][] = [];

  const lines = content.split("\n");
  let currentSection: { heading: string; lines: string[] } | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Meta: **Year Level:** Year 3
    const metaMatch = line.match(/^\*\*(.+?):\*\*(.+)$/);
    if (metaMatch) {
      meta[metaMatch[1].trim().toLowerCase()] = metaMatch[2].trim();
      continue;
    }

    // Markdown heading
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: hMatch[2].trim(), lines: [] };
    }
    // Table row
    else if (line.startsWith("|") && line.includes("|")) {
      const cells = line
        .split("|")
        .filter((_, i, a) => i > 0 && i < a.length - 1)
        .map(c => c.trim());
      if (cells.length > 1) tableRows.push(cells);
      currentSection?.lines.push(line);
    }
    // Bullet line
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      currentSection?.lines.push(line);
    }
    // Normal text
    else {
      if (currentSection) currentSection.lines.push(line);
    }
  }

  if (currentSection) sections.push(currentSection);
  return { meta, sections, tableRows };
}

function isPhaseTable(rows: string[][]): boolean {
  if (rows.length < 2) return false;
  const first = rows[0].map(c => c.toLowerCase());
  return (
    first.some(c => c.includes("phase")) ||
    first.some(c => c.includes("time") || c.includes("duration")) ||
    first.some(c => c.includes("teacher")) ||
    first.some(c => c.includes("student"))
  );
}

function buildPhaseTable(rows: string[][]): Table {
  const headerCells = rows[0].map(cell =>
    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: cell, bold: true, color: "FFFFFF", size: 20 })],
          alignment: AlignmentType.CENTER,
        }),
      ],
      shading: { type: ShadingType.CLEAR, color: "267359", fill: "267359" },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "267359" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "267359" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "267359" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "267359" },
      },
    })
  );

  const dataRows = rows.slice(1).map((row, rowIdx) =>
    new TableRow({
      children: row.map(cell => {
        const isOdd = rowIdx % 2 === 0;
        return new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: cell, size: 20 })],
            }),
          ],
          shading: { type: ShadingType.CLEAR, color: "auto", fill: isOdd ? "FFFFFF" : "FFFFFF" },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "F2F2F2" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "F2F2F2" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "F2F2F2" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "F2F2F2" },
          },
        });
      }),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "267359" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "267359" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "267359" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "267359" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "F2F2F2" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "F2F2F2" },
    },
  });
}

function parseInlineBold(text: string): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map(part => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({ text: part.replace(/\*\*/g, ""), bold: true });
    }
    return new TextRun({ text: part });
  });
}

function buildSectionParagraph(line: string): Paragraph {
  const isWilf = line.match(/^[-*]\s+(.+)$/);
  const parts = parseInlineBold(line.replace(/^[-*]\s+/, ""));
  return new Paragraph({
    children: [
      new TextRun({ text: isWilf ? "☐  " : "", bold: false }),
      ...parts,
    ],
    spacing: { after: 80 },
    indent: isWilf ? { left: convertInchesToTwip(0.25) } : undefined,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const cleanTitle = (title || "Lesson Plan").replace(/\*\*/g, "").trim();
    const { meta, sections, tableRows } = parseSectionLines(content);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = [];

    // ─── Title ───────────────────────────────────────────────────────────────
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: cleanTitle, bold: true, size: 40, color: "FFFFFF" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        shading: { type: ShadingType.CLEAR, color: "267359", fill: "267359" },
      })
    );

    // ─── Meta row ────────────────────────────────────────────────────────────
    const metaParts: string[] = [];
    if (meta["year level"]) metaParts.push(`Year Level: ${meta["year level"]}`);
    if (meta["subject"]) metaParts.push(`Subject: ${meta["subject"]}`);
    if (meta["duration"]) metaParts.push(`Duration: ${meta["duration"]}`);
    if (metaParts.length > 0) {
      children.push(
        new Paragraph({
          children: metaParts.map((p, i) =>
            new TextRun({ text: p, bold: i === 0, size: 20, color: "267359" })
          ),
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // ─── Phase table (detect from content) ────────────────────────────────────
    if (tableRows.length > 0 && isPhaseTable(tableRows)) {
      children.push(heading("Lesson Structure", HeadingLevel.HEADING_2));
      children.push(buildPhaseTable(tableRows));
      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // ─── Sections ────────────────────────────────────────────────────────────
    const sectionHeadings: Record<string, string> = {
      walt: "WALT",
      "what we are learning today": "WALT",
      tib: "TIB",
      "teaching intention/goal": "TIB",
      "teaching intention": "TIB",
      "teaching intent": "TIB",
      wilf: "WILF",
      "what i'm looking for": "WILF",
      "success criteria": "WILF",
      "successcriteria": "WILF",
      materials: "Materials",
      "resources & materials": "Materials",
      "resources and materials": "Materials",
      "lesson resources": "Materials",
      differentiation: "Differentiation",
      "adjustments / differentiation": "Differentiation",
      "adjustments and differentiation": "Differentiation",
      " adjustments": "Differentiation",
      "exit ticket": "Exit Ticket",
      "exit pass": "Exit Ticket",
      reflection: "Reflection",
      assessment: "Assessment",
      overview: "Overview",
      introduction: "Introduction",
      body: "Main Activities",
      conclusion: "Conclusion",
      "wrap up": "Wrap Up",
    };

    for (const section of sections) {
      const key = section.heading.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
      let matchedHeading = section.heading;

      for (const [k, v] of Object.entries(sectionHeadings)) {
        if (key.includes(k) || k.includes(key)) {
          matchedHeading = v;
          break;
        }
      }

      if (!section.lines || section.lines.length === 0) continue;

      // Check if this section contains a phase table
      const sectionTableRows = section.lines
        .filter(l => l.startsWith("|") && l.includes("|"))
        .map(l =>
          l.split("|").filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim())
        )
        .filter(cells => cells.length > 1);

      if (sectionTableRows.length > 0 && isPhaseTable(sectionTableRows) && tableRows.length === 0) {
        children.push(heading(matchedHeading, HeadingLevel.HEADING_2));
        children.push(buildPhaseTable(sectionTableRows));
        children.push(new Paragraph({ spacing: { after: 200 } }));
        continue;
      }

      // Section heading
      children.push(heading(matchedHeading, HeadingLevel.HEADING_2));

      // Section content
      for (const line of section.lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Another table row within this section
        if (trimmed.startsWith("|") && trimmed.includes("|")) {
          continue; // tables handled above
        }

        // Bullet item
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          children.push(buildSectionParagraph(trimmed));
        }
        // AC9 code highlight
        else if (trimmed.match(/AC9[TMESWHLFP]\d[A-Z]?\d[A-Z]?/i)) {
          const parts = trimmed.split(/(\*\*[^*]+\*\*)/);
          children.push(
            new Paragraph({
              children: parts.map(part => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return new TextRun({ text: part.replace(/\*\*/g, ""), bold: true, color: "267359" });
                }
                return new TextRun({ text: part });
              }),
              spacing: { after: 80 },
            })
          );
        }
        // Regular text with bold markers
        else if (trimmed.includes("**")) {
          children.push(
            new Paragraph({
              children: parseInlineBold(trimmed),
              spacing: { after: 80 },
            })
          );
        }
        // Plain paragraph
        else {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: trimmed })],
              spacing: { after: 80 },
            })
          );
        }
      }

      children.push(new Paragraph({ spacing: { after: 160 } }));
    }

    // ─── Build document ──────────────────────────────────────────────────────
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1.25),
                right: convertInchesToTwip(1.25),
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Owlly  •  Australian Curriculum v9", size: 16, color: "99E0CC" }),
                  ],
                  alignment: AlignmentType.RIGHT,
                  border: {
                    bottom: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "267359",
                    },
                  },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Owlly — owlly.ai  •  Page ", size: 16, color: "99E0CC" }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 16,
                      color: "99E0CC",
                    }),
                    new TextRun({ text: " of ", size: 16, color: "99E0CC" }),
                    new TextRun({
                      children: [PageNumber.TOTAL_PAGES],
                      size: 16,
                      color: "99E0CC",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  border: {
                    top: {
                      style: BorderStyle.SINGLE,
                      size: 6,
                      color: "267359",
                    },
                  },
                }),
              ],
            }),
          },
          children,
        },
      ],
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            run: { size: 32, bold: true, color: "267359" },
            paragraph: { spacing: { before: 320, after: 160 } },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            run: { size: 26, bold: true, color: "267359" },
            paragraph: {
              spacing: { before: 240, after: 120 },
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "267359",
                },
              },
            },
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            next: "Normal",
            run: { size: 22, bold: true, color: "267359" },
            paragraph: { spacing: { before: 200, after: 80 } },
          },
        ],
      },
    });

    const docBuffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(docBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${cleanTitle.replace(/[^a-z0-9]/gi, "-")}.docx"`,
        "Content-Length": String(docBuffer.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    console.error("[export/docx]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
