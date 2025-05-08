
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { notifyError } from '@/components/ui/BetterToast';
import { Tenant, UserRole } from '@/types/fixed';
import { snakeToCamel } from '@/lib/utils/caseConverters';
import { NavigationItem } from '@/types/navigation';
import {
  Home,
  Settings,
  Users,
  BarChart,
  Puzzle,
  Building2,
  KeyRound,
  Mail,
  HelpCircle,
  Plus,
  LucideIcon,
  LayoutDashboard,
  ListChecks,
  TrendingUp,
  Bell,
} from 'lucide-react';

export interface WorkspaceContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  tenants: Tenant[];
  loading: boolean;
  currentRole: UserRole | null;
  userRole: UserRole | null;
  navigationItems: NavigationItem[];
  createTenant?: (data: any) => Promise<any>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  children,
}) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Add userRole property as an alias of currentRole for backward compatibility
  const userRole = currentRole;

  // Create tenant function
  const createTenant = async (data: any) => {
    try {
      // First, create the tenant
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: data.companyName,
          metadata: {
            industry: data.industry,
            size: data.companySize,
            goals: data.goals
          }
        })
        .select('id')
        .single();

      if (tenantError) {
        throw tenantError;
      }

      if (!newTenant || !user) {
        throw new Error('Failed to create tenant or user not authenticated');
      }

      // Then, associate the current user with the tenant as an owner
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: newTenant.id,
          user_id: user.id,
          role: 'owner'
        });

      if (roleError) {
        throw roleError;
      }

      // Create company profile
      const { error: profileError } = await supabase
        .from('company_profiles')
        .insert({
          tenant_id: newTenant.id,
          name: data.companyName,
          industry: data.industry,
          size: data.companySize,
          goals: data.goals
        });

      if (profileError) {
        throw profileError;
      }

      // Refresh the workspaces
      await fetchWorkspaces();

      // Return the new tenant
      return newTenant;
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      notifyError('Failed to create workspace', err.message);
      throw err;
    }
  };

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      if (!user) {
        setTenants([]);
        setCurrentTenant(null);
        return;
      }

      const { data: userTenants, error } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id, role, tenants(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user workspaces:', error);
        notifyError('Error fetching workspaces', error.message);
        setLoading(false);
        return;
      }

      if (!userTenants || userTenants.length === 0) {
        setTenants([]);
        setCurrentTenant(null);
        setLoading(false);
        return;
      }

      const availableTenants = userTenants.map((ut) => {
        // Convert from snake_case to camelCase
        const tenantData = snakeToCamel<Tenant>(ut.tenants as any);
        return {
          ...tenantData,
          role: ut.role as UserRole,
        };
      });

      setTenants(availableTenants);

      // If a tenant is already selected, ensure it's still valid
      if (currentTenant) {
        const stillValidTenant = availableTenants.find(
          (t) => t.id === currentTenant.id
        );
        if (stillValidTenant) {
          setCurrentTenant(stillValidTenant);
          setCurrentRole(stillValidTenant.role as UserRole);
        } else {
          // Tenant is no longer valid for the user, clear it
          setCurrentTenant(null);
          setCurrentRole(null);
        }
      } else if (availableTenants.length > 0) {
        // Auto-select the first tenant if none is selected
        setCurrentTenant(availableTenants[0]);
        setCurrentRole(availableTenants[0].role as UserRole);
      } else {
        setCurrentTenant(null);
        setCurrentRole(null);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching workspaces:', err);
      notifyError('Unexpected error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem('currentTenantId', currentTenant.id);
    } else {
      localStorage.removeItem('currentTenantId');
    }
  }, [currentTenant]);

  const navigationItems: NavigationItem[] = React.useMemo(() => {
    return [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Strategies',
        href: '/strategies',
        icon: ListChecks,
      },
      {
        title: 'Insights',
        href: '/insights',
        icon: TrendingUp,
      },
      {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
      },
      {
        title: 'Agents',
        href: '/agents',
        icon: Puzzle,
      },
      {
        title: 'Team',
        href: '/team',
        icon: Users,
        role: 'admin',
      },
      {
        title: 'Billing',
        href: '/billing',
        icon: BarChart,
        role: 'admin',
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        role: 'admin',
      },
    ];
  }, []);

  const value: WorkspaceContextType = {
    currentTenant,
    setCurrentTenant,
    tenants,
    loading,
    currentRole,
    userRole, 
    navigationItems,
    createTenant,
  };

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
