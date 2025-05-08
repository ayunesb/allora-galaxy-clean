
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SystemLogFilters, { LogFilterState } from '@/components/admin/logs/SystemLogFilters';
import SystemLogsTable, { SystemLog } from '@/components/admin/logs/SystemLogsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const LOGS_PER_PAGE = 25;

const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
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

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNumber: number;
              
              // Logic to show pages around current page
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              // Show ellipsis for first page if needed
              if (i === 0 && pageNumber > 1) {
                return (
                  <React.Fragment key="start">
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                    </PaginationItem>
                    {pageNumber > 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </React.Fragment>
                );
              }
              
              // Show ellipsis for last page if needed
              if (i === 4 && pageNumber < totalPages) {
                return (
                  <React.Fragment key="end">
                    {pageNumber < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default SystemLogsPage;
