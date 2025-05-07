
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import useCopy from '@/hooks/useCopy';
import { Check, MoreHorizontal, UserPlus, Loader2, CheckIcon } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

const UserManagement: React.FC = () => {
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const { copyToClipboard } = useCopy();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    if (currentTenant?.id) {
      fetchUsers();
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    setIsAllSelected(selectedUsers.length > 0 && selectedUsers.length === users.length);
  }, [selectedUsers, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          user_id,
          role,
          profiles:user_id (
            email:id
          )
        `)
        .eq('tenant_id', currentTenant?.id)
        .order('role', { ascending: false });

      if (error) throw error;

      const formattedUsers = data.map((item: any) => ({
        id: item.user_id,
        email: item.profiles?.email || 'Unknown',
        role: item.role,
        created_at: 'N/A', // We don't have this from the join query
        last_sign_in_at: null // We don't have this from the join query
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', currentTenant?.id)
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', currentTenant?.id)
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      setSelectedUsers(selectedUsers.filter(id => id !== userId));

      toast({
        title: 'Success',
        description: 'User removed from workspace',
      });
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove user: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const inviteLink = `https://app.alloraos.com/join/${currentTenant?.id}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and their permissions in your workspace
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => copyToClipboard(
            inviteLink,
            "Workspace invitation link copied to clipboard!"
          )}>
            Copy Invite Link
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Invite User to Workspace</AlertDialogTitle>
                <AlertDialogDescription>
                  Send an invitation link to add a new user to this workspace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {/* Invite user form would go here */}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Send Invitation</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Workspace Users</CardTitle>
          <CardDescription>
            Manage user access and permissions for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div>
              {selectedUsers.length > 0 && (
                <div className="bg-muted p-2 rounded-md mb-4 flex justify-between items-center">
                  <span className="text-sm">
                    {selectedUsers.length} user{selectedUsers.length !== 1 && 's'} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                  >
                    Clear
                  </Button>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={isAllSelected} 
                        onCheckedChange={(checked) => handleSelectAllChange(!!checked)} 
                      />
                    </TableHead>
                    <TableHead className="w-[250px]">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Last Sign In</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)} 
                          onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)} 
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'owner' 
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'member' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(user.last_sign_in_at)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.role !== 'owner' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.id, 'admin')}
                                  disabled={user.role === 'admin'}
                                >
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.id, 'member')}
                                  disabled={user.role === 'member'}
                                >
                                  Make Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.id, 'viewer')}
                                  disabled={user.role === 'viewer'}
                                >
                                  Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleRemoveUser(user.id)}
                              disabled={user.role === 'owner'}
                            >
                              Remove from Workspace
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
