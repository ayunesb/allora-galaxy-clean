
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormRow } from '@/components/ui/form-row';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { 
  ErrorState, 
  CardErrorState, 
  InlineError, 
  PartialErrorState,
  EmptyState, 
  NoDataEmptyState,
  NoSearchResultsEmptyState,
  FormErrorSummary,
  FormSubmitButton,
  AsyncField
} from '@/lib/errors';
import { notify } from '@/lib/notifications/toast';
import { retryUtils } from '@/lib/errors/retryUtils';
import { ErrorBoundary } from '@/lib/errors';

/**
 * Example page showing the various error state components
 */
const ErrorStateExamples = () => {
  const [activeTab, setActiveTab] = useState('error-components');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showAsyncError, setShowAsyncError] = useState(false);
  
  // Simulate form submission with validation
  const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  const { formState: { errors } } = form;
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Simulate async validation
      setValidating(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setValidating(false);
      
      if (data.email === 'taken@example.com') {
        form.setError('email', { 
          type: 'manual', 
          message: 'This email is already taken' 
        });
        notify({
          title: "Validation failed",
          description: "This email is already taken. Please use another one."
        });
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success
      notify({
        title: "Form submitted successfully!",
        description: "Thank you for your submission."
      });
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError('root', { 
        type: 'manual', 
        message: 'Failed to submit form' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Simulate async validation
  const validateEmailAsync = async () => {
    if (!form.getValues('email')) return;
    
    setValidating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const email = form.getValues('email');
      if (email === 'taken@example.com') {
        form.setError('email', { 
          type: 'manual', 
          message: 'This email is already taken'
        });
        setShowAsyncError(true);
      } else {
        form.clearErrors('email');
        setShowAsyncError(false);
      }
    } finally {
      setValidating(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Error State Components</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="error-components">Error Components</TabsTrigger>
          <TabsTrigger value="empty-states">Empty States</TabsTrigger>
          <TabsTrigger value="form-validation">Form Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="error-components" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Error States</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Error State</CardTitle>
                </CardHeader>
                <CardContent>
                  <ErrorState
                    title="Failed to load data"
                    message="We couldn't load the requested data. Please try again later."
                    error={new Error("API connection timed out after 30 seconds")}
                    retry={() => notify({ title: "Retrying..." })}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Card Error State</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardErrorState
                    title="Payment Failed"
                    message="Your payment could not be processed. Please check your details and try again."
                    onRetry={() => notify({ title: "Retrying payment..." })}
                    onAction={() => notify({ title: "Contacting support..." })}
                    actionLabel="Contact Support"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Inline Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InlineError
                    message="Database connection failed"
                    details="Cannot establish connection to the database server"
                    onRetry={() => notify({ title: "Reconnecting..." })}
                  />
                  
                  <Separator className="my-4" />
                  
                  <InlineError
                    message="Invalid API key"
                    variant="subtle"
                    onRetry={() => notify({ title: "Checking API key..." })}
                  />
                  
                  <Separator className="my-4" />
                  
                  <InlineError
                    message="File not found"
                    variant="minimal"
                    severity="warning"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Partial Error State</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PartialErrorState
                    title="Charts partially loaded"
                    message="Analytics data could not be fully loaded"
                    section="User Activity"
                    variant="inline"
                    onRetry={() => notify({ title: "Reloading analytics data..." })}
                  />
                  
                  <Separator className="my-4" />
                  
                  <PartialErrorState
                    message="Some plugin data is unavailable"
                    section="Plugin Metrics"
                    variant="embedded"
                    onRetry={() => notify({ title: "Reloading plugin data..." })}
                  />
                  
                  <Separator className="my-4" />
                  
                  <div className="relative">
                    <PartialErrorState
                      message="Dashboard statistics are incomplete"
                      onRetry={() => notify({ title: "Reloading dashboard..." })}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Error Boundary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">With Error</h3>
                    <ErrorBoundary>
                      <BuggyComponent />
                    </ErrorBoundary>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Working Component</h3>
                    <Card className="p-4">
                      <p>This component works correctly</p>
                      <Button className="mt-2" variant="outline">
                        Click me
                      </Button>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>
        
        <TabsContent value="empty-states" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Empty States</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Empty State</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    title="No reports available"
                    description="There are no reports available for the selected time period."
                    icon={<AlertTriangle className="h-12 w-12" />}
                    action={
                      <Button>Create Report</Button>
                    }
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>No Data Empty State</CardTitle>
                </CardHeader>
                <CardContent>
                  <NoDataEmptyState
                    onRefresh={() => notify({ title: "Refreshing data..." })}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Search Results Empty State</CardTitle>
                </CardHeader>
                <CardContent>
                  <NoSearchResultsEmptyState
                    searchTerm="artificial intelligence"
                    onClear={() => notify({ title: "Clearing search..." })}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Filter Empty State</CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterEmptyState
                    onReset={() => notify({ title: "Resetting filters..." })}
                  />
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>
        
        <TabsContent value="form-validation" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Form Validation</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form with Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormErrorSummary errors={errors} />
                      
                      <AsyncField
                        name="email"
                        label="Email"
                        validating={validating}
                        asyncMessage={showAsyncError ? undefined : "Email available"}
                      >
                        <Input
                          placeholder="Enter your email"
                          onBlur={validateEmailAsync}
                          {...form.register('email')}
                        />
                      </AsyncField>
                      
                      <FormRow label="Password" htmlFor="password" error={errors.password?.message}>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          {...form.register('password')}
                        />
                      </FormRow>
                      
                      <FormRow label="Confirm Password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          {...form.register('confirmPassword')}
                        />
                      </FormRow>
                      
                      <FormSubmitButton loadingText="Creating Account..." disabled={loading}>
                        Create Account
                      </FormSubmitButton>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Try these validation scenarios:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>Submit without filling fields</li>
                      <li>Use an invalid email format</li>
                      <li>Enter "taken@example.com" to see async validation</li>
                      <li>Enter non-matching passwords</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Form Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Form Error Summary</Label>
                    <FormErrorSummary
                      errors={{
                        "email": "Please enter a valid email address",
                        "password": "Password must be at least 8 characters",
                        "confirmPassword": "Passwords do not match"
                      }}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="mb-2 block">Form Submit Button States</Label>
                    <div className="space-y-2">
                      <FormSubmitButton>
                        Submit
                      </FormSubmitButton>
                      
                      <FormSubmitButton isSubmitting>
                        Submit
                      </FormSubmitButton>
                      
                      <FormSubmitButton isSuccess>
                        Submit
                      </FormSubmitButton>
                      
                      <FormSubmitButton isError errors={{"email": "Invalid"}}>
                        Submit
                      </FormSubmitButton>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="mb-2 block">Async Field States</Label>
                    <div className="space-y-4">
                      <AsyncField
                        name="email1"
                        label="Default State"
                      >
                        <Input placeholder="Enter email" />
                      </AsyncField>
                      
                      <AsyncField
                        name="email2"
                        label="Validating State"
                        validating={true}
                      >
                        <Input placeholder="Checking availability..." />
                      </AsyncField>
                      
                      <AsyncField
                        name="email3"
                        label="Success State"
                        asyncMessage="Email is available"
                      >
                        <Input placeholder="example@domain.com" />
                      </AsyncField>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// A component that intentionally throws an error for demonstration
const BuggyComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error("This is an intentional error for demonstration");
  }
  
  return (
    <Card className="p-4">
      <p className="mb-2">This component will throw an error when clicked</p>
      <Button onClick={() => setShouldThrow(true)} variant="destructive">
        Trigger Error
      </Button>
    </Card>
  );
};

export default ErrorStateExamples;
