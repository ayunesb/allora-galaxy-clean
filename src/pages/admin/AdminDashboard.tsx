
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users2, FileText, KeyRound, BarChart } from 'lucide-react';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Manage users, view system logs, and configure API keys for external integrations.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Users2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              Add, remove, and manage user access and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Control who has access to your Allora workspace and what actions they can perform.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>System Logs</CardTitle>
            </div>
            <CardDescription>
              Review system events and audit trails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              View detailed logs of system activities, user actions, and AI decisions for compliance and debugging.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/logs">View Logs</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>API Keys</CardTitle>
            </div>
            <CardDescription>
              Manage API keys for external integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Create and manage API keys for integrating Allora with external applications and services.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/api-keys">Manage API Keys</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withRoleCheck(AdminDashboard, { roles: ['admin', 'owner'] });
