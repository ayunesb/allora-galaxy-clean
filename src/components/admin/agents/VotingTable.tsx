import { useAgentEvolution } from '@/hooks/useAgentEvolution';

export default function VotingTable({ agentId }: { agentId: string }) {
  const { data: votes, isLoading } = useAgentEvolution(agentId);

  if (isLoading) return <div>Loading votes...</div>;
  if (!votes?.length) return <div>No votes for this agent.</div>;

  return (
    <table className="w-full mt-2 table-auto border-collapse">
      <thead>
        <tr>
          <th className="border p-2">Vote</th>
          <th className="border p-2">Voter</th>
          <th className="border p-2">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {votes.map((vote: any) => (
          <tr key={vote.id}>
            <td className="border p-2">{vote.value === 1 ? '👍' : '👎'}</td>
            <td className="border p-2">{vote.voter}</td>
            <td className="border p-2">{new Date(vote.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
