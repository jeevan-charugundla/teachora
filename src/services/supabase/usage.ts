import { supabase } from './client';

export interface UsageRecord {
  id: string;
  user_id: string;
  usage_date: string;
  chat_requests: number;
  ai_generations: number;
  image_generations: number;
  document_generations: number;
  tokens_used: number;
}

export async function getTodayUsage(userId: string): Promise<UsageRecord | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching today usage:', error.message);
    return null;
  }
  return data;
}

export async function getTotalUsage(userId: string): Promise<{
  total_chat_requests: number;
  total_ai_generations: number;
  total_image_generations: number;
  total_document_generations: number;
}> {
  const { data, error } = await supabase
    .from('usage')
    .select('chat_requests, ai_generations, image_generations, document_generations')
    .eq('user_id', userId);

  if (error || !data) {
    return {
      total_chat_requests: 0,
      total_ai_generations: 0,
      total_image_generations: 0,
      total_document_generations: 0,
    };
  }

  return data.reduce(
    (acc, curr) => ({
      total_chat_requests: acc.total_chat_requests + (curr.chat_requests || 0),
      total_ai_generations: acc.total_ai_generations + (curr.ai_generations || 0),
      total_image_generations: acc.total_image_generations + (curr.image_generations || 0),
      total_document_generations: acc.total_document_generations + (curr.document_generations || 0),
    }),
    {
      total_chat_requests: 0,
      total_ai_generations: 0,
      total_image_generations: 0,
      total_document_generations: 0,
    }
  );
}
