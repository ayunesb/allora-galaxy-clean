
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DeletionRequestPage: React.FC = () => {
  const { toast } = useToast();

  const handleRequestDeletion = () => {
    // In a real application, this would submit a deletion request
    toast({
      title: 'Request Submitted',
      description: 'Your deletion request has been submitted for review.',
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Account Deletion Request</h1>
      
      <Alert className="mb-6">
        <AlertDescription>
          Requesting account deletion will initiate the process of removing your account and all associated data.
          This action cannot be undone once completed.
        </AlertDescription>
      </Alert>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What happens when you delete your account</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>All your personal information will be permanently deleted</li>
            <li>Your user account will be removed from our systems</li>
            <li>All your projects and data will be permanently deleted</li>
            <li>You will lose access to any paid services</li>
            <li>This process may take up to 30 days to complete</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Request Account Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            To proceed with account deletion, please click the button below.
            A confirmation email will be sent to your registered email address.
          </p>
          
          <Button onClick={handleRequestDeletion} variant="destructive">
            Request Account Deletion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequestPage;
