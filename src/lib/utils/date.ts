
import { format, parse, isValid, parseISO } from 'date-fns';

/**
 * Format a date with a specified format string
 * @param date The date to format
 * @param formatStr Format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export function formatDate(date: Date | null | undefined, formatStr = 'yyyy-MM-dd'): string {
  if (!date) return '';
  return format(date, formatStr);
}

/**
 * Format a date with a time component
 * @param date The date to format
 * @returns Formatted date string with time
 */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Format a date for display in UI
 * @param date The date to format
 * @returns User-friendly formatted date
 */
export function formatDisplayDate(date: Date | null | undefined): string {
  if (!date) return '';
  return format(date, 'PPP');
}

/**
 * Format a date for database insertion
 * @param date The date to format
 * @returns ISO formatted date string
 */
export function formatForDatabase(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Parse a date string with a specified format
 * @param dateStr Date string to parse
 * @param formatStr Format string (default: 'yyyy-MM-dd')
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(dateStr: string | null | undefined, formatStr = 'yyyy-MM-dd'): Date | null {
  if (!dateStr) return null;
  
  try {
    // Try parsing with the specified format
    const parsedDate = parse(dateStr, formatStr, new Date());
    if (isValid(parsedDate)) return parsedDate;
    
    // Try parsing as ISO date
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) return isoDate;
    
    // Failed to parse
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Safely parse a date string in ISO format
 * @param dateStr ISO date string
 * @returns Parsed Date object or null if invalid
 */
export function parseISODate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing ISO date:', error);
    return null;
  }
}

/**
 * Convert a date object to a date string with specified format
 * @param obj Object containing date fields
 * @param fieldNames Names of date fields to convert
 * @returns New object with converted date fields
 */
export function convertDatesToStrings<T extends Record<string, any>>(
  obj: T,
  fieldNames: (keyof T)[]
): Record<string, any> {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  for (const fieldName of fieldNames) {
    const value = obj[fieldName as string];
    if (value instanceof Date) {
      result[fieldName as string] = formatForDatabase(value);
    }
  }
  
  return result;
}

// Now, let's implement Phase 4.1 by creating a service layer for Supabase operations

<lov-write file_path="src/services/logService.ts">
import { supabase } from '@/lib/supabase';
import { SystemLog, LogFilters } from '@/types/logs';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { SystemEventModule } from '@/types/shared';
import { useQuery } from '@tanstack/react-query';
import { formatForDatabase } from '@/lib/utils/date';

/**
 * Fetch system logs with optional filtering
 * @param filters Optional filters to apply
 * @returns Promise resolving to array of SystemLog objects
 */
export async function fetchSystemLogs(filters: LogFilters = {}): Promise<SystemLog[]> {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.module) {
      query = query.eq('module', filters.module);
    }
    
    if (filters.event) {
      query = query.eq('event', filters.event);
    }
    
    if (filters.tenant_id) {
      query = query.eq('tenant_id', filters.tenant_id);
    }
    
    if (filters.search) {
      query = query.or(`module.ilike.%${filters.search}%,event.ilike.%${filters.search}%`);
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
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching system logs:', error);
      throw error;
    }
    
    return data || [];
    
  } catch (err: any) {
    console.error('Error in fetchSystemLogs:', err);
    // Log the error to the system logs
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
 * Fetch unique module names from system logs
 * @param tenantId Optional tenant ID to filter by
 * @returns Promise resolving to array of module names
 */
export async function fetchLogModules(tenantId?: string): Promise<string[]> {
  try {
    let query = supabase
      .from('system_logs')
      .select('module');
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching log modules:', error);
      throw error;
    }
    
    // Extract unique module names
    const uniqueModules = Array.from(
      new Set(data.map(item => item.module).filter(Boolean))
    );
    
    return uniqueModules;
    
  } catch (err: any) {
    console.error('Error in fetchLogModules:', err);
    return [];
  }
}

/**
 * Fetch unique event types from system logs
 * @param tenantId Optional tenant ID to filter by
 * @returns Promise resolving to array of event types
 */
export async function fetchLogEvents(tenantId?: string): Promise<string[]> {
  try {
    let query = supabase
      .from('system_logs')
      .select('event');
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching log events:', error);
      throw error;
    }
    
    // Extract unique event types
    const uniqueEvents = Array.from(
      new Set(data.map(item => item.event).filter(Boolean))
    );
    
    return uniqueEvents;
    
  } catch (err: any) {
    console.error('Error in fetchLogEvents:', err);
    return [];
  }
}

/**
 * Log a system event and persist it to the database
 * @param module The system module
 * @param event The event type
 * @param context Optional context data
 * @param tenantId Optional tenant ID
 * @returns Promise with operation result
 */
export async function createSystemLog(
  module: SystemEventModule,
  event: string,
  context?: Record<string, any>,
  tenantId?: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    return logSystemEvent(module, event, context, tenantId);
  } catch (err: any) {
    console.error('Error in createSystemLog:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Custom hook to fetch system logs with React Query
 * @param filters Optional filters to apply
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
