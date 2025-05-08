
import { supabase } from '@/integrations/supabase/client';
import { SystemEventModule, SystemEventType } from '@/types/shared';

/**
 * Log a system event
 * @param tenantId ID of the tenant
 * @param module System module generating the event
 * @param event Event type 
 * @param context Additional context for the event
 * @returns Promise resolving to object containing success flag and optional error message
 */
export async function logSystemEvent(
  tenantId: string | { tenantId: string | null },
  module: SystemEventModule | string,
  event: SystemEventType | string,
  context?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Handle both string tenantId and object with tenantId property
    const actualTenantId = typeof tenantId === 'string' 
      ? tenantId 
      : (tenantId.tenantId || 'system');

    if (!actualTenantId) {
      return { 
        success: false, 
        error: 'Tenant ID is required' 
      };
    }
    
    const { error } = await supabase
      .from('system_logs')
      .insert({
        tenant_id: actualTenantId,
        module,
        event,
        context
      });
    
    if (error) {
      console.error('Error logging system event:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Failed to log system event:', err);
    return { 
      success: false, 
      error: err.message || 'An unknown error occurred' 
    };
  }
}
