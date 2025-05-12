import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import SystemLogFilter from '@/components/admin/logs/SystemLogFilters';
import { SystemLogFilter as SystemLogFilterType } from '@/components/admin/logs/SystemLogFilters';
import { AuditLog } from '@/types/logs';
import { Badge } from '@/components/ui/badge';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';

const SystemLogs = () => {
  const { currentWorkspace } = useWorkspace();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState<boolean>(false);
  const [filters, setFilters] = useState<SystemLogFilterType>({
    searchTerm: '',
  });
  
  // List of available modules based on logs
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    fetchLogs();
    fetchModules();
  }, [currentWorkspace?.id]);

  const fetchModules = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('module')
        .eq('tenant_id', currentWorkspace.id)
        .order('module')
        .limit(100);
      
      if (error) throw error;
      
      // Extract unique modules
      const uniqueModules = Array.from(new Set(data.map(item => item.module)));
      setModules(uniqueModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchLogs = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', currentWorkspace.id);
      
      // Apply filters
      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.dateRange?.from) {
        const fromDate = new Date(filters.dateRange.from);
        query = query.gte('created_at', fromDate.toISOString());
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          query = query.lte('created_at', toDate.toISOString());
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      
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

  const handleFilterChange = (newFilters: SystemLogFilterType) => {
    setFilters(newFilters);
    // Re-fetch logs with new filters
    setTimeout(fetchLogs, 0);
  };

  const handleOpenLogDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

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
              {logs.map((log) => (
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
              {logs.length === 0 && (
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
