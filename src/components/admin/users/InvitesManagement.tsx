
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const InvitesManagement = () => {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Sample data - in a real app, this would come from an API call
  const sampleInvites = [
    { 
      id: '1', 
      email: 'user1@example.com', 
      role: 'editor',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    { 
      id: '2', 
      email: 'user2@example.com', 
      role: 'viewer',
      status: 'expired',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];
  
  // Simulate loading invites
  useState(() => {
    setLoading(true);
    setTimeout(() => {
      setInvites(sampleInvites);
      setLoading(false);
    }, 1000);
  });
  
  // Status badge variants
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Invites</CardTitle>
        <Button size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No pending invites
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Role</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2">{invite.email}</td>
                    <td className="px-4 py-2 capitalize">{invite.role}</td>
                    <td className="px-4 py-2">
                      <Badge variant={getStatusBadgeVariant(invite.status)}>
                        {invite.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {format(new Date(invite.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitesManagement;
