
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SystemLog, AuditLog, LogFilters } from '@/types';

/**
 * Fetch system logs with optional filters
 */
export const fetchSystemLogs = async (filters: LogFilters = {}) => {
  let query = supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (filters.module) {
    query = query.eq('module', filters.module);
  }
  
  if (filters.event) {
    query = query.eq('event', filters.event);
  }
  
  if (filters.tenant_id) {
    query = query.eq('tenant_id', filters.tenant_id);
  }
  
  if (filters.searchTerm) {
    query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from.toISOString());
  }
  
  if (filters.date_to) {
    // Add 1 day to include the entire day
    const endDate = new Date(filters.date_to);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('created_at', endDate.toISOString());
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching system logs: ${error.message}`);
  }
  
  return data as SystemLog[];
};

/**
 * Fetch audit logs with optional filters
 */
export const fetchAuditLogs = async (filters: LogFilters = {}) => {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (filters.module) {
    query = query.eq('entity_type', filters.module);
  }
  
  if (filters.event) {
    query = query.eq('action', filters.event);
  }
  
  if (filters.tenant_id) {
    query = query.eq('tenant_id', filters.tenant_id);
  }
  
  if (filters.searchTerm) {
    query = query.or(`action.ilike.%${filters.searchTerm}%,entity_type.ilike.%${filters.searchTerm}%`);
  }
  
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from.toISOString());
  }
  
  if (filters.date_to) {
    // Add 1 day to include the entire day
    const endDate = new Date(filters.date_to);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt('created_at', endDate.toISOString());
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching audit logs: ${error.message}`);
  }
  
  return data as AuditLog[];
};

/**
 * Get unique log modules
 */
export const fetchLogModules = async () => {
  const { data, error } = await supabase
    .from('system_logs')
    .select('module')
    .order('module')
    .distinct();
    
  if (error) {
    throw new Error(`Error fetching log modules: ${error.message}`);
  }
  
  return data.map(item => item.module);
};

/**
 * Get unique log events
 */
export const fetchLogEvents = async () => {
  const { data, error } = await supabase
    .from('system_logs')
    .select('event')
    .order('event')
    .distinct();
    
  if (error) {
    throw new Error(`Error fetching log events: ${error.message}`);
  }
  
  return data.map(item => item.event);
};

/**
 * Hook to fetch system logs with optional filters
 */
export const useSystemLogs = (filters: LogFilters = {}) => {
  return useQuery({
    queryKey: ['systemLogs', filters],
    queryFn: () => fetchSystemLogs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch audit logs with optional filters
 */
export const useAuditLogs = (filters: LogFilters = {}) => {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch unique log modules
 */
export const useLogModules = () => {
  return useQuery({
    queryKey: ['logModules'],
    queryFn: fetchLogModules,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Hook to fetch unique log events
 */
export const useLogEvents = () => {
  return useQuery({
    queryKey: ['logEvents'],
    queryFn: fetchLogEvents,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};
