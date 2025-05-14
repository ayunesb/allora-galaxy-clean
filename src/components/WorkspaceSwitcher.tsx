
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Loader2 } from 'lucide-react';
import { Tenant } from '@/types/tenant';

const WorkspaceSwitcher: React.FC<{
  className?: string;
  disabled?: boolean;
}> = ({ className = '', disabled = false }) => {
  const { 
    currentWorkspace, 
    workspaces, 
    isLoading, 
    setCurrentWorkspace 
  } = useWorkspace();

  // Display loading state
  if (isLoading || workspaces.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading workspaces...</span>
      </div>
    );
  }

  // Handle workspace change
  const handleWorkspaceChange = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
  };

  // If only one workspace, just display it
  if (workspaces.length === 1) {
    return (
      <div className={`text-sm font-medium ${className}`}>
        {workspaces[0].name}
      </div>
    );
  }

  return (
    <Select
      value={currentWorkspace?.id || ''}
      onValueChange={handleWorkspaceChange}
      disabled={disabled}
    >
      <SelectTrigger className={`h-8 w-[180px] ${className}`}>
        <SelectValue placeholder="Select workspace" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((workspace: Tenant) => (
          <SelectItem key={workspace.id} value={workspace.id}>
            {workspace.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default WorkspaceSwitcher;
