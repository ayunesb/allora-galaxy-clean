import React, { createContext, useContext, useState, ReactNode } from "react";

interface WorkspaceContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  currentTenantId: string | null;
  setCurrentTenantId: (tenantId: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

interface WorkspaceProviderProps {
  children: ReactNode;
  initialTenantId?: string | null;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  children,
  initialTenantId = null,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(
    initialTenantId,
  );

  return (
    <WorkspaceContext.Provider
      value={{
        collapsed,
        setCollapsed,
        currentTenantId,
        setCurrentTenantId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
