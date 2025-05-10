
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface ExecutionLog {
  id: string;
  status: string;
  created_at: string;
  execution_time?: number;
  xp_earned?: number;
  error?: string;
  [key: string]: any;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
  formatDate: (dateStr: string) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({
  logs,
  formatDate,
  renderStatusBadge
}) => {
  const [expandedLogs, setExpandedLogs] = React.useState<Set<string>>(new Set());

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No execution logs found for this strategy.
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleExpand(log.id)}
                        >
                          {expandedLogs.has(log.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>{renderStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{log.execution_time?.toFixed(2) || '0'}s</span>
                        </div>
                      </TableCell>
                      <TableCell>+{log.xp_earned || 0} XP</TableCell>
                      <TableCell>
                        {log.error ? (
                          <span className="text-destructive text-xs">{log.error}</span>
                        ) : (
                          <span className="text-xs">Success</span>
                        )}
                      </TableCell>
                    </TableRow>
                    
                    {expandedLogs.has(log.id) && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="p-4 bg-muted/50 rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {log.input && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Input</h4>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.input, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              {log.output && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Output</h4>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.output, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                            
                            {log.error && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Error</h4>
                                <pre className="bg-destructive/10 text-destructive p-2 rounded text-xs overflow-x-auto">
                                  {log.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutionLogs;
