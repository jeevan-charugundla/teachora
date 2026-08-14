import { supabase } from './client';
import type { Project } from '@/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Normalized helper to handle column mapping (type vs project_type)
export function normalizeProject(raw: any): Project {
  if (!raw) return raw;
  return {
    ...raw,
    type: raw.project_type || raw.type || 'lesson',
    project_type: raw.project_type || raw.type || 'lesson',
    grade_level: raw.grade_level || raw.grade || null,
    is_favorite: Boolean(raw.is_favorite),
    last_opened_at: raw.last_opened_at || raw.updated_at || raw.created_at,
  };
}

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

  return (data || []).map(normalizeProject);
}

export async function getRecentProjects(userId: string, limit = 6): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('last_opened_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent projects:', error.message);
    return [];
  }
  return (data || []).map(normalizeProject);
}

export async function getFavoriteProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorite projects:', error.message);
    return [];
  }
  return (data || []).map(normalizeProject);
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
  return normalizeProject(data);
}

export async function createProject(project: any): Promise<Project> {
  const content = project.content;
  const projectType = project.project_type || project.type || 'lesson';
  const gradeLevel = project.grade_level || project.grade || null;
  const now = new Date().toISOString();

  const payload = {
    user_id: project.user_id,
    folder_id: project.folder_id || null,
    title: project.title || 'Untitled Creation',
    description: project.description || null,
    project_type: projectType,
    category: project.category || 'teach',
    status: project.status || 'completed',
    subject: project.subject || null,
    grade_level: gradeLevel,
    language: project.language || 'English',
    difficulty: project.difficulty || null,
    source_type: project.source_type || 'ai',
    thumbnail_url: project.thumbnail_url || null,
    is_favorite: Boolean(project.is_favorite),
    last_opened_at: now,
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

  return normalizeProject(data);
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project> {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error.message);
    throw new Error('Failed to update project.');
  }
  return normalizeProject(data);
}

export async function renameProject(projectId: string, title: string): Promise<Project> {
  return updateProject(projectId, { title: title.trim() });
}

export async function touchProjectLastOpened(projectId: string): Promise<void> {
  try {
    await supabase
      .from('projects')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', projectId);
  } catch (err) {
    console.warn('Could not update last_opened_at for project:', err);
  }
}

export async function toggleFavorite(projectId: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) {
    console.error('Error toggling favorite:', error.message);
    throw new Error('Failed to update favorite status.');
  }
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

/**
 * Subscribe to real-time changes on the projects table for a specific user.
 * Dispatches INSERT, UPDATE, and DELETE payload events to the listener callback.
 */
export function subscribeToProjects(
  userId: string,
  onPayload: (payload: RealtimePostgresChangesPayload<Project>) => void
) {
  const channel = supabase
    .channel(`user_projects_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // Normalize payload new/old rows if available
        const normalizedPayload = {
          ...payload,
          new: payload.new ? normalizeProject(payload.new) : payload.new,
          old: payload.old ? normalizeProject(payload.old) : payload.old,
        } as RealtimePostgresChangesPayload<Project>;

        onPayload(normalizedPayload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to projects changes for user ${userId}`);
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
