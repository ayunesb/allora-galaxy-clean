
export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  workspaces: Workspace[];
  loading: boolean;
  error: any;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, slug?: string) => Promise<Workspace | undefined>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  updateWorkspace: (workspaceId: string, updates: { name?: string; slug?: string }) => Promise<Workspace | undefined>;
  userRole: string | null;
  isLoading: boolean;
  tenant: any | null;
  currentTenant: any | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}
