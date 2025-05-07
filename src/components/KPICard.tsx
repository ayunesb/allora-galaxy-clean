
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  trendDirection?: 'up' | 'down' | 'neutral';
  formatter?: (value: string | number) => string;
}

const KPICard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  loading = false,
  trendDirection,
  formatter = (val) => String(val),
}: KPICardProps) => {
  // If change exists but trendDirection wasn't specified, calculate it
  const calculatedTrendDirection = trendDirection || 
    (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined);
  
  // Colors based on trend direction
  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };
  
  const trendIcon = {
    up: <TrendingUp className="h-4 w-4" />,
    down: <TrendingDown className="h-4 w-4" />,
    neutral: <Minus className="h-4 w-4" />,
  };
  
  // Format the change value with + or - prefix
  const formatChange = (val?: number) => {
    if (val === undefined) return '';
    return val > 0 ? `+${val}` : val.toString();
  };
  
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-40" />
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-28 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatter(value)}
        </div>
        {(change !== undefined || changeLabel) && (
          <div className="flex items-center pt-1">
            {calculatedTrendDirection && (
              <span className={`${trendColorClasses[calculatedTrendDirection]} mr-1`}>
                {trendIcon[calculatedTrendDirection]}
              </span>
            )}
            <p className={cn(
              "text-xs",
              calculatedTrendDirection ? trendColorClasses[calculatedTrendDirection] : "text-muted-foreground"
            )}>
              {change !== undefined ? formatChange(change) : ''} {changeLabel || ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
