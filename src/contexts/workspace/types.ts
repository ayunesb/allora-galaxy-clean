
import { Tenant } from '@/types/tenant';
import { NavigationItem } from '@/types/shared';

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  owner_id: string;
  metadata?: Record<string, any> | null;
  [key: string]: any;
}

export interface UserWorkspaceRole {
  role: string;
  workspace: Workspace;
}

export interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: UserWorkspaceRole[];
  currentWorkspace?: Workspace | null;
  isAdmin: boolean;
  isLoading: boolean;  // Primary property
  loading?: boolean;   // Backward compatibility
  error: Error | null;
  navigationItems?: NavigationItem[];
  navigation?: NavigationItem[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed?: () => void;
  refreshWorkspaces: () => Promise<void>;
  updateCurrentWorkspace?: (workspaceId: string) => void;
  setCurrentWorkspace: (workspace: Workspace) => void;
  userRole: string | null;
  createWorkspace?: (workspaceData: Partial<Workspace>) => Promise<Workspace | null>;
  
  // Backward compatibility properties
  tenant?: Tenant | null;
  currentTenant?: Tenant | null;
  tenants?: Tenant[]; // Backward compatibility
}
