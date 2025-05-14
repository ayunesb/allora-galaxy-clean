
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  error: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch workspaces (tenants) that the current user has access to
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select(`
          id,
          name,
          slug,
          tenant_user_roles!inner(user_id, role)
        `)
        .eq('tenant_user_roles.user_id', user.id);

      if (fetchError) {
        console.error('Error fetching workspaces:', fetchError);
        setError('Failed to load workspaces');
        toast({
          title: "Error loading workspaces",
          description: fetchError.message,
          variant: "destructive"
        });
        return;
      }

      // Transform the data to match our Workspace type
      const transformedWorkspaces: Workspace[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug
      }));

      setWorkspaces(transformedWorkspaces);

      // Set the first workspace as the current one if there's no current selection
      if (transformedWorkspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(transformedWorkspaces[0]);
      } else if (transformedWorkspaces.length === 0) {
        // Reset current workspace if there are no workspaces
        setCurrentWorkspace(null);
      }

    } catch (err: any) {
      console.error('Error in fetchWorkspaces:', err);
      setError('An unexpected error occurred');
      toast({
        title: "Error",
        description: err.message || 'Failed to load workspaces',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Switch the current workspace
  const switchWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    // Save selection to localStorage
    localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
  };

  // Restore the previously selected workspace from localStorage
  const restoreWorkspace = () => {
    const savedWorkspace = localStorage.getItem('currentWorkspace');
    if (savedWorkspace) {
      try {
        const parsedWorkspace = JSON.parse(savedWorkspace);
        // Only set it if it's in the available workspaces
        if (workspaces.some(w => w.id === parsedWorkspace.id)) {
          setCurrentWorkspace(parsedWorkspace);
        }
      } catch (err) {
        console.error('Error restoring workspace from localStorage:', err);
        localStorage.removeItem('currentWorkspace');
      }
    }
  };

  // Fetch workspaces when the user changes
  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  // Restore the selected workspace when workspaces are loaded
  useEffect(() => {
    if (workspaces.length > 0 && !loading) {
      restoreWorkspace();
    }
  }, [workspaces, loading]);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      currentWorkspace,
      loading,
      setCurrentWorkspace: switchWorkspace,
      refreshWorkspaces: fetchWorkspaces,
      error
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
