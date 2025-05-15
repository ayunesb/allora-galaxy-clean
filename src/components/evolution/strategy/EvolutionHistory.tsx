
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, GitCommit } from 'lucide-react';
import type { StrategyVersion } from '@/types/strategy';

interface EvolutionHistoryProps {
  history: StrategyVersion[];
  formatDate: (date: string | Date) => string;
  renderUser: (userId: string | null) => string;
}

const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  history,
  formatDate,
  renderUser
}) => {
  const getChangeTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'major': return 'bg-blue-100 text-blue-800';
      case 'minor': return 'bg-green-100 text-green-800';
      case 'patch': return 'bg-gray-100 text-gray-800';
      case 'initial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolution History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No evolution history available.</p>
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-0 before:left-3.5 before:h-full before:w-0.5 before:bg-muted before:-z-10 pl-8">
            {history.map((version, index) => (
              <div key={version.id} className="relative">
                <div className="absolute -left-8 mt-1.5 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">v{version.version}</h3>
                    <Badge variant="outline" className={getChangeTypeColor(version.change_type)}>
                      {version.change_type || 'Update'}
                    </Badge>
                    {index === 0 && (
                      <Badge variant="outline" className="bg-primary/20 text-primary">
                        Latest
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDate(version.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{version.created_by ? renderUser(version.created_by) : 'System'}</span>
                    </div>
                  </div>
                  
                  {version.description && (
                    <p className="text-sm mt-1">{version.description}</p>
                  )}
                  
                  {version.changes && (
                    <div className="mt-2 bg-muted/30 rounded-md p-3">
                      <h4 className="text-sm font-medium mb-1">Changes</h4>
                      <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(version.changes, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EvolutionHistory;
