import { supabase } from './client';
import type { ProjectAsset, StoredFile } from '@/types/database';

export async function getProjectAssets(projectId: string): Promise<ProjectAsset[]> {
  const { data, error } = await supabase
    .from('project_assets')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching project assets:', error.message);
    return [];
  }
  return data || [];
}

export async function createProjectAsset(
  asset: Omit<ProjectAsset, 'id' | 'created_at' | 'updated_at'>
): Promise<ProjectAsset> {
  const { data, error } = await supabase
    .from('project_assets')
    .insert(asset)
    .select()
    .single();

  if (error) {
    console.error('Error creating project asset:', error.message);
    throw new Error('Failed to create project asset.');
  }
  return data;
}

export async function deleteProjectAsset(assetId: string): Promise<void> {
  const { error } = await supabase
    .from('project_assets')
    .delete()
    .eq('id', assetId);

  if (error) {
    console.error('Error deleting project asset:', error.message);
    throw new Error('Failed to delete asset.');
  }
}

export async function recordStoredFile(
  fileData: Omit<StoredFile, 'id' | 'created_at'>
): Promise<StoredFile> {
  const { data, error } = await supabase
    .from('files')
    .insert(fileData)
    .select()
    .single();

  if (error) {
    console.error('Error recording stored file:', error.message);
    throw new Error('Failed to record stored file.');
  }
  return data;
}
