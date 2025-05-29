import React from 'react';
import XPBadge from '@/components/agent/XPBadge';
import EvolutionLogCard from '@/components/agent/EvolutionLogCard';

export default function XPStrategyEvolution() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">XP-Based Strategy Evolution</h1>
      <p className="text-muted-foreground">Track how strategies evolved when agents hit XP thresholds.</p>
      <XPBadge xp={1200} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EvolutionLogCard />
        <EvolutionLogCard />
        <EvolutionLogCard />
      </div>
    </div>
  );
}