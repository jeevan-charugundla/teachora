import { jsPDF } from 'jspdf';
import { sanitizeFileName } from './documentExporter';

export interface DiagramExportOptions {
  data: any;
  title: string;
  subject?: string;
  grade?: string;
  svgElement?: SVGSVGElement | null;
  supportingImageUrl?: string | null;
  orientation?: 'landscape' | 'portrait';
}

/**
 * Converts an SVG DOM element into a high-DPI HTMLCanvasElement.
 */
export async function svgToCanvas(svgElement: SVGSVGElement, scale: number = 3): Promise<HTMLCanvasElement> {
  const bbox = svgElement.getBoundingClientRect();
  const width = (bbox.width || 800) * scale;
  const height = (bbox.height || 450) * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas context not available');

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Clone SVG to modify font & inline styles for canvas rendering
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', `${width}`);
  clone.setAttribute('height', `${height}`);
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Exports a diagram directly to a high-resolution PNG image file.
 */
export async function exportDiagramToPNG(options: DiagramExportOptions): Promise<void> {
  const { title, svgElement } = options;
  if (!svgElement) throw new Error('Diagram SVG canvas element not found.');

  const canvas = await svgToCanvas(svgElement, 3);
  const dataUrl = canvas.toDataURL('image/png');

  const filename = sanitizeFileName(`${title}_Diagram_Teachora`, 'png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Exports a diagram directly to a scalable SVG vector file.
 */
export function exportDiagramToSVG(options: DiagramExportOptions): void {
  const { title, svgElement } = options;
  if (!svgElement) throw new Error('Diagram SVG element not found.');

  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const filename = sanitizeFileName(`${title}_Diagram_Teachora`, 'svg');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports a diagram to a professional 1-page/2-page PDF document containing:
 * 1. Teachora Header (Subject • Grade • Type)
 * 2. Title & Goal
 * 3. Actual Rendered Visual Diagram
 * 4. Formatted Key Concepts & Node Breakdown
 * 5. Supporting AI Visual (if generated)
 */
export async function exportDiagramToPDF(options: DiagramExportOptions): Promise<Blob> {
  const { data, title, subject = 'General Science', grade = 'Grade 8', svgElement } = options;
  const isLandscape = (data.orientation || options.orientation || 'landscape') === 'landscape';

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // 1. Header Banner
  pdf.setFillColor(13, 148, 136); // Emerald primary accent (#0d9488)
  pdf.rect(margin, margin, 4, 18, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(13, 148, 136);
  const metaText = `TEACHORA • ${subject.toUpperCase()} • ${grade.toUpperCase()} • ${(data.diagramType || 'PROCESS DIAGRAM').toUpperCase()}`;
  pdf.text(metaText, margin + 8, margin + 4);

  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42); // slate-900
  const displayTitle = data.title || title || 'Process Diagram';
  pdf.text(displayTitle, margin + 8, margin + 12);

  if (data.goal || data.purpose || data.description) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    const sub = data.goal || data.purpose || data.description;
    const splitSub = pdf.splitTextToSize(sub, contentWidth - 10);
    pdf.text(splitSub[0] || '', margin + 8, margin + 17);
  }

  let yCursor = margin + 24;

  // Divider line
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(margin, yCursor, pageWidth - margin, yCursor);
  yCursor += 6;

  // 2. Embed Visual Diagram Image
  if (svgElement) {
    try {
      const canvas = await svgToCanvas(svgElement, 3);
      const imgData = canvas.toDataURL('image/png');

      // Calculate scalable dimensions inside PDF
      const maxImgWidth = contentWidth;
      const maxImgHeight = isLandscape ? pageHeight - yCursor - 45 : 100;

      let imgW = maxImgWidth;
      let imgH = (canvas.height / canvas.width) * imgW;

      if (imgH > maxImgHeight) {
        imgH = maxImgHeight;
        imgW = (canvas.width / canvas.height) * imgH;
      }

      const imgX = margin + (contentWidth - imgW) / 2;
      pdf.addImage(imgData, 'PNG', imgX, yCursor, imgW, imgH);
      yCursor += imgH + 8;
    } catch (err) {
      console.warn('Could not render SVG to PDF canvas:', err);
    }
  }

  // 3. Key Concepts Section
  const rawNodes: any[] = Array.isArray(data.nodes) && data.nodes.length > 0
    ? data.nodes
    : (Array.isArray(data.elements) ? data.elements : []);

  if (rawNodes.length > 0) {
    // Check if space remains on page, else add page
    if (yCursor + 40 > pageHeight) {
      pdf.addPage();
      yCursor = margin;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('KEY CONCEPTS & COMPONENT BREAKDOWN', margin, yCursor);
    yCursor += 6;

    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, yCursor, pageWidth - margin, yCursor);
    yCursor += 5;

    const colors = [
      [13, 148, 136], [2, 132, 199], [124, 58, 237], [217, 119, 6], [5, 150, 105],
      [225, 29, 72], [8, 145, 178], [147, 51, 234], [101, 163, 13], [249, 115, 22],
    ];

    rawNodes.forEach((node, idx) => {
      if (yCursor + 15 > pageHeight - margin) {
        pdf.addPage();
        yCursor = margin;
      }

      const color = colors[idx % colors.length];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.circle(margin + 2, yCursor - 1.5, 1.5, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${node.label || node.name || 'Step'}`, margin + 6, yCursor);

      if (node.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(71, 85, 105);
        const lines = pdf.splitTextToSize(node.description, contentWidth - 10);
        pdf.text(lines, margin + 6, yCursor + 4.5);
        yCursor += lines.length * 4 + 5;
      } else {
        yCursor += 6;
      }
    });
  }

  // 4. Footer
  const totalPages = (pdf as any).getNumberOfPages ? (pdf as any).getNumberOfPages() : (pdf.internal as any).pages?.length || 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `Teachora AI Educational Studio — Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 8
    );
  }

  const pdfBlob = pdf.output('blob');
  const filename = sanitizeFileName(`${displayTitle}_${data.diagramType || 'Diagram'}_Teachora`, 'pdf');

  // Trigger download
  const a = document.createElement('a');
  a.href = URL.createObjectURL(pdfBlob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return pdfBlob;
}
