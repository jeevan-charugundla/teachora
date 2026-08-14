import { supabase } from './client';
import type { Project } from '@/types/database';

export async function getProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error.message);
    throw new Error('Failed to load projects.');
  }
  return data || [];
}

export async function getProject(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error.message);
    return null;
  }
  return data;
}

export async function createProject(
  project: any
): Promise<Project> {
  const content = project.content;
  const projectType = project.project_type || project.type || 'lesson';
  const gradeLevel = project.grade_level || project.grade || null;

  const payload = {
    user_id: project.user_id,
    folder_id: project.folder_id || null,
    title: project.title || 'Untitled Creation',
    description: project.description || null,
    project_type: projectType,
    status: project.status || 'draft',
    subject: project.subject || null,
    grade_level: gradeLevel,
    language: project.language || 'English',
    difficulty: project.difficulty || null,
    source_type: project.source_type || 'ai',
    metadata: {
      ...(project.metadata || {}),
      content: content || project.metadata?.content,
    },
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error.message);
    throw new Error('Failed to save project. Please try again.');
  }

  // Also insert into project_assets for rich structured asset retrieval
  if (content && data) {
    try {
      await supabase.from('project_assets').insert({
        project_id: data.id,
        user_id: project.user_id,
        asset_type: 'content',
        title: data.title,
        content: typeof content === 'object' ? content : { raw: content },
        plain_text: typeof content === 'string' ? content : JSON.stringify(content),
      });
    } catch (assetErr) {
      console.warn('Notice: project_assets insert notice:', assetErr);
    }
  }

  return data;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error.message);
    throw new Error('Failed to update project.');
  }
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error.message);
    throw new Error('Failed to delete project.');
  }
}

export async function toggleFavorite(projectId: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ is_favorite: isFavorite })
    .eq('id', projectId);

  if (error) {
    console.error('Error toggling favorite:', error.message);
    throw new Error('Failed to update favorite status.');
  }
}

export async function getRecentProjects(userId: string, limit = 6): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent projects:', error.message);
    return [];
  }
  return data || [];
}

export async function getFavoriteProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error.message);
    return [];
  }
  return data || [];
}
