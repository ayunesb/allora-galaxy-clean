
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, BarChart, Calendar, Plug, Settings, LayoutGrid, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentTenant } = useWorkspace();
  const { user } = useAuth();
  
  // Check if user is being impersonated (email includes +impersonate)
  const isImpersonated = user?.email?.includes('+impersonate');

  return (
    <div className="container mx-auto px-4 py-8">
      {isImpersonated && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            ⚠️ You are impersonating a user. All actions may be audited.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Allora OS</h1>
          <p className="text-muted-foreground mt-1">
            {currentTenant ? `Workspace: ${currentTenant.name}` : 'Select a workspace to get started'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link to="/launch">
              <ArrowRight className="mr-2 h-4 w-4" />
              Launch strategy
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">2 pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground mt-1">96% success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,280</div>
            <p className="text-xs text-muted-foreground mt-1">+210 this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Engine</CardTitle>
            <CardDescription>Generate and manage AI-driven business strategies</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="rounded-full bg-primary/10 p-3">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <Button asChild>
              <Link to="/launch">Launch</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plugins</CardTitle>
            <CardDescription>Manage your AI plugins and agent versions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Plug className="h-6 w-6 text-primary" />
            </div>
            <Button asChild>
              <Link to="/plugins">Explore</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Galaxy Explorer</CardTitle>
            <CardDescription>Visualize connections between plugins and strategies</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="rounded-full bg-primary/10 p-3">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <Button asChild>
              <Link to="/explore">View</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Track agent success rates and XP</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <Button asChild>
              <Link to="/agents/performance">Analyze</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPI Dashboard</CardTitle>
            <CardDescription>Monitor key business metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <Button asChild>
              <Link to="/insights/kpis">View</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Manage users and system settings</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <Button asChild>
              <Link to="/admin/users">Access</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
