
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface DeletionRequest {
  id: string;
  userId: string;
  email: string;
  reason: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
}

const DeletionRequestsPage = () => {
  const { tenant } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  
  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      // Mock data
      setRequests([
        {
          id: '1',
          userId: 'user-1',
          email: 'user1@example.com',
          reason: 'No longer using the service',
          requestedAt: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          userId: 'user-2',
          email: 'user2@example.com',
          reason: 'Privacy concerns',
          requestedAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'approved'
        }
      ]);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleApprove = (id: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'approved' as const } : req
      )
    );
  };
  
  const handleDeny = (id: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'denied' as const } : req
      )
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Data Deletion Requests</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Data Deletion Requests</h1>
      
      {requests.length > 0 ? (
        <Card>
          <Table>
            <TableCaption>List of data deletion requests</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>{new Date(request.requestedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={
                      request.status === 'approved' ? 'text-green-500' :
                      request.status === 'denied' ? 'text-red-500' :
                      'text-yellow-500'
                    }>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeny(request.id)}
                        >
                          Deny
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No deletion requests found.</p>
        </Card>
      )}
    </div>
  );
};

export default DeletionRequestsPage;
