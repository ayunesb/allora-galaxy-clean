
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  CreditCard,
  Calendar,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Clock,
} from 'lucide-react';

// Get current subscription for a tenant
const fetchSubscription = async (tenantId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Open Stripe customer portal for subscription management
const openCustomerPortal = async () => {
  const { data, error } = await supabase.functions.invoke('customer-portal');
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Redirect to Stripe Customer Portal
  if (data?.url) {
    window.location.href = data.url;
  }
  
  return data;
};

const PlanFeature = ({ included, text }: { included: boolean; text: string }) => (
  <div className="flex items-center gap-2">
    {included ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-gray-300" />
    )}
    <span className={included ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
  </div>
);

const BillingPage: React.FC = () => {
  const { toast } = useToast();
  
  // Mock active tenant ID - in a real app, get this from context or props
  const tenantId = "tenant-123"; 
  
  // Fetch current subscription
  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription', tenantId],
    queryFn: () => fetchSubscription(tenantId),
  });
  
  const handleCustomerPortal = async () => {
    try {
      toast({
        title: "Opening Stripe Portal...",
        description: "Please wait while we redirect you.",
      });
      
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not open billing portal",
        variant: "destructive",
      });
    }
  };
  
  // Calculate days left in trial
  const daysLeft = subscription?.trial_ends_at 
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
    : 0;
  
  // Format renewal date
  const renewalDate = subscription?.renews_at 
    ? new Date(subscription.renews_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) 
    : 'N/A';

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-full effect-glow bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and payment details</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Failed to load subscription details</h3>
              <p className="text-muted-foreground">Please try again later or contact support.</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your subscription details and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold capitalize">{subscription?.plan || 'No active plan'}</h3>
                    <p className="text-muted-foreground">
                      {subscription?.status === 'active' || subscription?.status === 'trialing' 
                        ? 'Active subscription' 
                        : 'Subscription inactive'}
                    </p>
                  </div>
                  <Badge 
                    className={`
                      ${subscription?.status === 'active' ? 'bg-green-500' : ''}
                      ${subscription?.status === 'trialing' ? 'bg-blue-500' : ''}
                      ${subscription?.status === 'canceled' ? 'bg-red-500' : ''}
                      ${subscription?.status === 'past_due' ? 'bg-yellow-500' : ''}
                    `}
                  >
                    {subscription?.status === 'active' ? 'Active' : ''}
                    {subscription?.status === 'trialing' ? 'Trial' : ''}
                    {subscription?.status === 'canceled' ? 'Canceled' : ''}
                    {subscription?.status === 'past_due' ? 'Past Due' : ''}
                  </Badge>
                </div>
                
                {subscription?.status === 'trialing' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Trial Period</span>
                      <span className="text-sm font-medium">{daysLeft} days left</span>
                    </div>
                    <Progress value={daysLeft} max={14} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Your trial ends on {new Date(subscription.trial_ends_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="font-medium">Billing Period</span>
                    <span>Monthly</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="font-medium">Next Payment</span>
                    <span>{renewalDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Payment Method</span>
                    <span>•••• 4242</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCustomerPortal} className="w-full sm:w-auto">
                  Manage Subscription
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Usage Summary</CardTitle>
                <CardDescription>
                  Your current resource usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Strategies</span>
                      <span className="text-sm">12 / 50</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Plugins</span>
                      <span className="text-sm">8 / 20</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Team Members</span>
                      <span className="text-sm">5 / 10</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className={`
              border-2 
              ${subscription?.plan === 'starter' ? 'border-blue-500' : ''}
              ${subscription?.plan === 'growth' ? 'border-purple-500' : ''}
              ${subscription?.plan === 'enterprise' ? 'border-indigo-500' : ''}
            `}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{subscription?.plan || 'No plan'}</CardTitle>
                  {subscription?.plan && (
                    <Badge variant="outline" className="bg-transparent text-primary">Your Plan</Badge>
                  )}
                </div>
                <CardDescription>
                  {subscription?.plan === 'starter' && 'Basic features to get you started'}
                  {subscription?.plan === 'growth' && 'Everything you need to grow'}
                  {subscription?.plan === 'enterprise' && 'Advanced features for large teams'}
                  {!subscription?.plan && 'Choose a plan to get started'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-3xl font-bold">
                    {subscription?.plan === 'starter' && '$49'}
                    {subscription?.plan === 'growth' && '$99'}
                    {subscription?.plan === 'enterprise' && '$299'}
                    {!subscription?.plan && '$0'}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <div className="space-y-3 mb-6">
                  {subscription?.plan === 'starter' && (
                    <>
                      <PlanFeature included={true} text="10 team members" />
                      <PlanFeature included={true} text="50 strategies" />
                      <PlanFeature included={true} text="20 plugins" />
                      <PlanFeature included={true} text="Basic analytics" />
                      <PlanFeature included={false} text="Advanced integrations" />
                      <PlanFeature included={false} text="Custom plugins" />
                    </>
                  )}
                  
                  {subscription?.plan === 'growth' && (
                    <>
                      <PlanFeature included={true} text="25 team members" />
                      <PlanFeature included={true} text="Unlimited strategies" />
                      <PlanFeature included={true} text="50 plugins" />
                      <PlanFeature included={true} text="Advanced analytics" />
                      <PlanFeature included={true} text="All integrations" />
                      <PlanFeature included={false} text="Custom plugins" />
                    </>
                  )}
                  
                  {subscription?.plan === 'enterprise' && (
                    <>
                      <PlanFeature included={true} text="Unlimited team members" />
                      <PlanFeature included={true} text="Unlimited strategies" />
                      <PlanFeature included={true} text="Unlimited plugins" />
                      <PlanFeature included={true} text="Enterprise analytics" />
                      <PlanFeature included={true} text="All integrations" />
                      <PlanFeature included={true} text="Custom plugins" />
                    </>
                  )}
                  
                  {!subscription?.plan && (
                    <>
                      <PlanFeature included={false} text="No active plan" />
                      <PlanFeature included={false} text="Limited access" />
                    </>
                  )}
                </div>
                
                <Button onClick={handleCustomerPortal} variant="default" className="w-full">
                  {subscription?.plan ? 'Change Plan' : 'Choose a Plan'}
                </Button>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleCustomerPortal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Billing History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
