import { supabase } from './client';
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
