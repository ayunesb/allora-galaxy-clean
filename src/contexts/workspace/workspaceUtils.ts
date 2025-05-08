
import { supabase } from '@/integrations/supabase/client';
import { NavigationItem } from '@/types/navigation';
import { Gallery, Home, PlugIcon, SparkleIcon } from 'lucide-react';

// Define app navigation items
export const getDefaultNavigationItems = (): NavigationItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    path: '/galaxy',
    icon: Gallery,
  },
  {
    id: 'launch',
    label: 'Launch',
    path: '/launch',
    icon: SparkleIcon,
  },
  {
    id: 'plugins',
    label: 'Plugins',
    path: '/plugins',
    icon: PlugIcon,
  }
];

/**
 * Fetch tenants for a specific user
 */
export const fetchTenants = async (userId: string | undefined) => {
  if (!userId) return [];

  try {
    const { data: tenantUserRoles, error } = await supabase
      .from('tenant_user_roles')
      .select('tenant_id, role, tenants:tenant_id(id, name, slug)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user tenants:', error);
      return [];
    }

    return tenantUserRoles.map(item => ({
      id: item.tenant_id,
      name: item.tenants?.name || 'Unknown',
      slug: item.tenants?.slug || 'unknown',
      role: item.role
    }));
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
};
