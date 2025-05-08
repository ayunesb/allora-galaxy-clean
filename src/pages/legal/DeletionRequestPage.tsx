
import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const DeletionRequestPage = () => {
  const { userRole } = useWorkspace();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for your account deletion request.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real implementation, this would submit to the backend
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Request submitted",
        description: "Your deletion request has been submitted and will be reviewed.",
      });
      
      setReason('');
      setIsConfirming(false);
    } catch (error) {
      console.error("Error submitting deletion request:", error);
      toast({
        title: "Submission error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Request Account Deletion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isConfirming ? (
            <>
              <div className="space-y-4">
                <p>Are you sure you want to request account deletion? This action cannot be undone.</p>
                <p className="text-destructive">All your data will be permanently removed from our system.</p>
                
                <div className="space-y-2">
                  <p className="font-medium">Please confirm your reason for leaving:</p>
                  <p className="bg-muted p-3 rounded-md">{reason}</p>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Request"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfirming(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <p>
                  We're sorry to see you go. Before proceeding with your deletion request, 
                  please note that this will permanently remove all your account data, including:
                </p>
                
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Personal profile information</li>
                  <li>Saved strategies and campaigns</li>
                  <li>Historical performance metrics</li>
                  <li>Plugin configurations and execution history</li>
                </ul>
                
                <p className="font-medium pt-2">Please provide a reason for deleting your account:</p>
                <Textarea
                  placeholder="Please tell us why you're leaving..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                />
                
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsConfirming(true)}
                    disabled={!reason.trim()}
                  >
                    Request Deletion
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequestPage;
