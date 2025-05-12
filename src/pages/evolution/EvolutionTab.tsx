
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import LogDetailDialog from '@/components/evolution/logs/LogDetailDialog';
import AuditLogFilters from '@/components/evolution/logs/AuditLogFilters';
import { AuditLog, SystemLog } from '@/types/logs';
import { DateRange } from '@/types/shared';

// Define columns for the DataTable
const getColumns = (onRowClick: (log: AuditLog | SystemLog) => void) => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span className="font-medium">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'created_at',
    header: 'Timestamp',
    cell: ({ row }) => {
      return format(new Date(row.getValue('created_at')), 'PPp');
    },
  },
  {
    accessorKey: 'event_type',
    header: 'Action',
    cell: ({ row }) => row.getValue('event_type') || row.getValue('event'),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.getValue('description') || 'No description',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onRowClick(row.original)}
      >
        View Details
      </Button>
    ),
  },
];

// Mock function to fetch audit logs - replace with real API call
const fetchAuditLogs = async (filters: any = {}) => {
  // This would be your actual API call
  console.log('Fetching audit logs with filters:', filters);
  
  // Return mock data for now
  return [
    {
      id: '1',
      event_type: 'create',
      entity_type: 'strategy',
      entity_id: 'abc123',
      user_id: 'user1',
      description: 'Created new strategy',
      metadata: { name: 'Growth Strategy', tags: ['growth', 'marketing'] },
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      event_type: 'update',
      entity_type: 'plugin',
      entity_id: 'def456',
      user_id: 'user2',
      description: 'Updated plugin parameters',
      metadata: { pluginId: 'email-sender', params: { subject: 'Welcome!' } },
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ];
};

const EvolutionTab: React.FC = () => {
  const { t } = useTranslation();
  const [selectedLog, setSelectedLog] = useState<AuditLog | SystemLog | null>(null);
  const [filters, setFilters] = useState<{
    dateRange?: DateRange;
    eventType?: string;
    entityType?: string;
    searchTerm?: string;
  }>({});

  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
  });

  const handleRowClick = (log: AuditLog | SystemLog) => {
    setSelectedLog(log);
  };

  const handleCloseDialog = () => {
    setSelectedLog(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  const columns = getColumns(handleRowClick);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('Audit Logs')}</h1>
        <Button variant="outline" onClick={handleRefresh}>
          {t('Refresh')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogFilters 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Audit Log Records')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns}
            data={auditLogs || []}
            isLoading={isLoading}
            pagination
          />
        </CardContent>
      </Card>

      {selectedLog && (
        <LogDetailDialog
          isOpen={!!selectedLog}
          onClose={handleCloseDialog}
          log={selectedLog}
        />
      )}
    </div>
  );
};

export default EvolutionTab;
