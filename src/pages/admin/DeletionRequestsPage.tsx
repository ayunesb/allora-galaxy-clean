import React from 'react';
import { AlertTriangle, Calendar, Trash2, User } from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/context/WorkspaceContext';

interface DeletionRequest {
  id: string;
  user_id: string;
  tenant_id: string;
  reason: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
}

const DeletionRequestsPage: React.FC = () => {
  const [requests, setRequests] = React.useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { currentTenant } = useWorkspace();

  React.useEffect(() => {
    fetchDeletionRequests();
  }, [currentTenant?.id]);

  const fetchDeletionRequests = async () => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('deletion_requests')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 'approved' } : req))
      );

      toast({
        title: 'Success',
        description: 'Deletion request approved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: 'rejected' } : req))
      );

      toast({
        title: 'Success',
        description: 'Deletion request rejected.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Deletion Requests</CardTitle>
            <CardDescription>Loading deletion requests...</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Deletion Requests</CardTitle>
          <CardDescription>
            Manage user deletion requests for your tenant.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {requests.length === 0 ? (
            <div className="text-center py-4">
              <AlertTriangle className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No deletion requests found.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>User ID: {request.user_id.substring(0, 8)}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Requested on:{' '}
                      {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  {request.metadata && (
                    <div className="mt-2">
                      <p>
                        <strong>Metadata:</strong>
                      </p>
                      <pre className="text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(request.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                      <Button onClick={() => handleApprove(request.id)}>
                        Approve
                      </Button>
                    </>
                  )}
                  {request.status !== 'pending' && (
                    <div className="text-sm text-muted-foreground">
                      Status: {request.status}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequestsPage;
