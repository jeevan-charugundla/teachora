import { supabase } from '@/services/supabase/client';
import { extractTextFromPDF, type PDFExtractionResult } from './pdfExtractor';

export interface ProcessedDocument {
  fileId: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  chunkCount: number;
  storagePath: string;
}

/**
 * Uploads a PDF to Supabase Storage, extracts text, generates chunks, and saves to database.
 */
export async function uploadAndProcessPDF(
  file: File,
  userId: string,
  onProgress?: (status: string) => void
): Promise<{ success: boolean; document?: ProcessedDocument; error?: string }> {
  try {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { success: false, error: 'Only PDF documents are supported for analysis.' };
    }

    if (file.size > 25 * 1024 * 1024) {
      return { success: false, error: 'PDF file size must be under 25MB.' };
    }

    onProgress?.('Uploading PDF…');
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/documents/${timestamp}_${cleanFileName}`;

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('teacher-files')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // 2. Extract Text using PDF.js
    onProgress?.('Analyzing document text…');
    const fileBuffer = await file.arrayBuffer();
    const extraction: PDFExtractionResult = await extractTextFromPDF(fileBuffer, file.name);

    if (extraction.isScanned || extraction.totalCharacters < 30) {
      return {
        success: false,
        error: "This PDF appears to be scanned or image-based and doesn't contain selectable text. Text extraction is not available for this document yet.",
      };
    }

    // 3. Insert File record in database
    onProgress?.('Indexing document chunks…');
    const { data: fileRecord, error: fileDbError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        file_name: file.name,
        storage_bucket: 'teacher-files',
        storage_path: storagePath,
        mime_type: 'application/pdf',
        file_size: file.size,
        file_type: 'pdf',
        metadata: {
          page_count: extraction.pageCount,
          total_characters: extraction.totalCharacters,
          status: 'ready',
        },
      })
      .select('id')
      .single();

    if (fileDbError || !fileRecord) {
      console.error('Database file record error:', fileDbError);
      return { success: false, error: 'Failed to record document metadata.' };
    }

    // 4. Batch insert chunks into document_chunks
    const chunkRows = extraction.chunks.map((chunk) => ({
      file_id: fileRecord.id,
      user_id: userId,
      page_number: chunk.pageNumber,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
    }));

    if (chunkRows.length > 0) {
      const { error: chunksError } = await supabase.from('document_chunks').insert(chunkRows);
      if (chunksError) {
        console.error('Database chunks insert error:', chunksError);
      }
    }

    return {
      success: true,
      document: {
        fileId: fileRecord.id,
        fileName: file.name,
        fileSize: file.size,
        pageCount: extraction.pageCount,
        chunkCount: chunkRows.length,
        storagePath,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('uploadAndProcessPDF error:', err);
    return { success: false, error: `Document analysis failed: ${message}` };
  }
}

/**
 * Gets details of a stored document file.
 */
export async function getDocumentDetails(fileId: string, userId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('id, file_name, file_size, metadata, created_at')
    .eq('id', fileId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}
