
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { SystemLog, LogFilters } from '@/types/logs';
import { formatForDatabase } from '@/lib/utils/date';

/**
 * Hook to fetch system logs with filters
 */
export const useSystemLogs = (filters: LogFilters) => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['system-logs', filters],
    queryFn: async () => {
      // Create query
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      
      if (filters.module) {
        query = query.eq('module', filters.module);
      }
      
      if (filters.event) {
        query = query.eq('event', filters.event);
      }
      
      if (filters.search) {
        query = query.or(
          `module.ilike.%${filters.search}%,event.ilike.%${filters.search}%,context.ilike.%${filters.search}%`
        );
      }
      
      if (filters.date_from) {
        const fromDate = formatForDatabase(filters.date_from);
        if (fromDate) {
          query = query.gte('created_at', fromDate);
        }
      }
      
      if (filters.date_to) {
        const toDate = formatForDatabase(filters.date_to);
        if (toDate) {
          query = query.lte('created_at', toDate);
        }
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as SystemLog[];
    }
  });
  
  return { data, isLoading, error, refetch, isFetching };
};

/**
 * Hook to fetch available log modules
 */
export const useLogModules = (tenantId?: string) => {
  return useQuery({
    queryKey: ['log-modules', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('module')
        .order('module');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Use Set to get unique values
      const uniqueModules = new Set<string>();
      data.forEach((item) => {
        if (item.module) uniqueModules.add(item.module);
      });
      
      return Array.from(uniqueModules);
    }
  });
};

/**
 * Hook to fetch available log events
 */
export const useLogEvents = (tenantId?: string) => {
  return useQuery({
    queryKey: ['log-events', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('event')
        .order('event');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Use Set to get unique values
      const uniqueEvents = new Set<string>();
      data.forEach((item) => {
        if (item.event) uniqueEvents.add(item.event);
      });
      
      return Array.from(uniqueEvents);
    }
  });
};

/**
 * Hook to get filter options for logs
 */
export const useLogFilterOptions = () => {
  const { tenantId } = useTenantId();
  const { data: modules = [] } = useLogModules(tenantId);
  const { data: events = [] } = useLogEvents(tenantId);
  
  return { modules, events };
};
