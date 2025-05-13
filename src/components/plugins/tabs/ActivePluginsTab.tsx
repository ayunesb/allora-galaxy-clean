
import { Plugin } from '@/types/plugin';
import { PluginGrid } from '../PluginGrid';

interface ActivePluginsTabProps {
  plugins: Plugin[];
  loading: boolean;
  onClearFilters: () => void;
}

export const ActivePluginsTab = ({ plugins, loading, onClearFilters }: ActivePluginsTabProps) => {
  return (
    <PluginGrid
      plugins={plugins}
      loading={loading}
      onClearFilters={onClearFilters}
    />
  );
};
