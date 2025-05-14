
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { TrendDirection } from '@/types';

export interface KPICardProps {
  title: string;
  value: number;
  previous?: number;
  change?: number;
  changePercent?: number;
  direction?: TrendDirection;
  trend?: 'increasing' | 'decreasing' | 'stable';
  unit?: string;
  target?: number;
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previous,
  change,
  changePercent,
  direction = 'neutral',
  trend = 'stable',
  unit = '',
  target,
  className
}) => {
  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M${unit}`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K${unit}`;
    } else {
      return `${val}${unit}`;
    }
  };

  const getDirectionIcon = () => {
    switch (direction) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    if (trend === 'increasing' && direction === 'up') return 'text-green-500';
    if (trend === 'decreasing' && direction === 'down') return 'text-red-500';
    if (trend === 'decreasing' && direction === 'up') return 'text-red-500';
    if (trend === 'increasing' && direction === 'down') return 'text-green-500';
    return 'text-gray-500';
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {previous !== undefined && (
          <div className="flex items-center mt-2">
            {getDirectionIcon()}
            <span className={cn("text-sm ml-1", getChangeColor())}>
              {changePercent !== undefined ? `${Math.abs(changePercent).toFixed(1)}%` : ''} 
              {change !== undefined ? ` (${change > 0 ? '+' : ''}${change})` : ''}
            </span>
          </div>
        )}
      </CardContent>
      {target !== undefined && (
        <CardFooter className="pt-0">
          <CardDescription>
            Target: {formatValue(target)}
          </CardDescription>
        </CardFooter>
      )}
    </Card>
  );
};

export default KPICard;
