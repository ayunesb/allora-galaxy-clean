
import { supabase } from '@/lib/supabase';

/**
 * Check if the user already has tenants
 * @param userId The current user's ID
 * @returns Array of tenant IDs the user belongs to
 */
export async function checkExistingTenants(userId: string | undefined) {
  try {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select('tenant_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error checking tenants:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error checking tenants:', err);
    return [];
  }
}
