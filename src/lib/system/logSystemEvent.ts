
import { SystemEventModule } from '@/types/shared';

/**
 * Log a system event to the database
 * 
 * @param module The system module generating the event
 * @param level The severity level of the event
 * @param eventData The event data/context
 * @param tenantId The tenant ID (optional)
 * @returns Promise resolving to the logged event
 */
export const logSystemEvent = async (
  module: SystemEventModule,
  level: 'info' | 'warning' | 'error',
  eventData: { description: string; [key: string]: any },
  tenantId: string = 'system'
): Promise<any> => {
  // Log to console for development
  console.log(`[${level.toUpperCase()}][${module}][${tenantId}]`, eventData);

  // In a real implementation, this would send to the database
  // For now, we're just implementing the interface to fix build errors
  return {
    id: `log_${Date.now()}`,
    created_at: new Date().toISOString(),
    description: eventData.description,
    level,
    module,
    tenant_id: tenantId,
    metadata: eventData
  };
};

export default logSystemEvent;
