-- Migration: 002_document_chunks.sql
-- Description: Creates document_chunks table with RLS and full-text search index for PDF-Aware Chat

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_file_id ON public.document_chunks(file_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id ON public.document_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_search ON public.document_chunks USING gin(to_tsvector('english', content));

-- Enable RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own document chunks" ON public.document_chunks;
CREATE POLICY "Users can view own document chunks" ON public.document_chunks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own document chunks" ON public.document_chunks;
CREATE POLICY "Users can insert own document chunks" ON public.document_chunks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own document chunks" ON public.document_chunks;
CREATE POLICY "Users can delete own document chunks" ON public.document_chunks
  FOR DELETE USING (auth.uid() = user_id);
