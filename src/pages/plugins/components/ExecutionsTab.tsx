
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';

interface PluginLog {
  id: string;
  created_at: string;
  status: string;
  xp_earned: number;
  execution_time: number;
  strategy?: {
    title: string;
  };
}

interface ExecutionsTabProps {
  pluginLogs: PluginLog[];
}

const ExecutionsTab: React.FC<ExecutionsTabProps> = ({ pluginLogs }) => {
  if (!pluginLogs || pluginLogs.length === 0) {
    return (
      <EmptyState
        title="No executions found"
        description="This plugin hasn't been executed yet"
        icon={<LineChartIcon className="h-12 w-12" />}
      />
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium">Recent Plugin Executions</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={pluginLogs.slice(0, 20).reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" tick={false} />
            <YAxis />
            <RechartsTooltip 
              formatter={(value: any) => [`${value} XP`, 'XP Earned']}
              labelFormatter={(index) => `Execution ${index + 1}`}
            />
            <Line 
              type="monotone" 
              dataKey="xp_earned" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              name="XP"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {pluginLogs.slice(0, 10).map((log) => (
          <Card key={log.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={log.status === 'success' ? 'default' : 'destructive'}
                    >
                      {log.status === 'success' ? 'Success' : 'Failed'}
                    </Badge>
                    {log.strategy && (
                      <span className="text-sm font-medium">
                        {log.strategy.title}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{log.xp_earned} XP</Badge>
                  <Badge variant="secondary">{log.execution_time.toFixed(2)}s</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {pluginLogs.length > 10 && (
          <div className="text-center py-2">
            <Button variant="ghost" size="sm">
              View All ({pluginLogs.length}) Executions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionsTab;
