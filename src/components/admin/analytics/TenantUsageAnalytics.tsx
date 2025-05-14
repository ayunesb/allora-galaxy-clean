
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Users, Database, Server } from 'lucide-react';

interface UsageData {
  name: string;
  value: number;
}

interface TenantUsageAnalyticsProps {
  tenantId?: string;
  data?: {
    apiUsage: UsageData[];
    userActivity: UsageData[];
    databaseOperations: UsageData[];
    computeUsage: UsageData[];
  };
  isLoading?: boolean;
}

export function TenantUsageAnalytics({ 
  tenantId, 
  data,
  isLoading = false
}: TenantUsageAnalyticsProps) {
  const mockData = {
    apiUsage: [
      { name: 'Mon', value: 120 },
      { name: 'Tue', value: 240 },
      { name: 'Wed', value: 190 },
      { name: 'Thu', value: 350 },
      { name: 'Fri', value: 280 },
      { name: 'Sat', value: 150 },
      { name: 'Sun', value: 90 },
    ],
    userActivity: [
      { name: 'Mon', value: 40 },
      { name: 'Tue', value: 65 },
      { name: 'Wed', value: 55 },
      { name: 'Thu', value: 80 },
      { name: 'Fri', value: 72 },
      { name: 'Sat', value: 30 },
      { name: 'Sun', value: 25 },
    ],
    databaseOperations: [
      { name: 'Mon', value: 450 },
      { name: 'Tue', value: 620 },
      { name: 'Wed', value: 580 },
      { name: 'Thu', value: 780 },
      { name: 'Fri', value: 590 },
      { name: 'Sat', value: 320 },
      { name: 'Sun', value: 280 },
    ],
    computeUsage: [
      { name: 'Mon', value: 8 },
      { name: 'Tue', value: 12 },
      { name: 'Wed', value: 10 },
      { name: 'Thu', value: 15 },
      { name: 'Fri', value: 11 },
      { name: 'Sat', value: 6 },
      { name: 'Sun', value: 5 },
    ],
  };

  // Use provided data or fallback to mock data
  const displayData = data || mockData;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-[200px]" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-[300px]" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <span>Tenant Usage Analytics</span>
        </CardTitle>
        <CardDescription>
          System usage statistics and trends over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="apiUsage">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="apiUsage" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">API Usage</span>
            </TabsTrigger>
            <TabsTrigger value="userActivity" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">User Activity</span>
            </TabsTrigger>
            <TabsTrigger value="databaseOperations" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">DB Operations</span>
            </TabsTrigger>
            <TabsTrigger value="computeUsage" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">Compute Usage</span>
            </TabsTrigger>
          </TabsList>
          
          {/* API Usage Chart */}
          <TabsContent value="apiUsage">
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">API Requests</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Total API requests per day
              </p>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData.apiUsage}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          {/* User Activity Chart */}
          <TabsContent value="userActivity">
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Active Users</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Daily active users count
              </p>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData.userActivity}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          {/* Database Operations Chart */}
          <TabsContent value="databaseOperations">
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Database Operations</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Daily database read/write operations
              </p>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData.databaseOperations}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          {/* Compute Usage Chart */}
          <TabsContent value="computeUsage">
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Compute Usage</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Daily compute resources used (in minutes)
              </p>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData.computeUsage}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
