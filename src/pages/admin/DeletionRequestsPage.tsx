
import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DeletionRequestsPage: React.FC = () => {
  const { currentRole } = useWorkspace();

  const dummyRequests = [
    {
      id: '1',
      email: 'user1@example.com',
      requestDate: '2025-04-01',
      status: 'pending'
    },
    {
      id: '2',
      email: 'user2@example.com',
      requestDate: '2025-04-02',
      status: 'processing'
    }
  ];

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Data Deletion Requests</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {dummyRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        request.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Process
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No deletion requests pending.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequestsPage;
