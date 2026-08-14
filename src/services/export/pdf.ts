import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { LessonContent } from '@/types/content';

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

interface DrawContext {
  page: ReturnType<PDFDocument['addPage']>;
  doc: PDFDocument;
  y: number;
  fontRegular: Awaited<ReturnType<PDFDocument['embedFont']>>;
  fontBold: Awaited<ReturnType<PDFDocument['embedFont']>>;
  pageNumber: number;
}

function addNewPage(ctx: DrawContext): DrawContext {
  const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.pageNumber++;
  return { ...ctx, page, y: PAGE_HEIGHT - MARGIN };
}

function ensureSpace(ctx: DrawContext, needed: number): DrawContext {
  if (ctx.y - needed < MARGIN + 30) {
    return addNewPage(ctx);
  }
  return ctx;
}

function drawWrappedText(
  ctx: DrawContext,
  text: string,
  fontSize: number,
  font: DrawContext['fontRegular'],
  color = rgb(0.11, 0.1, 0.09),
  lineHeight = 1.5
): DrawContext {
  const words = text.split(' ');
  let line = '';
  const spacing = fontSize * lineHeight;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > CONTENT_WIDTH && line) {
      ctx = ensureSpace(ctx, spacing);
      ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: fontSize, font, color });
      ctx.y -= spacing;
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx = ensureSpace(ctx, spacing);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y, size: fontSize, font, color });
    ctx.y -= spacing;
  }

  return ctx;
}

export async function generateLessonPDF(lesson: LessonContent): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let ctx: DrawContext = {
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    doc,
    y: PAGE_HEIGHT - MARGIN,
    fontRegular,
    fontBold,
    pageNumber: 1,
  };

  // Title
  ctx = drawWrappedText(ctx, lesson.title || 'Lesson Plan', 22, fontBold, rgb(0.05, 0.58, 0.53));
  ctx.y -= 8;

  // Metadata line
  const meta = [lesson.subject, lesson.grade, lesson.duration, lesson.difficulty].filter(Boolean).join(' • ');
  if (meta) {
    ctx = drawWrappedText(ctx, meta, 10, fontRegular, rgb(0.47, 0.44, 0.42));
    ctx.y -= 4;
  }

  // Separator
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN, y: ctx.y },
    thickness: 0.5,
    color: rgb(0.9, 0.9, 0.88),
  });
  ctx.y -= 20;

  // Objectives
  if (lesson.objectives?.length) {
    ctx = ensureSpace(ctx, 40);
    ctx = drawWrappedText(ctx, 'Learning Objectives', 14, fontBold);
    ctx.y -= 4;
    for (const obj of lesson.objectives) {
      ctx = drawWrappedText(ctx, `•  ${obj}`, 10, fontRegular);
    }
    ctx.y -= 12;
  }

  // Introduction
  if (lesson.introduction) {
    ctx = ensureSpace(ctx, 40);
    ctx = drawWrappedText(ctx, 'Introduction', 14, fontBold);
    ctx.y -= 4;
    ctx = drawWrappedText(ctx, lesson.introduction, 10, fontRegular);
    ctx.y -= 12;
  }

  // Sections
  if (lesson.sections?.length) {
    for (const section of lesson.sections) {
      ctx = ensureSpace(ctx, 50);
      ctx = drawWrappedText(ctx, section.heading, 13, fontBold);
      ctx.y -= 4;
      ctx = drawWrappedText(ctx, section.content, 10, fontRegular);

      if (section.key_points?.length) {
        ctx.y -= 4;
        ctx = drawWrappedText(ctx, 'Key Points:', 10, fontBold);
        for (const point of section.key_points) {
          ctx = drawWrappedText(ctx, `•  ${point}`, 10, fontRegular);
        }
      }

      if (section.examples?.length) {
        ctx.y -= 4;
        ctx = drawWrappedText(ctx, 'Examples:', 10, fontBold);
        for (const example of section.examples) {
          ctx = drawWrappedText(ctx, `•  ${example}`, 10, fontRegular);
        }
      }
      ctx.y -= 12;
    }
  }

  // Activities
  if (lesson.activities?.length) {
    ctx = ensureSpace(ctx, 50);
    ctx = drawWrappedText(ctx, 'Activities', 14, fontBold, rgb(0.05, 0.58, 0.53));
    ctx.y -= 6;
    for (const activity of lesson.activities) {
      ctx = ensureSpace(ctx, 40);
      ctx = drawWrappedText(ctx, `${activity.name} (${activity.duration})`, 11, fontBold);
      ctx = drawWrappedText(ctx, activity.description, 10, fontRegular);
      if (activity.instructions?.length) {
        for (let i = 0; i < activity.instructions.length; i++) {
          ctx = drawWrappedText(ctx, `${i + 1}. ${activity.instructions[i]}`, 10, fontRegular);
        }
      }
      ctx.y -= 8;
    }
  }

  // Assessment
  if (lesson.assessment?.questions?.length) {
    ctx = ensureSpace(ctx, 50);
    ctx = drawWrappedText(ctx, 'Assessment', 14, fontBold, rgb(0.05, 0.58, 0.53));
    ctx.y -= 6;
    for (let i = 0; i < lesson.assessment.questions.length; i++) {
      const q = lesson.assessment.questions[i];
      ctx = ensureSpace(ctx, 30);
      ctx = drawWrappedText(ctx, `${i + 1}. ${q.question}`, 10, fontBold);
      if (q.options?.length) {
        for (const opt of q.options) {
          ctx = drawWrappedText(ctx, `   ${opt}`, 10, fontRegular);
        }
      }
      ctx.y -= 4;
    }
  }

  // Summary
  if (lesson.summary) {
    ctx = ensureSpace(ctx, 40);
    ctx = drawWrappedText(ctx, 'Summary', 14, fontBold);
    ctx.y -= 4;
    ctx = drawWrappedText(ctx, lesson.summary, 10, fontRegular);
  }

  // Page numbers
  const pages = doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const text = `${i + 1} / ${pages.length}`;
    const width = fontRegular.widthOfTextAtSize(text, 8);
    p.drawText(text, {
      x: PAGE_WIDTH / 2 - width / 2,
      y: 25,
      size: 8,
      font: fontRegular,
      color: rgb(0.65, 0.63, 0.6),
    });
  }

  // Footer
  const footerText = 'Created with Teachora';
  for (const p of pages) {
    p.drawText(footerText, {
      x: MARGIN,
      y: 25,
      size: 7,
      font: fontRegular,
      color: rgb(0.75, 0.73, 0.7),
    });
  }

  return doc.save();
}

export function downloadPDF(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
