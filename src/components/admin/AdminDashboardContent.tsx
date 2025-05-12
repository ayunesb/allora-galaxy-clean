
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentSystemLogs } from '@/components/admin/logs/RecentSystemLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tenant } from '@/types';
import { BarChart } from '@/components/ui/bar-chart';

const AdminDashboardContent = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="users">User Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Total Tenants" value="25" description="Active workspaces" />
            <DashboardCard title="Active Users" value="147" description="Last 30 days" />
            <DashboardCard title="Strategies" value="89" description="Created this month" />
            <DashboardCard title="API Requests" value="12,568" description="Last 7 days" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Activity</CardTitle>
                <CardDescription>Recent system events and logs</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSystemLogs limit={5} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>System resource allocation</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={[
                    { name: 'Database', value: 78 },
                    { name: 'Storage', value: 45 },
                    { name: 'Edge Func', value: 62 },
                    { name: 'Auth', value: 34 },
                    { name: 'API', value: 89 }
                  ]}
                  index="name"
                  categories={['value']}
                  yAxisWidth={40}
                  colors={['#2563eb']}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health Details</CardTitle>
              <CardDescription>Comprehensive system metrics and monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed system health monitoring is coming soon. This will include
                service uptime, resource usage trends, and infrastructure metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Detailed user engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed user analytics are coming soon. This will include
                active users, session duration, feature usage, and more.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
}

const DashboardCard = ({ title, value, description }: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default AdminDashboardContent;
