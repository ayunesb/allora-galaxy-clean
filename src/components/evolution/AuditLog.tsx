
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import AuditLogFilters from './logs/AuditLogFilters';
import LogDetailDialog from './logs/LogDetailDialog';
import { FilterState } from '@/types/shared';

// This will be replaced with actual data type from your system
export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details?: any;
  [key: string]: any;
}

interface AuditLogProps {
  title?: string;
  initialData?: AuditLogItem[];
  isLoading?: boolean;
  onFetchData?: (filter: FilterState) => Promise<AuditLogItem[]>;
}

export const AuditLog: React.FC<AuditLogProps> = ({
  title = 'Audit Logs',
  initialData = [],
  isLoading = false,
  onFetchData,
}) => {
  const [data, setData] = useState<AuditLogItem[]>(initialData);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [filter, setFilter] = useState<FilterState>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchData = async () => {
    if (!onFetchData) return;
    
    try {
      setLoading(true);
      const results = await onFetchData(filter);
      setData(results);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (onFetchData) {
      fetchData();
    }
  }, []);

  const handleApplyFilter = () => {
    fetchData();
  };

  const handleResetFilter = () => {
    setFilter({});
    // Optionally fetch data with reset filters
    fetchData();
  };

  const handleViewDetails = (log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const columns = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }: any) => {
        const timestamp = row.getValue('timestamp');
        return new Date(timestamp).toLocaleString();
      },
    },
    {
      accessorKey: 'userId',
      header: 'User',
    },
    {
      accessorKey: 'action',
      header: 'Action',
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleViewDetails(row.original)}
          >
            View Details
          </Button>
        );
      },
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <AuditLogFilters 
          filter={filter}
          setFilter={setFilter}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />
        
        <div className="mt-4">
          <DataTable 
            columns={columns} 
            data={data}
            isLoading={loading} 
          />
        </div>
        
        {selectedLog && (
          <LogDetailDialog 
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            log={selectedLog}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLog;
