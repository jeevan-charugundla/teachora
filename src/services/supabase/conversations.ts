import { supabase } from './client';
import type { Conversation, Message } from '@/types/database';

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error.message);
    return [];
  }
  return data || [];
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error.message);
    return null;
  }
  return data;
}

export async function createConversation(
  userId: string,
  title = 'New Conversation',
  context: Record<string, unknown> = {}
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, context })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error.message);
    throw new Error('Failed to create conversation.');
  }
  return data;
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating conversation title:', error.message);
    throw new Error('Failed to update title.');
  }
  return data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error.message);
    throw new Error('Failed to delete conversation.');
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }
  return data || [];
}

export async function addMessage(
  message: Omit<Message, 'id' | 'created_at'>
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error.message);
    throw new Error('Failed to send message.');
  }
  return data;
}
