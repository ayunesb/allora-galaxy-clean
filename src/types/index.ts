
/**
 * System log entry type
 */
export interface SystemLog {
  id: string;
  created_at: string;
  module: string;
  event: string;
  context?: Record<string, any>;
  tenant_id?: string;
}

// Re-export types from various domains
export * from './shared';
export * from './auth';
export * from './admin';
export * from './user';

// Re-export types from the onboarding namespace
export * from './onboarding';
