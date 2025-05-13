
import { Plugin } from '@/types/plugin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface PluginLeaderboardProps {
  plugins: Plugin[];
  isLoading?: boolean;
  metric?: 'xp' | 'roi' | 'trend';
}

export const PluginLeaderboard = ({ plugins, isLoading = false, metric = 'xp' }: PluginLeaderboardProps) => {
  const navigate = useNavigate();

  const handlePluginClick = (plugin: Plugin) => {
    navigate(`/plugins/${plugin.id}`);
  };

  if (isLoading) {
    return (
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/50 p-3">
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plugin</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">XP</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">ROI</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plugins.map((plugin, index) => (
            <tr key={plugin.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
              <td className="px-4 py-3 text-sm font-semibold">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium">{plugin.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {plugin.description || 'No description available'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                {plugin.category && (
                  <Badge variant="outline">{plugin.category}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-center font-medium">
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {plugin.xp || 0}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-center font-medium">
                <div className="flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                  {plugin.roi || 0}%
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePluginClick(plugin)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
