// Shared export utilities — pure client-side, no API calls

export async function downloadTxt(content: string, label: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${label}_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPdf(content: string, label: string) {
  try {
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 72;
    const fontSize = 11;
    const lineHeight = 14;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const titleFontSize = 18;
    const words = content.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (font.widthOfTextAtSize(test, fontSize) > pageWidth - margin * 2) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    let y = pageHeight - margin - titleFontSize;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawText(label, { x: margin, y, size: titleFontSize, font, color: rgb(0.1, 0.1, 0.1) });
    y -= lineHeight * 2;
    for (const line of lines) {
      if (y < margin + lineHeight) { page = pdfDoc.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      y -= lineHeight;
    }
    const buf = await pdfDoc.save();
    const blob = new Blob([buf.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0, 10)}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(`PDF export failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function downloadDOCX(content: string, label: string) {
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
    const paras = content.split(/\n\n+/).filter(p => p.trim());
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: label, heading: HeadingLevel.HEADING_1 }),
          ...paras.map(p => new Paragraph({ children: [new TextRun({ text: p })] })),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0, 10)}.docx`; a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(`DOCX export failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function downloadPPTX(content: string, label: string) {
  try {
    const PptxGenJS = (await import("pptxgenjs")).default;
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.title = label;
    const titleSlide = pptx.addSlide();
    titleSlide.addText(label, { x: 0.5, y: 3, w: "90%", h: 1.5, fontSize: 36, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    titleSlide.addText("Created with Owlly", { x: 0.5, y: 4.8, w: "90%", h: 0.5, fontSize: 14, color: "AAAAAA", align: "center" });
    const paras = content.split(/\n\n+/).filter(p => p.trim());
    const chunkSize = 6;
    for (let i = 0; i < paras.length; i += chunkSize) {
      const chunk = paras.slice(i, i + chunkSize);
      const slide = pptx.addSlide();
      slide.addText(chunk.join("\n\n"), { x: 0.6, y: 0.5, w: 12.5, h: 7, fontSize: 14, color: "333333", valign: "top" });
    }
    const blob = await (pptx.write({}) as Promise<Blob>);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${label}_${new Date().toISOString().slice(0, 10)}.pptx`; a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(`PPTX export failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
