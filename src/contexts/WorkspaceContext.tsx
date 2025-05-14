
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { Tenant, User } from '@/types';
import { NavigationItem } from '@/types/shared';
import { 
  LayoutDashboard,
  Globe,
  Rocket,
  Package,
  Users,
  BarChart,
  Settings,
  Layers,
  Bell
} from 'lucide-react';

// Default navigation items
const defaultNavigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Galaxy",
    href: "/galaxy",
    icon: Globe,
  },
  {
    title: "Launch",
    href: "/launch",
    icon: Rocket,
  },
  {
    title: "Plugins",
    href: "/plugins",
    icon: Package,
  },
  {
    title: "Agents",
    href: "/agents",
    icon: Users,
    items: [
      {
        title: "Performance",
        href: "/agents/performance",
        icon: BarChart,
      },
    ],
  },
  {
    title: "Insights",
    href: "/insights",
    icon: BarChart,
    items: [
      {
        title: "KPIs",
        href: "/insights/kpis",
        icon: BarChart,
      },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Layers,
    adminOnly: true,
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "System Logs",
        href: "/admin/system-logs",
        icon: LayoutDashboard,
      },
      {
        title: "AI Decisions",
        href: "/admin/ai-decisions",
        icon: LayoutDashboard,
      },
      {
        title: "Plugin Logs",
        href: "/admin/plugin-logs",
        icon: LayoutDashboard,
      },
      {
        title: "API Keys",
        href: "/admin/api-keys",
        icon: LayoutDashboard,
      },
    ],
  }
];

export interface WorkspaceContextType {
  tenant: Tenant | null;
  tenants: Tenant[];
  currentWorkspace: Tenant | null;
  navigationItems: NavigationItem[];
  loading: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setCurrentWorkspace: (workspace: Tenant) => void;
  createWorkspace: (name: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [navigationItems] = useState<NavigationItem[]>(defaultNavigationItems);

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const { data: tenantData, error } = await supabaseClient
          .from('tenants')
          .select('*');

        if (error) throw error;

        if (tenantData && tenantData.length > 0) {
          setTenants(tenantData);
          setTenant(tenantData[0]);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const setCurrentWorkspace = (workspace: Tenant) => {
    setTenant(workspace);
  };

  const createWorkspace = async (name: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('tenants')
        .insert({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTenants([...tenants, data]);
        setTenant(data);
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  const value = {
    tenant,
    tenants,
    currentWorkspace: tenant,
    navigationItems,
    loading,
    collapsed,
    setCollapsed,
    setCurrentWorkspace,
    createWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
