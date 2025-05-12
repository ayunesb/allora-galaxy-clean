
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import withRoleCheck from '@/lib/auth/withRoleCheck';

const UserManagement: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Users & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User management interface is under development. Here you'll be able to manage users, assign roles, and control permissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleCheck(UserManagement, {
  roles: ['admin', 'owner'],
  redirectTo: '/unauthorized'
});
