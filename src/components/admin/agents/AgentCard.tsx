import type { AgentVersion } from "@/types/agents";

export default function AgentCard({ version }: { version: AgentVersion }) {
  return (
    <div className="p-4 border rounded-xl shadow bg-muted/10">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">{version.name}</p>
          <p className="text-sm text-muted-foreground">v{version.version}</p>
        </div>
        <div>
          <span className="text-sm text-green-500">XP: {version.xp}</span>
        </div>
      </div>
      <div className="mt-2">
        <code className="text-xs block text-muted-foreground">
          {version.prompt?.slice(0, 200)}...
        </code>
      </div>
    </div>
  );
}
