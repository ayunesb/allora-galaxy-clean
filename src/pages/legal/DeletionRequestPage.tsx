
import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const DeletionRequestPage = () => {
  const { tenant } = useWorkspace();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for your request',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Here we would submit the deletion request to the API
      // For now, let's just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast({
        title: 'Request Submitted',
        description: 'Your data deletion request has been submitted.',
      });
    } catch (error: any) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit deletion request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Request Data Deletion</h1>
      
      {submitted ? (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Request Submitted</h2>
          <p className="mb-4">
            Your data deletion request has been submitted successfully. Our team will review your request and process it according to our privacy policy.
          </p>
          <p className="mb-4">
            You will receive an email confirmation once your request has been processed.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Back to Dashboard
          </Button>
        </Card>
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Data Deletion Request</h2>
              <p className="text-muted-foreground mb-4">
                Please provide a reason for your data deletion request. This will help us understand your concerns and process your request more efficiently.
              </p>
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Reason for deletion request
              </label>
              <Textarea
                id="reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please explain why you want your data deleted..."
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Deletion Request'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">What happens next?</h2>
        <p className="text-muted-foreground mb-4">
          Once you submit your request:
        </p>
        <ol className="list-decimal ml-6 space-y-2 text-muted-foreground">
          <li>Our team will review your request within 7 business days</li>
          <li>You will receive an email confirmation when your request is received</li>
          <li>If approved, all your personal data will be deleted from our systems</li>
          <li>You'll receive a final confirmation email once the deletion is complete</li>
        </ol>
      </div>
    </div>
  );
};

export default DeletionRequestPage;
