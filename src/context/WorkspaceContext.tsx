import { createContext, useContext, useState, ReactNode } from "react";

export interface WorkspaceContextType {
  // Basic workspace properties
  currentTenant: string | null;
  setCurrentTenant: (tenantId: string | null) => void;

  // Additional workspace state
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  // Error handling state
  error: Error | null;
  setError: (error: Error | null) => void;
}

const defaultWorkspaceContext: WorkspaceContextType = {
  currentTenant: null,
  setCurrentTenant: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
};

export const WorkspaceContext = createContext<WorkspaceContextType>(
  defaultWorkspaceContext,
);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  return (
    <WorkspaceContext.Provider
      value={{
        currentTenant,
        setCurrentTenant,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
