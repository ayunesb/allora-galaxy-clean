import React from 'react';
import PluginImpactTracker from '@/components/plugins/PluginImpactTracker';
import PluginImpactTimeline from '@/components/plugins/PluginImpactTimeline';

export default function PluginImpactPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Plugin Impact Dashboard</h1>
      <PluginImpactTracker />
      <PluginImpactTimeline />
    </div>
  );
}
