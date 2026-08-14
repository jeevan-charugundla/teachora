import type { CreationFormState } from '../types/creationTypes';
import { supabase } from '@/services/supabase/client';

export interface GenerationResult<T = Record<string, unknown>> {
  success: boolean;
  data: T;
  mock?: boolean;
  generatedAt: string;
  error?: string;
  metadata?: {
    provider: string;
    model: string;
    generatedAt: string;
    jobId?: string;
  };
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  photographer?: string;
  photographerUrl?: string;
  alt?: string;
  attribution?: string;
  files?: Array<{ link: string; quality: string; width: number; height: number }>;
}

export interface MediaSearchResult {
  success: boolean;
  query: string;
  type: 'photo' | 'video';
  total_results: number;
  page: number;
  media: MediaItem[];
  error?: string;
}

/**
 * CreationService: Connects Teachora Create Studio to Supabase Edge Functions.
 * Content Generation -> 'generate-content' (Groq llama-3.3-70b-versatile)
 * Media Search -> 'search-media' (Pexels)
 */
export class CreationService {
  /**
   * Universal generator dispatcher calling the generate-content Edge Function
   */
  static async generate(
    form: CreationFormState,
    onProgress?: (step: number, label: string) => void
  ): Promise<GenerationResult> {
    // Check network connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        data: {} as Record<string, unknown>,
        generatedAt: new Date().toISOString(),
        error: "You're offline. Please reconnect to generate this educational material.",
      };
    }

    // Step 1: Initialize pedagogical parameters
    onProgress?.(1, 'Preparing requirements & pedagogical context…');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return {
          success: false,
          data: {} as Record<string, unknown>,
          generatedAt: new Date().toISOString(),
          error: 'Please log in to generate educational content.',
        };
      }

      // Step 2: Content generation via Groq
      onProgress?.(2, 'Generating structured classroom material with Teachora AI…');

      const response = await supabase.functions.invoke('generate-content', {
        body: {
          creationType: form.type,
          form,
        },
      });

      if (response.error) {
        console.error('Edge Function error:', response.error);
        const status = response.error.status;
        const msg = status === 429
          ? 'Teachora is temporarily busy. Please try again in a moment.'
          : (status === 401
              ? 'Please sign in to generate content.'
              : "We couldn't prepare this material correctly. Please try again.");

        return {
          success: false,
          data: {} as Record<string, unknown>,
          generatedAt: new Date().toISOString(),
          error: msg,
        };
      }

      const resBody = response.data;
      if (!resBody || !resBody.success || !resBody.result) {
        const errorMsg = resBody?.error?.message || "We couldn't generate this material right now. Please try again.";
        return {
          success: false,
          data: {} as Record<string, unknown>,
          generatedAt: new Date().toISOString(),
          error: errorMsg,
        };
      }

      // Step 3: Schema validation & structure check
      onProgress?.(3, 'Validating schema & verifying classroom structure…');

      // Step 4: Finalize workspace preview
      onProgress?.(4, 'Finalizing creation workspace…');

      return {
        success: true,
        data: resBody.result as Record<string, unknown>,
        mock: false,
        generatedAt: resBody.metadata?.generatedAt || new Date().toISOString(),
        metadata: resBody.metadata,
      };
    } catch (err: any) {
      console.error('CreationService.generate error:', err);
      return {
        success: false,
        data: {} as Record<string, unknown>,
        generatedAt: new Date().toISOString(),
        error: err.message || 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Media Search Proxy calling the search-media Edge Function (Pexels)
   */
  static async searchMedia(
    query: string,
    type: 'photo' | 'video' = 'photo',
    perPage: number = 12,
    page: number = 1
  ): Promise<MediaSearchResult> {
    if (!query.trim()) {
      return { success: false, query, type, total_results: 0, page: 1, media: [], error: 'Query is empty' };
    }

    try {
      const response = await supabase.functions.invoke('search-media', {
        body: {
          query: query.trim(),
          type: type === 'video' ? 'videos' : 'photos',
          perPage,
          page,
        },
      });

      if (response.error) {
        return {
          success: false,
          query,
          type,
          total_results: 0,
          page: 1,
          media: [],
          error: response.error.message || 'Media search failed',
        };
      }

      const resBody = response.data;
      return {
        success: Boolean(resBody?.success),
        query: resBody?.query || query,
        type,
        total_results: resBody?.total_results || 0,
        page: resBody?.page || 1,
        media: resBody?.media || [],
      };
    } catch (err: any) {
      return {
        success: false,
        query,
        type,
        total_results: 0,
        page: 1,
        media: [],
        error: err.message || 'Network error during media search',
      };
    }
  }

  /**
   * Visual Generation Proxy calling generate-image Edge Function (Pollinations AI + Pexels fallback)
   */
  static async generateVisual(options: {
    prompt?: string;
    topic?: string;
    subject?: string;
    grade?: string;
    style?: string;
    aspectRatio?: 'landscape' | 'square' | 'portrait';
    creationType?: string;
    additionalInstructions?: string;
    visualSource?: 'auto' | 'stock' | 'ai';
    width?: number;
    height?: number;
    // Diagram-specific rich parameters
    diagramType?: string;
    visualStyle?: string;
    requiredElements?: string[];
    orientation?: string;
  }): Promise<{
    success: boolean;
    provider?: 'pollinations' | 'pexels';
    source?: 'ai' | 'stock';
    found?: boolean;
    image?: {
      id: string;
      url: string;
      width: number;
      height: number;
      prompt: string;
      model: string;
      attribution: string;
      createdAt: string;
    };
    media?: MediaItem[];
    error?: string;
    message?: string;
  }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        error: "You're offline. Reconnect to generate this visual.",
      };
    }

    try {
      const response = await supabase.functions.invoke('generate-image', {
        body: options,
      });

      if (response.error) {
        return {
          success: false,
          error: response.error.message || 'Visual generation failed.',
        };
      }

      const data = response.data;
      if (!data) return { success: false, error: 'Empty response from visual generator' };

      // Normalize error: Edge Function may return error as { code, message } object
      if (data.error && typeof data.error === 'object' && data.error.message) {
        return { ...data, success: false, error: data.error.message };
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error during visual generation.',
      };
    }
  }

  // Type-specific helper proxies
  static async generateLesson(form: CreationFormState) { return this.generate(form); }
  static async generateNotes(form: CreationFormState) { return this.generate(form); }
  static async generatePresentation(form: CreationFormState) { return this.generate(form); }
  static async generateVideo(form: CreationFormState) { return this.generate(form); }
  static async generateAssignment(form: CreationFormState) { return this.generate(form); }
  static async generateWorksheet(form: CreationFormState) { return this.generate(form); }
  static async generateActivity(form: CreationFormState) { return this.generate(form); }
  static async generateFlashcards(form: CreationFormState) { return this.generate(form); }
  static async generateQuiz(form: CreationFormState) { return this.generate(form); }
  static async generateMockTest(form: CreationFormState) { return this.generate(form); }
  static async generateQuestionPaper(form: CreationFormState) { return this.generate(form); }
  static async generateExam(form: CreationFormState) { return this.generate(form); }
  static async generateDiagram(form: CreationFormState) { return this.generate(form); }
  static async generateMindMap(form: CreationFormState) { return this.generate(form); }
  static async generateChart(form: CreationFormState) { return this.generate(form); }
  static async generateInfographic(form: CreationFormState) { return this.generate(form); }
}
