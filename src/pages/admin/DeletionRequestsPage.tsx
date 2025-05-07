import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useTenantId } from '@/hooks/useTenantId';
import {
  AlertTriangle,
  Check,
  FileText,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHelmet from '@/components/PageHelmet';

interface DeletionRequest {
  id: string;
  user_id: string;
  tenant_id: string;
  reason: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  processed_at: string | null;
}

interface UserInfo {
  email: string;
}

const DeletionRequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const tenantId = useTenantId();
  
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<Record<string, UserInfo>>({});
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch deletion requests
  useEffect(() => {
    if (!tenantId) return;
    
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('deletion_requests')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setRequests(data as DeletionRequest[]);
          
          // Get unique user IDs
          const userIds = [...new Set(data.map(req => req.user_id))];
          
          // Fetch user info for each user ID
          const userInfoMap: Record<string, UserInfo> = {};
          for (const userId of userIds) {
            // Fix for the indexed access operator with unknown type
            if (typeof userId === 'string') {
              const { data: userData, error: userError } = await supabase
                .from('auth.users')
                .select('email')
                .eq('id', userId)
                .single();
                
              if (!userError && userData) {
                userInfoMap[userId] = {
                  email: userData.email,
                };
              }
            }
          }
          
          setUserInfo(userInfoMap);
        }
      } catch (error) {
        console.error('Error fetching deletion requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [tenantId]);
  
  const openUpdateDialog = (request: DeletionRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIsUpdateDialogOpen(true);
  };
  
  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .update({
          status: newStatus,
          processed_at: newStatus === 'completed' || newStatus === 'rejected' ? new Date().toISOString() : null,
        })
        .eq('id', selectedRequest.id);
        
      if (error) throw error;
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: newStatus as 'pending' | 'in_progress' | 'completed' | 'rejected',
                processed_at: newStatus === 'completed' || newStatus === 'rejected' ? new Date().toISOString() : null,
              } 
            : req
        )
      );
      
      toast({
        title: 'Status updated successfully',
      });
      
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error updating status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">{status}</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">{status}</Badge>;
      case 'completed':
        return <Badge variant="default">{status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const isRequestOverdue = (request: DeletionRequest) => {
    if (request.status === 'pending' || request.status === 'in_progress') {
      const createdDate = new Date(request.created_at);
      const daysDiff = differenceInDays(new Date(), createdDate);
      return daysDiff > 14;
    }
    return false;
  };
  
  return (
    <AdminGuard>
      <PageHelmet
        title={t('legal.admin.title')}
        description="Manage data deletion requests"
      />
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('legal.admin.title')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('legal.admin.title')}</CardTitle>
            <CardDescription>
              Manage user requests for data deletion and export.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deletion requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('legal.admin.user')}</TableHead>
                      <TableHead>{t('legal.admin.reason')}</TableHead>
                      <TableHead>{t('legal.admin.status')}</TableHead>
                      <TableHead>{t('legal.admin.requested')}</TableHead>
                      <TableHead>{t('legal.admin.processed')}</TableHead>
                      <TableHead className="text-right">{t('legal.admin.updateStatus')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id} className={isRequestOverdue(request) ? 'bg-red-50 dark:bg-red-950/10' : ''}>
                        <TableCell>
                          {userInfo[request.user_id]?.email || request.user_id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start space-x-2">
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{request.reason || 'No reason provided'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(request.status)}
                            {isRequestOverdue(request) && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {request.processed_at 
                            ? format(new Date(request.processed_at), 'MMM d, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateDialog(request)}
                          >
                            {t('legal.admin.changeStatus')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Status Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('legal.admin.changeStatus')}</DialogTitle>
            <DialogDescription>
              Update the status of this deletion request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                {t('legal.admin.status')}
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              onClick={handleUpdateStatus}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
};

export default DeletionRequestsPage;
