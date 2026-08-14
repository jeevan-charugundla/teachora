import { supabase } from './client';
import type { Folder } from '@/types/database';

export async function getFolders(userId: string): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching folders:', error.message);
    return [];
  }
  return data || [];
}

export async function createFolder(
  folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>
): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .insert(folder)
    .select()
    .single();

  if (error) {
    console.error('Error creating folder:', error.message);
    throw new Error('Failed to create folder.');
  }
  return data;
}

export async function updateFolder(
  folderId: string,
  updates: Partial<Folder>
): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .update(updates)
    .eq('id', folderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating folder:', error.message);
    throw new Error('Failed to update folder.');
  }
  return data;
}

export async function deleteFolder(folderId: string): Promise<void> {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId);

  if (error) {
    console.error('Error deleting folder:', error.message);
    throw new Error('Failed to delete folder.');
  }
}
