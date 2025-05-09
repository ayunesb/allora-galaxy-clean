import React, { useState, useEffect } from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';

interface UserEmail {
  email: string;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: UserEmail;
}

interface User {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
  profiles: UserProfile;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const tenantId = currentWorkspace?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, [tenantId]);
  
  const fetchUsers = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          id,
          role,
          user_id,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url,
            email:id(email)
          )
        `)
        .eq('tenant_id', tenantId);
        
      if (error) {
        throw error;
      }
      
      // Transform the data to match our User interface
      const transformedUsers: User[] = (data || []).map((item: any) => ({
        id: item.id,
        role: item.role,
        user_id: item.user_id,
        created_at: item.created_at,
        profiles: item.profiles as UserProfile
      }));
      
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!tenantId) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Role updated",
        description: `User role updated to ${newRole}`,
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    if (!tenantId) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "User removed",
        description: "User has been removed from the workspace",
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast({
        title: "Error removing user",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const firstName = user.profiles?.first_name || '';
    const lastName = user.profiles?.last_name || '';
    const email = user.profiles?.email?.email || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
    
    const query = searchQuery.toLowerCase().trim();
    
    return fullName.includes(query) || 
      firstName.toLowerCase().includes(query) || 
      lastName.toLowerCase().includes(query) || 
      email.toLowerCase().includes(query);
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper functions for UI rendering
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-500">Owner</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500">Admin</Badge>;
      case 'member':
        return <Badge className="bg-green-500">Member</Badge>;
      case 'viewer':
        return <Badge variant="outline">Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Manage users and their roles within your workspace.
      </p>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Users with access to the {currentWorkspace?.name || 'current'} workspace
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Search users..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          {user.profiles?.avatar_url ? (
                            <AvatarImage src={user.profiles.avatar_url} />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(user.profiles?.first_name, user.profiles?.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {user.profiles?.first_name || user.profiles?.last_name ? (
                            <div>
                              {user.profiles?.first_name} {user.profiles?.last_name}
                            </div>
                          ) : (
                            <div className="text-muted-foreground italic">Unnamed User</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.profiles?.email?.email || "No email"}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, 'admin')}>
                            Set as Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, 'member')}>
                            Set as Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, 'viewer')}>
                            Set as Viewer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => handleRemoveUser(user.user_id)}
                          >
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found {searchQuery ? 'matching your search' : ''}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} in this workspace
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
      
      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
};

export default withRoleCheck(UserManagement, { roles: ['admin', 'owner'] });
