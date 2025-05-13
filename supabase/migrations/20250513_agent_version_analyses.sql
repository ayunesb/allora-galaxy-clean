
-- Create the agent_version_analyses table to store AI-generated diff analyses
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

-- Add Row Level Security (RLS)
ALTER TABLE public.agent_version_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting analyses based on tenant membership
CREATE POLICY "Users can view agent version analyses if they are a member of the tenant"
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

-- Create policy for inserting analyses (admin or system role)
CREATE POLICY "Only admins can insert agent version analyses"
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

-- Create indexes for performance
CREATE INDEX idx_agent_version_analyses_agent_version_id ON public.agent_version_analyses(agent_version_id);
CREATE INDEX idx_agent_version_analyses_plugin_id ON public.agent_version_analyses(plugin_id);

-- Add created_by field to strategies table to track AI-generated strategies
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT FALSE;

-- Add is_generated_by_ai field to strategies
COMMENT ON COLUMN public.strategies.created_by_ai IS 'Indicates if the strategy was created by AI';
