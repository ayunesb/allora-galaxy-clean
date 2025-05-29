import React from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Loader2,
  FileEdit,
  Copy,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Strategy } from "@/types";

interface StrategyActionsProps {
  strategyId: string;
  status: Strategy["status"];
  isExecuting: boolean;
  onExecute: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const StrategyActions: React.FC<StrategyActionsProps> = ({
  strategyId,
  status,
  isExecuting,
  onExecute,
  onEdit,
  onDuplicate,
  onApprove,
  onReject,
}) => {
  const isCompleted = status === "completed";
  const isRejected = status === "rejected";
  const isPending = status === "pending";
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
      <Button disabled={!canExecute} onClick={onExecute} className="flex-1">
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

      {isPending && onApprove && (
        <Button
          variant="outline"
          onClick={onApprove}
          className="bg-green-50 border-green-200 hover:bg-green-100"
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Approve
        </Button>
      )}

      {isPending && onReject && (
        <Button
          variant="outline"
          onClick={onReject}
          className="bg-red-50 border-red-200 hover:bg-red-100"
        >
          <ThumbsDown className="mr-2 h-4 w-4" />
          Reject
        </Button>
      )}

      {status !== "pending" && (
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
