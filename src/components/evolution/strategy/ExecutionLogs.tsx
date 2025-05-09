
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ExecutionLog {
  id: string;
  created_at: string;
  plugin_id?: string;
  status: string;
  executed_by?: string;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
  formatDate: (dateString: string) => string;
  renderUser: (userId: string | undefined) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ 
  logs, 
  formatDate, 
  renderUser, 
  renderStatusBadge 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No execution logs found for this strategy.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                <div className="w-32 shrink-0">
                  {formatDate(log.created_at)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {log.plugin_id ? 'Plugin Execution' : 'Strategy Execution'}
                    </p>
                    {renderStatusBadge(log.status)}
                  </div>
                  
                  {log.executed_by && (
                    <div className="text-sm text-muted-foreground">
                      by {renderUser(log.executed_by)}
                    </div>
                  )}
                </div>
                
                <div>
                  <Button variant="ghost" size="icon" title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
