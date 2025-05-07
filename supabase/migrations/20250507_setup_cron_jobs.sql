
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
      url:='{{SUPABASE_URL}}/functions/v1/updateKPIs',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{ANON_KEY}}"}'::jsonb,
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
      url:='{{SUPABASE_URL}}/functions/v1/syncMQLs',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{ANON_KEY}}"}'::jsonb,
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
      url:='{{SUPABASE_URL}}/functions/v1/autoEvolveAgents',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{ANON_KEY}}"}'::jsonb,
      body:='{"check_all_tenants": true, "run_mode": "cron", "requires_approval": true}'::jsonb
    ) AS request_id;
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

-- Create function to log job execution start
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

-- Create function to log job execution completion
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

-- Enable RLS on the view
ALTER VIEW public.cron_job_stats OWNER TO postgres;
GRANT SELECT ON public.cron_job_stats TO authenticated;

-- Create RLS policy for the view
COMMENT ON VIEW public.cron_job_stats IS 'Statistics for CRON job executions';
