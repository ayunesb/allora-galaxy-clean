
import React from 'react';
import { format } from 'date-fns';
import { formatDistance } from 'date-fns/formatDistance';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PluginLog } from '@/types/logs';

interface PluginLogItemProps {
  log: PluginLog;
}

const PluginLogItem: React.FC<PluginLogItemProps> = ({ log }) => {
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
    } catch (e) {
      return dateString;
    }
  };
  
  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return '';
    }
  };
  
  const getStatusIcon = () => {
    if (!log.status) return null;
    
    switch (log.status) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className={`border-l-4 ${
      log.status === 'error' ? 'border-l-destructive' : 
      log.status === 'warning' ? 'border-l-warning' : 
      log.status === 'success' ? 'border-l-success' : 
      'border-l-primary'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {getStatusIcon()}
              <span>{log.message}</span>
            </CardTitle>
            <CardDescription>
              {formatDateTime(log.created_at)} ({getTimeAgo(log.created_at)})
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {(log.data || log.error) && (
        <CardContent className="pb-2">
          {log.data && (
            <div className="text-sm space-y-1">
              <div className="font-medium">Data:</div>
              <pre className="text-xs bg-muted p-2 rounded-sm overflow-auto max-h-40">
                {typeof log.data === 'object' 
                  ? JSON.stringify(log.data, null, 2) 
                  : String(log.data)}
              </pre>
            </div>
          )}
          
          {log.error && (
            <div className="text-sm space-y-1 mt-3">
              <div className="font-medium text-destructive">Error:</div>
              <pre className="text-xs bg-destructive/10 text-destructive p-2 rounded-sm overflow-auto max-h-40">
                {log.error}
              </pre>
            </div>
          )}
        </CardContent>
      )}
      
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <div>Plugin ID: {log.plugin_id}</div>
          {log.execution_time !== undefined && (
            <div>Execution Time: {log.execution_time.toFixed(2)}ms</div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PluginLogItem;
