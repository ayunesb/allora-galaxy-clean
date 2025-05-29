import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ijrnwpgsqsxzqdemtknz.supabase.co",
  "public-anon-key",
);

type PluginLog = {
  id: string;
  plugin_id: string;
  xp_change: number;
  timestamp: string;
  message: string;
};

export default function PluginLogs() {
  const [logs, setLogs] = useState<PluginLog[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("plugin_logs").select("*").limit(10);
      setLogs(data ?? []);
    };
    load();
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Plugin Logs</h2>
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="bg-zinc-800 p-3 rounded">
            Plugin {log.plugin_id} — XP: {log.xp_change} on {log.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}
