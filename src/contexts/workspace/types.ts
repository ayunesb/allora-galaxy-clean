
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | undefined>;
  deleteWorkspace: (id: string) => Promise<void>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<Workspace | undefined>;
}
