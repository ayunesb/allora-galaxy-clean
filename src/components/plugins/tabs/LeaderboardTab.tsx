
import { Plugin } from '@/types/plugin';
import { PluginLeaderboard } from '../PluginLeaderboard';

interface LeaderboardTabProps {
  plugins: Plugin[];
  isLoading?: boolean;
  metric?: 'xp' | 'roi' | 'trend';
}

export const LeaderboardTab = ({ 
  plugins, 
  isLoading = false, 
  metric = 'xp' 
}: LeaderboardTabProps) => {
  return (
    <PluginLeaderboard 
      plugins={plugins} 
      isLoading={isLoading} 
      metric={metric} 
    />
  );
};
