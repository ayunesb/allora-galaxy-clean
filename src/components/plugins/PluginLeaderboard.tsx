
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plugin } from '@/types/plugin';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface PluginLeaderboardProps {
  plugins: Plugin[];
  isLoading: boolean;
  metric: 'xp' | 'roi' | 'trend';
}

export const PluginLeaderboard: React.FC<PluginLeaderboardProps> = ({ 
  plugins, 
  isLoading,
  metric
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!plugins || plugins.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-muted-foreground">No plugins found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Plugin</TableHead>
          <TableHead className="text-right">
            {metric === 'xp' ? 'XP' : metric === 'roi' ? 'ROI' : 'Trend'}
          </TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plugins.map((plugin, index) => (
          <TableRow key={plugin.id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {plugin.icon ? (
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                    {plugin.icon}
                  </span>
                ) : (
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                    P
                  </span>
                )}
                <span>{plugin.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              {metric === 'xp' && plugin.xp ? (
                <span>{plugin.xp.toLocaleString()} XP</span>
              ) : metric === 'roi' && plugin.roi ? (
                <span>{plugin.roi}%</span>
              ) : metric === 'trend' ? (
                <div className="flex items-center justify-end">
                  {(plugin as any).trend_score > 0 ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span>{Math.abs((plugin as any).trend_score || 0)}</span>
                </div>
              ) : (
                <span>-</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Badge variant={plugin.status === 'active' ? 'default' : 'secondary'}>
                {plugin.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PluginLeaderboard;
