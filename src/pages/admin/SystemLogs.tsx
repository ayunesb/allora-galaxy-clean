import { useSystemLogsData } from "@/hooks/useSystemLogsData";

const SystemLogs = () => {
  const { logs } = useSystemLogsData();

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">System Logs</h2>
      <ul className="space-y-2">
        {logs.map((log: any) => (
          <li key={log.id} className="bg-zinc-800 p-3 rounded">
            [{log.level}] {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemLogs;
