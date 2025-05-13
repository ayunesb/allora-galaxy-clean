
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SystemLog, AuditLog } from '@/types';

type LogType = 'system' | 'audit';
type LogData = SystemLog | AuditLog;

export const useLogDetails = (logId: string | undefined) => {
  const [currentView, setCurrentView] = useState<'details' | 'raw'>('details');
  const [transformDialogOpen, setTransformDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['log-details', logId],
    queryFn: async () => {
      if (!logId) return null;
      
      // Try to get from system_logs first
      const { data: systemLog, error: systemError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('id', logId)
        .maybeSingle();
      
      if (systemLog) {
        return { log: systemLog, type: 'system' as const };
      }
      
      // If not found in system_logs, try audit_logs
      const { data: auditLog, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', logId)
        .maybeSingle();
      
      if (auditLog) {
        return { log: auditLog, type: 'audit' as const };
      }
      
      if (systemError && auditError) {
        throw new Error('Log not found');
      }
      
      return null;
    },
    enabled: !!logId
  });

  const logData = data?.log as LogData | undefined;
  const logType = data?.type as LogType | undefined;

  const isSystemLog = logType === 'system';

  const toggleView = (view: 'details' | 'raw') => {
    setCurrentView(view);
  };

  const openTransformDialog = () => {
    setTransformDialogOpen(true);
  };

  const closeTransformDialog = () => {
    setTransformDialogOpen(false);
  };

  return {
    logData,
    logType,
    isSystemLog,
    isLoading,
    error,
    refetch,
    currentView,
    toggleView,
    transformDialogOpen,
    openTransformDialog,
    closeTransformDialog
  };
};
