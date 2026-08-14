import { supabase } from '@/services/supabase/client';
import type { ChatRequestOptions, ChatResponsePayload } from './AIProvider';

export class ChatService {
  /**
   * Sends a message to the teacher-chat Edge Function (powered by Groq).
   * Verifies authentication and ensures user data isolation.
   */
  static async sendMessage(options: ChatRequestOptions): Promise<ChatResponsePayload> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return {
          success: false,
          error: 'You must be signed in to converse with Teachora AI.',
        };
      }

      const payload = {
        conversation_id: options.conversationId || undefined,
        message: options.message,
        document_id: options.documentId || undefined,
        teacher_context: options.teacherContext || {},
        project_context: options.projectContext || undefined,
        messages: options.history || undefined,
      };

      // Invoke teacher-chat Edge Function
      const { data, error } = await supabase.functions.invoke('teacher-chat', {
        body: payload,
      });

      if (error) {
        console.error('Teacher Chat Edge Function error:', error);
        return {
          success: false,
          error: error.message || "Teachora couldn't reach the AI right now. Please try again.",
        };
      }

      if (!data || data.error) {
        return {
          success: false,
          error: data?.error || 'No response received from assistant.',
        };
      }

      return {
        success: true,
        message: data.message || '',
        conversation_id: data.conversation_id,
        user_message_id: data.user_message_id,
        assistant_message_id: data.assistant_message_id,
        document_name: data.document_name,
        source_pages: data.source_pages,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      console.error('ChatService error:', msg);
      return {
        success: false,
        error: "Teachora couldn't connect to the AI assistant. Please check your internet connection.",
      };
    }
  }
}
