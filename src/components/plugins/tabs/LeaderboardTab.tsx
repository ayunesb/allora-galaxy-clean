
import { Plugin } from '@/types/plugin';
import { PluginLeaderboard } from '../PluginLeaderboard';

interface LeaderboardTabProps {
  plugins: Plugin[];
}

export const LeaderboardTab = ({ plugins }: LeaderboardTabProps) => {
  return (
    <PluginLeaderboard plugins={plugins} />
  );
};
