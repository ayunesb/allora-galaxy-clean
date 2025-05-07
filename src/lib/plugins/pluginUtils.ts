
import { v4 as uuid } from 'uuid';
import { PluginResult } from '@/types/fixed';

export type PluginFunction = (input: any) => Promise<any>;

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

export const validatePlugin = (plugin: any) => {
  if (!plugin) throw new Error('Plugin not found');
  if (!plugin.name) throw new Error('Plugin has no name');
  if (plugin.status !== 'active') throw new Error('Plugin is not active');
  return true;
};
