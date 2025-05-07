
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import { Loader2, UserPlus, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useTenantId } from '@/hooks/useTenantId';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

// Define TypeScript interfaces for our data
interface User {
  id: string;
  email: string;
  created_at: string;
  role: string;
  last_sign_in_at: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();
  const tenantId = useTenantId();

  useEffect(() => {
    fetchUsers();
  }, [tenantId]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get all Supabase users
      const { data: authUsersData, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (authUsersError) throw authUsersError;
      
      // Get all user roles from tenant_user_roles for current tenant
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('tenant_user_roles')
        .select('user_id, role')
        .eq('tenant_id', tenantId);
        
      if (userRolesError) throw userRolesError;
      
      // Create a map of user_id to role for quick lookup
      const rolesMap: Record<string, string> = {};
      
      userRolesData?.forEach((userRole) => {
        rolesMap[userRole.user_id] = userRole.role;
      });
      
      // Combine the user data with their roles
      const combinedUsers: User[] = authUsersData.users.map((user) => ({
        id: user.id,
        email: user.email || 'No email',
        created_at: user.created_at,
        role: rolesMap[user.id] || 'user', // Default to 'user' if no role is found
        last_sign_in_at: user.last_sign_in_at,
      }));
      
      setUsers(combinedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: 'Failed to load users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true);
      
      // Check if user role already exists
      const { data: existingRole, error: findError } = await supabase
        .from('tenant_user_roles')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)
        .single();
        
      if (findError && findError.code !== 'PGRST116') { // PGRST116 is "row not found" error
        throw findError;
      }
      
      let result;
      
      if (existingRole) {
        // Update existing role
        result = await supabase
          .from('tenant_user_roles')
          .update({ role: newRole })
          .eq('tenant_id', tenantId)
          .eq('user_id', userId);
      } else {
        // Insert new role
        result = await supabase
          .from('tenant_user_roles')
          .insert({ tenant_id: tenantId, user_id: userId, role: newRole });
      }
      
      if (result.error) throw result.error;
      
      // Log user role change
      await logSystemEvent(
        tenantId,
        'admin',
        'user_role_updated',
        { user_id: userId, new_role: newRole }
      );
      
      // Update the local users state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'Role updated',
        description: 'User role has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating user role:', error.message);
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setEditingUserId(null);
    }
  };

  const handleInviteComplete = () => {
    setInviteDialogOpen(false);
    fetchUsers();
    
    // Log user invitation
    logSystemEvent(
      tenantId,
      'admin',
      'user_invited',
      { invited_by: 'current_user' } // In a real app, we'd include the actual user ID
    );
    
    toast({
      title: 'Invitation sent',
      description: 'The user has been invited to the workspace.',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'owner':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original;
        
        return (
          <>
            {editingUserId === user.id ? (
              <Select 
                value={selectedRole} 
                onValueChange={(value) => {
                  setSelectedRole(value);
                  updateUserRole(user.id, value);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
            )}
          </>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Joined
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return format(new Date(row.getValue('created_at')), 'PPP');
      },
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'last_sign_in_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Last Sign In
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const lastSignIn = row.getValue('last_sign_in_at');
        return lastSignIn 
          ? format(new Date(lastSignIn as string), 'PPP') 
          : 'Never';
      },
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setEditingUserId(user.id);
                setSelectedRole(user.role);
              }}
            >
              Edit Role
            </Button>
          </div>
        )
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles in your workspace</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Users</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  table.getColumn('email')?.setFilterValue(value);
                }}
                className="max-w-sm pl-8"
              />
            </div>
            <Select
              value={table.getColumn('role')?.getFilterValue() as string || ""}
              onValueChange={(value) => {
                table.getColumn('role')?.setFilterValue(value === 'all' ? undefined : [value]);
                
                // Log filter change
                logSystemEvent(
                  tenantId,
                  'admin',
                  'user_list_filtered',
                  { filter_role: value }
                );
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No results found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing {table.getFilteredRowModel().rows.length} of {users.length} users
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen}
        onComplete={handleInviteComplete}
      />
    </div>
  );
};

export default UserManagement;
