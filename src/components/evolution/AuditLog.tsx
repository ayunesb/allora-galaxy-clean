
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AuditLog as AuditLogType, LogFilters } from '@/types/logs';
import { LogFilterBar } from '@/components/admin/logs';
import { LogsList, LogDetailDialog } from '@/components/evolution/logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';

interface AuditLogProps {
  tenantId?: string;
  entityId?: string;
  entityType?: string;
  limit?: number;
  showHeader?: boolean;
  title?: string;
  data?: AuditLogType[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const AuditLog: React.FC<AuditLogProps> = ({
  tenantId,
  entityId,
  entityType,
  limit = 20,
  showHeader = true,
  title = 'Audit Log',
  data,
  isLoading: externalLoading,
  onRefresh: externalRefresh
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    module: entityType || '',
    searchTerm: '',
    limit
  });

  // Query to fetch audit logs if not provided externally
  const {
    data: fetchedLogs = [],
    isLoading: internalLoading,
    refetch,
  } = useQuery({
    queryKey: ['auditLogs', tenantId, entityId, entityType, filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }
      
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      
      if (filters.module) {
        query = query.eq('entity_type', filters.module);
      }
      
      if (filters.event) {
        query = query.eq('action', filters.event);
      }
      
      if (filters.searchTerm) {
        query = query.or(`action.ilike.%${filters.searchTerm}%,entity_type.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate.toISOString());
      }
      
      if (filters.toDate) {
        const endDate = new Date(filters.toDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AuditLogType[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !data // Only run query if data is not provided externally
  });
  
  // Get unique entity types for filtering
  const { data: entityTypes = [] } = useQuery({
    queryKey: ['auditLogEntityTypes', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('entity_type')
        .order('entity_type');
        
      if (error) throw error;
      
      // Extract and deduplicate values
      const typeValues = data.map((item: { entity_type: string }) => item.entity_type);
      return Array.from(new Set(typeValues)).filter(Boolean);
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  // Get unique actions for filtering
  const { data: actions = [] } = useQuery({
    queryKey: ['auditLogActions', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('action')
        .order('action');
        
      if (error) throw error;
      
      // Extract and deduplicate values
      const actionValues = data.map((item: { action: string }) => item.action);
      return Array.from(new Set(actionValues)).filter(Boolean);
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  const handleFilterChange = (key: keyof LogFilters, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters(prev => ({
      ...prev,
      fromDate: range?.from || null,
      toDate: range?.to || null
    }));
  };

  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;
  const logs = data || fetchedLogs;
  const refreshFn = externalRefresh || refetch;
  
  return (
    <>
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        
        <CardContent className="space-y-4">
          <LogFilterBar
            searchTerm={filters.searchTerm || ''}
            onSearchChange={(value) => handleFilterChange('searchTerm', value)}
            module={filters.module || ''}
            onModuleChange={(value) => handleFilterChange('module', value)}
            event={filters.event || ''}
            onEventChange={(value) => handleFilterChange('event', value)}
            dateRange={
              filters.fromDate || filters.toDate
                ? { from: filters.fromDate || undefined, to: filters.toDate || undefined }
                : undefined
            }
            onDateRangeChange={handleDateRangeChange}
            modules={entityTypes}
            events={actions}
            onRefresh={() => refreshFn()}
          />
          
          <LogsList
            logs={logs}
            onSelectLog={(log) => setSelectedLog(log as AuditLogType)}
            isLoading={isLoading}
            selectedLogId={selectedLog?.id}
          />
        </CardContent>
      </Card>
      
      <LogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
};

export default AuditLog;
