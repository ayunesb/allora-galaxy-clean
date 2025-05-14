
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UsageData {
  date: string;
  strategies: number;
  plugins: number;
  agents: number;
}

interface TenantUsageAnalyticsProps {
  data: UsageData[];
  title?: string;
  description?: string;
}

export function TenantUsageAnalytics({ 
  data,
  title = "Usage Analytics", 
  description = "AI Component execution metrics over time"
}: TenantUsageAnalyticsProps) {
  // Process data for better chart display
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="strategies" name="Strategies" fill="#8884d8" />
              <Bar dataKey="plugins" name="Plugins" fill="#82ca9d" />
              <Bar dataKey="agents" name="Agents" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
