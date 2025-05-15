
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  Clock
} from 'lucide-react';
import type { StrategyExecution } from '@/types/strategy';

interface ExecutionLogsProps {
  executions: StrategyExecution[];
  formatDate: (date: string | Date) => string;
  renderUser: (userId: string | null) => string;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({
  executions,
  formatDate,
  renderUser
}) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No execution logs available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id} className="overflow-hidden">
                <div className="p-4 bg-muted/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getStatusIcon(execution.status)}
                      <span className="ml-2 font-medium">{execution.id.substring(0, 8)}...</span>
                      <Badge variant="outline" className={`ml-2 ${getStatusClass(execution.status)}`}>
                        {execution.status}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="outline">{execution.version || 'Unknown'}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(execution.execution_time || execution.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{execution.executed_by ? renderUser(execution.executed_by) : 'System'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {execution.duration_ms ? `${execution.duration_ms}ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {execution.error && (
                  <div className="p-4 border-t border-muted bg-red-50 dark:bg-red-900/10">
                    <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Error</h4>
                    <p className="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap">{execution.error}</p>
                  </div>
                )}
                
                {execution.results && (
                  <div className="p-4 border-t border-muted">
                    <h4 className="text-sm font-medium mb-1">Results</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(execution.results, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
