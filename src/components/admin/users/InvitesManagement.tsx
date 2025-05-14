
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Mail, Trash2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invite {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  created_at: string;
  tenant_id: string;
}

export function InvitesManagement() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  const fetchInvites = async () => {
    if (!currentWorkspace?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_invites')
        .select('*')
        .eq('tenant_id', currentWorkspace.id);

      if (error) throw error;
      setInvites(data || []);
    } catch (error: any) {
      console.error('Error fetching invites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitation data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchInvites();
    }
  }, [currentWorkspace?.id]);

  const resendInvitation = async (invite: Invite) => {
    try {
      const { error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: invite.email,
          tenant_id: invite.tenant_id,
          tenant_name: currentWorkspace?.name || "Your Organization",
          role: invite.role,
          token: invite.token
        }
      });

      if (error) throw error;

      toast({
        title: 'Invitation resent',
        description: `An invitation has been sent to ${invite.email}`,
      });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Failed to resend invitation',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const deleteInvitation = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('user_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      setInvites(invites.filter(invite => invite.id !== inviteId));
      
      toast({
        title: 'Invitation deleted',
        description: 'The invitation has been removed',
      });
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast({
        title: 'Failed to delete invitation',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const getInviteStatus = (expiresAt: string) => {
    return isPast(new Date(expiresAt)) ? 
      <Badge variant="destructive">Expired</Badge> : 
      <Badge variant="outline">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Invitations</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchInvites} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : invites.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No pending invitations found</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map(invite => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>{invite.role}</TableCell>
                    <TableCell>{format(new Date(invite.created_at), 'PP')}</TableCell>
                    <TableCell>{format(new Date(invite.expires_at), 'PP')}</TableCell>
                    <TableCell>{getInviteStatus(invite.expires_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="Resend invitation"
                          onClick={() => resendInvitation(invite)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          title="Delete invitation"
                          onClick={() => deleteInvitation(invite.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
