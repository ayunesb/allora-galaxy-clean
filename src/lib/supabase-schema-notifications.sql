
-- Notifications table for user-specific notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  module TEXT CHECK (module IN ('strategy', 'agent', 'plugin', 'system', 'billing')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  related_entity_id UUID,
  related_entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user ON public.notifications (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies to ensure users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    auth.uid() = user_id
  );

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_tenant_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'info',
  p_module TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    tenant_id,
    user_id,
    title,
    description,
    type,
    module,
    link,
    related_entity_id,
    related_entity_type,
    expires_at
  ) VALUES (
    p_tenant_id,
    p_user_id,
    p_title,
    p_description,
    p_type,
    p_module,
    p_link,
    p_related_entity_id,
    p_related_entity_type,
    p_expires_at
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to create notifications for all users in a tenant
CREATE OR REPLACE FUNCTION public.notify_tenant_users(
  p_tenant_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'info',
  p_module TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_notification_id UUID;
BEGIN
  FOR v_user_id IN
    SELECT user_id FROM public.tenant_user_roles WHERE tenant_id = p_tenant_id
  LOOP
    INSERT INTO public.notifications (
      tenant_id,
      user_id,
      title,
      description,
      type,
      module,
      link,
      related_entity_id,
      related_entity_type,
      expires_at
    ) VALUES (
      p_tenant_id,
      v_user_id,
      p_title,
      p_description,
      p_type,
      p_module,
      p_link,
      p_related_entity_id,
      p_related_entity_type,
      p_expires_at
    )
    RETURNING id INTO v_notification_id;
    
    RETURN NEXT v_notification_id;
  END LOOP;
  
  RETURN;
END;
$$;

-- Enable Realtime for the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add cleanup function for expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;
