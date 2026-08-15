import { supabase } from './client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error.message);
    throw new Error('Failed to update profile. Please try again.');
  }
  return data;
}

export async function createProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error.message);
    throw new Error('Failed to create profile. Please try again.');
  }
  return data;
}

export async function ensureProfileForUser(user: User): Promise<Profile | null> {
  try {
    const existing = await getProfile(user.id);
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Teacher';
    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    if (!existing) {
      return await createProfile({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        preferred_language: 'English',
        onboarding_completed: false,
      });
    }

    const updates: Partial<Profile> = {};
    if (!existing.full_name || existing.full_name === 'Teacher') {
      updates.full_name = fullName;
    }
    if (!existing.avatar_url && avatarUrl) {
      updates.avatar_url = avatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      return await updateProfile(user.id, updates);
    }

    return existing;
  } catch (err) {
    console.error('ensureProfileForUser error:', err);
    return null;
  }
}
