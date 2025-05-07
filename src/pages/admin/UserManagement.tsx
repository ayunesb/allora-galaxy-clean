
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useTenantId } from '@/hooks/useTenantId';
import { Badge } from '@/components/ui/badge';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus, Trash2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define types
interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const perPage = 10;
  
  const tenantId = useTenantId();
  const { toast } = useToast();
  const { currentRole } = useWorkspace();
  
  // Check if user has admin privileges
  const isAdmin = currentRole === 'admin' || currentRole === 'owner';
  
  // Function to load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tenantId) {
        throw new Error('No tenant selected');
      }
      
      // Get all users associated with this tenant and their roles
      let query = supabase
        .from('tenant_user_roles')
        .select(`
          id,
          role,
          user_id,
          created_at
        `)
        .eq('tenant_id', tenantId);
      
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      // Apply pagination
      const from = (currentPage - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);
      
      const { data: userRoles, error: rolesError } = await query;
      
      if (rolesError) throw rolesError;
      
      // Get count for pagination
      const { count, error: countError } = await supabase
        .from('tenant_user_roles')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .maybeSingle();
        
      if (countError) throw countError;
      
      setTotalPages(Math.ceil((count || 0) / perPage));
      
      if (!userRoles?.length) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Now fetch actual user details from auth.users
      // Since we can't directly query auth.users with the JS client,
      // we'll use profiles or another approach in a real app
      
      // For now, let's use mock data for the email/user info
      const mockUserData: Record<string, { email: string, last_sign_in_at?: string }> = {};
      userRoles.forEach(role => {
        mockUserData[role.user_id] = { 
          email: `user-${role.user_id.substring(0, 6)}@example.com`,
          last_sign_in_at: new Date().toISOString()
        };
      });
      
      const formattedUsers = userRoles.map(role => ({
        id: role.user_id,
        email: mockUserData[role.user_id]?.email || 'Unknown email',
        role: role.role,
        created_at: role.created_at,
        last_sign_in_at: mockUserData[role.user_id]?.last_sign_in_at
      }));
      
      // Apply search filter client-side
      const filteredUsers = searchQuery 
        ? formattedUsers.filter(user => 
            user.email.toLowerCase().includes(searchQuery.toLowerCase()))
        : formattedUsers;
      
      setUsers(filteredUsers);
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
  
  // Initial load
  useEffect(() => {
    if (tenantId) {
      loadUsers();
    }
  }, [tenantId, roleFilter, currentPage]);
  
  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    loadUsers();
  };
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      if (!userToDelete || !tenantId) return;
      
      // Remove user role association with this tenant
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('user_id', userToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: 'User removed',
        description: `${userToDelete.email} has been removed from this workspace.`,
      });
      
      // Reload users
      loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error removing user',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setUserToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Render role badge with appropriate color
  const RoleBadge = ({ role }: { role: string }) => {
    const variant = 
      role === 'owner' ? 'destructive' :
      role === 'admin' ? 'default' :
      role === 'member' ? 'secondary' :
      'outline';
    
    return <Badge variant={variant}>{role}</Badge>;
  };
  
  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to access this page. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={() => setInviteDialogOpen(true)} className="mt-4 sm:mt-0">
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
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
            <Button variant="outline" onClick={loadUsers} className="self-start">
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                      <p className="mt-2 text-gray-500">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">No users found</p>
                      <p className="text-sm text-gray-400">
                        {roleFilter ? `Try removing the "${roleFilter}" filter` : 'Try inviting users to your workspace'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell><RoleBadge role={user.role} /></TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={user.role === 'owner'}
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    {currentPage} of {totalPages}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen}
        onComplete={loadUsers}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {userToDelete?.email} from this workspace. 
              They will no longer have access to any resources in this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
