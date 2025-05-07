
-- Create table to store AI-generated prompt diff analyses
CREATE TABLE IF NOT EXISTS public.agent_version_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID REFERENCES public.agent_versions(id),
  plugin_id UUID REFERENCES public.plugins(id),
  diff_summary TEXT NOT NULL,
  impact_rationale TEXT NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.agent_version_analyses ENABLE ROW LEVEL SECURITY;

-- Allow users to view analyses if they belong to the tenant that owns the plugin
CREATE POLICY "Users can view agent version analyses"
  ON public.agent_version_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.agent_versions av
      JOIN public.plugins p ON av.plugin_id = p.id
      JOIN public.tenant_user_roles tur ON tur.tenant_id = p.tenant_id
      WHERE av.id = agent_version_analyses.agent_version_id
      AND tur.user_id = auth.uid()
    )
  );

-- Allow admins to insert analyses
CREATE POLICY "Admins can insert agent version analyses"
  ON public.agent_version_analyses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.agent_versions av
      JOIN public.plugins p ON av.plugin_id = p.id
      JOIN public.tenant_user_roles tur ON tur.tenant_id = p.tenant_id
      WHERE av.id = agent_version_analyses.agent_version_id
      AND tur.user_id = auth.uid()
      AND tur.role IN ('admin', 'owner')
    )
  );

-- Add created_by_ai field to strategies table to track AI-generated strategies
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT FALSE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_agent_version_analyses_agent_version_id ON public.agent_version_analyses(agent_version_id);
CREATE INDEX IF NOT EXISTS idx_agent_version_analyses_plugin_id ON public.agent_version_analyses(plugin_id);
