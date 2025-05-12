
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import withRoleCheck from '@/lib/auth/withRoleCheck';

const StandaloneAgentOSPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Standalone Agent OS</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Agent OS Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Standalone Agent OS platform is coming soon. This feature will allow you to deploy and manage 
            autonomous agents independently.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleCheck(StandaloneAgentOSPage, {
  roles: ['admin', 'owner'],
  redirectTo: '/unauthorized'
});
