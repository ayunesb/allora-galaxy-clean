
import React from 'react';
import { Strategy } from '@/types';
import { format } from 'date-fns';
import { Calendar, User, Flag } from 'lucide-react';

interface StrategyMetadataProps {
  strategy: Strategy;
}

export const StrategyMetadata: React.FC<StrategyMetadataProps> = ({ strategy }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        {strategy.created_at && (
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">{format(new Date(strategy.created_at), 'MMM d, yyyy')}</p>
            </div>
          </div>
        )}
        
        {strategy.due_date && (
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">Due Date</p>
              <p className="text-muted-foreground">{format(new Date(strategy.due_date), 'MMM d, yyyy')}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {strategy.created_by && (
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">Created By</p>
              <p className="text-muted-foreground">{strategy.created_by.substring(0, 8)}</p>
            </div>
          </div>
        )}
        
        {strategy.priority && (
          <div className="flex items-center text-sm">
            <Flag className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">Priority</p>
              <p className="text-muted-foreground">{strategy.priority}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyMetadata;
