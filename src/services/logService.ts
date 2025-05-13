import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook to get log filter options from the database
 * @returns Object containing modules and events arrays
 */
export function useLogFilterOptions() {
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        setLoading(true);
        
        // Fetch distinct modules
        const { data: moduleData, error: moduleError } = await supabase
          .from('system_logs')
          .select('module')
          .is('module', 'not.null')
          .order('module')
          .limit(100);
          
        if (moduleError) {
          console.error('Error fetching modules:', moduleError);
        } else {
          const uniqueModules = Array.from(
            new Set(moduleData.map(item => item.module))
          ).filter(Boolean);
          setModules(uniqueModules);
        }
        
        // Fetch distinct events
        const { data: eventData, error: eventError } = await supabase
          .from('system_logs')
          .select('event')
          .is('event', 'not.null')
          .order('event')
          .limit(100);
          
        if (eventError) {
          console.error('Error fetching events:', eventError);
        } else {
          const uniqueEvents = Array.from(
            new Set(eventData.map(item => item.event))
          ).filter(Boolean);
          setEvents(uniqueEvents);
        }
      } catch (error) {
        console.error('Error in useLogFilterOptions:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFilterOptions();
  }, []);
  
  return { modules, events, loading };
}

/**
 * Filter logs by search term
 * @param logs Array of logs to filter
 * @param searchTerm Search term to filter by
 * @returns Filtered logs array
 */
export function filterLogsBySearchTerm(logs: any[], searchTerm: string) {
  if (!searchTerm.trim()) return logs;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return logs.filter(log => {
    // Search in common fields
    if (log.id?.toLowerCase().includes(lowerSearchTerm)) return true;
    if (log.module?.toLowerCase().includes(lowerSearchTerm)) return true;
    if (log.event?.toLowerCase().includes(lowerSearchTerm)) return true;
    if (log.description?.toLowerCase().includes(lowerSearchTerm)) return true;
    if (log.user_id?.toLowerCase().includes(lowerSearchTerm)) return true;
    
    // Search in context object if it exists
    if (log.context) {
      const contextStr = JSON.stringify(log.context).toLowerCase();
      if (contextStr.includes(lowerSearchTerm)) return true;
    }
    
    // Search in entity-specific fields for audit logs
    if (log.entity_type?.toLowerCase().includes(lowerSearchTerm)) return true;
    if (log.entity_id?.toLowerCase().includes(lowerSearchTerm)) return true;
    if (log.action?.toLowerCase().includes(lowerSearchTerm)) return true;
    
    return false;
  });
}

/**
 * Format log context for display
 * @param context Log context object
 * @returns Formatted context string
 */
export function formatLogContext(context: any): string {
  if (!context) return '';
  
  try {
    if (typeof context === 'string') {
      return context;
    }
    
    return JSON.stringify(context, null, 2);
  } catch (error) {
    console.error('Error formatting log context:', error);
    return String(context);
  }
}
