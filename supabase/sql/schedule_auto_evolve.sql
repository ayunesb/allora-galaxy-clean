
-- Enable the pg_cron and pg_net extensions if they're not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the autoEvolveAgents function to run daily at midnight
SELECT cron.schedule(
  'auto-evolve-agents-daily',
  '0 0 * * *', -- Midnight every day
  $$
  SELECT
    net.http_post(
      url:='https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/autoEvolveAgents',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
