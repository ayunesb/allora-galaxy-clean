import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/context/WorkspaceContext';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { UserRole } from '@/lib/auth/requireRole';
import { useToast } from '@/hooks/use-toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ChevronDown, Edit, Trash, User, Users, X } from 'lucide-react';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
  role_id: string;
}

const UserManagement: React.FC = () => {
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tenant-users', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant) return [];

      // Get all users with roles in the current tenant
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          id,
          role,
          user_id,
          user:user_id (
            id,
            email,
            created_at
          )
        `)
        .eq('tenant_id', currentTenant.id);

      if (error) throw error;

      // Make sure data is an array and map properly
      if (!data || !Array.isArray(data)) return [];
      
      return data.map(item => ({
        id: item.user?.id,
        email: item.user?.email,
        created_at: item.user?.created_at,
        role: item.role as UserRole,
        role_id: item.id
      })).filter(user => user.id !== undefined) as UserWithRole[];
    },
    enabled: !!currentTenant
  });

  const updateUserRole = async (roleId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });

      refetch();
    } catch (err: any) {
      toast({
        title: "Failed to update role",
        description: err.message || "An error occurred while updating the user role.",
        variant: "destructive"
      });
    }
  };

  const removeUser = async (roleId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from this workspace?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "User removed",
        description: "The user has been removed from the workspace."
      });

      refetch();
    } catch (err: any) {
      toast({
        title: "Failed to remove user",
        description: err.message || "An error occurred while removing the user.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      case 'viewer': return 'outline';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  const handleInviteSuccess = () => {
    refetch();
    setInviteDialogOpen(false);
  };

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage users and permissions for {currentTenant?.name}
            </p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            Error loading users: {(error as Error).message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="bg-muted rounded-full p-2 mr-2">
                        <User className="h-4 w-4" />
                      </div>
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role !== 'owner' && (
                          <>
                            <DropdownMenuItem onClick={() => updateUserRole(user.role_id, 'admin')}>
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.role_id, 'member')}>
                              Make Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateUserRole(user.role_id, 'viewer')}>
                              Make Viewer
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => removeUser(user.role_id, user.email)}
                          disabled={user.role === 'owner'}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Users className="h-8 w-8 mb-2 opacity-50" />
                      <p>No users found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setInviteDialogOpen(true)}
                      >
                        Invite your first user
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen} 
        onSuccess={handleInviteSuccess} 
      />
    </AdminGuard>
  );
};

export default UserManagement;
