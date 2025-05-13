
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHelmet from '@/components/PageHelmet';
import { SystemLogTable, SystemLogFilter } from '@/components/admin/system-logs';
import { SystemLog, LogFilters } from '@/types/logs';
import { useSystemLogs } from '@/hooks/admin/useSystemLogs';

const EnhancedSystemLogs: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LogFilters>({ limit: 100 });
  
  const {
    logs,
    isLoading,
    refetch
  } = useSystemLogs(filters);
  
  const handleFilterChange = (newFilters: LogFilters) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({ limit: 100 });
  };
  
  const handleViewDetails = (log: SystemLog) => {
    navigate(`/admin/logs/${log.id}`);
  };
  
  return (
    <>
      <PageHelmet
        title="System Logs"
        description="View and analyze system logs"
      />
      
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">System Logs</h1>
        </div>
        
        <div className="space-y-6">
          <SystemLogFilter
            onChange={handleFilterChange}
            initialFilters={filters}
          />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemLogTable
                logs={logs}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EnhancedSystemLogs;
