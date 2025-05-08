
-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the scheduled intelligence function to run daily at 8 AM UTC
SELECT cron.schedule(
  'scheduled-intelligence-daily',
  '0 8 * * *',  -- Run at 8 AM UTC every day
  $$
  SELECT
    net.http_post(
      url:='https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/scheduledIntelligence',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || (SELECT value FROM secrets.secrets WHERE key = 'SUPABASE_ANON_KEY') || '"}'::jsonb,
      body:='{"type": "daily_run"}'::jsonb
    ) as request_id;
  $$
);

-- Schedule KPI monitoring every 4 hours to catch urgent issues
SELECT cron.schedule(
  'kpi-monitoring-every-4-hours',
  '0 */4 * * *',  -- Every 4 hours
  $$
  SELECT
    net.http_post(
      url:='https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/scheduledIntelligence',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || (SELECT value FROM secrets.secrets WHERE key = 'SUPABASE_ANON_KEY') || '"}'::jsonb,
      body:='{"type": "kpi_monitoring", "priority": "high"}'::jsonb
    ) as request_id;
  $$
);

-- Schedule a weekly benchmark report on Mondays at 9 AM UTC
SELECT cron.schedule(
  'weekly-benchmark-report',
  '0 9 * * 1',  -- 9 AM UTC on Mondays
  $$
  SELECT
    net.http_post(
      url:='https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/scheduledIntelligence',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || (SELECT value FROM secrets.secrets WHERE key = 'SUPABASE_ANON_KEY') || '"}'::jsonb,
      body:='{"type": "weekly_benchmark", "generate_report": true}'::jsonb
    ) as request_id;
  $$
);
