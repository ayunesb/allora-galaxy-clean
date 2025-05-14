
-- Create the cron_job_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'running',
  result JSONB,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status ON cron_job_logs(status);

-- Function to log the start of a CRON job execution
CREATE OR REPLACE FUNCTION log_cron_job_start(
  job_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
  job_id UUID;
BEGIN
  -- Insert job start record and return the ID
  INSERT INTO cron_job_logs (
    job_name,
    status,
    metadata
  ) VALUES (
    job_name,
    'running',
    metadata
  ) RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$;

-- Function to log the completion of a CRON job
CREATE OR REPLACE FUNCTION log_cron_job_completion(
  job_id UUID,
  duration_ms INTEGER DEFAULT NULL,
  result JSONB DEFAULT NULL,
  error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  -- Calculate duration if not provided
  IF duration_ms IS NULL THEN
    UPDATE cron_job_logs
    SET 
      end_time = now(),
      duration_ms = EXTRACT(EPOCH FROM (now() - start_time)) * 1000,
      status = CASE WHEN error_message IS NULL THEN 'completed' ELSE 'failed' END,
      result = COALESCE(result, '{}'::jsonb),
      error = error_message
    WHERE id = job_id;
  ELSE
    UPDATE cron_job_logs
    SET 
      end_time = now(),
      duration_ms = duration_ms,
      status = CASE WHEN error_message IS NULL THEN 'completed' ELSE 'failed' END,
      result = COALESCE(result, '{}'::jsonb),
      error = error_message
    WHERE id = job_id;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Function to execute cleanup of old execution logs
CREATE OR REPLACE FUNCTION execute_scheduled_cleanup(
  retention_days INTEGER DEFAULT 30
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  deletion_count INTEGER;
  result JSONB;
BEGIN
  -- Delete old CRON job logs
  DELETE FROM cron_job_logs 
  WHERE start_time < now() - (retention_days || ' days')::interval
  RETURNING COUNT(*) INTO deletion_count;
  
  result = jsonb_build_object(
    'cron_logs_deleted', deletion_count
  );
  
  -- Delete old system logs
  DELETE FROM system_logs 
  WHERE created_at < now() - (retention_days || ' days')::interval
  RETURNING COUNT(*) INTO deletion_count;
  
  result = result || jsonb_build_object(
    'system_logs_deleted', deletion_count
  );
  
  -- Delete old execution logs
  DELETE FROM executions 
  WHERE created_at < now() - (retention_days || ' days')::interval
  RETURNING COUNT(*) INTO deletion_count;
  
  result = result || jsonb_build_object(
    'executions_deleted', deletion_count
  );
  
  -- Delete old plugin logs
  DELETE FROM plugin_logs 
  WHERE created_at < now() - (retention_days || ' days')::interval
  RETURNING COUNT(*) INTO deletion_count;
  
  result = result || jsonb_build_object(
    'plugin_logs_deleted', deletion_count
  );
  
  RETURN result;
END;
$$;

-- Create or replace the get_cron_job_stats function
CREATE OR REPLACE FUNCTION get_cron_job_stats(
  job_filter TEXT DEFAULT NULL,
  days_back INTEGER DEFAULT 7
) RETURNS TABLE (
  job_name TEXT,
  executions INTEGER,
  successful INTEGER,
  failed INTEGER,
  avg_duration_ms NUMERIC,
  last_execution TIMESTAMP WITH TIME ZONE,
  last_status TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    logs.job_name,
    COUNT(*) AS executions,
    COUNT(*) FILTER (WHERE logs.status = 'completed') AS successful,
    COUNT(*) FILTER (WHERE logs.status = 'failed') AS failed,
    COALESCE(AVG(logs.duration_ms) FILTER (WHERE logs.status = 'completed'), 0)::NUMERIC AS avg_duration_ms,
    MAX(logs.start_time) AS last_execution,
    (
      SELECT l2.status 
      FROM cron_job_logs l2 
      WHERE l2.job_name = logs.job_name 
      ORDER BY l2.start_time DESC 
      LIMIT 1
    ) AS last_status
  FROM cron_job_logs logs
  WHERE 
    (job_filter IS NULL OR logs.job_name = job_filter) AND
    logs.start_time > (now() - (days_back || ' days')::interval)
  GROUP BY logs.job_name
  ORDER BY last_execution DESC;
END;
$$;
