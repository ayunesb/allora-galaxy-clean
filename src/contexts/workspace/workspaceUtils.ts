
import { supabase } from '@/integrations/supabase/client';
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/lib/auth/roleTypes';
import { Tenant } from './types';

// Get custom navigation items based on user role
export const getNavigationItems = (role?: string): NavigationItem[] => {
  // Base navigation items for all users
  const navItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { id: 'galaxy', label: 'Galaxy', path: '/galaxy', icon: 'Globe' },
    { id: 'launch', label: 'Launch', path: '/launch', icon: 'Rocket' },
    { id: 'agents', label: 'Agents', path: '/agents/performance', icon: 'Bot' },
    { id: 'insights', label: 'Insights', path: '/insights/kpis', icon: 'LineChart' },
  ];

  // Add admin section for admin users
  if (role === 'admin' || role === 'owner') {
    navItems.push({
      id: 'admin',
      label: 'Admin',
      path: '/admin/users',
      icon: 'ShieldCheck',
      children: [
        { id: 'users', label: 'Users', path: '/admin/users' },
        { id: 'plugin-logs', label: 'Plugin Logs', path: '/admin/plugin-logs' },
        { id: 'ai-decisions', label: 'AI Decisions', path: '/admin/ai-decisions' },
        { id: 'system-logs', label: 'System Logs', path: '/admin/system-logs' },
      ],
    });
  }

  return navItems;
};

// Fetch tenant data
export const fetchTenant = async (tenantId: string, userId?: string) => {
  if (!userId) return null;
  
  try {
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('*, tenant_user_roles!inner(role)')
      .eq('id', tenantId)
      .eq('tenant_user_roles.user_id', userId)
      .single();

    if (tenantError) {
      console.error('Error fetching workspace tenant:', tenantError);
      return null;
    }

    if (!tenantData) {
      return null;
    }

    return {
      ...tenantData,
      role: tenantData.tenant_user_roles[0].role,
    };
  } catch (error) {
    console.error('Error fetching workspace tenant:', error);
    return null;
  }
};

// Fetch all tenants for the current user
export const fetchTenants = async (userId?: string) => {
  if (!userId) return [];
  
  try {
    // First, get tenant-user associations
    const { data: tenantRoles, error: tenantRolesError } = await supabase
      .from('tenant_user_roles')
      .select('tenant_id, role')
      .eq('user_id', userId);

    if (tenantRolesError) {
      console.error('Error fetching user tenants:', tenantRolesError);
      return [];
    }

    if (!tenantRoles || tenantRoles.length === 0) {
      return [];
    }

    // Then get the actual tenant details
    const tenantIds = tenantRoles.map(tr => tr.tenant_id);
    
    const { data: tenantsData, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .in('id', tenantIds);

    if (tenantsError) {
      console.error('Error fetching tenant details:', tenantsError);
      return [];
    }

    // Combine tenant details with roles
    return tenantsData.map(tenant => {
      const tenantRole = tenantRoles.find(tr => tr.tenant_id === tenant.id);
      return {
        ...tenant,
        role: tenantRole?.role as UserRole
      };
    });
  } catch (error) {
    console.error('Error fetching user tenants:', error);
    return [];
  }
};
