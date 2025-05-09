
import React from 'react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import UserTable from '@/components/admin/users/UserTable';
import UserStatsFooter from '@/components/admin/users/UserStatsFooter';
import { useUserManagement } from '@/hooks/admin/useUserManagement';

const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    fetchUsers,
    handleUpdateRole,
    handleRemoveUser
  } = useUserManagement();

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage users and their roles within your workspace
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <UserTable 
            users={users}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onUpdateRole={handleUpdateRole}
            onRemoveUser={handleRemoveUser}
            onOpenInviteDialog={() => setIsInviteDialogOpen(true)}
          />
        </CardContent>
        
        <UserStatsFooter 
          userCount={users.length} 
          onRefresh={fetchUsers}
        />
      </Card>
      
      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
};

export default withRoleCheck(UserManagement, { roles: ['admin', 'owner'] });
