
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { LogFilters, SystemLog } from '@/types/logs';

// Cache for module and event lists
let cachedModules: string[] | null = null;
let cachedEvents: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches system logs with optimized querying
 */
export const fetchSystemLogs = async (filters: LogFilters = {}): Promise<SystemLog[]> => {
  let query = supabase
    .from('system_logs')
    .select('*');

  // Apply sorting consistently
  query = query.order('created_at', { ascending: false });
  
  // Apply filters efficiently using appropriate operators
  if (filters.searchTerm) {
    // Use or() for multiple column search
    query = query.or(`event.ilike.%${filters.searchTerm}%,module.ilike.%${filters.searchTerm}%,context.message.ilike.%${filters.searchTerm}%`);
  }
  
  if (filters.module) {
    query = query.eq('module', filters.module);
  }
  
  if (filters.event) {
    query = query.eq('event', filters.event);
  }
  
  if (filters.tenant_id) {
    query = query.eq('tenant_id', filters.tenant_id);
  }
  
  // Date range filtering
  if (filters.fromDate) {
    const fromDate = typeof filters.fromDate === 'string' 
      ? filters.fromDate 
      : format(filters.fromDate, 'yyyy-MM-dd');
    
    query = query.gte('created_at', `${fromDate}T00:00:00`);
  }
  
  if (filters.toDate) {
    const toDate = typeof filters.toDate === 'string'
      ? filters.toDate
      : format(filters.toDate, 'yyyy-MM-dd');
    
    query = query.lte('created_at', `${toDate}T23:59:59`);
  }
  
  // Pagination with default limits
  const limit = filters.limit || 20;
  query = query.limit(limit);
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + limit - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching system logs:', error);
    throw error;
  }
  
  return data as SystemLog[];
};

/**
 * Fetch log modules with caching
 */
export const fetchLogModules = async (): Promise<string[]> => {
  const now = Date.now();
  
  // Return cached data if valid
  if (cachedModules && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedModules;
  }
  
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('module')
      .order('module');
    
    if (error) {
      throw error;
    }
    
    // Extract unique module names
    const uniqueModules = Array.from(new Set(data.map(item => item.module).filter(Boolean)));
    
    // Update cache
    cachedModules = uniqueModules;
    cacheTimestamp = now;
    
    return uniqueModules;
  } catch (error) {
    console.error('Error fetching log modules:', error);
    // Return cached data even if expired in case of error
    return cachedModules || [];
  }
};

/**
 * Fetch log events with caching
 */
export const fetchLogEvents = async (): Promise<string[]> => {
  const now = Date.now();
  
  // Return cached data if valid
  if (cachedEvents && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedEvents;
  }
  
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('event')
      .order('event');
    
    if (error) {
      throw error;
    }
    
    // Extract unique event names
    const uniqueEvents = Array.from(new Set(data.map(item => item.event).filter(Boolean)));
    
    // Update cache
    cachedEvents = uniqueEvents;
    cacheTimestamp = now;
    
    return uniqueEvents;
  } catch (error) {
    console.error('Error fetching log events:', error);
    // Return cached data even if expired in case of error
    return cachedEvents || [];
  }
};

/**
 * Fetch tenants (no caching as tenant list may change frequently)
 */
export const fetchTenants = async () => {
  const { data, error } = await supabase
    .from('tenants')
    .select('id, name');
    
  if (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
  
  return data;
};
