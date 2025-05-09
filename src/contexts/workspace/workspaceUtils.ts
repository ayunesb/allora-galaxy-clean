
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/auth/roleTypes';

export async function fetchUserRole(tenantId: string, userUid: string): Promise<UserRole | null> {
  if (!tenantId || !userUid) return null;
  
  try {
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', userUid)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return (data?.role as UserRole) || null;
  } catch (err) {
    console.error('Exception fetching user role:', err);
    return null;
  }
}

export async function fetchUserTenants(userUid: string) {
  if (!userUid) return [];
  
  try {
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select(`
        tenant_id,
        role,
        tenants:tenant_id (
          id,
          name,
          slug,
          created_at
        )
      `)
      .eq('user_id', userUid);
      
    if (error) {
      console.error('Error fetching user tenants:', error);
      return [];
    }
    
    return data.map(item => ({
      ...item.tenants,
      role: item.role
    })) || [];
  } catch (err) {
    console.error('Exception fetching user tenants:', err);
    return [];
  }
}
