
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { PluginLog } from '@/types';

interface PluginLogItemProps {
  log: PluginLog;
}

export const PluginLogItem: React.FC<PluginLogItemProps> = ({ log }) => {
  // Format timestamp
  const formattedTime = log.created_at 
    ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')
    : 'Unknown time';

  // Determine status icon
  const StatusIcon = () => {
    switch (log.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failure':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format execution time
  const executionTime = log.execution_time 
    ? `${log.execution_time.toFixed(2)}s`
    : 'N/A';

  // Format XP earned
  const xpEarned = log.xp_earned !== undefined 
    ? `+${log.xp_earned} XP`
    : '';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <StatusIcon />
            <div className="ml-3">
              <div className="flex items-center">
                <h4 className="font-medium">
                  Plugin Execution
                </h4>
                <Badge 
                  variant={log.status === 'success' ? 'success' : log.status === 'failure' ? 'destructive' : 'outline'}
                  className="ml-2"
                >
                  {log.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formattedTime}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <div>{executionTime}</div>
            {xpEarned && <div className="text-green-600 font-medium">{xpEarned}</div>}
          </div>
        </div>
        
        {log.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {log.error}
          </div>
        )}
        
        {(log.input || log.output) && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {log.input && (
              <div className="text-sm">
                <div className="font-medium mb-1">Input:</div>
                <pre className="bg-gray-50 p-2 rounded overflow-x-auto text-xs">
                  {JSON.stringify(log.input, null, 2)}
                </pre>
              </div>
            )}
            {log.output && (
              <div className="text-sm">
                <div className="font-medium mb-1">Output:</div>
                <pre className="bg-gray-50 p-2 rounded overflow-x-auto text-xs">
                  {JSON.stringify(log.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PluginLogItem;
