import { createAdminClient } from './server'

/**
 * Set the user context for RLS policies
 * This must be called before any database operations that need RLS
 */
export async function setUserContext(userId: string) {
  const supabase = createAdminClient()
  
  try {
    await supabase.rpc('set_user_context', { user_uuid: userId })
  } catch (error) {
    console.error('[v0] Error setting user context:', error)
    throw new Error('Failed to set user context for RLS')
  }
}

/**
 * Clear the user context for RLS policies
 */
export async function clearUserContext() {
  const supabase = createAdminClient()
  
  try {
    await supabase.rpc('clear_user_context')
  } catch (error) {
    console.error('[v0] Error clearing user context:', error)
  }
}

/**
 * Execute a function with user context set for RLS
 */
export async function withUserContext<T>(
  userId: string,
  fn: () => Promise<T>
): Promise<T> {
  await setUserContext(userId)
  try {
    return await fn()
  } finally {
    await clearUserContext()
  }
}
