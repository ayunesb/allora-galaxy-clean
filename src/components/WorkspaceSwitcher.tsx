
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, Check, PlusCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';

/**
 * WorkspaceSwitcher allows users to switch between different tenants/workspaces
 */
export function WorkspaceSwitcher() {
  const { currentWorkspace, setCurrentWorkspace, userWorkspaces, loading } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Handle workspace selection
  const handleSelectWorkspace = async (workspaceId: string) => {
    if (currentWorkspace?.id === workspaceId) return;
    
    const workspace = userWorkspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspace.id);
      setOpen(false);
      navigate('/dashboard');
    }
  };

  // Open create workspace dialog
  const handleCreateWorkspace = () => {
    setCreating(true);
    setOpen(false);
  };

  // Close create workspace dialog
  const handleCloseCreateDialog = () => {
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-[150px]" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <Button variant="outline" onClick={handleCreateWorkspace}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Workspace
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
            {currentWorkspace.name}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userWorkspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSelectWorkspace(workspace.id)}
              className="cursor-pointer"
            >
              <Check
                className={`mr-2 h-4 w-4 ${currentWorkspace.id === workspace.id ? "opacity-100" : "opacity-0"}`}
              />
              <span>{workspace.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleCreateWorkspace}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {creating && <CreateWorkspaceDialog open={creating} onClose={handleCloseCreateDialog} />}
    </>
  );
}

export default WorkspaceSwitcher;
