
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  notify, 
  notifySuccess, 
  notifyError, 
  notifyWarning, 
  notifyInfo,
  notifyPromise,
  useToast
} from '@/lib/notifications/toast';

export const ToastExamples: React.FC = () => {
  const toast = useToast();
  
  const simulateAsyncOperation = () => {
    return new Promise<string>((resolve, reject) => {
      // Simulate 50% success/failure rate
      const willSucceed = Math.random() > 0.5;
      
      setTimeout(() => {
        if (willSucceed) {
          resolve("Operation completed successfully");
        } else {
          reject(new Error("Something went wrong"));
        }
      }, 2000);
    });
  };
  
  const handlePromiseToast = async () => {
    try {
      await toast.promise(
        simulateAsyncOperation(),
        {
          loading: "Processing your request...",
          success: (data) => `Success! ${data}`,
          error: (err) => `Error: ${err.message}`,
          logModule: 'agent',
          tenantId: 'system',
          logContext: { action: 'toast-demo' }
        }
      );
    } catch (error) {
      console.log("Error handled by toast.promise");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Toast Notification Examples</CardTitle>
        <CardDescription>
          Demonstration of the different toast notification types
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button onClick={() => notify("Default notification")}>
          Default Toast
        </Button>
        
        <Button 
          variant="success" 
          onClick={() => notifySuccess("Success notification", { 
            description: "The operation was completed successfully"
          })}
        >
          Success Toast
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={() => notifyError("Error notification", { 
            description: "Something went wrong. Please try again."
          })}
        >
          Error Toast
        </Button>
        
        <Button 
          variant="warning" 
          onClick={() => notifyWarning("Warning notification", { 
            description: "This is a warning message you should pay attention to.",
            duration: 8000
          })}
        >
          Warning Toast (8s)
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => notifyInfo("Information", { 
            description: "This is an informational toast message",
            action: {
              label: "Action",
              onClick: () => alert("Action clicked")
            }
          })}
        >
          Info Toast with Action
        </Button>
        
        <Button onClick={handlePromiseToast}>
          Promise Toast
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => notify("Persistent Notification", { 
            description: "This notification will stay until dismissed", 
            duration: Infinity
          })}
        >
          Persistent Toast
        </Button>
      </CardContent>
    </Card>
  );
};

export default ToastExamples;
