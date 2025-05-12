
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import withRoleCheck from '@/lib/auth/withRoleCheck';
import { UserRole } from '@/types/user';

const AlloraBrainDocsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Allora Brain Documentation</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Developer Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Documentation for Allora Brain API and SDK is coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleCheck(AlloraBrainDocsPage, {
  roles: ['admin' as UserRole, 'user' as UserRole, 'owner' as UserRole],
  redirectTo: '/unauthorized'
});
