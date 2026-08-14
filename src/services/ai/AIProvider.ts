import type { TeacherContext } from '@/types/database';

export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequestOptions {
  conversationId?: string | null;
  message: string;
  documentId?: string | null;
  teacherContext?: TeacherContext;
  projectContext?: Record<string, unknown>;
  history?: ChatMessagePayload[];
}

export interface ChatResponsePayload {
  success: boolean;
  message?: string;
  conversation_id?: string;
  user_message_id?: string;
  assistant_message_id?: string;
  document_name?: string | null;
  source_pages?: number[] | null;
  error?: string;
}

export interface ContentGenerationOptions {
  type: 'lesson' | 'quiz' | 'worksheet' | 'assignment' | 'notes' | 'presentation' | 'mock-test' | 'question-paper' | 'exam' | string;
  topic: string;
  subject?: string;
  grade?: string;
  difficulty?: string;
  duration?: string;
  language?: string;
  teaching_style?: string;
  additional_instructions?: string;
}

export interface ContentGenerationResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MediaSearchOptions {
  query: string;
  type?: 'photos' | 'videos';
  per_page?: number;
  page?: number;
}

export interface MediaItem {
  id: number;
  type: 'photo' | 'video';
  photographer?: string;
  photographer_url?: string;
  alt?: string;
  thumbnail?: string;
  url?: string;
  duration?: number;
  src?: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
}

export interface MediaSearchResponse {
  success: boolean;
  query: string;
  total_results: number;
  page: number;
  media: MediaItem[];
  error?: string;
}

export interface IAIProvider {
  chat(options: ChatRequestOptions): Promise<ChatResponsePayload>;
  generateContent<T = Record<string, unknown>>(options: ContentGenerationOptions): Promise<ContentGenerationResponse<T>>;
  searchMedia(options: MediaSearchOptions): Promise<MediaSearchResponse>;
}
