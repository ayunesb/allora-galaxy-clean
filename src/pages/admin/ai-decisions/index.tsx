import React from 'react';
import AIDiffViewer from '@/components/admin/AIDiffViewer';
import VotingTable from '@/components/admin/VotingTable';

export default function AIDecisionsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Decision Logs</h1>
      <AIDiffViewer />
      <VotingTable />
    </div>
  );
}