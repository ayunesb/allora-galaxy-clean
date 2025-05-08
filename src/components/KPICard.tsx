
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendDirection } from '@/types/shared';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  trend?: TrendDirection;
  isPositive?: boolean;
  className?: string;
  icon?: React.ReactNode;
  unit?: string;
}

/**
 * A card component that displays a key performance indicator with trend
 */
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  change,
  trend = 'flat',
  isPositive = true,
  className,
  icon,
  unit = ''
}) => {
  const renderTrendIcon = () => {
    if (trend === 'up') {
      return <ArrowUpIcon className={cn('h-4 w-4', isPositive ? 'text-green-500' : 'text-red-500')} />;
    }
    
    if (trend === 'down') {
      return <ArrowDownIcon className={cn('h-4 w-4', isPositive ? 'text-green-500' : 'text-red-500')} />;
    }
    
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  };
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        
        {(change !== undefined || previousValue !== undefined) && (
          <div className="flex items-center space-x-1 pt-1">
            {renderTrendIcon()}
            <p className={cn(
              'text-xs',
              isPositive ? 'text-green-500' : 'text-red-500',
              trend === 'flat' && 'text-gray-400'
            )}>
              {change !== undefined && (
                <>
                  {change > 0 && '+'}
                  {change}%
                </>
              )}
              {previousValue !== undefined && change === undefined && (
                <>
                  {trend === 'up' && 'Increased from '}
                  {trend === 'down' && 'Decreased from '}
                  {trend === 'flat' && 'No change from '}
                  {previousValue}
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
