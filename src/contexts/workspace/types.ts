
export interface WorkspaceContextType {
  currentWorkspace: any | null;
  setCurrentWorkspace: (workspace: any) => void;
  workspaces: any[];
  loading: boolean;
  error: any;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, slug?: string) => Promise<any | undefined>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  updateWorkspace: (workspaceId: string, updates: { name?: string; slug?: string }) => Promise<any | undefined>;
  userRole: string | null;
  isLoading: boolean;
  tenant: any | null;
  currentTenant: any | null;
}
