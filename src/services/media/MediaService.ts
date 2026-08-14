import { supabase } from '@/services/supabase/client';
import type { MediaSearchOptions, MediaSearchResponse } from '../ai/AIProvider';

export class MediaService {
  /**
   * Searches educational media (photos, videos) using Pexels securely via Edge Function.
   * Never exposes PEXELS_API_KEY to the browser.
   */
  static async search(options: MediaSearchOptions): Promise<MediaSearchResponse> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return {
          success: false,
          query: options.query,
          total_results: 0,
          page: 1,
          media: [],
          error: 'You must be signed in to search educational media.',
        };
      }

      const { data, error } = await supabase.functions.invoke('search-media', {
        body: options,
      });

      if (error) {
        console.error('Media search Edge Function error:', error);
        return {
          success: false,
          query: options.query,
          total_results: 0,
          page: 1,
          media: [],
          error: error.message || 'Failed to search media.',
        };
      }

      return {
        success: true,
        query: data.query || options.query,
        total_results: data.total_results || 0,
        page: data.page || 1,
        media: data.media || [],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      console.error('MediaService error:', msg);
      return {
        success: false,
        query: options.query,
        total_results: 0,
        page: 1,
        media: [],
        error: 'Unable to reach the media service. Please check your connection.',
      };
    }
  }
}
