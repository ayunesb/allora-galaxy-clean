
import { createClient } from '@supabase/supabase-js';
import { ExecuteStrategyInput, ExecuteStrategyResult } from '@/lib/strategy/types';
import { runStrategy } from '@/lib/strategy/runStrategy';

export default async function executeStrategy(input: ExecuteStrategyInput): Promise<ExecuteStrategyResult> {
  const startTime = Date.now();
  
  try {
    // Validate required inputs
    if (!input.strategy_id) {
      return {
        success: false,
        error: 'Strategy ID is required',
        execution_time: (Date.now() - startTime) / 1000
      };
    }
    
    if (!input.tenant_id) {
      return {
        success: false,
        error: 'Tenant ID is required',
        execution_time: (Date.now() - startTime) / 1000
      };
    }

    // Optional inputs and their defaults
    input.user_id = input.user_id || null; 
    input.options = input.options || {};
    
    // Create Supabase client with safe fallbacks for different environments
    let supabaseUrl, supabaseKey;
    
    try {
      // Deno environment (Edge Functions)
      supabaseUrl = Deno.env.get('SUPABASE_URL');
      supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    } catch (error) {
      // Node/browser environment
      supabaseUrl = process.env.SUPABASE_URL || 'https://ijrnwpgsqsxzqdemtknz.supabase.co';
      supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo';
    }
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or key is missing');
    }
    
    // Execute the strategy using the runStrategy function
    const result = await runStrategy(input);
    
    // Add execution time to the result
    result.execution_time = (Date.now() - startTime) / 1000;
    
    return result;
  } catch (error: any) {
    // Handle unexpected errors gracefully
    console.error('Error executing strategy:', error);
    
    return {
      success: false,
      error: error.message || 'Unexpected error',
      execution_time: (Date.now() - startTime) / 1000
    };
  }
}
