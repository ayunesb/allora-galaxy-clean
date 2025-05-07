
import { v4 as uuid } from 'uuid';
import { PluginResult } from '@/types/fixed';
import { supabase } from '@/integrations/supabase/client';

export type PluginFunction = (input: any) => Promise<any>;

/**
 * Validates a strategy exists and belongs to the tenant
 * @param strategyId The strategy ID to validate
 * @param tenantId The tenant ID for validation
 * @returns Validation result with strategy data or error
 */
export const validateStrategy = async (strategyId: string, tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('id, title, status')
      .eq('id', strategyId)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      return { valid: false, error: error.message, strategy: null };
    }
    
    if (!data) {
      return { valid: false, error: 'Strategy not found', strategy: null };
    }
    
    return { valid: true, strategy: data, error: null };
  } catch (error: any) {
    return { valid: false, error: error.message, strategy: null };
  }
};

/**
 * Fetches plugins associated with a strategy
 * @param strategyId The strategy ID
 * @returns Plugins array or error
 */
export const fetchPluginsForStrategy = async (strategyId: string) => {
  try {
    // This is a simplified implementation
    // In a real application, you would have a proper relationship between strategies and plugins
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
      .limit(3);
      
    if (error) {
      return { plugins: null, error: error.message };
    }
    
    return { plugins: data, error: null };
  } catch (error: any) {
    return { plugins: null, error: error.message };
  }
};

/**
 * Executes a plugin function and returns a standardized result
 * @param pluginId Plugin identifier
 * @param pluginFn Plugin function to execute
 * @param input Input data for the plugin
 * @returns Plugin execution result
 */
export const executePlugin = async (
  pluginId: string,
  pluginFn: PluginFunction,
  input: any,
): Promise<PluginResult> => {
  const startTime = Date.now();
  try {
    const output = await pluginFn(input);
    
    return {
      pluginId,
      status: 'success',
      output,
      executionTime: (Date.now() - startTime) / 1000,
      xpEarned: 10 // Default XP for successful execution
    };
  } catch (error: any) {
    return {
      pluginId,
      status: 'failure',
      error: error.message || 'Unknown error',
      executionTime: (Date.now() - startTime) / 1000,
      xpEarned: 0
    };
  }
};

/**
 * Validates a plugin's basic properties
 * @param plugin Plugin to validate
 * @returns true if valid, throws error if invalid
 */
export const validatePlugin = (plugin: any) => {
  if (!plugin) throw new Error('Plugin not found');
  if (!plugin.name) throw new Error('Plugin has no name');
  if (plugin.status !== 'active') throw new Error('Plugin is not active');
  return true;
};
