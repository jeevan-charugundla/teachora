import { supabase } from '@/services/supabase/client';
import type { ContentGenerationOptions, ContentGenerationResponse } from './AIProvider';

export class ContentGenerationService {
  /**
   * Generates high-quality structured classroom material using Gemini via Edge Function.
   */
  static async generate<T = Record<string, unknown>>(
    options: ContentGenerationOptions
  ): Promise<ContentGenerationResponse<T>> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return {
          success: false,
          error: 'You must be signed in to generate classroom materials.',
        };
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: options,
      });

      if (error) {
        console.error('Content generation function error:', error);
        return {
          success: false,
          error: error.message || 'Generation failed. Please try again.',
        };
      }

      if (!data || data.error) {
        return {
          success: false,
          error: data?.error || 'No content received from generator.',
        };
      }

      return {
        success: true,
        data: (data.data || data) as T,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure';
      console.error('ContentGenerationService error:', msg);
      return {
        success: false,
        error: 'Unable to connect to the generation service. Please check your connection.',
      };
    }
  }
}
