
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface EvolutionHistoryProps {
  history: any[];
  renderUser?: (userId: string | undefined) => any;
  formatDate?: (dateStr: string) => string;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({ 
  history,
  renderUser = (userId) => userId || 'Unknown',
  formatDate = (dateStr) => dateStr
}) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolution History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No evolution history available for this strategy.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'strategy_created':
        return <Badge variant="default">Created</Badge>;
      case 'strategy_approved':
        return <Badge variant="success">Approved</Badge>;
      case 'strategy_rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'strategy_executed':
        return <Badge variant="secondary">Executed</Badge>;
      case 'strategy_updated':
        return <Badge variant="outline">Updated</Badge>;
      case 'strategy_completed':
        return <Badge>Completed</Badge>;
      default:
        return <Badge variant="outline">{event}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((item, index) => (
            <div key={item.id} className="relative pb-6">
              {index < history.length - 1 && (
                <span className="absolute left-[15px] top-[30px] bottom-0 w-[2px] bg-muted" />
              )}
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                  </div>
                </div>
                
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium">
                      {getEventBadge(item.event)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  
                  {item.context && (
                    <div className="mt-2 text-sm">
                      {item.context.description && (
                        <p>{item.context.description}</p>
                      )}
                      
                      {item.context.user_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {renderUser(item.context.user_id)}
                        </p>
                      )}
                      
                      {item.context.changes && (
                        <div className="mt-2 text-xs">
                          <p className="font-medium">Changes:</p>
                          <ul className="list-disc list-inside pl-2">
                            {Object.entries(item.context.changes).map(([key, value]: [string, any]) => (
                              <li key={key}>{key}: {value.toString()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
