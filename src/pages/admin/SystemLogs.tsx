
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { useTenantId } from '@/hooks/useTenantId';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SystemLogFilters, { LogFilterState } from '@/components/admin/logs/SystemLogFilters';
import SystemLogsTable from '@/components/admin/logs/SystemLogsTable';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SystemEventModule, SystemEventType } from '@/types/shared';

const SystemLogs: React.FC = () => {
  const tenantId = useTenantId();
  const [moduleFilter, setModuleFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  
  // Fetch module and event types for filters
  const [availableModules, setAvailableModules] = useState<SystemEventModule[]>([]);
  const [availableEvents, setAvailableEvents] = useState<SystemEventType[]>([]);
  
  // Fetch system logs
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['systemLogs', tenantId, moduleFilter, eventFilter, searchQuery, selectedDate],
    queryFn: async () => {
      if (!tenantId) return [];
      
      // First, fetch module and event types
      try {
        const { data: modules, error: modulesError } = await supabase
          .from('system_logs')
          .select('module')
          .eq('tenant_id', tenantId)
          .limit(100);
          
        if (!modulesError && modules) {
          const uniqueModules = Array.from(
            new Set(modules.map(item => item.module))
          ) as SystemEventModule[];
          setAvailableModules(uniqueModules);
        }
        
        const { data: events, error: eventsError } = await supabase
          .from('system_logs')
          .select('event')
          .eq('tenant_id', tenantId)
          .limit(100);
          
        if (!eventsError && events) {
          const uniqueEvents = Array.from(
            new Set(events.map(item => item.event))
          ) as SystemEventType[];
          setAvailableEvents(uniqueEvents);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
      
      // Now fetch logs with filters
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
      
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        query = query.gte('created_at', startDate.toISOString())
                     .lte('created_at', endDate.toISOString());
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
    setSelectedDate(null);
  };
  
  const handleFilterChange = (newFilters: LogFilterState) => {
    setModuleFilter(newFilters.moduleFilter);
    setEventFilter(newFilters.eventFilter);
    setSearchQuery(newFilters.searchQuery);
    setSelectedDate(newFilters.selectedDate);
  };
  
  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
  };
  
  const handleRefresh = () => {
    refetch();
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-8">
        View detailed logs of all system activities and events.
      </p>
      
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
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onReset={resetFilters}
              onFilterChange={handleFilterChange}
              modules={availableModules}
              events={availableEvents}
            />
          </div>
          
          <SystemLogsTable 
            logs={logs || []} 
            isLoading={isLoading} 
            onViewDetails={handleViewDetails}
            emptyMessage="No logs found matching your criteria."
          />
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
    </div>
  );
};

export default withRoleCheck(SystemLogs, { roles: ['admin', 'owner'] });
