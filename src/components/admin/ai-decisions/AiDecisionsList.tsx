
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pencil, Eye } from 'lucide-react';

export interface AiDecision {
  id: string;
  decision_type: string;
  input: Record<string, any>;
  output: Record<string, any>;
  confidence: number;
  created_at: string;
  strategy_id?: string;
  plugin_id?: string;
  tenant_id?: string;
  reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  review_outcome?: 'approved' | 'rejected' | 'modified';
}

interface AiDecisionsListProps {
  decisions: AiDecision[];
  isLoading: boolean;
  onViewDecision: (decision: AiDecision) => void;
  onReviewDecision: (decision: AiDecision) => void;
}

export const AiDecisionsList: React.FC<AiDecisionsListProps> = ({
  decisions,
  isLoading,
  onViewDecision,
  onReviewDecision
}) => {
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
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No AI decisions found.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Decision Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions.map((decision) => (
                <TableRow key={decision.id}>
                  <TableCell>
                    <div className="font-medium">{decision.decision_type}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {decision.id.substring(0, 8)}...
                    </div>
                  </TableCell>
                  <TableCell>{getConfidenceBadge(decision.confidence)}</TableCell>
                  <TableCell>{getReviewStatusBadge(decision)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(decision.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDecision(decision)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {!decision.reviewed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReviewDecision(decision)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AiDecisionsList;
