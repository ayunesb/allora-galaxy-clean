
import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSystemLogs } from '@/services/logService';
import { SystemLogFilterState } from '@/types/logs';
import { SystemLogFilter, SystemLogTable } from '@/components/admin/system-logs';
import { useTenantId } from '@/hooks/useTenantId';

const SystemLogs = () => {
  const { tenantId } = useTenantId();
  const [filters, setFilters] = useState<SystemLogFilterState>({
    module: '',
    event: '',
    searchTerm: '',
    fromDate: null,
    toDate: null
  });
  
  const { 
    data: logs = [], 
    isLoading, 
    refetch,
    isFetching
  } = useSystemLogs({
    tenant_id: tenantId,
    module: filters.module || undefined,
    event: filters.event || undefined,
    search: filters.searchTerm || undefined,
    date_from: filters.fromDate || undefined,
    date_to: filters.toDate || undefined,
    limit: 100
  });
  
  const handleFilterChange = (newFilters: SystemLogFilterState) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({
      module: '',
      event: '',
      searchTerm: '',
      fromDate: null,
      toDate: null
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="System Logs"
        description="View and analyze system logs across all components."
        actions={
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />
      
      <div className="space-y-6">
        <SystemLogFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Log Events</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemLogTable 
              logs={logs} 
              isLoading={isLoading || isFetching} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemLogs;
