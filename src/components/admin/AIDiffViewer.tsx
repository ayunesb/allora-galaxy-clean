import { useState } from 'react';
import { useAIDiff } from '@/hooks/useAIDiff';
import DiffViewer from 'react-diff-viewer'; // or your diff viewer of choice

export default function AIDiffViewer({ agentId }: { agentId: string }) {
  const { data: versionHistory = [], isLoading } = useAIDiff(agentId);
  const [selectedVersion, setSelectedVersion] = useState(0);

  if (isLoading) return <div>Loading diffs...</div>;
  if (versionHistory.length < 2) return <div>Not enough versions for diff.</div>;

  return (
    <div>
      <div className="flex gap-2 mb-2">
        {versionHistory.map((v: any, i: number) => (
          <button key={v.id} onClick={() => setSelectedVersion(i)}>
            View Prompt v{v.version}
          </button>
        ))}
      </div>
      <DiffViewer
        oldValue={versionHistory[selectedVersion]?.prompt}
        newValue={versionHistory[selectedVersion + 1]?.prompt}
        splitView={true}
      />
    </div>
  );
}