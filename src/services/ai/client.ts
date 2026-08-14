import { ChatService } from './ChatService';
import { ContentGenerationService } from './ContentGenerationService';
import type {
  AIGenerateRequest,
  AIGenerateResponse,
  AIChatRequest,
  AIChatResponse,
} from './types';

/**
 * AI Client — all AI requests are proxied securely through Supabase Edge Functions.
 * No AI API keys or secret credentials exist in the client bundle.
 */

export async function generateContent<T = Record<string, unknown>>(
  request: AIGenerateRequest
): Promise<AIGenerateResponse<T>> {
  return ContentGenerationService.generate<T>({
    type: request.type,
    topic: request.topic,
    subject: request.subject,
    grade: request.grade,
    difficulty: request.difficulty,
    duration: request.duration,
    language: request.language,
    teaching_style: request.teaching_style,
    additional_instructions: request.additional_instructions,
  });
}

export async function chatWithAssistant(
  request: AIChatRequest
): Promise<AIChatResponse> {
  const lastUserMsg = request.messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
  const result = await ChatService.sendMessage({
    message: lastUserMsg,
    history: request.messages,
    teacherContext: request.context,
  });

  return {
    success: result.success,
    message: result.message,
    error: result.error,
  };
}

export { ChatService, ContentGenerationService };
