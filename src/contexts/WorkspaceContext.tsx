
import React, { createContext, useContext, PropsWithChildren } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TenantWithRole } from './workspace/types';
import { useWorkspaceState } from './workspace/useWorkspaceState';

export interface WorkspaceContextType {
  currentTenant: TenantWithRole | null;
  tenants: TenantWithRole[];
  setCurrentTenant: (tenant: TenantWithRole | null) => void;
  isLoading: boolean;
}

// Create the context with a default value
export const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const workspaceState = useWorkspaceState();
  
  return (
    <WorkspaceContext.Provider value={workspaceState}>
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
