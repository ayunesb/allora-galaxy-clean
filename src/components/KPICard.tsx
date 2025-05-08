
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number; // Keeping for future implementation
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value,
  trend, 
  trendDirection = 'neutral', 
  icon,
  className = ''
}) => {
  const formatTrend = (trend: number) => {
    const formatted = Math.abs(trend).toFixed(1);
    return `${trend >= 0 ? '+' : '-'}${formatted}%`;
  };

  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green-500';
    if (trendDirection === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    if (trendDirection === 'down') return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
      {trend !== undefined && (
        <CardFooter className="pt-0">
          <div className="flex items-center gap-1 text-xs font-medium">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {formatTrend(trend)}
            </span>
            <span className="text-muted-foreground"> vs. previous</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default KPICard;
