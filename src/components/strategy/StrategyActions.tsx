
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2, FileEdit, Copy, CheckCircle, XCircle } from 'lucide-react';
import { Strategy } from '@/types';

interface StrategyActionsProps {
  strategyId: string;
  status: Strategy['status'];
  isExecuting: boolean;
  onExecute: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
}

export const StrategyActions: React.FC<StrategyActionsProps> = ({
  strategyId,
  status,
  isExecuting,
  onExecute,
  onEdit,
  onDuplicate
}) => {
  const isCompleted = status === 'completed';
  const isRejected = status === 'rejected';
  const canExecute = !isCompleted && !isRejected && !isExecuting;

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      window.location.href = `/strategies/${strategyId}/edit`;
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate();
    } else {
      window.location.href = `/strategies/${strategyId}/duplicate`;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        disabled={!canExecute}
        onClick={onExecute}
        className="flex-1"
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Execute Strategy
          </>
        )}
      </Button>
      
      {status !== 'pending' && (
        <Button variant="outline" onClick={handleEdit}>
          <FileEdit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}
      
      <Button variant="outline" onClick={handleDuplicate}>
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </Button>
      
      {isCompleted && (
        <div className="w-full flex items-center gap-2 mt-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Strategy has been completed
        </div>
      )}
      
      {isRejected && (
        <div className="w-full flex items-center gap-2 mt-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          Strategy has been rejected
        </div>
      )}
    </div>
  );
};

export default StrategyActions;
