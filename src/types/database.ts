export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  subjects: string[];
  grade_levels: string[];
  preferred_language: string;
  teaching_style: string | null;
  default_difficulty: string | null;
  country: string | null;
  timezone: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  folder_id?: string | null;
  title: string;
  description?: string | null;
  project_type?: string;
  type: string;
  status: 'draft' | 'processing' | 'completed' | 'archived';
  subject?: string | null;
  grade_level?: string | null;
  grade?: string | null;
  language?: string;
  difficulty?: string | null;
  source_type?: string | null;
  source_project_id?: string | null;
  thumbnail_url?: string | null;
  metadata?: Record<string, unknown>;
  content?: Record<string, unknown>;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectAsset {
  id: string;
  project_id: string;
  user_id: string;
  asset_type: string;
  title: string | null;
  content: Record<string, unknown>;
  plain_text: string | null;
  file_path: string | null;
  file_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  metadata: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StoredFile {
  id: string;
  user_id: string;
  project_id: string | null;
  asset_id: string | null;
  file_name: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  file_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  project_id: string | null;
  asset_id: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  context: TeacherContext;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GenerationJob {
  id: string;
  user_id: string;
  project_id: string | null;
  generation_type: string;
  type?: string;
  provider: string | null;
  model: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface Usage {
  id: string;
  user_id: string;
  usage_date: string;
  chat_requests: number;
  ai_generations: number;
  image_generations: number;
  document_generations: number;
  media_searches: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  category_id: string | null;
  title: string;
  slug: string | null;
  description: string | null;
  template_type: string;
  type?: string;
  category?: string;
  subject: string | null;
  grade_level: string | null;
  grade?: string | null;
  difficulty: string | null;
  thumbnail_url: string | null;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateFavorite {
  id: string;
  user_id: string;
  template_id: string;
  created_at: string;
}

export interface TeacherContext {
  name?: string;
  subject?: string;
  grade?: string;
  topic?: string;
  language?: string;
  teaching_style?: string;
  difficulty?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      folders: {
        Row: Folder;
        Insert: Omit<Folder, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Folder>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Project>;
      };
      project_assets: {
        Row: ProjectAsset;
        Insert: Omit<ProjectAsset, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<ProjectAsset>;
      };
      files: {
        Row: StoredFile;
        Insert: Omit<StoredFile, 'id' | 'created_at'> & { id?: string };
        Update: Partial<StoredFile>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Favorite>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Message>;
      };
      generation_jobs: {
        Row: GenerationJob;
        Insert: Omit<GenerationJob, 'id' | 'created_at'> & { id?: string };
        Update: Partial<GenerationJob>;
      };
      usage: {
        Row: Usage;
        Insert: Partial<Usage> & { user_id: string };
        Update: Partial<Usage>;
      };
      template_categories: {
        Row: TemplateCategory;
        Insert: Omit<TemplateCategory, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<TemplateCategory>;
      };
      templates: {
        Row: Template;
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Template>;
      };
      template_favorites: {
        Row: TemplateFavorite;
        Insert: Omit<TemplateFavorite, 'id' | 'created_at'> & { id?: string };
        Update: Partial<TemplateFavorite>;
      };
    };
  };
}
