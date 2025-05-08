
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DeletionRequest {
  id: string;
  user_id: string;
  user_email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const DeletionRequestsPage = () => {
  // We're not using tenant directly, but it's kept for future implementation
  const { userRole } = useWorkspace();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchDeletionRequests();
  }, []);
  
  const fetchDeletionRequests = async () => {
    setIsLoading(true);
    
    // Mock data for now - would be replaced with actual API call
    setTimeout(() => {
      setRequests([
        {
          id: '1',
          user_id: 'user-123',
          user_email: 'user@example.com',
          reason: 'No longer using the service',
          status: 'pending',
          created_at: '2025-04-15T14:30:00Z'
        },
        {
          id: '2',
          user_id: 'user-456',
          user_email: 'another@example.com',
          reason: 'Privacy concerns',
          status: 'approved',
          created_at: '2025-04-10T09:15:00Z'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleApprove = (id: string) => {
    console.log(`Approving request ${id}`);
    // Implementation would go here
  };
  
  const handleReject = (id: string) => {
    console.log(`Rejecting request ${id}`);
    // Implementation would go here
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Deletion Requests</h1>
        <Button onClick={() => fetchDeletionRequests()}>Refresh</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Deletion Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No deletion requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.user_email}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
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
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequestsPage;
