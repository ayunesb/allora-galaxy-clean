
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CronJobsMonitoring from './cron/CronJobsMonitoring';
import UserTable, { User } from './users/UserTable';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';

const AdminDashboardContent = () => {
  const { currentWorkspace } = useWorkspace();
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
            profiles:user_id (
              first_name,
              last_name,
              avatar_url,
              email:auth.users!user_id (email)
            )
          `)
          .eq('tenant_id', currentWorkspace.id);
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentWorkspace?.id]);

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
    } catch (error) {
      console.error('Error updating user role:', error);
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
    } catch (error) {
      console.error('Error removing user:', error);
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
                <p>Description: {currentWorkspace.description}</p>
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
