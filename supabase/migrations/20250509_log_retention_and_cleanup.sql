
-- Add log cleanup scheduled job

SELECT cron.schedule(
  'log-cleanup-weekly', -- name of the cron job
  '0 0 * * 0', -- cron schedule (every Sunday at midnight)
  $$
  SELECT
    net.http_post(
      url:='{{SUPABASE_URL}}/functions/v1/cleanupLogs',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer {{ANON_KEY}}"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Add log retention settings table for future configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only allow admins to select system settings
CREATE POLICY "Admin select system settings" 
  ON public.system_settings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Only allow admins to update system settings
CREATE POLICY "Admin update system settings" 
  ON public.system_settings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM tenant_user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Insert default log retention settings
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'log_retention', 
  '{"plugin_logs_days": 30, "system_logs_days": 90}', 
  'Number of days to retain different types of logs'
)
ON CONFLICT (key) DO NOTHING;
