
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AuditLog } from '@/types/shared';

interface EvolutionHistoryProps {
  history: AuditLog[];
  formatDate: (dateStr: string) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  history,
  formatDate,
  renderStatusBadge
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No history available for this strategy.
          </div>
        ) : (
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-muted ml-6 mt-6"></div>
            
            <div className="space-y-6 relative">
              {history.map((log) => (
                <div key={log.id} className="flex">
                  <div className="flex-shrink-0 relative">
                    <div className="h-3 w-3 rounded-full bg-primary mt-2 ml-5"></div>
                  </div>
                  
                  <div className="ml-6 flex-1">
                    <div className="text-sm">
                      <div className="font-medium">{log.description}</div>
                      <div className="text-muted-foreground">
                        {log.event_type} • {formatDate(log.created_at)}
                      </div>
                      
                      {log.metadata && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          {Object.entries(log.metadata).map(([key, value]) => {
                            if (key === 'status') {
                              return (
                                <div key={key} className="flex items-center justify-between mb-1">
                                  <span className="capitalize">{key}:</span>
                                  <span>{renderStatusBadge(value as string)}</span>
                                </div>
                              );
                            }
                            return (
                              <div key={key} className="mb-1">
                                <span className="capitalize">{key}:</span>{' '}
                                <span className="font-mono">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
