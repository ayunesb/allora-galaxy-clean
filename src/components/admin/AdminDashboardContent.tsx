
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CronJobsMonitoring from './cron/CronJobsMonitoring';
import UserTable, { User } from './users/UserTable';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AdminDashboardContent = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentWorkspace?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tenant_user_roles')
          .select(`
            id,
            role,
            created_at,
            user_id,
            profiles:user_id(
              first_name,
              last_name,
              avatar_url,
              email(email)
            )
          `)
          .eq('tenant_id', currentWorkspace.id);
          
        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          // Transform the data to match the User type
          const typedUsers: User[] = data.map(item => ({
            id: item.id,
            role: item.role,
            created_at: item.created_at,
            user_id: item.user_id,
            profiles: {
              first_name: item.profiles?.first_name,
              last_name: item.profiles?.last_name,
              avatar_url: item.profiles?.avatar_url,
              email: item.profiles?.email ? { email: item.profiles.email.email } : undefined
            }
          }));
          
          setUsers(typedUsers);
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error fetching users",
          description: error.message || "Failed to load users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentWorkspace?.id, toast]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', currentWorkspace.id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Role updated",
        description: `User role updated to ${newRole}`
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating role",
        description: error.message || "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', currentWorkspace.id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.user_id !== userId));
      
      toast({
        title: "User removed",
        description: "User has been removed from the workspace"
      });
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast({
        title: "Error removing user",
        description: error.message || "Failed to remove user",
        variant: "destructive"
      });
    }
  };

  const handleOpenInviteDialog = () => {
    // Logic to open invite dialog
    console.log('Open invite dialog');
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.profiles?.first_name || ''} ${user.profiles?.last_name || ''}`.toLowerCase();
    const email = user.profiles?.email?.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Overview</CardTitle>
            <CardDescription>
              Details about the current workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentWorkspace ? (
              <>
                <p>Name: {currentWorkspace.name}</p>
                <p>ID: {currentWorkspace.id}</p>
                {currentWorkspace.description && (
                  <p>Description: {currentWorkspace.description}</p>
                )}
              </>
            ) : (
              <p>No workspace selected.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users and their roles within the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable 
              users={filteredUsers}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onUpdateRole={handleUpdateRole}
              onRemoveUser={handleRemoveUser}
              onOpenInviteDialog={handleOpenInviteDialog}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cron Jobs Monitoring</CardTitle>
            <CardDescription>
              Monitor the status and history of scheduled tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CronJobsMonitoring />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
