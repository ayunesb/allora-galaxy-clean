
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshWorkspaces } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a workspace name',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a workspace',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Generate a slug from the workspace name
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Insert the new tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name,
          slug,
          owner_id: user.id
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Assign the current user as an owner of this tenant
      const { error: roleError } = await supabase
        .from('tenant_user_roles')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          role: 'owner'
        });

      if (roleError) throw roleError;

      toast({
        title: 'Success',
        description: `${name} workspace has been created`,
      });

      // Refresh the workspaces list
      await refreshWorkspaces();
      
      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create workspace',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Company"
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
