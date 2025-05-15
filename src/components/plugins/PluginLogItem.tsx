import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { PluginLog } from '@/types/logs';

interface PluginLogItemProps {
  log: PluginLog;
}

export const PluginLogItem: React.FC<PluginLogItemProps> = ({ log }) => {
  const formattedDate = format(new Date(log.created_at), 'PPpp');
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <StatusBadge status={log.status} />
            <span className="text-sm font-medium">Execution ID: {log.execution_id.slice(0, 8)}...</span>
          </div>
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="text-sm space-y-2">
          <div>
            <span className="font-medium">XP Earned:</span> {log.xp_earned}
          </div>
          {log.context && Object.keys(log.context).length > 0 && (
            <div>
              <span className="font-medium">Context:</span>
              <pre className="mt-1 p-2 bg-muted rounded-md text-xs overflow-x-auto">
                {JSON.stringify(log.context, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        <div className="flex gap-2">
          <span>Plugin ID: {log.plugin_id.slice(0, 8)}...</span>
          {log.agent_version_id && <span>Agent: {log.agent_version_id.slice(0, 8)}...</span>}
        </div>
      </CardFooter>
    </Card>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let variant: 'default' | 'destructive' | 'outline' | 'secondary';
  
  switch (status.toLowerCase()) {
    case 'success':
      variant = 'default';
      break;
    case 'error':
    case 'failed':
      variant = 'destructive';
      break;
    case 'pending':
    case 'running':
      variant = 'secondary';
      break;
    default:
      variant = 'outline';
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

export default PluginLogItem;
