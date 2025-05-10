
import React from 'react';
import { Strategy } from '@/types/strategy';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StrategyDetailsProps {
  strategy: Strategy;
  loading: boolean;
  renderUser: (userId: string | undefined) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
  formatDate: (dateStr: string) => string;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({
  strategy,
  loading,
  renderUser,
  renderStatusBadge,
  formatDate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Strategy Details</span>
          {renderStatusBadge(strategy.status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{strategy.title}</h3>
            <p className="text-muted-foreground">{strategy.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Created By</h3>
              <div>{renderUser(strategy.created_by)}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Date Created</h3>
              <p>{strategy.created_at ? formatDate(strategy.created_at) : 'Unknown'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Approved By</h3>
              <div>{strategy.approved_by ? renderUser(strategy.approved_by) : 'Not approved yet'}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
              <p>{strategy.due_date ? formatDate(strategy.due_date) : 'No due date'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Completion</h3>
              <div className="flex items-center">
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{width: `${strategy.completion_percentage || 0}%`}}
                  />
                </div>
                <span className="ml-2 text-sm">{strategy.completion_percentage || 0}%</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
              <p className="capitalize">{strategy.priority || 'Not set'}</p>
            </div>
          </div>
          
          {strategy.tags && strategy.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {strategy.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyDetails;
