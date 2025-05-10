
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export interface ExecutionLogsProps {
  logs: any[];
  renderUser?: (userId: string | undefined) => any;
  formatDate?: (dateStr: string) => string;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ 
  logs,
  renderUser = (userId) => userId || 'Unknown',
  formatDate = (dateStr) => dateStr
}) => {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLogExpand = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No execution logs available for this strategy.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'failure':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map(log => (
            <div 
              key={log.id}
              className="border rounded-lg overflow-hidden"
            >
              <div 
                className="bg-muted/50 p-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleLogExpand(log.id)}
              >
                <div className="flex items-center gap-3">
                  {getStatusBadge(log.status)}
                  <span className="text-sm font-medium">
                    {formatDate(log.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {log.executed_by && (
                    <span className="text-xs text-muted-foreground">
                      Executed by: {renderUser(log.executed_by)}
                    </span>
                  )}
                  <Button variant="ghost" size="sm">
                    {expandedLogs[log.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>
              </div>
              
              {expandedLogs[log.id] && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground">Execution Time</h4>
                      <p className="text-sm">{log.execution_time ? `${log.execution_time.toFixed(2)}s` : 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground">XP Earned</h4>
                      <p className="text-sm">{log.xp_earned || 0}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground">Type</h4>
                      <p className="text-sm capitalize">{log.type || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  {log.output && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Output</h4>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-[200px]">
                        {JSON.stringify(log.output, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {log.error && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 text-destructive">Error</h4>
                      <pre className="text-xs bg-destructive/10 text-destructive p-3 rounded-md overflow-x-auto">
                        {log.error}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
