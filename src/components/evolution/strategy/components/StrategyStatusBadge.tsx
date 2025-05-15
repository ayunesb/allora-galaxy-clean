
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StrategyStatusBadgeProps {
  status: string;
}

export const StrategyStatusBadge: React.FC<StrategyStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'approved':
      return <Badge variant="success">Approved</Badge>;
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'completed':
      return <Badge variant="default">Completed</Badge>;
    case 'in_progress':
      return <Badge variant="secondary">In Progress</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default StrategyStatusBadge;
