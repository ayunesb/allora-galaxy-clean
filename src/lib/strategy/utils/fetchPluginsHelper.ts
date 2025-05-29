/**
 * Fetch plugins for a strategy
 * @param strategyId The ID of the strategy
 * @returns Array of plugins
 */
export async function fetchPluginsHelper(_strategyId: string) {
  // In a real implementation, this would fetch plugins from the database
  const plugins = [
    { id: "plugin-1", name: "Plugin 1" },
    { id: "plugin-2", name: "Plugin 2" },
  ];
  return { plugins };
}
