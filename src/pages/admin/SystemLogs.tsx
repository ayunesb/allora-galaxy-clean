diff --git a/src/components/admin/logs/SystemLogsList.tsx b/src/components/admin/logs/SystemLogsList.tsx
new file mode 100644
index 0000000..abcdef0
--- /dev/null
+++ b/src/components/admin/logs/SystemLogsList.tsx
@@ -0,0 +1,40 @@
+import React from 'react';
+import { SystemLog } from '@/types/logs';
+
+export interface SystemLogsListProps {
+  logs: SystemLog[];
+  isLoading: boolean;
+  onViewLog: (log: SystemLog) => void;
+}
+
+const SystemLogsList: React.FC<SystemLogsListProps> = ({
+  logs,
+  isLoading,
+  onViewLog,
+}) => {
+  if (isLoading) return <p className="p-4 text-center">Loading logs…</p>;
+
+  if (logs.length === 0) return <p className="p-4 text-center">No logs found.</p>;
+
+  return (
+    <table className="w-full table-auto">
+      <thead className="bg-gray-100">
+        <tr>
+          <th className="px-4 py-2 text-left">Time</th>
+          <th className="px-4 py-2 text-left">Module</th>
+          <th className="px-4 py-2 text-left">Event</th>
+          <th className="px-4 py-2">&nbsp;</th>
+        </tr>
+      </thead>
+      <tbody>
+        {logs.map((log) => (
+          <tr key={log.id} className="hover:bg-gray-50">
+            <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
+            <td className="px-4 py-2">{log.module}</td>
+            <td className="px-4 py-2">{log.event}</td>
+            <td className="px-4 py-2">
+              <button
+                className="text-blue-600 hover:underline"
+                onClick={() => onViewLog(log)}
+              >
+                View
+              </button>
+            </td>
+          </tr>
+        ))}
+      </tbody>
+    </table>
+  );
+};
+
+export default SystemLogsList;
