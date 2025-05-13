
import { Plugin } from '@/types/plugin';
import { PluginGrid } from '../PluginGrid';

interface AllPluginsTabProps {
  plugins: Plugin[];
  loading: boolean;
  onClearFilters: () => void;
}

export const AllPluginsTab = ({ plugins, loading, onClearFilters }: AllPluginsTabProps) => {
  return (
    <PluginGrid
      plugins={plugins}
      loading={loading}
      onClearFilters={onClearFilters}
    />
  );
};
