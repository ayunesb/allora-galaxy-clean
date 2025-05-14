
import { supabase } from '@/integrations/supabase/client';
import type { SystemEventModule } from '@/types/shared';
import type { SystemLog } from '@/types/logs';

/**
 * Log a system event to the database
 */
export const logSystemEvent = async (
  module: SystemEventModule,
  level: 'info' | 'warning' | 'error',
  details: {
    description: string;
    [key: string]: any;
  },
  tenantId: string = 'system'
): Promise<void> => {
  try {
    const { error } = await supabase.from('system_logs').insert({
      module,
      level,
      description: details.description,
      tenant_id: tenantId,
      metadata: JSON.stringify(details)
    });

    if (error) {
      console.error('Failed to log system event:', error);
    }
  } catch (err) {
    console.error('Error logging system event:', err);
  }
};

/**
 * Fetch system logs from the database
 */
export const fetchSystemLogs = async (): Promise<SystemLog[]> => {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Failed to fetch system logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching system logs:', err);
    return [];
  }
};

export default logSystemEvent;
