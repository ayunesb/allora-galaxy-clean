
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { usePlugins } from '@/hooks/usePlugins';
import { PluginFilters } from '@/components/plugins/PluginFilters';
import { FilteredPluginsDisplay } from '@/components/plugins/FilteredPluginsDisplay';

const PluginsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    filteredPlugins,
    clearFilters
  } = usePlugins();

  return (
    <RequireAuth>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
            <p className="text-muted-foreground">
              Browse, track, and integrate plugins that power your business strategies
            </p>
          </div>
          <Button
            onClick={() => navigate('/plugins/create')}
            className="shrink-0"
          >
            Create Plugin
          </Button>
        </div>

        <PluginFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        <FilteredPluginsDisplay
          filteredPlugins={filteredPlugins}
          loading={loading}
          onClearFilters={clearFilters}
        />
      </div>
    </RequireAuth>
  );
};

export default PluginsPage;
