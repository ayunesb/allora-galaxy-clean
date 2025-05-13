
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { SystemLog, LogFilters } from '@/types/logs';
import { logSystemEvent } from '@/lib/system/logSystemEvent';

/**
 * Fetch system logs with optional filtering
 * 
 * @param filters Filter options
 * @returns Promise with logs data
 */
export async function fetchSystemLogs(filters: LogFilters = {}): Promise<SystemLog[]> {
  try {
    // Start with basic query
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
      query = query.or(`event.ilike.%${filters.search}%,module.ilike.%${filters.search}%`);
    }
    
    if (filters.date_from) {
      const fromDate = filters.date_from.toISOString();
      query = query.gte('created_at', fromDate);
    }
    
    if (filters.date_to) {
      const toDate = filters.date_to.toISOString();
      query = query.lte('created_at', toDate);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching system logs:', error);
      throw error;
    }

    return data as SystemLog[];
  } catch (err: any) {
    console.error('Error in fetchSystemLogs:', err);
    // Log the error
    await logSystemEvent(
      'system',
      'error',
      { message: 'Failed to fetch system logs', error: err.message },
      filters.tenant_id
    );
    return [];
  }
}

/**
 * Fetch distinct log module names
 * 
 * @param tenantId The tenant ID
 * @returns Promise with module names
 */
export async function fetchLogModules(tenantId?: string): Promise<string[]> {
  try {
    // Using a query to get unique module values
    let query = supabase
      .from('system_logs')
      .select('module')
      .limit(100);
      
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching log modules:', error);
      throw error;
    }
    
    // Extract unique module names
    const uniqueModules = Array.from(new Set(data.map(item => item.module).filter(Boolean)));
    return uniqueModules;
  } catch (err: any) {
    console.error('Error in fetchLogModules:', err);
    return [];
  }
}

/**
 * Fetch distinct log event types
 * 
 * @param tenantId The tenant ID
 * @returns Promise with event types
 */
export async function fetchLogEvents(tenantId?: string): Promise<string[]> {
  try {
    // Using a query to get unique event values
    let query = supabase
      .from('system_logs')
      .select('event')
      .limit(100);
      
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching log events:', error);
      throw error;
    }
    
    // Extract unique event names
    const uniqueEvents = Array.from(new Set(data.map(item => item.event).filter(Boolean)));
    return uniqueEvents;
  } catch (err: any) {
    console.error('Error in fetchLogEvents:', err);
    return [];
  }
}

/**
 * Custom hook to fetch system logs with React Query
 * 
 * @param filters Filter options
 * @returns Query result object
 */
export function useSystemLogs(filters: LogFilters = {}) {
  return useQuery({
    queryKey: ['system_logs', filters],
    queryFn: () => fetchSystemLogs(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Custom hook to fetch log modules with React Query
 * 
 * @param tenantId Optional tenant ID
 * @returns Query result object
 */
export function useLogModules(tenantId?: string) {
  return useQuery({
    queryKey: ['log_modules', tenantId],
    queryFn: () => fetchLogModules(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch log events with React Query
 * 
 * @param tenantId Optional tenant ID
 * @returns Query result object
 */
export function useLogEvents(tenantId?: string) {
  return useQuery({
    queryKey: ['log_events', tenantId],
    queryFn: () => fetchLogEvents(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
