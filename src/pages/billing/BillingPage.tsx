
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BillingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <Button variant="outline">Contact Support</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription details and usage information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Plan</h3>
                  <p className="text-muted-foreground mb-4">$99 / month</p>
                  <Button>Upgrade Plan</Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Plan Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Up to 10 users</li>
                    <li>✓ 100 strategies per month</li>
                    <li>✓ Premium support</li>
                    <li>✓ Custom integrations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Summary</CardTitle>
              <CardDescription>Your current usage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AI Strategy Creation</span>
                    <span className="text-sm text-muted-foreground">45 / 100</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Plugin Executions</span>
                    <span className="text-sm text-muted-foreground">1,250 / 5,000</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-muted-foreground">2.3 GB / 10 GB</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4">
                  <p className="text-muted-foreground text-center">No invoices available yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Manage your billing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
                <Button variant="outline">Update Payment Method</Button>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Billing Contact</h3>
                <Button variant="outline">Edit Contact Details</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
