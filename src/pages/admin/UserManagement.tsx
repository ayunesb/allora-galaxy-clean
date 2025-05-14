
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import withRoleCheck from '@/lib/auth/withRoleCheck';
import { UserRole } from '@/types/shared';
import { UserTable } from '@/components/admin/users/UserTable';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import { InvitesManagement } from '@/components/admin/users/InvitesManagement'; 
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AuditLogTable } from '@/components/admin/users/AuditLogTable';

const UserManagement: React.FC = () => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    changeUserRole,
    removeUser,
    fetchUsers
  } = useUserManagement();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      
      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen} 
        onComplete={fetchUsers}
      />
      
      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users & Permissions</CardTitle>
              <CardDescription>
                Manage users and their roles within your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable 
                users={users} 
                loading={isLoading}
                searchQuery={searchTerm}
                onSearchChange={setSearchTerm}
                onUpdateRole={changeUserRole}
                onRemoveUser={removeUser}
                onOpenInviteDialog={() => setInviteDialogOpen(true)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <InvitesManagement />
        </TabsContent>
        
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Audit</CardTitle>
              <CardDescription>
                Track user activities and system events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogTable moduleFilter="auth" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withRoleCheck(UserManagement, {
  roles: ['admin' as UserRole, 'owner' as UserRole],
  redirectTo: '/unauthorized'
});
