
import { Plugin } from '@/types/plugin';
import { PluginGrid } from '../PluginGrid';

interface TrendingPluginsTabProps {
  plugins: Plugin[];
  loading: boolean;
  onClearFilters: () => void;
}

export const TrendingPluginsTab = ({ plugins, loading, onClearFilters }: TrendingPluginsTabProps) => {
  return (
    <PluginGrid
      plugins={plugins}
      loading={loading}
      onClearFilters={onClearFilters}
    />
  );
};
