
-- This migration sets up scheduled cron jobs for edge functions
-- These run on the Supabase serverless infrastructure

-- First, activate pgcron extension if not already activated
-- Note: this may require superuser privileges on self-hosted Postgres
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Also need pg_net for making HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create schedule for updateKPIs - runs daily at midnight UTC
SELECT cron.schedule(
  'update_kpis_daily',
  '0 0 * * *',  -- Every day at midnight (cron syntax)
  $$
    SELECT net.http_post(
      url:='https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/updateKPIs',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo"}'::jsonb,
      body:='{"check_all_tenants": true, "run_mode": "cron"}'::jsonb
    ) AS request_id;
  $$
);

-- Create schedule for syncMQLs - runs every Monday at 6 AM UTC
SELECT cron.schedule(
  'sync_mqls_weekly',
  '0 6 * * 1',  -- Every Monday at 6 AM (cron syntax)
  $$
    SELECT net.http_post(
      url:='https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/syncMQLs',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo"}'::jsonb,
      body:='{"check_all_tenants": true, "run_mode": "cron"}'::jsonb
    ) AS request_id;
  $$
);

-- Create schedule for autoEvolveAgents - runs daily at 3 AM UTC
SELECT cron.schedule(
  'auto_evolve_agents_daily',
  '0 3 * * *',  -- Every day at 3 AM (cron syntax)
  $$
    SELECT net.http_post(
      url:='https://ijrnwpgsqsxzqdemtknz.supabase.co/functions/v1/autoEvolveAgents',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcm53cGdzcXN4enFkZW10a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1ODM4MTgsImV4cCI6MjA2MjE1OTgxOH0.aIwahrPEK098sxdqAvsAJBDRCvyQpa9tb42gYn1hoRo"}'::jsonb,
      body:='{"check_all_tenants": true, "run_mode": "cron", "requires_approval": true}'::jsonb
    ) AS request_id;
  $$
);

-- Create a schedule to clean up old execution logs - runs weekly on Sunday at 2 AM UTC
SELECT cron.schedule(
  'cleanup_old_execution_logs',
  '0 2 * * 0',  -- Every Sunday at 2 AM (cron syntax)
  $$
    DELETE FROM executions
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('success', 'failure');
  $$
);

-- Create a schedule to update system metrics - runs every hour
SELECT cron.schedule(
  'update_system_metrics_hourly',
  '0 * * * *',  -- Every hour (cron syntax)
  $$
    WITH metrics AS (
      SELECT 
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS executions_24h,
        COUNT(*) FILTER (WHERE status = 'success' AND created_at > NOW() - INTERVAL '24 hours') AS successful_executions_24h,
        COUNT(*) FILTER (WHERE status = 'failure' AND created_at > NOW() - INTERVAL '24 hours') AS failed_executions_24h,
        COUNT(DISTINCT tenant_id) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS active_tenants_24h
      FROM executions
    )
    INSERT INTO system_metrics (
      timestamp, 
      executions_24h, 
      successful_executions_24h, 
      failed_executions_24h, 
      active_tenants_24h
    )
    SELECT 
      NOW(),
      executions_24h,
      successful_executions_24h,
      failed_executions_24h,
      active_tenants_24h
    FROM metrics;
  $$
);

-- Create a table to track CRON job execution history
CREATE TABLE IF NOT EXISTS public.cron_job_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add index for faster queries on job history
CREATE INDEX IF NOT EXISTS idx_cron_job_history_job_name ON public.cron_job_history(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_history_execution_time ON public.cron_job_history(execution_time DESC);
CREATE INDEX IF NOT EXISTS idx_cron_job_history_status ON public.cron_job_history(status);

-- Enable RLS on the cron job history table
ALTER TABLE public.cron_job_history ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view cron job history
CREATE POLICY "Admins can view cron job history"
ON public.cron_job_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tenant_user_roles
    WHERE tenant_user_roles.user_id = auth.uid()
    AND tenant_user_roles.role IN ('owner', 'admin')
  )
);

-- Create system metrics table for tracking system performance
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  executions_24h INTEGER,
  successful_executions_24h INTEGER,
  failed_executions_24h INTEGER,
  active_tenants_24h INTEGER,
  execution_time_avg_ms INTEGER,
  additional_metrics JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on the system metrics table
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view system metrics
CREATE POLICY "Admins can view system metrics"
ON public.system_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tenant_user_roles
    WHERE tenant_user_roles.user_id = auth.uid()
    AND tenant_user_roles.role IN ('owner', 'admin')
  )
);

-- Create functions to log job execution start and completion
CREATE OR REPLACE FUNCTION public.log_cron_job_start(
  job_name TEXT,
  metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_id UUID;
BEGIN
  INSERT INTO public.cron_job_history (job_name, status, metadata)
  VALUES (job_name, 'started', COALESCE(metadata, '{}'::jsonb))
  RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_cron_job_completion(
  job_id UUID,
  duration_ms INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cron_job_history
  SET 
    status = CASE WHEN error_message IS NULL THEN 'completed' ELSE 'failed' END,
    duration_ms = COALESCE(duration_ms, EXTRACT(EPOCH FROM now() - execution_time) * 1000),
    error_message = error_message
  WHERE id = job_id;
END;
$$;

-- Create view for cron job statistics
CREATE OR REPLACE VIEW public.cron_job_stats AS
SELECT 
  job_name,
  COUNT(*) AS total_executions,
  COUNT(*) FILTER (WHERE status = 'completed') AS successful_executions,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_executions,
  AVG(duration_ms) FILTER (WHERE status = 'completed') AS avg_duration_ms,
  MAX(execution_time) FILTER (WHERE status = 'completed') AS last_successful_execution,
  MAX(execution_time) AS last_execution
FROM public.cron_job_history
GROUP BY job_name;

-- Grant access to the view
GRANT SELECT ON public.cron_job_stats TO authenticated;
