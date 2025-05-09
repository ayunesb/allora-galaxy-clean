
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HistoryEvent {
  id: string;
  created_at: string;
  event: string;
  context?: {
    user_id?: string;
    executed_by?: string;
    status?: string;
  };
}

interface EvolutionHistoryProps {
  history: HistoryEvent[];
  formatDate: (dateString: string) => string;
  renderUser: (userId: string | undefined) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({ 
  history, 
  formatDate, 
  renderUser, 
  renderStatusBadge 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No evolution history found for this strategy.</p>
        ) : (
          <div className="space-y-4">
            {history.map((event) => {
              const userId = event.context?.user_id || event.context?.executed_by;
              
              return (
                <div key={event.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="w-32 shrink-0">
                    {formatDate(event.created_at)}
                  </div>
                  
                  <div className="flex-grow">
                    <p className="font-medium">
                      {event.event.replace(/_/g, ' ')}
                    </p>
                    
                    {userId && (
                      <div className="text-sm text-muted-foreground">
                        by {renderUser(userId)}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {event.context?.status && renderStatusBadge(event.context.status)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
