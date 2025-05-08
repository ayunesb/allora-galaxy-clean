
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Strategy } from '@/types';
import { CheckCircle, Clock, XCircle, AlertCircle, Play } from 'lucide-react';

interface StrategyStatusBadgeProps {
  status: Strategy['status'];
}

export const StrategyStatusBadge: React.FC<StrategyStatusBadgeProps> = ({ status }) => {
  // Define status configurations
  const statusConfig: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
    pending: { 
      label: 'Pending', 
      variant: 'outline',
      icon: <Clock className="h-3 w-3 mr-1" />
    },
    approved: { 
      label: 'Approved', 
      variant: 'outline',
      icon: <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
    },
    rejected: { 
      label: 'Rejected', 
      variant: 'destructive',
      icon: <XCircle className="h-3 w-3 mr-1" />
    },
    in_progress: { 
      label: 'In Progress', 
      variant: 'default',
      icon: <Play className="h-3 w-3 mr-1" />
    },
    completed: { 
      label: 'Completed', 
      variant: 'success',
      icon: <CheckCircle className="h-3 w-3 mr-1" />
    },
    draft: { 
      label: 'Draft', 
      variant: 'secondary',
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
  };

  // Get configuration for current status or use a default
  const config = statusConfig[status] || { 
    label: status.charAt(0).toUpperCase() + status.slice(1), 
    variant: 'outline',
    icon: <Clock className="h-3 w-3 mr-1" />
  };

  return (
    <Badge variant={config.variant as any} className="flex items-center">
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default StrategyStatusBadge;
