-- =====================================================================
-- TEACHORA — COMPLETE SUPABASE DATABASE INITIALIZATION SCHEMA
-- Production-ready schema, relationships, RLS, triggers & seed data
-- =====================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. TABLE: profiles (Teacher Profiles linked to auth.users)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  grade_levels TEXT[] DEFAULT '{}',
  preferred_language TEXT DEFAULT 'English',
  teaching_style TEXT,
  default_difficulty TEXT,
  country TEXT,
  timezone TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 2. TABLE: folders (Organization for projects)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 3. TABLE: projects (Core Teacher Creation Studio Projects)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL, -- lesson, notes, assignment, worksheet, quiz, mock_test, question_paper, exam, presentation, visual, infographic, diagram, video, pdf, document, activity, flashcards, teaching_pack
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'archived')),
  subject TEXT,
  grade_level TEXT,
  language TEXT DEFAULT 'English',
  difficulty TEXT,
  source_type TEXT, -- ai, template, manual, transform, assistant
  source_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 4. TABLE: project_assets (Multiple assets belonging to a project)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- content, image, video, audio, pdf, docx, pptx, diagram, question, answer_key, thumbnail, attachment
  title TEXT,
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  plain_text TEXT,
  file_path TEXT,
  file_url TEXT,
  mime_type TEXT,
  file_size BIGINT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 5. TABLE: files (Metadata of files stored in Supabase Storage)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.project_assets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  file_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 6. TABLE: favorites (Bookmarked projects or assets)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.project_assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_favorite_target CHECK (project_id IS NOT NULL OR asset_id IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_favorite_project 
  ON public.favorites(user_id, project_id) WHERE project_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_favorite_asset 
  ON public.favorites(user_id, asset_id) WHERE asset_id IS NOT NULL;

-- =====================================================================
-- 7. TABLE: conversations (Teacher AI Assistant Conversations)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  context JSONB DEFAULT '{}'::jsonb NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 8. TABLE: messages (Messages inside AI Conversations)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 9. TABLE: generation_jobs (Async / Edge Function AI generation jobs)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL, -- chat, lesson, notes, assignment, worksheet, quiz, mock_test, question_paper, exam, presentation, visual, image, video, document, pdf, teaching_pack, transform
  provider TEXT, -- groq, gemini, pexels, local
  model TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  input JSONB DEFAULT '{}'::jsonb NOT NULL,
  output JSONB DEFAULT '{}'::jsonb NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- =====================================================================
-- 10. TABLE: usage (Daily per-user AI and resource usage tracking)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE NOT NULL,
  chat_requests INTEGER DEFAULT 0 NOT NULL,
  ai_generations INTEGER DEFAULT 0 NOT NULL,
  image_generations INTEGER DEFAULT 0 NOT NULL,
  document_generations INTEGER DEFAULT 0 NOT NULL,
  media_searches INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, usage_date)
);

-- =====================================================================
-- 11. TABLE: template_categories (Template Catalog Categories)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 12. TABLE: templates (Curated Starter & Discover Templates)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  template_type TEXT NOT NULL, -- lesson, notes, assignment, worksheet, quiz, mock_test, question_paper, presentation, visual, activity
  subject TEXT,
  grade_level TEXT,
  difficulty TEXT,
  thumbnail_url TEXT,
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================================
-- 13. TABLE: template_favorites (User Bookmarked Templates)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.template_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, template_id)
);

-- =====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_folder_id ON public.projects(folder_id);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON public.project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_user_id ON public.project_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_asset_type ON public.project_assets(asset_type);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_asset_id ON public.files(asset_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_template_favorites_user_id ON public.template_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON public.generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON public.generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_usage_user_id_date ON public.usage(user_id, usage_date);

CREATE INDEX IF NOT EXISTS idx_templates_category_id ON public.templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_template_type ON public.templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_subject ON public.templates(subject);
CREATE INDEX IF NOT EXISTS idx_templates_grade_level ON public.templates(grade_level);
CREATE INDEX IF NOT EXISTS idx_templates_is_featured ON public.templates(is_featured) WHERE is_featured = true;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_favorites ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Folders RLS
CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Projects RLS
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Project Assets RLS
CREATE POLICY "Users can view own project assets" ON public.project_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own project assets" ON public.project_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project assets" ON public.project_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project assets" ON public.project_assets
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Files RLS
CREATE POLICY "Users can view own files" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON public.files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON public.files
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Favorites RLS
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Conversations RLS
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Messages RLS
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.messages
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Generation Jobs RLS
CREATE POLICY "Users can view own generation jobs" ON public.generation_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generation jobs" ON public.generation_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generation jobs" ON public.generation_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Usage RLS
CREATE POLICY "Users can view own usage" ON public.usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage
  FOR UPDATE USING (auth.uid() = user_id);

-- 11. Template Categories RLS (Public read for authenticated users)
CREATE POLICY "Authenticated users can view template categories" ON public.template_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- 12. Templates RLS (Public read for authenticated users when is_public = true)
CREATE POLICY "Authenticated users can view public templates" ON public.templates
  FOR SELECT USING (auth.role() = 'authenticated' AND is_public = true);

-- 13. Template Favorites RLS
CREATE POLICY "Users can view own template favorites" ON public.template_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own template favorites" ON public.template_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own template favorites" ON public.template_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- AUTOMATION FUNCTIONS & TRIGGERS
-- =====================================================================

-- Trigger 1: Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    preferred_language,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Teacher'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'English'),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_folders_updated_at ON public.folders;
CREATE TRIGGER trg_folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_project_assets_updated_at ON public.project_assets;
CREATE TRIGGER trg_project_assets_updated_at BEFORE UPDATE ON public.project_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_usage_updated_at ON public.usage;
CREATE TRIGGER trg_usage_updated_at BEFORE UPDATE ON public.usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_template_categories_updated_at ON public.template_categories;
CREATE TRIGGER trg_template_categories_updated_at BEFORE UPDATE ON public.template_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_templates_updated_at ON public.templates;
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function 3: Safe Usage Increment Helper (callable via RPC from backend functions)
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_field TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage (
    user_id,
    usage_date,
    chat_requests,
    ai_generations,
    image_generations,
    document_generations,
    media_searches
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    CASE WHEN p_field = 'chat_requests' THEN p_amount ELSE 0 END,
    CASE WHEN p_field = 'ai_generations' THEN p_amount ELSE 0 END,
    CASE WHEN p_field = 'image_generations' THEN p_amount ELSE 0 END,
    CASE WHEN p_field = 'document_generations' THEN p_amount ELSE 0 END,
    CASE WHEN p_field = 'media_searches' THEN p_amount ELSE 0 END
  )
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    chat_requests = public.usage.chat_requests + (CASE WHEN p_field = 'chat_requests' THEN p_amount ELSE 0 END),
    ai_generations = public.usage.ai_generations + (CASE WHEN p_field = 'ai_generations' THEN p_amount ELSE 0 END),
    image_generations = public.usage.image_generations + (CASE WHEN p_field = 'image_generations' THEN p_amount ELSE 0 END),
    document_generations = public.usage.document_generations + (CASE WHEN p_field = 'document_generations' THEN p_amount ELSE 0 END),
    media_searches = public.usage.media_searches + (CASE WHEN p_field = 'media_searches' THEN p_amount ELSE 0 END),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- STORAGE BUCKETS & RLS POLICIES
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('teacher-files', 'teacher-files', false, 52428800, NULL), -- 50MB limit
  ('profile-assets', 'profile-assets', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']) -- 5MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: teacher-files (private to authenticated owner user_id/...)
DROP POLICY IF EXISTS "Teachers can upload to own folder in teacher-files" ON storage.objects;
CREATE POLICY "Teachers can upload to own folder in teacher-files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'teacher-files' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Teachers can read own files in teacher-files" ON storage.objects;
CREATE POLICY "Teachers can read own files in teacher-files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'teacher-files' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Teachers can delete own files in teacher-files" ON storage.objects;
CREATE POLICY "Teachers can delete own files in teacher-files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'teacher-files' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: profile-assets (private to authenticated owner)
DROP POLICY IF EXISTS "Teachers can upload to profile-assets" ON storage.objects;
CREATE POLICY "Teachers can upload to profile-assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-assets' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Teachers can read profile-assets" ON storage.objects;
CREATE POLICY "Teachers can read profile-assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-assets' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================================
-- SEED DATA: Template Categories & Starter Templates
-- =====================================================================
INSERT INTO public.template_categories (name, slug, description, icon)
VALUES
  ('Lessons', 'lessons', 'Complete structured lesson plans with objectives, instructional sections and activities', 'BookOpen'),
  ('Assignments', 'assignments', 'Homework tasks and class assignments with rubrics and scoring guides', 'ClipboardList'),
  ('Worksheets', 'worksheets', 'Progressive practice problem sets and student exercise sheets', 'FileSpreadsheet'),
  ('Quizzes', 'quizzes', 'Interactive assessments with multiple-choice, short-answers, and explanations', 'HelpCircle'),
  ('Mock Tests', 'mock-tests', 'Timed benchmark assessments covering complete curriculum units', 'Timer'),
  ('Question Papers', 'question-papers', 'Sectioned examination papers with formal marking schemes', 'FileQuestion'),
  ('Presentations', 'presentations', 'Slide decks with talking points, visual layouts and speaker notes', 'Presentation'),
  ('Activities', 'activities', 'Hands-on games, group experiments, and interactive classroom tasks', 'Puzzle'),
  ('Visuals', 'visuals', 'Concept maps, educational diagrams, and infographics', 'Image'),
  ('Teaching Packs', 'teaching-packs', 'End-to-end multi-asset instructional bundles generated from a single topic', 'Package')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- Initial Curated Starter Templates
INSERT INTO public.templates (
  category_id,
  title,
  slug,
  description,
  template_type,
  subject,
  grade_level,
  difficulty,
  content,
  is_featured,
  is_public
)
VALUES
  (
    (SELECT id FROM public.template_categories WHERE slug = 'lessons'),
    'Interactive Science Inquiry Lesson',
    'interactive-science-inquiry-lesson',
    'Engage students through the 5E instructional model (Engage, Explore, Explain, Elaborate, Evaluate).',
    'lesson',
    'Science',
    'Grade 7-9',
    'Medium',
    '{
      "duration": "45 minutes",
      "model": "5E Inquiry Model",
      "sections": [
        {"heading": "1. Engage (Hook)", "content": "Demonstration or intriguing question to spark curiosity."},
        {"heading": "2. Explore", "content": "Hands-on guided investigation in small groups."},
        {"heading": "3. Explain", "content": "Teacher-guided concept crystallization and vocabulary."},
        {"heading": "4. Elaborate", "content": "Applying the concept to a new, real-world context."},
        {"heading": "5. Evaluate", "content": "Quick exit ticket assessment."}
      ]
    }'::jsonb,
    true,
    true
  ),
  (
    (SELECT id FROM public.template_categories WHERE slug = 'quizzes'),
    '10-Question Conceptual Mastery Quiz',
    '10-question-conceptual-mastery-quiz',
    'Rapid diagnostic quiz with conceptual questions and explanation rationale for every option.',
    'quiz',
    'Mathematics & Science',
    'Grade 6-12',
    'Medium',
    '{
      "total_questions": 10,
      "time_limit": "15 minutes",
      "question_distribution": {
        "recall": 3,
        "application": 4,
        "analysis": 3
      }
    }'::jsonb,
    true,
    true
  ),
  (
    (SELECT id FROM public.template_categories WHERE slug = 'worksheets'),
    'Progressive Practice Worksheet',
    'progressive-practice-worksheet',
    'Three-tiered problem set starting with foundational questions, progressing to multi-step challenges.',
    'worksheet',
    'General',
    'Grade 4-10',
    'Adaptive',
    '{
      "tiers": [
        {"level": "Level 1: Foundation", "focus": "Direct definition and standard calculations"},
        {"level": "Level 2: Intermediate", "focus": "Word problems and multi-step reasoning"},
        {"level": "Level 3: Challenge / Extension", "focus": "Open-ended critical thinking"}
      ]
    }'::jsonb,
    true,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  is_featured = EXCLUDED.is_featured;
