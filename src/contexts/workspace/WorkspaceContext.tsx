
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WorkspaceContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  tenantId?: string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
  initialCollapsed?: boolean;
  tenantId?: string;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({
  children,
  initialCollapsed = false,
  tenantId,
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <WorkspaceContext.Provider value={{ collapsed, toggleCollapsed, tenantId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
