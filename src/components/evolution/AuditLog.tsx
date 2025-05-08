
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';

export const AuditLog = () => {
  const { currentTenant } = useWorkspace();
  const tenantId = currentTenant?.id;
  
  const [moduleFilter, setModuleFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  
  // Fetch system logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['systemLogs', tenantId, moduleFilter, eventFilter, searchQuery],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (moduleFilter) {
        query = query.eq('module', moduleFilter);
      }
      
      if (eventFilter) {
        query = query.eq('event', eventFilter);
      }
      
      if (searchQuery) {
        query = query.or(`context.ilike.%${searchQuery}%,event.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching system logs:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!tenantId
  });
  
  const resetFilters = () => {
    setModuleFilter('');
    setEventFilter('');
    setSearchQuery('');
  };
  
  const getModuleBadgeColor = (module: string) => {
    switch (module.toLowerCase()) {
      case 'strategy': return 'bg-blue-100 text-blue-800';
      case 'plugin': return 'bg-purple-100 text-purple-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'auth': return 'bg-yellow-100 text-yellow-800';
      case 'system': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>System Audit Log</CardTitle>
          <CardDescription>
            SOC2-style traceability for AI strategy evolution and execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SystemLogFilters
              moduleFilter={moduleFilter}
              setModuleFilter={setModuleFilter}
              eventFilter={eventFilter}
              setEventFilter={setEventFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onReset={resetFilters}
            />
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Context
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="mx-auto w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-mono">
                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getModuleBadgeColor(log.module)}`}>
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.event}
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {log.context ? JSON.stringify(log.context).substring(0, 50) + '...' : 'No context'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
                  <div className="font-mono">
                    {format(new Date(selectedLog.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Module</div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getModuleBadgeColor(selectedLog.module)}`}>
                      {selectedLog.module}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Event</div>
                <div>{selectedLog.event}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Context</div>
                <div className="bg-muted rounded-md p-4 overflow-auto max-h-96">
                  {selectedLog.context ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.context, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-muted-foreground">No context available</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
