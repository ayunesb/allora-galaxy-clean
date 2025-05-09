
import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps { 
  status: string; 
  errorMessage: string | null; 
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, errorMessage }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case 'started':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Running
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200" title={errorMessage || undefined}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
