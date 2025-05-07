
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface KPICardProps {
  name: string;
  value: number;
  previousValue?: number;
  trendData?: Array<{date: string; value: number}>;
  source?: 'stripe' | 'ga4' | 'hubspot' | 'manual';
  category?: 'financial' | 'marketing' | 'sales' | 'product';
  format?: 'currency' | 'number' | 'percentage';
}

const formatValue = (value: number, format?: string): string => {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
};

const KPICard: React.FC<KPICardProps> = ({
  name,
  value,
  previousValue,
  trendData,
  source,
  category,
  format = 'number'
}) => {
  const percentChange = previousValue 
    ? ((value - previousValue) / previousValue) * 100
    : 0;
  const isPositive = percentChange >= 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{name}</p>
            <h3 className="text-2xl font-bold">{formatValue(value, format)}</h3>
          </div>
          {source && (
            <Badge variant="outline" className="capitalize">
              {source}
            </Badge>
          )}
        </div>

        {previousValue !== undefined && (
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span>{`${isPositive ? '+' : ''}${percentChange.toFixed(1)}% from previous`}</span>
          </div>
        )}

        {trendData && trendData.length > 1 && (
          <div className="h-24 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="date" 
                  hide={true} 
                />
                <YAxis 
                  hide={true} 
                  domain={['dataMin - 5%', 'dataMax + 5%']}
                />
                <Tooltip 
                  formatter={(value) => [formatValue(Number(value), format), name]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isPositive ? "#10b981" : "#ef4444"} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
