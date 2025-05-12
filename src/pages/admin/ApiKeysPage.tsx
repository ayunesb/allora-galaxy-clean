
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import withRoleCheck from '@/lib/auth/withRoleCheck';
import { UserRole } from '@/types/user';

const ApiKeysPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Keys</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>API Keys Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is coming soon. You'll be able to manage your API keys here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleCheck(ApiKeysPage, {
  roles: ['admin' as UserRole, 'owner' as UserRole],
  redirectTo: '/unauthorized'
});
