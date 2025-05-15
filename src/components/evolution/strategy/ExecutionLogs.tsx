
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import type { StrategyExecution } from '@/types/strategy';

interface ExecutionLogsProps {
  executions: StrategyExecution[];
  formatDate: (date: string) => string;
  renderUser: (userId: string | null) => string;
}

/**
 * Execution Logs Component
 * Displays a list of strategy executions with status, timestamps, and results
 */
const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ 
  executions,
  formatDate,
  renderUser
}) => {
  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'failure':
        return <X className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No execution logs available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {executions.map((execution) => (
              <div 
                key={execution.id} 
                className="border rounded-lg p-4 hover:bg-muted/25 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(execution.status)}>
                      <span className="flex items-center">
                        {getStatusIcon(execution.status)}
                        <span className="ml-1">{execution.status}</span>
                      </span>
                    </Badge>
                    
                    {execution.version && (
                      <Badge variant="outline">
                        v{execution.version}
                      </Badge>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {execution.created_at ? formatDate(execution.created_at) : formatDate(execution.start_time)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{execution.executed_by ? renderUser(execution.executed_by) : 'System'}</span>
                  </div>
                  
                  {execution.duration_ms !== undefined && (
                    <div>Duration: {execution.duration_ms}ms</div>
                  )}
                </div>
                
                {execution.error && (
                  <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                    <p className="font-medium">Error:</p>
                    <p className="font-mono text-xs break-all">{execution.error}</p>
                  </div>
                )}
                
                {execution.result && (
                  <div className="mt-2 bg-muted/30 rounded-md p-3">
                    <p className="font-medium text-sm mb-1">Result:</p>
                    <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-32">
                      {typeof execution.result === 'string' 
                        ? execution.result 
                        : JSON.stringify(execution.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
