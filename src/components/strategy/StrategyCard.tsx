
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StrategyCardProps {
  title: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  tags?: string[];
  onView?: () => void;
  onLaunch?: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({
  title,
  description,
  status,
  createdAt,
  tags = [],
  onView,
  onLaunch
}) => {
  const statusConfig = {
    approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Approved' },
    pending: { icon: Clock, color: 'bg-amber-100 text-amber-800', text: 'Pending' },
    rejected: { icon: AlertTriangle, color: 'bg-red-100 text-red-800', text: 'Rejected' }
  };
  
  const { icon: StatusIcon, color, text } = statusConfig[status];
  
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold truncate">{title}</CardTitle>
          <Badge variant="outline" className={color}>
            <StatusIcon className="h-3.5 w-3.5 mr-1.5" /> {text}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Created {new Date(createdAt).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-end gap-2">
        {onView && (
          <Button variant="outline" size="sm" onClick={onView}>
            View
          </Button>
        )}
        {status === 'approved' && onLaunch && (
          <Button size="sm" onClick={onLaunch}>
            Launch
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default StrategyCard;
