import { createClient } from '@/utils/supabase/server'
import { User } from '@/types/database'
import { redirect } from 'next/navigation'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user: authUser }, error } = await supabase.auth.getUser()
  
  if (error || !authUser) {
    return null
  }

  // Get the user profile from our users table
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (userError || !user) {
    return null
  }

  return user
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

export async function createUserProfile(authUser: any): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || null,
      avatar_url: authUser.user_metadata?.avatar_url || null,
      email_verified: authUser.email_confirmed_at ? true : false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return user
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return user
}
