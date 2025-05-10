
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Strategy } from '@/types/strategy';

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
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strategy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold">Title</h3>
            <p>{strategy.title}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold">Status</h3>
            <div>{renderStatusBadge(strategy.status)}</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold">Created By</h3>
            <div>{renderUser(strategy.created_by)}</div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold">Created At</h3>
            <p>{strategy.created_at ? formatDate(strategy.created_at) : 'N/A'}</p>
          </div>
          
          {strategy.approved_by && (
            <div>
              <h3 className="text-sm font-semibold">Approved By</h3>
              <div>{renderUser(strategy.approved_by)}</div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-semibold">Completion</h3>
            <div className="flex items-center gap-2">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${strategy.completion_percentage || 0}%` }}
                ></div>
              </div>
              <span className="text-sm">{strategy.completion_percentage || 0}%</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold">Description</h3>
          <p className="text-sm">{strategy.description}</p>
        </div>
        
        {strategy.tags && strategy.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {strategy.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-muted px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StrategyDetails;
