-- Migration 003: Workspace Realtime & Project Management Enhancements

-- 1. Ensure projects table has required columns for Realtime Workspace
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Create index on last_opened_at & updated_at for fast workspace sorting
CREATE INDEX IF NOT EXISTS idx_projects_user_last_opened 
  ON public.projects(user_id, last_opened_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_user_updated 
  ON public.projects(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_user_favorite 
  ON public.projects(user_id, is_favorite) WHERE is_favorite = true;

-- 3. Enable Supabase Realtime for projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Publication might be managed externally in hosted Supabase
    NULL;
END $$;
