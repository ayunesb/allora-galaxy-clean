
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const BillingPage = () => {
  const { userRole } = useWorkspace();
  
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">Pro Plan</h3>
                <p className="text-2xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next billing date: June 1, 2025</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Plan includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Unlimited strategies</li>
                  <li>✓ 100 plugin executions/month</li>
                  <li>✓ 5 team members</li>
                  <li>✓ API access</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isAdmin ? (
              <div className="space-x-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="destructive">Cancel Plan</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Contact your admin to make changes</p>
            )}
          </CardFooter>
        </Card>
        
        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>Your usage for this billing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Plugin Executions</p>
                <p className="text-2xl font-bold">42<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                <div className="w-full bg-muted h-2 mt-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Team Members</p>
                <p className="text-2xl font-bold">3<span className="text-sm font-normal text-muted-foreground">/5</span></p>
                <div className="w-full bg-muted h-2 mt-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">API Calls</p>
                <p className="text-2xl font-bold">1,254<span className="text-sm font-normal text-muted-foreground">/5,000</span></p>
                <div className="w-full bg-muted h-2 mt-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-black text-white rounded-md p-2 flex items-center justify-center">
                    <span className="text-xs">VISA</span>
                  </div>
                  <div>
                    <p className="text-sm">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 04/25</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {isAdmin && (
              <Button variant="outline">Add Payment Method</Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your previous invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invoice #0001</p>
                  <p className="text-sm text-muted-foreground">May 1, 2025</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-medium">$49.00</p>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invoice #0002</p>
                  <p className="text-sm text-muted-foreground">April 1, 2025</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-medium">$49.00</p>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invoice #0003</p>
                  <p className="text-sm text-muted-foreground">March 1, 2025</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-medium">$49.00</p>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingPage;
