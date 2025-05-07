import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { notifyError } from '@/components/ui/BetterToast';
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

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  role?: string;
}

interface WorkspaceContextType {
  currentTenant: any | null;
  setCurrentTenant: (tenant: any | null) => void;
  tenants: any[];
  loading: boolean;
  currentRole: string | null;
  navigationItems: NavigationItem[];
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
  const [currentTenant, setCurrentTenant] = useState<any | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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

        const availableTenants = userTenants.map((ut) => ({
          id: ut.tenant_id,
          ...ut.tenants,
          role: ut.role,
        }));

        setTenants(availableTenants);

        // If a tenant is already selected, ensure it's still valid
        if (currentTenant) {
          const stillValidTenant = availableTenants.find(
            (t) => t.id === currentTenant.id
          );
          if (stillValidTenant) {
            setCurrentTenant(stillValidTenant);
            setCurrentRole(stillValidTenant.role);
          } else {
            // Tenant is no longer valid for the user, clear it
            setCurrentTenant(null);
            setCurrentRole(null);
          }
        } else if (availableTenants.length > 0) {
          // Auto-select the first tenant if none is selected
          setCurrentTenant(availableTenants[0]);
          setCurrentRole(availableTenants[0].role);
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
    navigationItems,
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
