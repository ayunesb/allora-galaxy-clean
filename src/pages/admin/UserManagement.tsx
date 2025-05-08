
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  RefreshCw,
  UserPlus,
  Search,
  Mail,
  MoreHorizontal,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AdminGuard from '@/components/guards/AdminGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { getRoleDisplayName } from '@/lib/auth/roleTypes';

interface TenantUser {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  
  const tenantId = useTenantId();
  const { toast } = useToast();
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      // Get all users associated with this tenant
      const { data: tenantUsers, error: tenantUsersError } = await supabase
        .from('tenant_user_roles')
        .select('role, user_id')
        .eq('tenant_id', tenantId);
      
      if (tenantUsersError) throw tenantUsersError;
      
      if (!tenantUsers || tenantUsers.length === 0) {
        setUsers([]);
        return;
      }
      
      // Get user profiles for each user
      const userIds = tenantUsers.map(tu => tu.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, created_at')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Get email addresses for each user (this would typically be done via an admin endpoint)
      // For demo purposes, we're simulating this data
      const completeUsers: TenantUser[] = tenantUsers.map(tu => {
        const profile = (profilesData?.find(p => p.id === tu.user_id) || {}) as UserProfile;
        // In a real app, you would get this information from an auth admin API
        const email = `user-${tu.user_id.substring(0, 6)}@example.com`;
        
        return {
          id: tu.user_id,
          email,
          role: tu.role as 'owner' | 'admin' | 'member' | 'viewer',
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at || new Date().toISOString()
        };
      });
      
      setUsers(completeUsers);
      
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message);
      toast({
        title: 'Error loading users',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenantId) {
      loadUsers();
    }
  }, [tenantId]);
  
  const filteredUsers = users.filter(user => {
    const nameMatch = 
      (user.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const roleMatch = !roleFilter || user.role === roleFilter;
    
    return nameMatch && roleMatch;
  });
  
  const handleUserRoleChange = async (userId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'Role updated',
        description: `User role has been updated to ${getRoleDisplayName(newRole)}`,
      });
      
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast({
        title: 'Error updating role',
        description: err.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    try {
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: 'User removed',
        description: 'User has been removed from this workspace',
      });
      
    } catch (err: any) {
      console.error('Error removing user:', err);
      toast({
        title: 'Error removing user',
        description: err.message,
        variant: 'destructive',
      });
    }
  };
  
  const sendInvite = async () => {
    try {
      setIsSendingInvite(true);
      
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      // In a real app, this would call an edge function to send the email
      // For this demo, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      toast({
        title: 'Error sending invitation',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, permissions and invitations for your workspace.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a new user</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your workspace. They'll receive an email with a link to accept.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={sendInvite} 
                    disabled={!inviteEmail || isSendingInvite}
                  >
                    {isSendingInvite ? 
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 
                      <><Mail className="mr-2 h-4 w-4" /> Send Invitation</>
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="w-full sm:w-auto flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-auto">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
              }}>
                Clear filters
              </Button>
              
              <Button variant="outline" onClick={loadUsers}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                        </div>
                        <p className="mt-2 text-gray-500">Loading users...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url || ''} alt={user.email} />
                              <AvatarFallback>
                                {getInitials(user.first_name, user.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.email
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          {user.role === 'owner' ? (
                            <Badge variant="outline">Owner</Badge>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={user.role === 'admin'}
                                  onClick={() => handleUserRoleChange(user.id, 'admin')}
                                >
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={user.role === 'member'}
                                  onClick={() => handleUserRoleChange(user.id, 'member')}
                                >
                                  Make Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={user.role === 'viewer'}
                                  onClick={() => handleUserRoleChange(user.id, 'viewer')}
                                >
                                  Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleRemoveUser(user.id)}
                                >
                                  Remove from workspace
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-gray-500">No users found</p>
                        {(searchTerm || roleFilter) && (
                          <p className="text-sm text-gray-400 mt-1">
                            Try clearing your filters
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </CardFooter>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default UserManagement;
