
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import AuditLogFilters, { AuditLogFilters as FilterType } from '@/components/evolution/logs/AuditLogFilters';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { Loader2 } from 'lucide-react';

const AuditLog: React.FC = () => {
  const tenantId = useTenantId();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<FilterType>({});

  const fetchLogs = async () => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId);

      // Apply filters
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.event) {
        query = query.ilike('event', `%${filters.event}%`);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }
      
      if (filters.search) {
        query = query.or(`event.ilike.%${filters.search}%,module.ilike.%${filters.search}%`);
      }

      // Order by created_at DESC
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching system logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tenantId, filters]);

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Audit Log
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AuditLogFilters 
            filters={filters} 
            onFiltersChange={handleFiltersChange} 
          />
          <SystemLogsList 
            logs={logs} 
            isLoading={isLoading} 
            error={error || undefined}
            onRetry={fetchLogs}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLog;
