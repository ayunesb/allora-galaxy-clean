
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshWorkspaces, setCurrentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a workspace name",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a workspace",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a URL-friendly slug from the name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Create a new tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name,
          slug,
          owner_id: user.id,
          metadata: { created_through: 'workspace_switcher' }
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create tenant user role
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: 'owner'
        });

      if (roleError) throw roleError;
      
      // Create company profile
      const { error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          tenant_id: tenant.id,
          name
        });

      if (companyError) throw companyError;

      // Log the event
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          module: 'workspace',
          event: 'workspace_created',
          context: { 
            workspace_name: name,
            created_by: user.id
          }
        });

      toast({
        title: "Success",
        description: `Workspace "${name}" has been created`,
      });

      // Refresh workspaces and set the current one
      await refreshWorkspaces();
      setCurrentWorkspace({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        role: 'owner'
      });
      
      // Store in local storage
      localStorage.setItem('currentWorkspaceId', tenant.id);
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create workspace: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to manage your projects and teams.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter workspace name"
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
