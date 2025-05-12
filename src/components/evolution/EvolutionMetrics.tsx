
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricItem {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

interface EvolutionMetricsProps {
  metrics?: MetricItem[];
  isLoading?: boolean;
  title?: string;
}

const EvolutionMetrics: React.FC<EvolutionMetricsProps> = ({
  metrics = [],
  isLoading = false,
  title = "Performance Metrics"
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="py-4">
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[150px]">
          <p className="text-muted-foreground">No metrics available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                    {metric.change !== undefined && (
                      <p className={`text-xs mt-1 ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.isPositive ? '↑' : '↓'} {metric.change}%
                      </p>
                    )}
                  </div>
                  {metric.icon && (
                    <div className="text-muted-foreground">
                      {metric.icon}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvolutionMetrics;
