export interface AIGenerateRequest {
  type: string;
  topic: string;
  subject: string;
  grade: string;
  difficulty?: string;
  duration?: string;
  language?: string;
  teaching_style?: string;
  additional_instructions?: string;
}

export interface AIGenerateResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AIChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    subject?: string;
    grade?: string;
    topic?: string;
    language?: string;
    teaching_style?: string;
  };
}

export interface AIChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}
