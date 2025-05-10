
import React, { useState } from 'react';
import PageHelmet from '@/components/PageHelmet';
import NotificationsContainer from '@/components/notifications/NotificationsContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const { userRole } = useWorkspace();
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="Notifications" 
        description="View and manage your notifications"
      />
      
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin Settings</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="notifications">
          <NotificationsContainer 
            filter={filter}
            setFilter={setFilter}
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delivery Methods</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="in-app" className="flex flex-col space-y-1">
                    <span>In-App Notifications</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Receive notifications within the application
                    </span>
                  </Label>
                  <Switch id="in-app" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Receive important notifications via email
                    </span>
                  </Label>
                  <Switch id="email" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Notification Types</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="alerts" className="flex flex-col space-y-1">
                    <span>System Alerts</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Downtime, maintenance, and security alerts
                    </span>
                  </Label>
                  <Switch id="alerts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="kpis" className="flex flex-col space-y-1">
                    <span>KPI Milestones</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Notifications when KPIs reach significant milestones
                    </span>
                  </Label>
                  <Switch id="kpis" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="strategy" className="flex flex-col space-y-1">
                    <span>Strategy Updates</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Notifications about strategy approvals and completions
                    </span>
                  </Label>
                  <Switch id="strategy" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="mentions" className="flex flex-col space-y-1">
                    <span>Mentions & Comments</span>
                    <span className="font-normal text-xs text-muted-foreground">
                      Notifications when you're mentioned or receive comments
                    </span>
                  </Label>
                  <Switch id="mentions" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Team Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification settings for your entire team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Default Notification Settings</h3>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="team-email" className="flex flex-col space-y-1">
                      <span>Enable Email for All Team Members</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        By default, send email notifications to all team members
                      </span>
                    </Label>
                    <Switch id="team-email" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="team-digest" className="flex flex-col space-y-1">
                      <span>Daily Digest Emails</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Send a daily summary of activities and notifications
                      </span>
                    </Label>
                    <Switch id="team-digest" />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Notification Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize the templates for different notification types used across the system.
                    These templates will be used for all email and in-app notifications.
                  </p>
                  
                  <div className="grid gap-4 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Strategy Approval Template</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">KPI Alert Template</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">System Alert Template</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Welcome Email Template</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
