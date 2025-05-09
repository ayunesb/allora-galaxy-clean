
-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job for scheduledIntelligence (runs daily at midnight)
SELECT cron.schedule(
  'daily-intelligence-processing',
  '0 0 * * *', -- daily at midnight
  $$
  SELECT
    net.http_post(
        url:='{{supabaseUrl}}/functions/v1/scheduledIntelligence',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{supabaseKey}}"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Create cron job for updateKPIs (runs every 6 hours)
SELECT cron.schedule(
  'regular-kpi-updates',
  '0 */6 * * *', -- every 6 hours
  $$
  SELECT
    net.http_post(
        url:='{{supabaseUrl}}/functions/v1/updateKPIs',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{supabaseKey}}"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Create cron job for syncMQLs (runs daily at 2 AM)
SELECT cron.schedule(
  'daily-mql-sync',
  '0 2 * * *', -- daily at 2 AM
  $$
  SELECT
    net.http_post(
        url:='{{supabaseUrl}}/functions/v1/syncMQLs',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{supabaseKey}}"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Create cron job for autoEvolveAgents (runs weekly on Sunday at 3 AM)
SELECT cron.schedule(
  'weekly-agent-evolution',
  '0 3 * * 0', -- weekly on Sunday at 3 AM
  $$
  SELECT
    net.http_post(
        url:='{{supabaseUrl}}/functions/v1/autoEvolveAgents',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{supabaseKey}}"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
