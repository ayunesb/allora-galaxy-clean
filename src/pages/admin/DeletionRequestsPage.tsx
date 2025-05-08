
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DeletionRequestsPage() {
  const { tenant } = useWorkspace();
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (tenant?.id) {
      fetchDeletionRequests();
    }
  }, [tenant?.id]);

  const fetchDeletionRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deletion_requests')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setDeletionRequests(data || []);
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deletion requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setDeletionRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: 'approved', processed_at: new Date().toISOString() } 
            : request
        )
      );
      
      toast({
        title: 'Request approved',
        description: 'The deletion request has been approved',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve the request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .update({ 
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setDeletionRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: 'rejected', processed_at: new Date().toISOString() } 
            : request
        )
      );
      
      toast({
        title: 'Request rejected',
        description: 'The deletion request has been rejected',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject the request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Deletion Requests</h1>
        <Button onClick={fetchDeletionRequests}>Refresh</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review and process data deletion requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : deletionRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No deletion requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletionRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-xs">
                      {request.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {request.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.request_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          request.status === 'pending' ? 'outline' : 
                          request.status === 'approved' ? 'success' : 'destructive'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={!!processingId}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Deletion Request</DialogTitle>
                                <DialogDescription>
                                  Please review the details of this deletion request before approving or rejecting.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 my-4">
                                <div>
                                  <h4 className="font-medium">Request Details</h4>
                                  <p className="text-sm">User ID: {request.user_id}</p>
                                  <p className="text-sm">Request Type: {request.request_type}</p>
                                  <p className="text-sm">Created: {new Date(request.created_at).toLocaleString()}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium">Reason</h4>
                                  <p className="text-sm bg-muted p-2 rounded">
                                    {request.reason || "No reason provided"}
                                  </p>
                                </div>
                                
                                {request.metadata && (
                                  <div>
                                    <h4 className="font-medium">Additional Information</h4>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                      {JSON.stringify(request.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                              
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleRejectRequest(request.id)}
                                  disabled={processingId === request.id}
                                >
                                  {processingId === request.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : null}
                                  Reject
                                </Button>
                                <Button 
                                  onClick={() => handleApproveRequest(request.id)}
                                  disabled={processingId === request.id}
                                >
                                  {processingId === request.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                  )}
                                  Approve
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <Badge variant="outline">
                          {request.processed_at ? 
                            `Processed on ${new Date(request.processed_at).toLocaleDateString()}` : 
                            'Processed'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Total requests: {deletionRequests.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Pending: {deletionRequests.filter(r => r.status === 'pending').length}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
