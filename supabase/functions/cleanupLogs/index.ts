import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../../lib/corsHeaders';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Number of days to keep logs
const LOG_RETENTION_DAYS = 30;

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client with service role key
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request for optional parameters
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch (e) {
      // Default to empty body
      body = {};
    }

    const retentionDays = (body.retention_days as number) || LOG_RETENTION_DAYS;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    // Clean up plugin logs
    const { data: pluginLogsResult, error: pluginLogsError } = await supabase
      .from('plugin_logs')
      .delete()
      .lt('created_at', cutoffTimestamp)
      .select('count');

    if (pluginLogsError) {
      throw new Error(`Failed to clean up plugin logs: ${pluginLogsError.message}`);
    }

    // Clean up system logs
    const { data: systemLogsResult, error: systemLogsError } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffTimestamp)
      .select('count');

    if (systemLogsError) {
      throw new Error(`Failed to clean up system logs: ${systemLogsError.message}`);
    }

    // Log the cleanup action
    await supabase.from('system_logs').insert({
      tenant_id: body.tenant_id || 'system',
      category: 'maintenance',
      event: 'logs_cleanup',
      details: {
        plugin_logs_deleted: pluginLogsResult?.length || 0,
        system_logs_deleted: systemLogsResult?.length || 0,
        retention_days: retentionDays
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Logs cleanup completed successfully',
        plugin_logs_deleted: pluginLogsResult?.length || 0,
        system_logs_deleted: systemLogsResult?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
