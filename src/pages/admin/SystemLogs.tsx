
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SystemLogFilters, { LogFilterState } from '@/components/admin/logs/SystemLogFilters';
import SystemLogsTable from '@/components/admin/logs/SystemLogsTable';
import SystemLogsPagination from '@/components/admin/logs/SystemLogsPagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const LOGS_PER_PAGE = 25;

const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<LogFilterState>({ searchTerm: '' });
  const { toast } = useToast();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('system_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE - 1);

      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }

      if (filters.event) {
        query = query.eq('event', filters.event);
      }

      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.searchTerm) {
        query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%`);
      }

      if (filters.startDate) {
        const startDateIso = filters.startDate.toISOString();
        query = query.gte('created_at', startDateIso);
      }
      
      if (filters.endDate) {
        // Add a day to include the end date fully
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        const endDateIso = endDate.toISOString();
        query = query.lt('created_at', endDateIso);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setLogs(data || []);
      setTotalLogs(count || 0);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error fetching logs',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch logs when page or filters change
  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);

  const handleFilterChange = (newFilters: LogFilterState) => {
    setCurrentPage(1); // Reset to page 1 when filters change
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor and analyze system activity across all modules
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Filters</CardTitle>
          <CardDescription>
            Filter logs by module, event type, date range, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemLogFilters onFilterChange={handleFilterChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>System Log Entries</CardTitle>
          <CardDescription>
            Showing {logs.length} of {totalLogs} logs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <SystemLogsTable 
            logs={logs} 
            isLoading={isLoading}
            emptyMessage={isLoading ? 'Loading...' : 'No logs match the current filters'} 
          />
        </CardContent>
      </Card>

      <SystemLogsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default SystemLogsPage;
