
import { supabase } from '@/integrations/supabase/client';
import { NavigationItem } from '@/types/navigation';
import { LayoutGrid, Home, Plugin, Sparkle } from 'lucide-react';

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
    icon: Plugin
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
export const getUserTenants = async (userId: string) => {
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
    return data.map(item => ({
      id: item.tenants.id,
      name: item.tenants.name,
      slug: item.tenants.slug,
      role: item.role
    }));
  } catch (err) {
    console.error('Error in getUserTenants:', err);
    return null;
  }
};
