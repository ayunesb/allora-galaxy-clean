
import { Tenant } from '@/types/tenant';
import { NavigationItem } from '@/types/navigation';

export interface WorkspaceContextType {
  currentWorkspace: Tenant | null;
  workspaces: Tenant[];
  isLoading: boolean;  // Primary property
  error: Error | null;
  navigationItems: NavigationItem[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  refreshWorkspaces: () => Promise<void>;
  updateCurrentWorkspace: (workspaceId: string) => void;
  userRole: string | null;
  
  // Backward compatibility properties
  tenant?: Tenant | null;
  currentTenant?: Tenant | null;
  loading?: boolean;  // Backward compatibility
  tenants?: Tenant[]; // Backward compatibility
  setCurrentWorkspace?: (workspace: Tenant) => void;
  toggleCollapsed?: () => void;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  [key: string]: any;
}
