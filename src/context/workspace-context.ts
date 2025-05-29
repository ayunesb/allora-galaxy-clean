import { createContext, useContext } from "react";

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  tenants: Workspace[];
  loading: boolean;
  error?: string;
}

// Default empty context
export const WorkspaceContext = createContext<WorkspaceContextType | null>(
  null,
);

// Custom hook for using the workspace context
export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspaceContext must be used within a WorkspaceProvider",
    );
  }
  return context;
};
