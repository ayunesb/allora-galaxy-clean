
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog, AuditLog } from '@/types/logs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { JsonView } from '@/components/ui/json-view';
import { formatDisplayDate } from '@/lib/utils/date';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PageHelmet from '@/components/PageHelmet';
import LogTransformationDialog from '@/components/evolution/LogTransformationDialog';
import { auditLogToSystemLog, systemLogToAuditLog } from '@/lib/utils/logTransformations';

const LogDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transformDialogOpen, setTransformDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'details' | 'raw'>('details');
  
  const { data: log, isLoading, refetch } = useQuery({
    queryKey: ['log-details', id],
    queryFn: async () => {
      if (!id) throw new Error('Log ID is required');
      
      // Try to get from system_logs first
      const { data: systemLog, error: systemError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (systemLog) {
        return { log: systemLog, type: 'system' as const };
      }
      
      // If not found in system_logs, try audit_logs
      const { data: auditLog, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (auditLog) {
        return { log: auditLog, type: 'audit' as const };
      }
      
      if (systemError && auditError) {
        throw new Error('Log not found');
      }
      
      return null;
    }
  });
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  const logData = log?.log as SystemLog | AuditLog | undefined;
  const logType = log?.type;
  
  // Determine which fields to show based on log type
  const isSystemLog = logType === 'system';
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!logData) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Log Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The requested log could not be found. It may have been deleted or you may not have permission to view it.
            </p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <PageHelmet
        title={`Log Details: ${logData.id}`}
        description="View detailed information about this log entry"
      />
      
      <div className="container py-8">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
            >
              <RotateCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setTransformDialogOpen(true)}
            >
              Transform Log
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Log Details
                <Badge variant="outline" className="ml-2">
                  {logType?.toUpperCase()}
                </Badge>
              </CardTitle>
              
              <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as 'details' | 'raw')}>
                <TabsList>
                  <TabsTrigger value="details">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="details" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p className="text-sm font-mono">{logData.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p className="text-sm">{formatDisplayDate(logData.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isSystemLog ? 'Module' : 'Entity Type'}
                  </p>
                  <Badge variant="outline">
                    {isSystemLog 
                      ? (logData as SystemLog).module 
                      : (logData as AuditLog).entity_type || (logData as AuditLog).module}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isSystemLog ? 'Event' : 'Action'}
                  </p>
                  <Badge variant={
                    (isSystemLog ? (logData as SystemLog).event : (logData as AuditLog).action) === 'error' 
                      ? 'destructive' 
                      : 'default'
                  }>
                    {isSystemLog 
                      ? (logData as SystemLog).event 
                      : (logData as AuditLog).action || (logData as AuditLog).event}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono text-xs">{logData.user_id || 'system'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tenant ID</p>
                  <p className="text-sm font-mono text-xs">{logData.tenant_id || 'global'}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Description/Message */}
              {((isSystemLog && (logData as SystemLog).description) || 
                (!isSystemLog && (logData as AuditLog).details?.message)) && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {isSystemLog 
                      ? (logData as SystemLog).description 
                      : (logData as AuditLog).details?.message}
                  </p>
                </div>
              )}
              
              {/* Context/Details */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {isSystemLog ? 'Context' : 'Details'}
                </p>
                <div className="border rounded-md p-4 bg-muted/20">
                  <JsonView data={isSystemLog 
                    ? (logData as SystemLog).context || {} 
                    : (logData as AuditLog).details || {}} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="raw" className="mt-0">
              <div className="border rounded-md p-4 bg-muted/20">
                <JsonView data={logData} />
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
      
      <LogTransformationDialog
        open={transformDialogOpen}
        onOpenChange={setTransformDialogOpen}
        log={logData}
        type={logType as 'system' | 'audit'}
      />
    </>
  );
};

export default LogDetailsPage;
