import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export async function saveUserProfile(user: User) {
  if (!user) return;

  const updates = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').upsert(updates);

  if (error) {
    console.error('Error saving user profile:', error);
  } else {
    console.log('User profile saved successfully.');
  }
}
