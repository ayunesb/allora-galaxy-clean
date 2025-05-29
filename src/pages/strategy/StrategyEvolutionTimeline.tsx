import React from 'react';
import StrategyEvolution from '@/components/strategy/StrategyEvolution';
import ExecutionTimeline from '@/components/strategy/ExecutionTimeline';

export default function StrategyEvolutionTimelinePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Strategy Evolution Timeline</h1>
      <StrategyEvolution />
      <ExecutionTimeline />
    </div>
  );
}