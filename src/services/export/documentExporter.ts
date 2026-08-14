import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { cleanMarkdownToPlainText } from '../../features/assistant/utils/messageParser';

export interface DocumentSection {
  heading?: string;
  level?: number;
  content?: string[];
  bulletList?: string[];
  numberedList?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface NormalizedDocument {
  title: string;
  rawText: string;
  sections: DocumentSection[];
}

/**
 * Sanitizes a title into a valid filesystem filename.
 */
export function sanitizeFileName(name: string, extension: string): string {
  const sanitized = (name || 'Teachora_Document')
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 60);

  return `${sanitized || 'Teachora_Document'}.${extension}`;
}

/**
 * Sanitizes Unicode characters for standard PDF compatibility.
 */
function sanitizeTextForPDF(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // En/Em dash
    .replace(/[\u2022\u2023\u25E6]/g, '-') // Unicode bullets
    .replace(/\u00A0/g, ' ') // Non-breaking space
    .replace(/\u2026/g, '...') // Ellipsis
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
}

/**
 * Parses markdown educational content into a structured NormalizedDocument.
 */
export function parseMarkdownToDocument(markdown: string): NormalizedDocument {
  const lines = markdown.split('\n');
  let title = 'Teachora Teaching Material';
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection = { content: [] };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Table Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim().replace(/\*\*/g, ''));
        const rows = tableLines.slice(2).map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim().replace(/\*\*/g, ''))
        );

        if (!currentSection.table) {
          currentSection.table = { headers, rows };
        } else {
          sections.push(currentSection);
          currentSection = { table: { headers, rows } };
        }
      }
      continue;
    }

    // 2. Heading Detection
    if (trimmed.startsWith('#')) {
      if (currentSection.heading || currentSection.content?.length || currentSection.bulletList?.length || currentSection.numberedList?.length || currentSection.table) {
        sections.push(currentSection);
      }

      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const headingText = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();

      if (title === 'Teachora Teaching Material' && headingText) {
        title = headingText;
      }

      currentSection = {
        heading: headingText,
        level,
        content: [],
      };
      i++;
      continue;
    }

    // 3. Bullet List Detection
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2).replace(/\*\*/g, '').trim();
      if (!currentSection.bulletList) currentSection.bulletList = [];
      currentSection.bulletList.push(itemText);
      i++;
      continue;
    }

    // 4. Numbered List Detection
    if (/^\d+\.\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').trim();
      if (!currentSection.numberedList) currentSection.numberedList = [];
      currentSection.numberedList.push(itemText);
      i++;
      continue;
    }

    // 5. Paragraph content
    const cleanParagraph = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    if (!currentSection.content) currentSection.content = [];
    currentSection.content.push(cleanParagraph);
    i++;
  }

  if (currentSection.heading || currentSection.content?.length || currentSection.bulletList?.length || currentSection.numberedList?.length || currentSection.table) {
    sections.push(currentSection);
  }

  return {
    title: title || 'Teachora Teaching Material',
    rawText: cleanMarkdownToPlainText(markdown),
    sections,
  };
}

/**
 * Triggers a browser file download from Blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Exports document as a clean, highly compatible PDF using jsPDF.
 */
export async function exportToPDF(docData: NormalizedDocument, filename?: string): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const PAGE_WIDTH = doc.internal.pageSize.getWidth(); // 595.28 pt
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight(); // 841.89 pt
  const MARGIN_LEFT = 45;
  const MARGIN_RIGHT = 45;
  const MARGIN_TOP = 50;
  const MARGIN_BOTTOM = 50;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  let y = MARGIN_TOP;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }
  };

  // 1. Document Title
  const cleanTitle = sanitizeTextForPDF(docData.title);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(13, 148, 136); // Teal #0d9488
  const titleLines = doc.splitTextToSize(cleanTitle, CONTENT_WIDTH);
  checkPageBreak(titleLines.length * 22 + 15);
  doc.text(titleLines, MARGIN_LEFT, y);
  y += titleLines.length * 22 + 4;

  // Title Divider Line
  doc.setDrawColor(229, 231, 235); // Light gray
  doc.setLineWidth(1);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 18;

  // 2. Sections
  for (const section of docData.sections) {
    // Section Heading
    if (section.heading && section.heading !== docData.title) {
      const cleanHeading = sanitizeTextForPDF(section.heading);
      const isSub = section.level && section.level > 2;
      const headingFontSize = isSub ? 12 : 14;
      const lineHeight = isSub ? 16 : 18;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(headingFontSize);
      doc.setTextColor(17, 24, 39); // Dark #111827

      const headingLines = doc.splitTextToSize(cleanHeading, CONTENT_WIDTH);
      checkPageBreak(headingLines.length * lineHeight + 12);
      y += 6;
      doc.text(headingLines, MARGIN_LEFT, y);
      y += headingLines.length * lineHeight + 4;
    }

    // Paragraphs
    if (section.content) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81); // Slate #374151

      for (const p of section.content) {
        const cleanP = sanitizeTextForPDF(p);
        if (!cleanP) continue;

        const pLines = doc.splitTextToSize(cleanP, CONTENT_WIDTH);
        checkPageBreak(pLines.length * 14 + 6);
        doc.text(pLines, MARGIN_LEFT, y);
        y += pLines.length * 14 + 6;
      }
    }

    // Bullet List
    if (section.bulletList && section.bulletList.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);

      for (const item of section.bulletList) {
        const cleanItem = sanitizeTextForPDF(item);
        if (!cleanItem) continue;

        const listIndent = 16;
        const itemLines = doc.splitTextToSize(cleanItem, CONTENT_WIDTH - listIndent);
        checkPageBreak(itemLines.length * 14 + 4);

        // Draw bullet circle
        doc.setFillColor(13, 148, 136);
        doc.circle(MARGIN_LEFT + 4, y - 3.5, 2, 'F');

        doc.text(itemLines, MARGIN_LEFT + listIndent, y);
        y += itemLines.length * 14 + 4;
      }
      y += 4;
    }

    // Numbered List
    if (section.numberedList && section.numberedList.length > 0) {
      section.numberedList.forEach((item, idx) => {
        const cleanItem = sanitizeTextForPDF(item);
        if (!cleanItem) return;

        const prefix = `${idx + 1}.`;
        const listIndent = 18;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(13, 148, 136);

        const itemLines = doc.splitTextToSize(cleanItem, CONTENT_WIDTH - listIndent);
        checkPageBreak(itemLines.length * 14 + 4);

        doc.text(prefix, MARGIN_LEFT, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        doc.text(itemLines, MARGIN_LEFT + listIndent, y);
        y += itemLines.length * 14 + 4;
      });
      y += 4;
    }

    // Table
    if (section.table && section.table.headers.length > 0) {
      const headers = section.table.headers.map(sanitizeTextForPDF);
      const rows = section.table.rows.map((row) => row.map(sanitizeTextForPDF));
      const colCount = headers.length;
      const colWidth = CONTENT_WIDTH / colCount;
      const rowHeight = 20;

      checkPageBreak(rowHeight * (rows.length + 1) + 16);

      // Header background
      doc.setFillColor(243, 244, 246);
      doc.rect(MARGIN_LEFT, y - 12, CONTENT_WIDTH, rowHeight, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(MARGIN_LEFT, y - 12, CONTENT_WIDTH, rowHeight, 'S');

      // Header text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(17, 24, 39);
      headers.forEach((h, cIdx) => {
        doc.text(h.slice(0, 25), MARGIN_LEFT + cIdx * colWidth + 6, y + 1);
      });
      y += rowHeight;

      // Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);

      rows.forEach((row) => {
        checkPageBreak(rowHeight + 4);
        doc.setDrawColor(243, 244, 246);
        doc.rect(MARGIN_LEFT, y - 12, CONTENT_WIDTH, rowHeight, 'S');

        row.forEach((cell, cIdx) => {
          doc.text(cell.slice(0, 30), MARGIN_LEFT + cIdx * colWidth + 6, y + 1);
        });
        y += rowHeight;
      });
      y += 8;
    }
  }

  // 3. Add Page Footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // Gray #9ca3af

    // Footer divider line
    doc.setDrawColor(243, 244, 246);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, PAGE_HEIGHT - 35, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 35);

    // Footer text
    const footerText = `Page ${p} of ${totalPages} • Generated with Teachora AI Studio`;
    doc.text(footerText, PAGE_WIDTH / 2, PAGE_HEIGHT - 22, { align: 'center' });
  }

  const pdfBlob = doc.output('blob');
  const finalFilename = sanitizeFileName(filename || docData.title, 'pdf');
  downloadBlob(pdfBlob, finalFilename);

  return pdfBlob;
}

/**
 * Exports document as an editable Microsoft Word document (.docx).
 */
export async function exportToDOCX(docData: NormalizedDocument, filename?: string): Promise<Blob> {
  const docChildren: (Paragraph | Table)[] = [];

  // Title
  docChildren.push(
    new Paragraph({
      text: docData.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  for (const section of docData.sections) {
    if (section.heading && section.heading !== docData.title) {
      const headingLevel =
        section.level === 2
          ? HeadingLevel.HEADING_1
          : section.level === 3
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3;

      docChildren.push(
        new Paragraph({
          text: section.heading,
          heading: headingLevel,
          spacing: { before: 240, after: 120 },
        })
      );
    }

    if (section.content) {
      for (const p of section.content) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: p, size: 22 })], // 11pt
            spacing: { after: 120 },
          })
        );
      }
    }

    if (section.bulletList) {
      for (const item of section.bulletList) {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: item, size: 22 })],
            spacing: { after: 60 },
          })
        );
      }
    }

    if (section.numberedList) {
      section.numberedList.forEach((item, idx) => {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${idx + 1}. `, bold: true, size: 22 }),
              new TextRun({ text: item, size: 22 }),
            ],
            spacing: { after: 60 },
          })
        );
      });
    }

    if (section.table && section.table.headers.length > 0) {
      const headerRow = new TableRow({
        children: section.table.headers.map(
          (h) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
              shading: { fill: 'F3F4F6' },
            })
        ),
      });

      const bodyRows = section.table.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
                })
            ),
          })
      );

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'F3F4F6' },
            insideVertical: { style: BorderStyle.NONE },
          },
          rows: [headerRow, ...bodyRows],
        })
      );
    }
  }

  const doc = new Document({
    creator: 'Teachora AI Studio',
    title: docData.title,
    description: 'Educational material generated with Teachora',
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const finalFilename = sanitizeFileName(filename || docData.title, 'docx');
  downloadBlob(blob, finalFilename);
  return blob;
}

/**
 * Exports document as a clean Plain Text file (.txt).
 */
export function exportToTXT(docData: NormalizedDocument, filename?: string): Blob {
  const blob = new Blob([docData.rawText], { type: 'text/plain;charset=utf-8' });
  const finalFilename = sanitizeFileName(filename || docData.title, 'txt');
  downloadBlob(blob, finalFilename);
  return blob;
}

/**
 * Opens a clean print window for the document.
 */
export function printDocument(docData: NormalizedDocument): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${docData.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #0d9488; font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 20px; }
          h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; color: #111827; }
          h3 { font-size: 15px; margin-top: 18px; margin-bottom: 6px; }
          p { margin-bottom: 12px; font-size: 14px; }
          ul, ol { margin-bottom: 16px; padding-left: 24px; }
          li { margin-bottom: 6px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
          th { background-color: #f9fafb; font-weight: bold; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${docData.title}</h1>
        ${docData.sections
          .map((s) => `
            ${s.heading && s.heading !== docData.title ? `<h2>${s.heading}</h2>` : ''}
            ${s.content ? s.content.map((p) => `<p>${p}</p>`).join('') : ''}
            ${s.bulletList ? `<ul>${s.bulletList.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
            ${s.numberedList ? `<ol>${s.numberedList.map((item) => `<li>${item}</li>`).join('')}</ol>` : ''}
            ${
              s.table
                ? `<table>
                    <thead><tr>${s.table.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>${s.table.rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
                  </table>`
                : ''
            }
          `)
          .join('')}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}
