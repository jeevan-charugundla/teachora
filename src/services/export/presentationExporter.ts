import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { sanitizeFileName, downloadBlob } from './documentExporter';

export interface SlideData {
  slideNumber: number;
  type?: string;
  title: string;
  subtitle?: string;
  content: string[];
  speakerNotes?: string;
  visualSuggestion?: string;
  visualQuery?: string;
  mediaSuggestions?: Array<{
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    photographer?: string;
    attribution?: string;
  }>;
}

export interface PresentationExportData {
  title: string;
  subtitle?: string;
  subject?: string;
  grade?: string;
  topic?: string;
  visualStyle?: string;
  slides: SlideData[];
}

/**
 * Helper to load an image URL into HTMLImageElement and convert to Data URL for PDF embedding.
 */
async function loadImageAsDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 450;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Export presentation as a 16:9 Landscape PDF document.
 * Every slide corresponds to exactly one PDF page.
 */
export async function exportPresentationToPDF(
  presentation: PresentationExportData,
  filename?: string
): Promise<Blob> {
  // Widescreen 16:9 landscape aspect ratio: 841.89 pt x 473.56 pt
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [841.89, 473.56],
  });

  const PAGE_WIDTH = 841.89;
  const PAGE_HEIGHT = 473.56;
  const MARGIN_X = 40;
  const slides = presentation.slides || [];
  const subject = presentation.subject || 'Education';
  const grade = presentation.grade || 'Classroom';
  const theme = presentation.visualStyle || 'Clean';

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) {
      doc.addPage([841.89, 473.56], 'landscape');
    }

    const slide = slides[i];

    // Background Card Styling
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

    // Top Brand Accent Bar
    doc.setFillColor(249, 115, 22); // Orange #f97316
    doc.rect(0, 0, PAGE_WIDTH, 6, 'F');

    // Slide Header metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175); // Gray #9ca3af
    doc.text(`${subject.toUpperCase()} • ${grade.toUpperCase()}`, MARGIN_X, 32);
    doc.text(`SLIDE ${slide.slideNumber} / ${slides.length}`, PAGE_WIDTH - MARGIN_X, 32, { align: 'right' });

    // Header divider line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.75);
    doc.line(MARGIN_X, 40, PAGE_WIDTH - MARGIN_X, 40);

    // Slide Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39); // Dark #111827
    const cleanTitle = (slide.title || `Slide ${i + 1}`).replace(/[*#]/g, '').trim();
    const titleLines = doc.splitTextToSize(cleanTitle, 760);
    doc.text(titleLines, MARGIN_X, 68);

    let startY = 68 + titleLines.length * 24;

    // Slide Subtitle
    if (slide.subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229); // Indigo #4f46e5
      const cleanSubtitle = slide.subtitle.replace(/[*#]/g, '').trim();
      doc.text(cleanSubtitle, MARGIN_X, startY);
      startY += 18;
    }

    // Determine layout: check if image is available
    const imageUrl = slide.mediaSuggestions?.[0]?.url || slide.mediaSuggestions?.[0]?.thumbnailUrl;
    const contentWidth = imageUrl ? 460 : 760;

    // Content Bullet Points
    if (Array.isArray(slide.content) && slide.content.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81); // Slate #374151

      let bulletY = startY + 14;
      for (const bullet of slide.content) {
        if (bulletY > PAGE_HEIGHT - 90) break;
        const cleanBullet = bullet.replace(/[*#]/g, '').trim();
        if (!cleanBullet) continue;

        // Draw bullet dot
        doc.setFillColor(249, 115, 22);
        doc.circle(MARGIN_X + 4, bulletY - 3.5, 2.5, 'F');

        const bulletLines = doc.splitTextToSize(cleanBullet, contentWidth - 20);
        doc.text(bulletLines, MARGIN_X + 16, bulletY);
        bulletY += bulletLines.length * 15 + 6;
      }
    }

    // Embed Image if available
    if (imageUrl) {
      try {
        const dataUrl = await loadImageAsDataUrl(imageUrl);
        if (dataUrl) {
          // Place image in right-side 16:9 container
          const imgX = 520;
          const imgY = startY + 10;
          const imgW = 280;
          const imgH = 157.5; // 16:9 ratio

          doc.setDrawColor(229, 231, 235);
          doc.rect(imgX - 2, imgY - 2, imgW + 4, imgH + 4, 'S');
          doc.addImage(dataUrl, 'JPEG', imgX, imgY, imgW, imgH);
        }
      } catch {
        // Ignore image embedding errors gracefully
      }
    }

    // Speaker Notes (if available)
    if (slide.speakerNotes && slide.speakerNotes.trim()) {
      const notesY = PAGE_HEIGHT - 65;
      doc.setFillColor(254, 243, 199); // Light amber #fef3c7
      doc.roundedRect(MARGIN_X, notesY, 761.89, 32, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9); // Dark amber
      doc.text('SPEAKER NOTES / TEACHER CUES:', MARGIN_X + 8, notesY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 53, 15);
      const cleanNotes = slide.speakerNotes.replace(/[*#]/g, '').trim();
      const notesLines = doc.splitTextToSize(cleanNotes, 740);
      doc.text(notesLines.slice(0, 2), MARGIN_X + 8, notesY + 23);
    }

    // Slide Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(MARGIN_X, PAGE_HEIGHT - 24, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Teachora Classroom Series • ${theme} Theme`, MARGIN_X, PAGE_HEIGHT - 10);
    doc.text(`${presentation.title}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 10, { align: 'right' });
  }

  const pdfBlob = doc.output('blob');
  const outFilename = sanitizeFileName(filename || presentation.title || 'Teachora_Presentation', 'pdf');
  downloadBlob(pdfBlob, outFilename);
  return pdfBlob;
}

/**
 * Export presentation as an editable PowerPoint (.pptx) file using pptxgenjs.
 */
export async function exportPresentationToPPTX(
  presentation: PresentationExportData,
  filename?: string
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentation.title || 'Teachora Presentation';

  const slides = presentation.slides || [];
  const subject = presentation.subject || 'Science';
  const grade = presentation.grade || 'Grade 8';
  const theme = presentation.visualStyle || 'Clean';

  // Theme color definitions
  const accentColor = theme === 'Academic' ? '1E3A8A' : (theme === 'Modern' ? '6366F1' : 'EA580C');

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const pptxSlide = pptx.addSlide();

    // Slide Header Tag
    pptxSlide.addText(`${subject.toUpperCase()} • ${grade.toUpperCase()} • SLIDE ${s.slideNumber}/${slides.length}`, {
      x: 0.5,
      y: 0.4,
      w: 9.0,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: '94A3B8',
    });

    // Slide Title
    const cleanTitle = (s.title || `Slide ${i + 1}`).replace(/[*#]/g, '').trim();
    pptxSlide.addText(cleanTitle, {
      x: 0.5,
      y: 0.7,
      w: 9.0,
      h: 0.7,
      fontSize: 22,
      bold: true,
      color: accentColor,
    });

    let currentY = 1.4;

    // Subtitle
    if (s.subtitle) {
      const cleanSub = s.subtitle.replace(/[*#]/g, '').trim();
      pptxSlide.addText(cleanSub, {
        x: 0.5,
        y: currentY,
        w: 9.0,
        h: 0.4,
        fontSize: 14,
        italic: true,
        color: '475569',
      });
      currentY += 0.5;
    }

    // Determine layout width based on image presence
    const imageUrl = s.mediaSuggestions?.[0]?.url || s.mediaSuggestions?.[0]?.thumbnailUrl;
    const contentWidth = imageUrl ? 5.8 : 9.0;

    // Bullet Content
    if (Array.isArray(s.content) && s.content.length > 0) {
      const textRuns = s.content.map((pt) => {
        const cleanPt = pt.replace(/[*#]/g, '').trim();
        return {
          text: cleanPt,
          options: {
            fontSize: 14,
            color: '1E293B',
            bullet: true,
            breakLine: true,
          },
        };
      });

      pptxSlide.addText(textRuns, {
        x: 0.5,
        y: currentY,
        w: contentWidth,
        h: 4.2,
        valign: 'top',
      });
    }

    // Image Box
    if (imageUrl) {
      try {
        pptxSlide.addImage({
          path: imageUrl,
          x: 6.5,
          y: currentY,
          w: 3.0,
          h: 1.7,
        });
      } catch {
        // Ignore pptx image embedding fallback
      }
    }

    // Native Speaker Notes
    if (s.speakerNotes && s.speakerNotes.trim()) {
      const cleanNotes = s.speakerNotes.replace(/[*#]/g, '').trim();
      pptxSlide.addNotes(cleanNotes);
    }
  }

  const outFilename = sanitizeFileName(filename || presentation.title || 'Teachora_Presentation', 'pptx');
  await pptx.writeFile({ fileName: outFilename });
}
