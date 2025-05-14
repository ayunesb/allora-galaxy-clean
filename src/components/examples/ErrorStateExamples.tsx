
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorState from '@/components/errors/ErrorState';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormErrorSummary } from '@/components/errors/FormErrorSummary';
import { toast } from "sonner";
import { AlertCircle, FileSearch, Inbox } from 'lucide-react';
import { retry } from '@/lib/utils';
import { EdgeFunctionError } from '@/components/errors/EdgeFunctionErrorHandler';

// Define test errors
const testErrors = {
  notFound: {
    message: 'Resource not found',
    statusCode: 404,
    code: 'NOT_FOUND',
    details: { resourceType: 'User', id: '123456' },
    requestId: 'req_1684062600000_abcdef',
  },
  serverError: {
    message: 'Internal server error occurred',
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    details: { trace: 'Error at line 42' },
    requestId: 'req_1684062600000_abcdef',
  },
  validationError: {
    message: 'Validation failed',
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    details: { errors: ['Email is invalid', 'Password is too short'] },
    requestId: 'req_1684062600000_abcdef',
  }
};

// Function to simulate a retry operation
const simulateRetry = async (shouldFail: boolean = true) => {
  let attempts = 0;
  
  try {
    await retry(
      async () => {
        attempts++;
        if (shouldFail && attempts < 3) {
          throw new Error(`Attempt ${attempts} failed`);
        }
        return 'Success';
      },
      {
        maxAttempts: 3,
        baseDelay: 500,
        onRetry: (error, attempt) => {
          toast.info(`Retry attempt ${attempt}`, {
            description: `Previous attempt failed: ${error.message}`
          });
        }
      }
    );
    
    toast.success('Operation succeeded after retries');
  } catch (error) {
    toast.error('Operation failed after all retry attempts');
    throw error;
  }
};

// Empty state component
const EmptyState = ({ title = 'No data found', description = 'There are no items to display.', icon, action }: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/40 rounded-lg">
    <div className="rounded-full bg-muted p-3 mb-4">
      {icon || <Inbox className="h-8 w-8 text-muted-foreground" />}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
    {action}
  </div>
);

// Form validation schema
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long.')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type FormData = z.infer<typeof formSchema>;

const ErrorStateExamples: React.FC = () => {
  const [activeError, setActiveError] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });
  
  const { errors } = formState;
  
  // Convert React Hook Form errors to the format expected by FormErrorSummary
  const formattedErrors: Record<string, string | string[]> = {};
  
  if (errors) {
    Object.entries(errors).forEach(([field, error]) => {
      if (error && error.message) {
        formattedErrors[field] = error.message;
      }
    });
  }
  
  const onSubmit = (data: FormData) => {
    toast.success('Form submitted successfully', {
      description: `Logged in as ${data.email}`
    });
  };
  
  const triggerRetry = async () => {
    setIsRetrying(true);
    try {
      await simulateRetry(true);
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleRetrySuccess = async () => {
    setIsRetrying(true);
    try {
      await simulateRetry(false);
      setActiveError(null);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Error State Components</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Standard Error States</CardTitle>
            <CardDescription>Different variations of the ErrorState component</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErrorState 
              title="Something went wrong"
              message="We were unable to process your request."
              retry={() => toast("Retrying...")}
            />
            
            <ErrorState 
              title="Network Error"
              message="Could not connect to the server."
              error={new Error("ECONNREFUSED: Connection refused")}
              showDetails={true}
              variant="default"
              size="sm"
            />
            
            <ErrorState 
              title="Access Denied"
              message="You don't have permission to access this resource."
              variant="default"
              size="lg"
            >
              <div className="flex justify-center mt-4">
                <Button variant="default" size="sm">
                  Request Access
                </Button>
              </div>
            </ErrorState>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Edge Function Errors</CardTitle>
            <CardDescription>Error handling for API and edge function calls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveError(testErrors.notFound)}
              >
                Show 404 Error
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveError(testErrors.serverError)}
              >
                Show 500 Error
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveError(testErrors.validationError)}
              >
                Show Validation Error
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveError(null)}
              >
                Clear Error
              </Button>
            </div>
            
            {activeError ? (
              <EdgeFunctionError 
                error={activeError} 
                retry={handleRetrySuccess} 
                showDetails={true}
                showRequestId={true}
              />
            ) : (
              <div className="p-6 text-center border rounded-md bg-background">
                <p className="text-muted-foreground">Select an error type to display</p>
              </div>
            )}
            
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Testing Retry Logic</h3>
              <Button 
                onClick={triggerRetry} 
                disabled={isRetrying}
              >
                {isRetrying ? 'Retrying...' : 'Trigger Retry Logic'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will simulate a failing operation that automatically retries
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Empty States</CardTitle>
            <CardDescription>Components for when no data is available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <EmptyState 
              title="No results found"
              description="Try adjusting your search or filter terms."
              icon={<FileSearch className="h-8 w-8 text-muted-foreground" />}
              action={
                <Button variant="outline" size="sm">
                  Clear filters
                </Button>
              }
            />
            
            <EmptyState 
              title="Your inbox is empty"
              description="When you receive new messages, they will appear here."
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Form Error Handling</CardTitle>
            <CardDescription>Validation error handling in forms</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {Object.keys(formattedErrors).length > 0 && (
                <FormErrorSummary errors={formattedErrors} />
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              
              <Button type="submit">Submit</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorStateExamples;
