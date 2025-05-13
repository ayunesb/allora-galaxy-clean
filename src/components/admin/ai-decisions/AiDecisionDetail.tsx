
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { AiDecision } from './AiDecisionsList';

interface AiDecisionDetailProps {
  decision: AiDecision | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AiDecisionDetail: React.FC<AiDecisionDetailProps> = ({
  decision,
  open,
  onOpenChange,
}) => {
  if (!decision) return null;

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'PPP p');
    } catch (error) {
      return dateStr;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) return <Badge variant="success">{(confidence * 100).toFixed(1)}%</Badge>;
    if (confidence >= 0.7) return <Badge variant="warning">{(confidence * 100).toFixed(1)}%</Badge>;
    return <Badge variant="destructive">{(confidence * 100).toFixed(1)}%</Badge>;
  };

  const getReviewStatusBadge = (decision: AiDecision) => {
    if (!decision.reviewed) return <Badge variant="outline">Not Reviewed</Badge>;
    
    switch (decision.review_outcome) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'modified':
        return <Badge variant="warning">Modified</Badge>;
      default:
        return <Badge variant="secondary">Reviewed</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-semibold text-lg">AI Decision: {decision.decision_type}</span>
            <div className="ml-auto flex items-center gap-2">
              {getConfidenceBadge(decision.confidence)}
              {getReviewStatusBadge(decision)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Created:</span> {formatDate(decision.created_at)}
            </div>
            <div>
              <span className="font-medium">ID:</span> {decision.id}
            </div>
            {decision.strategy_id && (
              <div>
                <span className="font-medium">Strategy ID:</span> {decision.strategy_id}
              </div>
            )}
            {decision.plugin_id && (
              <div>
                <span className="font-medium">Plugin ID:</span> {decision.plugin_id}
              </div>
            )}
            {decision.reviewed && (
              <>
                <div>
                  <span className="font-medium">Reviewed By:</span> {decision.reviewed_by || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Reviewed At:</span> {formatDate(decision.reviewed_at)}
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Input Data</h3>
            <Card className="p-4">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(decision.input, null, 2)}
              </pre>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Output / Decision</h3>
            <Card className="p-4">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(decision.output, null, 2)}
              </pre>
            </Card>
          </div>

          {decision.reviewed && decision.review_outcome === 'modified' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Modified Output</h3>
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(decision.output, null, 2)}
                </pre>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiDecisionDetail;
