
import React from 'react';
import { Strategy } from '@/types/strategy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StrategyDetailsProps {
  strategy: Strategy;
  loading: boolean;
  renderUser: (userId: string | undefined) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
  formatDate: (dateString: string) => string;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ 
  strategy, 
  renderUser, 
  formatDate,
  renderStatusBadge
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <div>Strategy: {strategy.title}</div>
          <div>{renderStatusBadge(strategy.status)}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-lg">{strategy.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Created by</p>
            <div className="pt-1">
              {strategy.created_by ? renderUser(strategy.created_by) : 'System'}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Created at</p>
            <p>{formatDate(strategy.created_at)}</p>
          </div>
          
          {strategy.approved_by && (
            <div>
              <p className="text-sm text-muted-foreground">Approved by</p>
              <div className="pt-1">
                {renderUser(strategy.approved_by)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyDetails;
