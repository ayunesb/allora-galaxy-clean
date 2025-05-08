import { supabase } from '@/integrations/supabase/client';
import { NavigationItem } from '@/types/navigation';
import { LayoutGrid, Home, Plug, Sparkle } from 'lucide-react';
import { Tenant } from './types';

// Define app navigation items
export const getDefaultNavigationItems = (): NavigationItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    path: '/galaxy',
    icon: LayoutGrid
  },
  {
    id: 'plugins',
    label: 'Plugins',
    path: '/plugins',
    icon: Plug
  },
  {
    id: 'agents',
    label: 'Agents',
    path: '/agents',
    icon: Sparkle
  }
];

/**
 * Helper to check if a user is assigned to a tenant
 * @param userId The user ID to check
 * @returns Promise with an array of tenants or null
 */
export const getUserTenants = async (userId: string): Promise<Tenant[] | null> => {
  try {
    // Get all tenants the user is associated with
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select(`
        tenant_id,
        role,
        tenants:tenant_id (
          id,
          name,
          slug
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user tenants:', error);
      return null;
    }

    // Map the result to a more usable format
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      id: item.tenants?.id,
      name: item.tenants?.name,
      slug: item.tenants?.slug,
      role: item.role
    }));
  } catch (err) {
    console.error('Error in getUserTenants:', err);
    return null;
  }
};

// Alias for backward compatibility
export const fetchTenants = getUserTenants;

export function formatTenantsforDropdown(tenants: any[]) {
  if (!tenants || tenants.length === 0) return [];
  
  return tenants.map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug
  }));
}
