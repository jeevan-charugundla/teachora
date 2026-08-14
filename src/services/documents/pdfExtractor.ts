import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface DocumentChunk {
  pageNumber: number;
  chunkIndex: number;
  content: string;
}

export interface PDFExtractionResult {
  fileName: string;
  pageCount: number;
  pages: ExtractedPage[];
  chunks: DocumentChunk[];
  totalCharacters: number;
  isScanned: boolean;
}

/**
 * Extracts text page-by-page from an ArrayBuffer / File using PDF.js.
 */
export async function extractTextFromPDF(
  fileData: ArrayBuffer | Uint8Array,
  fileName: string
): Promise<PDFExtractionResult> {
  const loadingTask = pdfjsLib.getDocument({ data: fileData });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;
  const pages: ExtractedPage[] = [];
  let totalCharacters = 0;

  for (let p = 1; p <= pageCount; p++) {
    const page = await pdfDoc.getPage(p);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    totalCharacters += pageText.length;
    pages.push({
      pageNumber: p,
      text: pageText,
    });
  }

  // If average characters per page is very low (< 30), it's likely scanned / image-only
  const isScanned = totalCharacters < 40;

  // Split into overlapping semantic chunks (~600 chars with 100 char overlap)
  const chunks: DocumentChunk[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    if (!page.text) continue;

    const chunkSize = 600;
    const overlap = 100;
    let start = 0;

    while (start < page.text.length) {
      const end = Math.min(start + chunkSize, page.text.length);
      const chunkText = page.text.slice(start, end).trim();

      if (chunkText.length > 20) {
        chunks.push({
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex++,
          content: chunkText,
        });
      }

      if (end >= page.text.length) break;
      start += chunkSize - overlap;
    }
  }

  return {
    fileName,
    pageCount,
    pages,
    chunks,
    totalCharacters,
    isScanned,
  };
}
