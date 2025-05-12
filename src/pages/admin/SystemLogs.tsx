
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import SystemLogFilter from '@/components/admin/logs/SystemLogFilters';
import { AuditLog as AuditLogType, SystemEventModule } from '@/types/logs';
import { FilterState } from '@/types/shared';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import { Badge } from '@/components/ui/badge';

const SystemLogs = () => {
  const { currentWorkspace } = useWorkspace();
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [showLogDetail, setShowLogDetail] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState<SystemEventModule>>({
    searchTerm: '',
  });
  
  // List of available modules based on SystemEventModule type
  const modules: SystemEventModule[] = [
    'strategy',
    'agent',
    'plugin',
    'user',
    'tenant',
    'auth',
    'billing',
    'hubspot',
    'system'
  ];

  useEffect(() => {
    fetchLogs();
  }, [currentWorkspace?.id]);

  const fetchLogs = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState<SystemEventModule>) => {
    setFilters(newFilters);
  };

  const handleOpenLogDetail = (log: AuditLogType) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  const filteredLogs = logs.filter(log => {
    // Filter by search term
    const searchTermMatch = !filters.searchTerm || 
      log.event.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (log.context && JSON.stringify(log.context).toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    // Filter by module
    const moduleMatch = !filters.module || log.module === filters.module;
    
    // Filter by date range
    const dateRangeMatch = !filters.dateRange?.from || (
      new Date(log.created_at) >= filters.dateRange.from &&
      (!filters.dateRange.to || new Date(log.created_at) <= filters.dateRange.to)
    );
    
    return searchTermMatch && moduleMatch && dateRangeMatch;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">System Logs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>System Activity Logs</CardTitle>
          <SystemLogFilter 
            onFilterChange={handleFilterChange}
            filters={filters}
            modules={modules}
            onRefresh={fetchLogs}
            isLoading={loading}
          />
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            <div className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 items-center gap-4 p-4 hover:bg-secondary cursor-pointer"
                  onClick={() => handleOpenLogDetail(log)}
                >
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {format(new Date(log.created_at), 'MMM dd, yyyy hh:mm:ss')}
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary">{log.module}</Badge>
                  </div>
                  <div className="col-span-8">{log.event}</div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  {loading ? 'Loading logs...' : 'No logs found.'}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {selectedLog && (
        <LogDetailDialog 
          log={selectedLog} 
          open={showLogDetail} 
          onOpenChange={setShowLogDetail} 
        />
      )}
    </div>
  );
};

export default SystemLogs;
